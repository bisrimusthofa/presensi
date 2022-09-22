const db = require('../../models');
const User = db.user;
const Role = db.role;
const Jabatan = db.jabatan;
const Op = db.Sequelize.Op;
const bcrypt = require('bcryptjs');
const validation = require('../../config/validation');
const { unlink } = require('fs/promises');
const path = require('path');

exports.index = async (req, res) => {
    let urlOriginal = req.protocol + '://' + req.get('host') + req.originalUrl;
    let url = urlOriginal.split('?')[0];

    let currentPage = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 5;

    //get admin
    roleKaryawan = await Role.findOne({where: {nama_role: 'karyawan'}});
    
    try{
        const data = req.query.search
                        ?   await User.findAndCountAll({
                                distinct: true,
                                attributes: {exclude: ['password', 'roleId', 'jabatanId', 'createdAt', 'updatedAt']},
                                where:{
                                    [Op.or] : [{
                                        nama : {
                                            [Op.like]: `%${req.query.search}%`
                                        }
                                    },
                                    {
                                        id : {
                                            [Op.like]: `%${req.query.search}%`
                                        }
                                    },
                                    {
                                        email : {
                                            [Op.like]: `%${req.query.search}%`
                                        }
                                    }],
                                    roleId: {
                                        [Op.eq]: roleKaryawan.id
                                    }
                                },
                                offset: (currentPage - 1) * perPage,
                                limit: perPage,
                                order: [
                                    ['createdAt', 'desc']
                                ]
                            })
                        :   await User.findAndCountAll({
                                distinct: true,
                                attributes: {exclude: ['password', 'roleId', 'jabatanId', 'createdAt', 'updatedAt']},
                                where: {
                                    roleId: {
                                        [Op.eq]: roleKaryawan.id
                                    }
                                },
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
     const {error} = validation.createKaryawanValidation(req.body);
    
     if(error){
         return res.status(400).json({
             message: error.details[0].message
         })
     }
     if(req.body.password == 'undefined'){
        return res.status(400).json({
            message: 'Password harus diisi'
        })
     }
 
     //check email
     const emailExist = await User.findOne({where:{email: req.body.email}});
     
     if(emailExist){
         return res.status(400).json({
             status: res.statusCode,
             message: 'Email sudah digunakan'
         });
     }

     //check image
     const photo = req.file ? req.file.path : 'images\\no_profile.png';
 
     //Hashing password
     const salt = await bcrypt.genSalt(10);
     const hashPassword = await bcrypt.hash(req.body.password, salt); 
     
     //get id karyawan
     const roleKaryawan = await Role.findOne({where: {nama_role: 'karyawan'}});

     //generate id K-[id-Jabatan][tahundaftar][index]
     const id = async () => {

        let huruf = 'K';
        let idJabatan = req.body.jabatanId;
        let tahunDaftar = new Date().getFullYear();

         try{
            const lastId = await User.findAll({
                where: {roleId: roleKaryawan.id},
                attributes: [[db.sequelize.fn('max', db.sequelize.col("id")), 'maxid']],
                raw: true
            });
            if(lastId[0].maxid){
                let number = parseInt(lastId[0].maxid.slice(7, 10));
                number++;
                let index = number.toString().padStart(3, 0);
                let id = `${huruf+idJabatan+tahunDaftar+index}`

                return id;
            }else{
                let number = 1;
                let index = number.toString().padStart(3, 0);
                let id = `${huruf+idJabatan+tahunDaftar+index}`;
                res.json(lastId[0].maxid)
                return id;
            }

         }catch(err){
            res.json(err)
         }
     }

     const user = {
         id: await id(),
         nama: req.body.nama,
         jenis_kelamin: req.body.jenis_kelamin,
         tempat_lahir: req.body.tempat_lahir,
         tgl_lahir: req.body.tgl_lahir,
         provinsi: req.body.provinsi,
         kabupaten: req.body.kabupaten,
         kecamatan: req.body.kecamatan,
         alamat: req.body.alamat,
         no_hp: req.body.no_hp,
         email: req.body.email,
         photo: photo,
         password: hashPassword,
         roleId: roleKaryawan.id,
         jabatanId: req.body.jabatanId,
     }
 
     try{
         const data = await User.create(user)
         res.json(data);
     }catch(err){
         res.status(500).json({
             message: err
         })
     }
}

exports.update = async (req, res) => {
    //validate
    const {error} = validation.updateKaryawanValidation(req.body);
   
    if(error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    //inisialisasi payload
    const userUpdate = {
        nama: req.body.nama,
        jenis_kelamin: req.body.jenis_kelamin,
        tempat_lahir: req.body.tempat_lahir,
        tgl_lahir: req.body.tgl_lahir,
        provinsi: req.body.provinsi,
        kabupaten: req.body.kabupaten,
        kecamatan: req.body.kecamatan,
        alamat: req.body.alamat,
        jabatanId: req.body.jabatanId,
        no_hp: req.body.no_hp,
        email: req.body.email
    }

    //get KaryawanOld
    const KaryawanOld = await User.findOne({where:{id: req.body.id}});
    
    //check jika ubah email
    if(req.body.email != KaryawanOld.email){
        const emailExist = await User.findOne({where:{email: req.body.email}});
        if(emailExist){
            return res.status(400).json({
                status: res.statusCode,
                message: 'Email sudah digunakan'
            });
        }
    }

    //check jika ubah password
    if(req.body.password && req.body.password != 'undefined'){
        //Hashing password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        userUpdate.password = hashPassword;
    }

    //check jika ubah foto
    if(req.file){
        //jika bukan photo default maka hapus foto

            let filename = path.basename(KaryawanOld.photo);

            if(filename != 'no_profile.png'){
                unlink(KaryawanOld.photo);
            }

            userUpdate.photo = req.file.path;
    }else{
        userUpdate.photo = req.body.photo;
    }

    try{
        const data = await User.update(
            userUpdate,
            {where: {id: req.params.id}}
        )
        res.json(data);
    }catch(err){
        res.status(500).json({
            message: err
        })
    }
}

exports.delete = async (req, res) => {
    try{
        const data = await User.findOne({where: {id: req.params.id}});
        let filename = await path.basename(data.photo)

        //jika bukan photo default maka hapus foto
        if(filename != 'no_profile.png'){
            await unlink(data.photo);
        }

        //hapus data
        const dataDelete = await data.destroy();
        
        res.status(200).json(dataDelete);
    }catch(err){
        res.status(500).json({
            message: err
        })
    }
}

exports.getJabatan = async (req, res) => {
    try{
        const data = await Jabatan.findAll();

        res.status(200).json(data);
    }catch(err){
        res.status(500).json({
            message: err
        })
    }
}