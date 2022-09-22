const db = require('../../models');
const Izin = db.izin;
const Presensi = db.presensi;
const JenisIzin = db.jenis_izin;
const LokasiKantor = db.lokasi_kantor;
const JamKerja = db.JamKerja;
const Op = db.Sequelize.Op;
const Sequelize = db.sequelize;
const validation = require('../../config/validation');
const dateFormat = require('../../utils/convertDate');
const compareTime = require('../../config/compareTime');
const { unlink } = require('fs/promises');
const path = require('path');
const { sequelize } = require('../../models');
const {checkLibur} = require('../../utils/helper');

exports.index = async (req, res) => {
    let urlOriginal = req.protocol + '://' + req.get('host') + req.originalUrl;
    let url = urlOriginal.split('?')[0];

    let currentPage = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 5;
    try{
        let data = {};
        if(req.query.search){
            data = await Izin.findAndCountAll({
                where: {
                    [Op.or]: [
                        {
                            '$jenis_izin.jenis_izin$' : {
                                [Op.like] : `%${req.query.search}%`
                            }
                        },
                        {
                            createdAt: {
                                [Op.substring] : `%${req.query.search}%`
                            }
                        }
                    ]
                },
                include: [
                    {
                        model: Presensi,
                        where: {
                            userId: {
                                [Op.eq]: req.params.id
                            }
                        },
                        required: true
                    },
                    {
                        model: JenisIzin,
                        as: 'jenis_izin',
                        required: true
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
            let arrayAcc = [];
            
            //push data jenis_izin ke array string
            if(filter.jenis_izin.length > 0){
                filter.jenis_izin.map((data)=>{
                    stateArrayJI.push(data.jenis_izin);
                    if(data.status){
                        arrayJI.push(data.jenis_izin);
                    }
                })
            }

            //identifikasi data acc dan tidak acc
            filter.acc ? arrayAcc.push(1) : '';
            filter.notAcc ? arrayAcc.push(0) : '';

            data = await Izin.findAndCountAll({
                where: {
                    [Op.and]: {
                        '$jenis_izin.jenis_izin$': {
                            [Op.in]: arrayJI.length > 0 ? arrayJI : stateArrayJI
                        },
                        acc: {
                            [Op.in]: arrayAcc.length > 0 ? arrayAcc : [1, 0]
                        },
                        createdAt: {
                            [Op.between]: [
                                filter.tglMulai ? filter.tglMulai : '', 
                                filter.tglSelesai ? filter.tglSelesai : Date.now()
                            ]
                        }
                    }
                },
                include: [
                    {
                        model: Presensi,
                        where: {
                            userId: {
                                [Op.eq]: req.params.id
                            }
                        },
                        required: true
                    },
                    {
                        model: JenisIzin,
                        as: 'jenis_izin',
                        required: true
                    },
                ],
                offset: (currentPage - 1) * perPage,
                limit: perPage,
                order: [
                    ['createdAt', 'desc']
                ]
            })


        }else{
            data = await Izin.findAndCountAll({
                include: [
                    {
                        model: Presensi,
                        where:{
                            userId : {
                                [Op.eq]: req.params.id
                            }
                        }
                    },
                    {
                        model: JenisIzin
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

exports.create = async (req, res) => {
    /* check libur */
    let libur = await checkLibur();
    if(libur){
        return res.status(400).json({
            message: libur.name
        })
    }
    //validate
    const {error} = validation.createIzinValidation(req.body);

    if(error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    /* Jika sudah presensi maka tidak bisa melakukan izin */
    const presensiHariIni = await Presensi.findOne({
        where :{
            createdAt : {
                [Op.substring] : dateFormat.dateDash(Date.now())
            },
            userId: req.body.userId
        },
        include: [{
            model: Izin
        }]
    });

    /* Check apakah sudah izin hari ini */
    /* Jika sudah maka check apakah acc, kalu tidak hapus izin dan ganti yang baru, kalau acc maka return false */

    if(presensiHariIni && presensiHariIni.status == 'hadir' || presensiHariIni && presensiHariIni.status == 'terlambat'){
        return res.status(400).json({
            message: 'Anda sudah melakukan presensi hari ini.'
        });
    }else if(presensiHariIni && presensiHariIni.status == 'cuti'){
        return res.status(400).json({
            message: 'Anda sedang cuti.'
        })
    }else if(presensiHariIni && presensiHariIni.izinId && presensiHariIni.izin.acc){
        return res.status(400).json({
            message: 'Anda sudah melakukan izin hari ini dan sudah di acc.'
        })
    }else if(presensiHariIni){
        const tIzin = await sequelize.transaction()
        try{
            await Presensi.destroy({
                where: {
                    id: presensiHariIni.id
                },
                transaction: tIzin
            });
            await Izin.destroy({
                where: {
                    id: presensiHariIni.izinId
                },
                transaction: tIzin
            });
            await tIzin.commit();
        }catch(err){
            await tIzin.rollback();

            return res.status(500).json({
                message: err
            })
        }
    }

    const jamkerja = await JamKerja.findOne({
        where: {isActive: 1},
        raw: true
    });

    /* check jam kerja */
    /* Jika melakukan izin sesudah jam pulang maka tidak boleh */
    if(compareTime(dateFormat.getTime(Date.now()), '>', jamkerja.jam_pulang)){
        return res.status(400).json({
            message: 'Waktu pengajuan izin hari ini sudah habis, karena sudah masuk jam pulang'
        })
    }

    //check berkas
    const berkas = req.file ? req.file.path : 'images\\no_berkas.png';

    //generate ID
    const id =  async () => {
        let huruf = 'I';
        let tglHariIni = dateFormat.dateSlash(Date.now());
        try{

            /* data max id izin berdasarkan createdAt hari ini */
            const lastId = await Izin.findAll({
                attributes: [[db.sequelize.fn('max', db.sequelize.col("id")), 'maxid']],
                raw: true,
                where: {
                    createdAt: {
                        [Op.substring] : `%${dateFormat.dateDash(Date.now())}%`
                    }
                }
            });
            
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

    //generate ID
    const idPresensi =  async () => {
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

    // payload Izin
    const izin = {
        id: await id(),
        keterangan: req.body.keterangan,
        jenisIzinId: req.body.jenisIzinId,
        berkas: berkas
    }

    /* transaction */
    const transaksiIzin = await Sequelize.transaction();

    try{
        /* Input izin */
        const data = await Izin.create(izin, {transaction: transaksiIzin});

        /* Input Presensi */
        await Presensi.create({
            id: await idPresensi(),
            userId: req.body.userId,
            izinId: izin.id,
            status: 'izin',
            jamKerjaId: jamkerja.id
        }, {transaction: transaksiIzin});

        await transaksiIzin.commit();

        res.status(200).json(data);
    }catch(err){
        await transaksiIzin.rollback();
        
        res.status(500).json({
            message: err
        })
    }
}

exports.delete = async (req, res) => {
    try{
        const dataIzin = await Izin.findOne({
            where: {
                id: req.query.id,
                acc: 0
            }
        });

        if(!dataIzin || dataIzin == []){
            return res.status(400).json({
                message: 'Data izin tidak valid'
            })
        }

        //jika bukan berkas default maka hapus berkas
        let filename = await path.basename(dataIzin.berkas);
        if(filename != 'no_berkas.png'){
            await unlink(dataIzin.berkas);
        }
        
        //hapus data
        await Presensi.destroy({
            where: {
                izinId: dataIzin.id
            }
        });
        const dataDelete = await dataIzin.destroy();


        res.status(200).json(dataDelete);

    }catch(err){
        return res.status(500).json({
            message: err
        })
    }
}

exports.jenisIzin = async (req, res) => {
    try{
        const data = await JenisIzin.findAll();

        res.status(200).json(data);
    }catch(err){
        res.status(500).json({
            message: err
        })
    }
}