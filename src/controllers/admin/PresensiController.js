const db = require('../../models');
const Presensi = db.presensi;
const Izin = db.izin;
const Cuti = db.cuti;
const JenisCuti = db.jenis_cuti;
const JenisIzin = db.jenis_izin;
const User = db.user;
const Role = db.role;
const JamKerja = db.JamKerja;
const Jabatan = db.jabatan;
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;
const QRCode = require('qrcode');
const JWT = require('jsonwebtoken');
const dateFormat = require('../../utils/convertDate');

exports.index = async (req, res) => {
    let urlOriginal = req.protocol + '://' + req.get('host') + req.originalUrl;
    let url = urlOriginal.split('?')[0];

    let currentPage = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 10;
    try{
        const data = req.query.search
                        ?   await Presensi.findAndCountAll({
                                distinct: true,
                                where:{
                                    [Op.or] : [
                                        {
                                            '$izin.jenis_izin.jenis_izin$' : {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        },
                                        {
                                            '$user.nama$' : {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        },
                                        {
                                            id: {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        },
                                        {
                                            createdAt: {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        },
                                        {
                                            status: {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        }
                                    ],
                                    createdAt: {
                                        [Op.substring] : `%${req.query.hari}%`
                                    }
                                },
                                include: [
                                    {
                                        model: Izin,
                                        as: 'izin',
                                        required: false,
                                        include: [{
                                            model: JenisIzin,
                                            as: 'jenis_izin',
                                            required: false
                                        }]
                                    },
                                    {
                                        model: User,
                                        as: 'user'
                                    }
                                ],
                                offset: (currentPage - 1) * perPage,
                                limit: perPage,
                                order: [
                                    ['createdAt', 'desc']
                                ]
                            })
                        :   await Presensi.findAndCountAll({
                                distinct: true,
                                where: {
                                    createdAt: {
                                        [Op.substring] : `%${req.query.hari}%`
                                    }
                                },
                                include: [
                                    {
                                        model: Izin,
                                        as: 'izin',
                                        required: false,
                                        include: [{
                                            model: JenisIzin,
                                            as: 'jenis_izin',
                                            required: false
                                        }]
                                    },
                                    {
                                        model: User,
                                        as: 'user'
                                    }
                                ],
                                offset: (currentPage - 1) * perPage,
                                limit: perPage,
                                order: [
                                    ['createdAt', 'desc']
                                ]
                            });
        //pagination
        let nextPage = perPage !== Math.ceil(data.count/currentPage) && currentPage < Math.ceil(data.count/perPage) ? `${url}?page=${currentPage+1}&perPage=${perPage}&hari=${req.query.hari}` : null;
        let prevPage = currentPage > 1 ? `${url}?page=${currentPage-1}&perPage=${perPage}&hari=${req.query.hari}` : null;

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

exports.perKaryawan = async (req, res) => {
    try{
        const data = await User.findOne({
            where: {
                id: req.query.id
            },
            include: [
                {
                    model: Presensi,
                    as: 'presensis',
                    required: false,
                    where: {
                        createdAt: {
                            [Op.between]: [req.query.tglmulai, req.query.tglselesai]
                        }
                    },
                    include: [{
                        model: Izin,
                        required: false,
                        include: [{
                            model: JenisIzin,
                            required: false
                        }]
                    }]
                },
                {
                    model: Cuti,
                    as: 'cutis',
                    required: false,
                    where: {
                        createdAt: {
                            [Op.between]: [req.query.tglmulai, req.query.tglselesai]
                        }
                    },
                    include: [{
                        model: JenisCuti,
                        required: false
                    }]
                },
                {
                    model: Role,
                    as: 'role',
                    where: {
                        nama_role : {
                            [Op.substring] : 'Karyawan'
                        }
                    }
                },
                {
                    model: Jabatan,
                    as: 'jabatan'
                }
            ]
        });

        res.status(200).json(data)
    }catch(error){
        res.status(400).json({
            message: 'Ada kesalahan',
            error: error
        })
    }
}

exports.perBulan = async (req, res) => {
    try{
        const data = req.query.search
                        ?   await User.findAll({
                                where:{
                                    [Op.or] : [
                                        {
                                            nama : {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        },
                                        {
                                            id: {
                                                [Op.like]: `%${req.query.search}%`
                                            }
                                        }
                                    ],
                                },
                                include: [
                                    {
                                        model: Presensi,
                                        required: false,
                                        where: {
                                            [Op.and]: [
                                                sequelize.where(sequelize.fn("month", sequelize.col('presensis.createdAt')), req.query.bulan?req.query.bulan:new Date().getMonth()+1),
                                                sequelize.where(sequelize.fn("year", sequelize.col('presensis.createdAt')), req.query.tahun?req.query.tahun:new Date().getFullYear()),
                                            ]
                                        },
                                        include: [{
                                            model: Izin,
                                            required: false,
                                            include: [{
                                                model: JenisIzin,
                                                required: false
                                            }]
                                        }]
                                    },
                                    {
                                        model: Role,
                                        as: 'role',
                                        where: {
                                            nama_role : {
                                                [Op.eq] : 'Karyawan'
                                            }
                                        },
                                        required: true
                                    }
                                ],
                                order: [
                                    ['nama', 'asc']
                                ]
                            })
                        :   await User.findAll({
                                include: [
                                    {
                                        model: Presensi,
                                        required: false,
                                        where: {
                                            [Op.and]: [
                                                sequelize.where(sequelize.fn("month", sequelize.col('presensis.createdAt')), req.query.bulan?req.query.bulan:new Date(Date.now()).getMonth()+1),
                                                sequelize.where(sequelize.fn("year", sequelize.col('presensis.createdAt')), req.query.tahun?req.query.tahun:new Date(Date.now()).getFullYear()),
                                            ]
                                        },
                                        include: [{
                                            model: Izin,
                                            required: false,
                                            include: [{
                                                model: JenisIzin,
                                                required: false
                                            }]
                                        }]
                                    },
                                    {
                                        model: Role,
                                        as: 'role',
                                        where: {
                                            nama_role : {
                                                [Op.substring] : 'Karyawan'
                                            }
                                        }
                                    }
                                ],
                                order: [
                                    ['nama', 'asc']
                                ]
                            });              

        res.status(200).json(data);
    }catch(error){
        res.status(400).json({
            message: 'Ada kesalahan',
            error: error
        })
    }
}

exports.generateQRCode = async (req, res) => {
    try {
        const dataJamKerja = await JamKerja.findOne({
            where: {
                isActive : {
                    [Op.eq] : 1
                }
            }
        });
        const data = JWT.sign({data: dataJamKerja}, process.env.SECRET_KEY)
        const dataQRCode = await QRCode.toDataURL(data);
        res.status(200).json(dataQRCode);
    } catch (error) {
        res.status(400).json(error);
    }
}

exports.getUser = async (req, res) => {
    try{
        const data = await User.findAll({
            include: [
                {
                    model: Role,
                    as: 'role',
                    where: {
                        nama_role : {
                            [Op.substring] : 'Karyawan'
                        }
                    }
                },
                {
                    model: Jabatan,
                    as: 'jabatan'
                }
            ]
        });
        res.status(200).json(data);
    }catch(error){
        res.status(400).json({
            message: 'Ada kesalahan',
            error: error
        })
    }
}

