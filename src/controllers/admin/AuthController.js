const db = require('../../models');
const User = db.user;
const Role = db.role;
const Op = db.Sequelize.Op;
const bcrypt = require('bcryptjs');
const validation = require('../../config/validation');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const user = await User.findOne({where:{email: req.body.email}});
    
    if(!user){
        return res.status(400).json({
            status: res.statusCode,
            message: 'Email salah'
        });
    }
    //check role
    roleAdmin = await Role.findOne({where: {nama_role: 'Admin'}});
    if(user.roleId !== roleAdmin.id){
        return res.status(403).json({
            status: res.statusCode,
            message: 'Hanya untuk admin'
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
    res.status(201).header('auth-token-admin', token).json({
        status: res.statusCode,
        token: token
    })
}