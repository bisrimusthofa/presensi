const db = require('../../models');
const JenisIzin = db.jenis_izin;
const Izin = db.izin;
const Presensi = db.presensi;
const Jabatan = db.jabatan;
const JamKerja = db.JamKerja;
const User = db.user;
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;
const validation = require('../../config/validation');
const dateFormat = require('../../utils/convertDate');
const compareTime = require('../../config/compareTime');
const { unlink } = require('fs/promises');
const path = require('path');
const axios = require('axios');

//create
exports.index = async (req, res) => {
    let urlOriginal = req.protocol + '://' + req.get('host') + req.originalUrl;
    let url = urlOriginal.split('?')[0];

    let currentPage = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 5;
    try{
        const data = req.query.search
                        ?   await Izin.findAndCountAll({
                                distinct: true,
                                where:{
                                    [Op.or] : [
                                        {
                                            '$jenis_izin.jenis_izin$' : {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        },
                                        {
                                            '$presensi.status$' : {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        },
                                        {
                                            '$presensi.user.nama$' : {
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
                                    createdAt: {
                                        [Op.substring] : `%${dateFormat.dateDash(Date.now())}%`
                                    }
                                },
                                include: [
                                    {
                                        model: JenisIzin
                                    },
                                    {
                                        model: Presensi,
                                        include: [
                                            {
                                                model: User,
                                                include: [{
                                                    model: Jabatan,
                                                    as: 'jabatan',
                                                    reuired: false
                                                }]
                                            },
                                            {
                                                model: JamKerja
                                            }
                                        ]
                                    }
                                ],
                                offset: (currentPage - 1) * perPage,
                                limit: perPage,
                                order: [
                                    ['createdAt', 'desc']
                                ]
                            })
                        :   await Izin.findAndCountAll({
                                distinct: true,
                                where: {
                                    createdAt: {
                                        [Op.substring] : `%${dateFormat.dateDash(Date.now())}%`
                                    }
                                },
                                include: [
                                    {
                                        model: JenisIzin
                                    },
                                    {
                                        model: Presensi,
                                        include: [
                                            {
                                                model: User,
                                                include: [{
                                                    model: Jabatan,
                                                    as: 'jabatan',
                                                    reuired: false
                                                }]
                                            },
                                            {
                                                model: JamKerja
                                            }
                                        ]
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

exports.all = async (req, res) => {
    let urlOriginal = req.protocol + '://' + req.get('host') + req.originalUrl;
    let url = urlOriginal.split('?')[0];

    let currentPage = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 5;
    try{
        const data = req.query.search
                        ?   await Izin.findAndCountAll({
                                distinct: true,
                                where:{
                                    [Op.or] : [
                                        {
                                            '$jenis_izin.jenis_izin$' : {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        },
                                        {
                                            '$presensi.status$' : {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        },
                                        {
                                            '$presensi.user.nama$' : {
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
                                    ]
                                },
                                include: [
                                    {
                                        model: JenisIzin
                                    },
                                    {
                                        model: Presensi,
                                        include: [
                                            {
                                                model: User,
                                                include: [{
                                                    model: Jabatan,
                                                    as: 'jabatan',
                                                    reuired: false
                                                }]
                                            },
                                            {
                                                model: JamKerja
                                            }
                                        ]
                                    }
                                ],
                                offset: (currentPage - 1) * perPage,
                                limit: perPage,
                                order: [
                                    ['createdAt', 'desc']
                                ]
                            })
                        :   await Izin.findAndCountAll({
                                distinct: true,
                                include: [
                                    {
                                        model: JenisIzin
                                    },
                                    {
                                        model: Presensi,
                                        include: [
                                            {
                                                model: User,
                                                include: [{
                                                    model: Jabatan,
                                                    as: 'jabatan',
                                                    reuired: false
                                                }]
                                            },
                                            {
                                                model: JamKerja
                                            }
                                        ]
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
    /* get izin */
    const dataPresensi = await Presensi.findOne({
                                where: {izinId: req.query.id},
                                include: [
                                    {
                                        model: JamKerja
                                    },
                                    {
                                        model: User
                                    }
                                ]
                            });
    /* inisialisasi waktu sekarang */
    let waktuSekarang = dateFormat.getTime(Date.now());
    
    if(compareTime(waktuSekarang, '<', dataPresensi.jam_kerja.jam_pulang) && (dateFormat.dateDash(dataPresensi.createdAt) == dateFormat.dateDash(Date.now()))){
    
        try{
            /* set acc */
            const data = await Izin.update(
                {acc: 1},
                {where: {id: req.query.id}});
            
            /* Fire notifikasi */
            const dataNotifikasi = {
                    to: dataPresensi.user.tokenFCM,
                    priority: "high",
                    soundName: "default",
                    notification: {
                         title: "ACC IZIN",
                         body: `Pengajuan izin ${dateFormat.dateToString(Date.now())} sudah di Acc`
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
Jika izin ditolak maka hapus izin dan presensinya.
Jika izin sudah terAcc maka tidak dapat ditolak. 
*/
    try{
        const dataIzin = await Izin.findOne({
            where: {
                id: req.query.id,
                acc: 0
            },
            include: [
                {
                    model: Presensi,
                    as: 'presensi',
                    include: [{
                        model: User
                    }]
                }
            ]
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

        /* Fire notifikasi */
        const dataNotifikasi = {
            to: dataIzin.presensi.user.tokenFCM,
            priority: "high",
            soundName: "default",
            notification: {
                 title: "IZIN DITOLAK",
                 body: `Pengajuan izin ${dateFormat.dateToString(Date.now())} ditolak.`
            }
       }

        await axios.post('https://fcm.googleapis.com/fcm/send', dataNotifikasi, {
            headers: {
                "Authorization": `key=${process.env.FCM_KEY}`,
                "Content-Type": "application/json"
            }
        });


        res.status(200).json(dataDelete);

    }catch(err){
        return res.status(500).json({
            message: err
        })
    }
}
