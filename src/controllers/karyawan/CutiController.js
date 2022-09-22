const db = require('../../models');
const Cuti = db.cuti;
const JenisCuti = db.jenis_cuti;
const Op = db.Sequelize.Op;
const validation = require('../../config/validation');
const dateFormat = require('../../utils/convertDate');
const compareDate = require('../../config/compareDate');
const { unlink } = require('fs/promises');
const path = require('path');
const {checkLibur} = require('../../utils/helper');

exports.index = async (req, res) => {
    let urlOriginal = req.protocol + '://' + req.get('host') + req.originalUrl;
    let url = urlOriginal.split('?')[0];

    let currentPage = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 5;
    try{
        let data = {};
        if(req.query.search){
            data = await Cuti.findAndCountAll({
                where: {
                    [Op.or]: [
                        {
                            '$jenis_cuti.jenis_cuti$' : {
                                [Op.like] : `%${req.query.search}%`
                            }
                        },
                        {
                            createdAt: {
                                [Op.substring] : `%${req.query.search}%`
                            }
                        }
                    ],
                    userId: {
                        [Op.eq] : req.params.id
                    }
                },
                include: [
                    {
                        model: JenisCuti,
                        as: 'jenis_cuti',
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
            if(filter.jenis_cuti.length > 0){
                filter.jenis_cuti.map((data)=>{
                    stateArrayJI.push(data.jenis_cuti);
                    if(data.status){
                        arrayJI.push(data.jenis_cuti);
                    }
                })
            }

            //identifikasi data acc dan tidak acc
            filter.acc ? arrayAcc.push(1) : '';
            filter.notAcc ? arrayAcc.push(0) : '';

            data = await Cuti.findAndCountAll({
                where: {
                    [Op.and]: {
                        '$jenis_cuti.jenis_cuti$': {
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
                        },
                        userId: {
                            [Op.eq] : req.params.id
                        }
                    }
                },
                include: [
                    {
                        model: JenisCuti,
                        as: 'jenis_cuti',
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
            data = await Cuti.findAndCountAll({
                where: {
                    userId: {
                        [Op.eq] : req.params.id
                    }
                },
                include: [
                    {
                        model: JenisCuti
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
    const {error} = validation.createCutiValidation(req.body);

    if(error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    //check tanggal jika tgl mmulai lebih besar dari tanggal selesai dan tgl mulai tidak sama dengan tanggal selesai maka benar
    const tanggalValid = compareDate(req.body.tgl_mulai, '<', req.body.tgl_selesai) && compareDate(req.body.tgl_mulai, '>', Date.now()) && dateFormat.dateDash(req.body.tgl_mulai) != dateFormat.dateDash(req.body.tgl_selesai);
    
    if(!tanggalValid){
        return res.status(400).json({
            message: 'Tanggal tidak valid'
        })
    }

    //check berkas
    const berkas = req.file ? req.file.path : 'images\\no_berkas.png';

    //generate ID
    const id =  async () => {
        let huruf = 'C';
        let tglHariIni = dateFormat.dateSlash(Date.now());
        try{

            /* data max id izin berdasarkan createdAt hari ini */
            const lastId = await Cuti.findAll({
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

    // payload Cuti
    const cuti = {
        id: await id(),
        tgl_mulai: req.body.tgl_mulai,
        tgl_selesai: req.body.tgl_selesai,
        keterangan: req.body.keterangan,
        jenisCutiId: req.body.jenisCutiId,
        userId: req.body.userId,
        berkas: berkas
    }

    try{
        const data = await Cuti.create(cuti);
        res.status(200).json(data)
    }catch(err){
        return res.status(500).json({
            message: err
        })
    }
},

exports.delete = async (req, res) => {
    try{
        const dataCuti = await Cuti.findOne({
            where: {
                id: req.query.id,
                acc: 0
            },
            raw: true
        });

        if(!dataCuti || dataCuti == []){
            return res.status(400).json({
                message: 'Data cuti tidak valid'
            })
        }

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

exports.jenisCuti = async (req, res) => {
    try{
        const data = await JenisCuti.findAll();

        res.status(200).json(data);
    }catch(err){
        res.status(500).json({
            message: err
        })
    }
}