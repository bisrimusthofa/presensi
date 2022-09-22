const db = require('../../models');
const Role = db.role;
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
                        ?   await Role.findAndCountAll({
                                where:{
                                    [Op.or] : [{
                                        nama_role : {
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
                        :   await Role.findAndCountAll({
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
    const {error} = validation.createRoleValidation(req.body);

    if(error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    //generate ID
    const id =  async () => {
        let huruf = 'R-';
        try{
            const lastId = await Role.findAll({
                attributes: [[db.sequelize.fn('max', db.sequelize.col("id")), 'maxid']],
                raw: true
            });
            let inc = parseInt(lastId[0].maxid.slice(2, 4));
            inc++;
            let angka = inc < 10 ? '0'+inc.toString() : inc;
            return `${huruf+angka}`;
        }catch(err){
            res.json(err)
        }
    }

    // payload role
    const role = {
        id: await id(),
        nama_role: req.body.nama_role
    }
    try{
        const data = await Role.create(role);
        res.status(200).json(data)
    }catch(err){
        res.status(500).json({
            message: err
        })
    }
},
exports.update = async (req, res) => {
    //validate
    const {error} = validation.createRoleValidation(req.body);

    if(error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    const role = {
        nama_role: req.body.nama_role
    }

    try{
        const data = await Role.update(
            role,
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
        const deleteData = await Role.findOne({where: {id: req.params.id}});
        const data = await deleteData.destroy();

        res.status(200).json(data);
    }catch(err){
        res.status(500).json({
            message: err
        })
    }
}