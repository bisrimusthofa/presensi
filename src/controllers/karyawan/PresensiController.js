const db = require('../../models');
const Presensi = db.presensi;
const Izin = db.izin;
const JenisIzin = db.jenis_izin;
const JamKerja = db.JamKerja;
const LokasiKantor = db.lokasi_kantor;
const {QueryTypes} = db.Sequelize;
const Sequelize = db.sequelize;
const Op = db.Sequelize.Op;
const validation = require('../../config/validation');
const dateFormat = require('../../utils/convertDate');
const jwt_decode = require('jwt-decode');
const compareTime = require('../../config/compareTime');
const {checkLibur} = require('../../utils/helper');

exports.oneWeek = async (req, res) => {
    // let today = new Date();
    // let weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate()-7);

    try{
        const data = await Sequelize.query(`SELECT * FROM presensis WHERE WEEK(createdAt)=WEEK(NOW()) AND userId='${req.params.id}';`, {
            model: Presensi,
            type: QueryTypes.SELECT,
            map: true
        })

        res.status(200).json(data);
    }catch(error){
        res.status(400).json({
            message: 'Ada kesalahan',
            error: error
        })
    }
}

exports.index = async (req, res) => {
    let urlOriginal = req.protocol + '://' + req.get('host') + req.originalUrl;
    let url = urlOriginal.split('?')[0];

    let currentPage = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 10;
    try{
        let data = {};
        if(req.query.search){
            data = await Presensi.findAndCountAll({
                distinct: true,
                where: {
                    [Op.or]: [
                        {
                            '$izin.jenis_izin.jenis_izin$' : {
                                [Op.like] : `%${req.query.search}%`
                            }
                        },
                        {
                            status : {
                                [Op.like] : `%${req.query.search}%`
                            }
                        },
                        {
                            createdAt: {
                                [Op.substring] : `%${req.query.search}%`
                            }
                        }
                    ],
                    userId : {
                        [Op.eq]: req.params.id
                    }
                },
                include: [
                    {
                        model: Izin,
                        as: 'izin',
                        required: false,
                        include: [
                            {
                                model: JenisIzin,
                                as: 'jenis_izin',
                                required: false
                            }
                        ]
                    },
                ],
                offset: (currentPage - 1) * perPage,
                limit: perPage,
                order: [
                    ['createdAt', 'desc']
                ]
            })
        }else if(req.query.filter){
            const filter = JSON.parse(req.query.filter);

            //variabel untuk menyimpan data filter
            //stateArrayJI untuk inisialisasi jika tidak ada yang true
            let stateArrayJI = [];
            let arrayJI = [];
            
            //push data statusPresensi ke array string
            if(filter.statusPresensi.length > 0){
                filter.statusPresensi.map((data)=>{
                    stateArrayJI.push(data.statusPresensi);
                    if(data.status){
                        arrayJI.push(data.statusPresensi);
                    }
                })
            }

            data = await Presensi.findAndCountAll({
                distinct: true,
                where: {
                    [Op.and]: {
                        status: {
                            [Op.in]: arrayJI.length > 0 ? arrayJI : stateArrayJI
                        },
                        createdAt: {
                            [Op.between]: [
                                filter.tglMulai ? filter.tglMulai : '', 
                                filter.tglSelesai ? filter.tglSelesai : dateFormat.dateDash(Date.now())
                            ]
                        },
                        userId : {
                            [Op.eq]: req.params.id
                        }
                    }
                },
                offset: (currentPage - 1) * perPage,
                limit: perPage,
                order: [
                    ['createdAt', 'desc']
                ]
            })


        }else{
            data = await Presensi.findAndCountAll({
                distinct: true,
                where: {
                    userId : req.params.id
                },
                include: [
                    {
                        model: Izin,
                        as: 'izin',
                        required: false,
                        include: [
                            {
                                model: JenisIzin,
                                as: 'jenis_izin',
                                required: false
                            }
                        ]
                    },
                ],
                offset: (currentPage - 1) * perPage,
                limit: perPage,
                order: [
                    ['createdAt', 'desc']
                ]
            });
        }

        //pagination
        let nextPage = perPage !== Math.ceil(data.count/currentPage) && currentPage < Math.ceil(data.count/perPage) ? `${url}?page=${currentPage+1}&perPage=${perPage}` : null;
        let prevPage = currentPage > 1 ? `${url}?page=${currentPage-1}&perPage=${perPage}` : null;

        res.status(200).json({
            nextPage,
            prevPage,
            data: data.rows,
            total: data.count,
            jumlahData: data.rows.length,
            currentPage,
            perPage
        });
    }catch(error){
        res.status(400).json({
            message: 'Ada kesalahan',
            error: error
        })
    }
}

exports.create = async (req, res, next) => {

    /* check libur */
    let libur = await checkLibur();
    if(libur){
        return res.status(400).json({
            message: libur.name
        })
    }

    //validate
    const {error} = validation.createPresensiKaryawanValidation(req.body);
    if(error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    //decode jwt
    const token = jwt_decode(req.body.token);

    //state jam kerja
    const dataJamKerja = token.data;

    if(!dataJamKerja){
        return res.status(400).json({
            message: 'Token tidak valid'
        });
    }
    //verify jam kerja
    const isValidJamKerja = await JamKerja.findOne({
        where: {
            [Op.and]: [
                {
                    id: dataJamKerja.id
                },
                {
                    isActive: 1
                }
            ]
        },
        include: [{
            model: LokasiKantor,
            as: 'lokasi_kantor'
        }],
        raw: true
    });
    
    if(!isValidJamKerja){
        return res.status(400).json({
            message: 'Invalid jam kerja'
        });
    }
    /* get jarak kantor dan karyawan */
    const p1 = {
        lat: req.body.lat,
        lng: req.body.lng
    }

    const p2 = {
        lat: isValidJamKerja["lokasi_kantor.lat"],
        lng: isValidJamKerja["lokasi_kantor.lng"]
    }

    /* fungsi check jarak dari lokasi kantor dan lokasi karyawan */
    const rad = (x) => {
        return x * Math.PI / 180;
    };
      
    const getDistance = (p1, p2) => {
        let R = 6378137; // radius bumi dalam meter
        let dLat = rad(p2.lat - p1.lat);
        let dLong = rad(p2.lng - p1.lng);
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c;
        return d; // jarak dalam meter
    };

    /* check jarak */
    if(getDistance(p1, p2) > 30){
        return res.status(400).json({
            message: 'Jarak anda terlalu jauh, maksimal jarak 30 meter'
        });
    }


    //generate ID
    const id =  async () => {
        let huruf = 'P';
        let tglHariIni = dateFormat.dateSlash(Date.now());
        try{

            /* data max id presensi berdasarkan createdAt hari ini */
            const lastId = await Presensi.findAll({
                attributes: [[db.sequelize.fn('max', db.sequelize.col("id")), 'maxid']],
                raw: true,
                where: {
                    createdAt: {
                        [Op.substring] : `%${dateFormat.dateDash(Date.now())}%`
                    }
                }
            });

            /* Data tanggal hari ini */

            if(lastId[0].maxid){
                let number = parseInt(lastId[0].maxid.slice(24, 26));
                number++;

                let dataId = number.toString().padStart(2, 0);
                return `${huruf}/${req.body.userId}/${tglHariIni}/${dataId}`;
            }else{
                let number = 1;
                let dataId = number.toString().padStart(2, 0);
                return `${huruf}/${req.body.userId}/${tglHariIni}/${dataId}`;
            }
        }catch(err){
            res.json(err)
        }
    }

    /* Check jam masuk, jam keluar, dan acc berdasarkan id user yang presensi hari ini */
    /* state presensi izin */
    const dataPresensi = await Presensi.findOne({
        raw: true,
        where: {
            [Op.and] : [
                {
                    userId: req.body.userId
                },
                {
                    createdAt: {
                        [Op.substring] : `%${dateFormat.dateDash(Date.now())}%`
                    }
                }
            ]
        },
        include: [{
            model: Izin
        }]
    });

    /* jika belum presensi hari ini */
    if(dataPresensi === null){
        if(compareTime(req.body.jam_presensi, '>', isValidJamKerja.jam_pulang)){
            return res.status(400).json({
                message: 'Sudah tidak bisa presensi hari ini'
            })
        }
        
        try{
            const presensi = {
                id: await id(),
                jam_masuk: req.body.jam_presensi,
                status: compareTime(req.body.jam_presensi, '>', isValidJamKerja.jam_masuk) ? 'terlambat' : 'hadir',
                userId: req.body.userId,
                jamKerjaId: isValidJamKerja.id
            }
            const data = await Presensi.create(presensi);
            res.status(200).json(data)
        }catch(err){
            res.status(500).json({
                message: err
            })
        }
    }

    /* Jika sudah cuti */
    if(dataPresensi.status == 'cuti'){
        return res.status(400).json({
            message: 'Anda sedang cuti.'
        })
    }

    /* check apakah sudah izin */
    if(dataPresensi.jam_masuk == '00:00:00' && dataPresensi.status == 'izin'){
        const t = await Sequelize.transaction();
        try{
            /* Jika sudah izin tetapi melakukan presensi normal */
            if(compareTime(req.body.jam_presensi, '<', isValidJamKerja.jam_masuk)){
                const data = await Presensi.update(
                    {
                        jam_masuk: req.body.jam_presensi,
                        izinId: null,
                        status: 'hadir'
                    },
                    {
                        where: {
                            [Op.and] : [
                                {
                                    userId: req.body.userId
                                },
                                {
                                    createdAt: {
                                        [Op.substring] : `%${dateFormat.dateDash(Date.now())}%`
                                    }
                                }
                            ]
                        },
                        transaction: t
                });

                /* Hapus izin */
                await Izin.destroy({
                    where: {
                        id: dataPresensi['izin.id']
                    },
                    transaction: t
                });

                await t.commit();
                res.status(200).json(data);

            /* Jika sudah izin dan melebihi jam masuk */
            }else if(compareTime(req.body.jam_presensi, '<', isValidJamKerja.jam_pulang)){
                const data = await Presensi.update(
                    {
                        jam_masuk: req.body.jam_presensi,
                        status: dataPresensi['izin.acc'] ? 'izin' : 'terlambat',
                        izinId: dataPresensi['izin.acc'] ? dataPresensi['izin.id'] : null
                    },
                    {
                        where: {
                            [Op.and] : [
                                {
                                    userId: req.body.userId
                                },
                                {
                                    createdAt: {
                                        [Op.substring] : `%${dateFormat.dateDash(Date.now())}%`
                                    }
                                }
                            ]
                        },
                        transaction: t
                });
                /* Jika tidak acc dan melakukan presensi melebihi jam masuk*/
                if(!dataPresensi['izin.acc']){
                    await Izin.destroy({
                        where: {
                            id: dataPresensi['izin.id']
                        },
                        transaction: t
                    });
                }
                await t.commit();
                res.status(200).json(data);
            }else{
                return res.status(400).json({
                    message: 'Sudah tidak bisa presensi hari ini'
                })
            }
            
        }catch(err){
            await t.rollback();
            res.status(500).json({
                message: err
            })
        }
    }

    /* Presensi pulang */
    if(dataPresensi.jam_masuk != '00:00:00' && dataPresensi.jam_pulang == '00:00:00'){
        try{
            if(compareTime(req.body.jam_presensi, '>', isValidJamKerja.jam_pulang)){
                const data = await Presensi.update(
                    {jam_pulang: req.body.jam_presensi},
                    {
                        where: {
                            [Op.and] : [
                                {
                                    userId: req.body.userId
                                },
                                {
                                    createdAt: {
                                        [Op.substring] : `%${dateFormat.dateDash(Date.now())}%`
                                    }
                                }
                            ]
                        }
                    });
                res.status(200).json(data)
            }else{
                return res.status(400).json({
                    message: `Belum waktunya pulang, silakan presensi pulang setelah jam ${isValidJamKerja.jam_pulang.substr(0, 5)}`
                })
            }
            
        }catch(err){
            res.status(500).json({
                message: err
            })
        }
        
    }

    /* jika sudah presensi */
    if(dataPresensi.jam_pulang != '00:00:00'){
        return res.status(400).json({
            message: 'Sudah presensi hari ini.'
        })
    }
}