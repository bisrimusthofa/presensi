const db = require('../../models');
const JenisCuti = db.jenis_cuti;
const Cuti = db.cuti;
const Presensi = db.presensi;
const Jabatan = db.jabatan;
const JamKerja = db.JamKerja;
const User = db.user;
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;
const dateFormat = require('../../utils/convertDate');
const compareDate = require('../../config/compareDate');
const { unlink } = require('fs/promises');
const path = require('path');
const axios = require('axios');
const { user } = require('../../models');

exports.index = async (req, res) => {
    let urlOriginal = req.protocol + '://' + req.get('host') + req.originalUrl;
    let url = urlOriginal.split('?')[0];

    let currentPage = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 5;
    try{
        const data = req.query.search
                        ?   await Cuti.findAndCountAll({
                                distinct: true,
                                where:{
                                    [Op.or] : [
                                        {
                                            '$jenis_cuti$' : {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        },
                                        {
                                            '$user.nama$' : {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        },
                                        {
                                            id : {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        },
                                        {
                                            acc : {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        }
                                    ],
                                    acc: 0
                                },
                                include: [
                                    {
                                        model: JenisCuti,
                                        as: 'jenis_cuti',
                                        required: true
                                    },
                                    {
                                        model: User,
                                        as: 'user',
                                        include: [{
                                            model: Presensi,
                                            on: {col1: sequelize.where(sequelize.col("user->presensis.userId"), "=", sequelize.col("cuti.userId"))},
                                            where: {
                                                status: 'cuti',
                                                createdAt: {
                                                    [Op.between]: [sequelize.col("cuti.tgl_mulai"), sequelize.col("cuti.tgl_selesai")]
                                                }
                                            },
                                            required: false
                                        },
                                        {
                                            model: Jabatan,
                                            as: 'jabatan',
                                            reuired: false
                                        }],
                                        required: true
                                    }
                                ],
                                offset: (currentPage - 1) * perPage,
                                limit: perPage,
                                order: [
                                    ['createdAt', 'desc']
                                ]
                            })
                        :   await Cuti.findAndCountAll({
                                distinct: true,
                                where: {
                                    acc: 0
                                },
                                include: [
                                    {
                                        model: JenisCuti
                                    },
                                    {
                                        model: User,
                                        include: [{
                                            model: Presensi,
                                            on: {col1: sequelize.where(sequelize.col("user->presensis.userId"), "=", sequelize.col("cuti.userId"))},
                                            where: {
                                                status: 'cuti',
                                                createdAt: {
                                                    [Op.between]: [sequelize.col("cuti.tgl_mulai"), sequelize.col("cuti.tgl_selesai")]
                                                }
                                            },
                                            required: false
                                        },
                                        {
                                            model: Jabatan,
                                            as: 'jabatan',
                                            reuired: false
                                        }],
                                    }
                                ],
                                offset: (currentPage - 1) * perPage,
                                limit: perPage,
                                order: [
                                    ['createdAt', 'desc']
                                ]
                            });
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

exports.getAcc = async (req, res) => {
    let urlOriginal = req.protocol + '://' + req.get('host') + req.originalUrl;
    let url = urlOriginal.split('?')[0];

    let currentPage = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 5;
    try{
        const data = req.query.search
                        ?   await Cuti.findAndCountAll({
                                distinct: true,
                                where:{
                                    [Op.or] : [
                                        {
                                            '$jenis_cuti.jenis_cuti$' : {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        },
                                        {
                                            '$user.nama$' : {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        },
                                        {
                                            id : {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        }
                                    ],
                                    acc : 1
                                },
                                include: [
                                    {
                                        model: JenisCuti,
                                        as: 'jenis_cuti',
                                        required: true
                                    },
                                    {
                                        model: User,
                                        include: [{
                                            model: Presensi,
                                            on: {col1: sequelize.where(sequelize.col("user->presensis.userId"), "=", sequelize.col("cuti.userId"))},
                                            where: {
                                                status: 'cuti',
                                                createdAt: {
                                                    [Op.between]: [sequelize.col("cuti.tgl_mulai"), sequelize.col("cuti.tgl_selesai")]
                                                }
                                            },
                                            required: false
                                        },
                                        {
                                            model: Jabatan,
                                            as: 'jabatan',
                                            reuired: false
                                        }],
                                        required: true
                                    }
                                ],
                                offset: (currentPage - 1) * perPage,
                                limit: perPage,
                                order: [
                                    ['createdAt', 'desc']
                                ]
                            })
                        :   await Cuti.findAndCountAll({
                                distinct: true,
                                where: {
                                    acc: 1
                                },
                                include: [
                                    {
                                        model: JenisCuti
                                    },
                                    {
                                        model: User,
                                        include: [{
                                            model: Presensi,
                                            on: {col1: sequelize.where(sequelize.col("user->presensis.userId"), "=", sequelize.col("cuti.userId"))},
                                            where: {
                                                status: 'cuti',
                                                createdAt: {
                                                    [Op.between]: [sequelize.col("cuti.tgl_mulai"), sequelize.col("cuti.tgl_selesai")]
                                                }
                                            },
                                            required: false
                                        },
                                        {
                                            model: Jabatan,
                                            as: 'jabatan',
                                            reuired: false
                                        }],
                                        required: false
                                    }
                                ],
                                offset: (currentPage - 1) * perPage,
                                limit: perPage,
                                order: [
                                    ['createdAt', 'desc']
                                ]
                            });
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

exports.acc = async (req, res) => {

    /* Get jam kerja aktif */
    const jamKerja = await JamKerja.findOne({
        where: {
            isActive: 1
        },
        raw: true
    });

    /* Get jam kerja untuk identifikasi hari kerja */
    const jamKerjaAll = await JamKerja.findAll({
        raw: true
    });

    /* fungsi create presensi */
    const createPresensi = async (data, tgl) => {
        const id = async () => {
            let huruf = 'P';
            let tglHariIni = dateFormat.dateSlash(tgl);
            try{

                /* data max id presensi berdasarkan createdAt hari ini */
                const lastId = await Presensi.findAll({
                    attributes: [[db.sequelize.fn('max', db.sequelize.col("id")), 'maxid']],
                    raw: true,
                    where: {
                        createdAt: {
                            [Op.substring] : `%${dateFormat.dateDash(tgl)}%`
                        }
                    }
                });

                if(lastId[0].maxid){
                    let number = parseInt(lastId[0].maxid.slice(24, 26));
                    number++;

                    let dataId = number.toString().padStart(2, 0);
                    return `${huruf}/${data.userId}/${tglHariIni}/${dataId}`;
                }else{
                    let number = 1;
                    let dataId = number.toString().padStart(2, 0);
                    return `${huruf}/${data.userId}/${tglHariIni}/${dataId}`;
                }
            }catch(err){
                res.json(err)
            }
        }

        try{
            const presensi = {
                id: await id(),
                status: 'cuti',
                userId: data.userId,
                jamKerjaId: jamKerja.id,
                createdAt: tgl,
                updatedAt: tgl
            }
            await Presensi.create(presensi);
        }catch(error){
            return res.status(500).json({
                message: err
            })
        }
    }


    /* fungsi get data Cuti yang akan di acc */
    const dataCuti = await Cuti.findOne({
        where: {id: req.query.id, acc: 0},
        include: [{
            model: User
        }],
        raw: true
    });

    if(!dataCuti){
        return res.status(400).json({
            message: 'Data cuti tidak ditemukan'
        })
    }
    
    /* fungsi get dates tgl mulai-tgl selesai cuti*/
    const getDateArray = (start, end) => {

        let arr = new Array();
        let dt = new Date(start);
        let dtEnd = new Date(end);

        while (dt <= dtEnd) {

            /* Jika diluar jam kerja maka tidak dibuat presensi */
            jamKerjaAll.forEach((data, i)=>{
                if(data.hari == dt.getDay()){
                    arr.push(new Date(dt));
                }
            });
            
            dt.setDate(dt.getDate() + 1);
        }
      
        return arr;
      
    }
    
    /* inisialisasi tgl sekarang */
    /* Acc cuti harus dilakukan sebelum tgl mulai cuti */
    let tglSekarang = dateFormat.dateDash(Date.now());
    
    if(compareDate(tglSekarang, '<', dataCuti.tgl_mulai)){
    
        try{
            /* set acc */
            const data = await Cuti.update(
                {acc: 1},
                {where: {id: req.query.id}}
            );

            //create presensi berdasarkan rentang cuti
            const rentangTanggalCuti = getDateArray(dataCuti.tgl_mulai, dataCuti.tgl_selesai);
            for (let index = 0; index < rentangTanggalCuti.length; index++) {
                createPresensi(dataCuti, rentangTanggalCuti[index]);
            }

            /* Fire notifikasi */
            const dataNotifikasi = {
                    to: dataCuti['user.tokenFCM'],
                    priority: "high",
                    soundName: "default",
                    notification: {
                         title: "ACC CUTI",
                         body: `Pengajuan Cuti tanggal ${dateFormat.dateToString(dataCuti.createdAt)} sudah di Acc`
                    }
               }

            await axios.post('https://fcm.googleapis.com/fcm/send', dataNotifikasi, {
                headers: {
                    "Authorization": `key=${process.env.FCM_KEY}`,
                    "Content-Type": "application/json"
                }
            });

            res.status(200).json(data);
        }catch(err){
            res.status(500).json({
                message: err
            })
        }
    }else{
        return res.status(400).json({
            message: 'Tidak dapat acc karena melebihi batas waktu'
        })
    }
}

exports.tolak = async (req, res) => {
/* 
Jika cuti ditolak maka hapus cuti.
Jika cuti sudah terAcc maka tidak dapat ditolak. 
*/
    try{
        const dataCuti = await Cuti.findOne({
            where: {
                id: req.query.id,
                acc: 0
            },
            include: [
                {
                    model: User,
                }
            ],
            raw: true
        });

        if(!dataCuti || dataCuti == []){
            return res.status(400).json({
                message: 'Data izin tidak valid'
            })
        }

        /* Fire notifikasi */
        const dataNotifikasi = {
            to: dataCuti['user.tokenFCM'],
            priority: "high",
            soundName: "default",
            notification: {
                 title: "CUTI DITOLAK",
                 body: `Pengajuan cuti ${dateFormat.dateToString(dataCuti.createdAt)} ditolak.`
            }
        }

        await axios.post('https://fcm.googleapis.com/fcm/send', dataNotifikasi, {
            headers: {
                "Authorization": `key=${process.env.FCM_KEY}`,
                "Content-Type": "application/json"
            }
        });

        //jika bukan berkas default maka hapus berkas
        let filename = await path.basename(dataCuti.berkas);
        if(filename != 'no_berkas.png'){
            await unlink(dataCuti.berkas);
        }

        const dataDelete = await Cuti.destroy({
            where: {
                id: dataCuti.id
            }
        });


        res.status(200).json(dataDelete);

    }catch(err){
        return res.status(500).json({
            message: err
        })
    }
}

exports.getRiwayatCuti = async (req, res) => {
    try{
        const data = await Cuti.findAll({
            where: {
                userId: {
                    [Op.eq] : req.params.id
                },
                acc: 1
            },
            include: [
                {
                    model: JenisCuti
                },
            ],
            order: [
                ['createdAt', 'desc']
            ]
        });

        res.status(200).json(data);
    }catch(err){
        return res.status(500).json({
            message: err
        })
    }
}
