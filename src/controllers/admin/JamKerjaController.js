const db = require('../../models');
const JamKerja = db.JamKerja;
const lokasi_kantors = db.lokasi_kantor;
const Op = db.Sequelize.Op;
const validation = require('../../config/validation');
const jwt = require('jsonwebtoken');

//create
exports.index = async (req, res) => {
    let urlOriginal = req.protocol + '://' + req.get('host') + req.originalUrl;
    let url = urlOriginal.split('?')[0];

    let currentPage = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 5;
    try{
        const data = req.query.search
                        ?   await JamKerja.findAndCountAll({
                                distinct: true,
                                where:{
                                    [Op.or] : [{
                                        jam_masuk : {
                                            [Op.like]: `%${req.query.search}%`
                                        }
                                    },
                                    {
                                        jam_pulang : {
                                            [Op.like]: `%${req.query.search}%`
                                        }
                                    },
                                    {
                                        id : {
                                            [Op.like]: `%${req.query.search}%`
                                        }
                                    }],
                                },
                                include: [
                                    { model: lokasi_kantors }
                                ],
                                offset: (currentPage - 1) * perPage,
                                limit: perPage,
                                order: [
                                    ['createdAt', 'desc']
                                ]
                            })
                        :   await JamKerja.findAndCountAll({
                                distinct: true,
                                include: [
                                    { model: lokasi_kantors }
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

exports.jamKerjaActive = async (req, res) => {
    try{
        const data = await JamKerja.findOne({
            where: {
                isActive: 1
            },
            include: [{
                model: lokasi_kantors
            }]
        });

        res.status(200).json(data);

    }catch(error){
        res.status(400).json({
            message: 'Ada kesalahan',
            error: error
        })
    }
}

exports.create = async (req, res) => {
    //validate
    const {error} = validation.createJamKerjaValidation(req.body);

    if(error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    //generate ID
    const id =  async () => {
        let huruf = 'J';
        let idLokasiKantor = req.body.lokasiKantorId.slice(1, 3);
        try{

            const lastId = await JamKerja.findAll({
                attributes: [[db.sequelize.fn('max', db.sequelize.col("id")), 'maxid']],
                raw: true
            });

            if(lastId[0].maxid){
                let number = parseInt(lastId[0].maxid.slice(3, 5));
                number++;
                let dataId = number.toString().padStart(2, '0');
                return `${huruf+idLokasiKantor+dataId}`;
            }else{
                let number = 1
                let dataId = number.toString().padStart(2, '0');
                return `${huruf+idLokasiKantor+dataId}`;
            }
        }catch(err){
            res.json(err)
        }
    }

    // payload jam kerja
    const jamkerja = {
        id: await id(),
        hari: req.body.hari,
        jam_masuk: req.body.jam_masuk,
        jam_pulang: req.body.jam_pulang,
        lokasiKantorsId: req.body.lokasiKantorId,
        isActive: req.body.isActive
    }

    try{
        const data = await JamKerja.create(jamkerja);
        res.status(200).json(data)
    }catch(err){
        res.status(500).json({
            message: err
        })
    }
}
exports.update = async (req, res) => {
    //validate
    const {error} = validation.updateJamKerjaValidation(req.body);

    if(error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    const jamkerja = {
        hari: req.body.hari,
        jam_masuk: req.body.jam_masuk,
        jam_pulang: req.body.jam_pulang,
        lokasiKantorsId: req.body.lokasiKantorId,
    }

    try{
        const data = await JamKerja.update(
            jamkerja,
            {where: {id: req.params.id}});

        res.status(200).json(data);
    }catch(err){
        res.status(500).json({
            message: err
        })
    }
}

exports.delete = async (req, res) => {
    try{
        const deleteData = await JamKerja.findOne({where: {id: req.params.id}});
        const data = await deleteData.destroy();

        res.status(200).json(data);
    }catch(err){
        res.status(500).json({
            message: err
        })
    }
}

exports.updateActive = async (req, res) => {

    try{
        //set false pada semua data
        await JamKerja.update(
            {isActive: false},
            {where: {isActive: true}}
        )

        const data = await JamKerja.update(
            {isActive: true},
            {where: {id: req.params.id}}
        )

        res.status(200).json(data);
    }catch(err){
        res.status(500).json({
            message: err
        })
    }
}

exports.getLokasiKantor = async (req, res) => {
    try{
        let data = await lokasi_kantors.findAll();

        res.status(200).json(data);
    }catch(err){
        res.status(500).json({
            message: err
        })
    }
}