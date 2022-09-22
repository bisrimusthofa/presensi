const db = require('../../models');
const LokasiKantor = db.lokasi_kantor;
const Op = db.Sequelize.Op;
const validation = require('../../config/validation');

//create
exports.index = async (req, res) => {
    let urlOriginal = req.protocol + '://' + req.get('host') + req.originalUrl;
    let url = urlOriginal.split('?')[0];

    let currentPage = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 5;
    try{
        const data = req.query.search
                        ?   await LokasiKantor.findAndCountAll({
                                where:{
                                    [Op.or] : [{
                                        nama_lokasikantor : {
                                            [Op.like]: `%${req.query.search}%`
                                        }
                                    },
                                    {
                                        id : {
                                            [Op.like]: `%${req.query.search}%`
                                        }
                                    }],
                                },
                                offset: (currentPage - 1) * perPage,
                                limit: perPage,
                                order: [
                                    ['createdAt', 'desc']
                                ]
                            })
                        :   await LokasiKantor.findAndCountAll({
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

exports.create = async (req, res) => {
    //validate
    const {error} = validation.createLokasiKantorValidation(req.body);

    if(error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    //generate ID
    const id =  async () => {
        let huruf = 'L';
        try{

            const lastId = await LokasiKantor.findAll({
                attributes: [[db.sequelize.fn('max', db.sequelize.col("id")), 'maxid']],
                raw: true
            });

            if(lastId[0].maxid){
                let number = parseInt(lastId[0].maxid.slice(1, 3));
                number++;
                let dataId = number.toString().padStart(2, '0');
                return `${huruf+dataId}`;
            }else{
                let number = 1
                let dataId = number.toString().padStart(2, '0');
                return `${huruf+dataId}`;
            }
        }catch(err){
            res.json(err)
        }
    }

    // payload Lokasi Kantor
    const lokasiKantor = {
        id: await id(),
        lat: parseFloat(req.body.lat),
        lng: parseFloat(req.body.lng),
        nama_lokasikantor: req.body.nama_lokasikantor,
        isActive: req.body.isActive
    }

    try{
        const data = await LokasiKantor.create(lokasiKantor);
        res.status(200).json(data)
    }catch(err){
        res.status(500).json({
            message: err
        })
    }
}
exports.update = async (req, res) => {
    //validate
    const {error} = validation.updateLokasiKantorValidation(req.body);

    if(error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    const lokasiKantor = {
        lat: req.body.lat,
        lng: req.body.lng,
        nama_lokasikantor: req.body.nama_lokasikantor,
        isActive: req.body.isActive
    }

    try{
        const data = await LokasiKantor.update(
            lokasiKantor,
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
        const deleteData = await LokasiKantor.findOne({where: {id: req.params.id}});
        const data = await deleteData.destroy();

        res.status(200).json(data);
    }catch(err){
        res.status(500).json({
            message: err
        })
    }
}