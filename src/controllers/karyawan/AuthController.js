const db = require('../../models');
const User = db.user;
const Role = db.role;
const Jabatan = db.jabatan;
const Op = db.Sequelize.Op;
const bcrypt = require('bcryptjs');
const validation = require('../../config/validation');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const user = await User.findOne({
        where:{
            email: req.body.email
        },
        include: [{
            model: Jabatan,
            as: 'jabatan'
        }]
    });
    
    if(!user){
        return res.status(400).json({
            status: res.statusCode,
            message: 'Email salah'
        });
    }
    //check role
    roleAdmin = await Role.findOne({where: {nama_role: 'Karyawan'}});
    if(user.roleId !== roleAdmin.id){
        return res.status(403).json({
            status: res.statusCode,
            message: 'Hanya untuk Karywan'
        });
    }

    //check password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword){
        return res.status(400).json({
            status: res.statusCode,
            message: 'Password Salah'
        });
    }
    //hapus password lalu encode ke jwt
    delete user.dataValues.password;

    //set jwt
    const token = jwt.sign({user: user}, process.env.SECRET_KEY)
    res.status(201).header('auth-token-karyawan', token).json({
        status: res.statusCode,
        token: token
    })
}

exports.setToken = async (req, res) => {
    try{
        const data = await User.update(
            {tokenFCM: req.body.token},
            {
                where: {
                    id: req.params.id
                }
            }
        )

        res.status(200).json(data);
    }catch(error){
        return res.status(500).json({
            message: error
        })
    }
}