const db = require('../../models');
const JenisCuti = db.jenis_cuti;
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
                        ?   await JenisCuti.findAndCountAll({
                                where:{
                                    [Op.or] : [{
                                        jenis_cuti : {
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
                        :   await JenisCuti.findAndCountAll({
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
    const {error} = validation.createJenisCutiValidation(req.body);

    if(error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    //generate ID
    const id =  async () => {
        let huruf = 'JC'
        try{

            const lastId = await JenisCuti.findAll({
                attributes: [[db.sequelize.fn('max', db.sequelize.col("id")), 'maxid']],
                raw: true
            });

            if(lastId[0].maxid){
                let number = parseInt(lastId[0].maxid.slice(2, 5));
                number++;
                let dataId = number.toString().padStart(2, 0);
                return `${huruf+dataId}`;
            }else{
                let number = 1
                let dataId = number.toString().padStart(2, 0);
                return `${huruf+dataId}`;
            }
        }catch(err){
            res.json(err)
        }
    }

    // payload Jabatan
    const jenisCuti = {
        id: await id(),
        jenis_cuti: req.body.jenis_cuti
    }

    try{
        const data = await JenisCuti.create(jenisCuti);
        res.status(200).json(data)
    }catch(err){
        res.status(500).json({
            message: err
        })
    }
},
exports.update = async (req, res) => {
    //validate
    const {error} = validation.createJabatanValidation(req.body);

    const jenisCuti = {
        jenis_cuti: req.body.jenis_cuti
    }

    try{
        const data = await JenisCuti.update(
            jenisCuti,
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
        const deleteData = await JenisCuti.findOne({where: {id: req.params.id}});
        const data = await deleteData.destroy();

        res.status(200).json(data);
    }catch(err){
        res.status(500).json({
            message: err
        })
    }
}