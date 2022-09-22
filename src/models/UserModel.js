const Role = require('./RoleModel');

module.exports = (sequelize, Sequelize) => {
    const Users = sequelize.define('users', {
        nama: {
            type: Sequelize.STRING
        },
        jenis_kelamin: {
            type: Sequelize.ENUM('laki-laki', 'perempuan')
        },
        tempat_lahir: {
            type: Sequelize.STRING
        },
        tgl_lahir: {
            type: Sequelize.DATEONLY
        },
        provinsi: {
            type: Sequelize.STRING
        },
        kabupaten: {
            type: Sequelize.STRING
        },
        kecamatan: {
            type: Sequelize.STRING
        },
        alamat: {
            type: Sequelize.STRING
        },
        no_hp: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        photo: {
            type: Sequelize.STRING
        },
        roleId: {
            type: Sequelize.STRING
        },
        jabatanId: {
            type: Sequelize.STRING
        },
        socketId: {
            type: Sequelize.STRING
        },
        tokenFCM: {
            type: Sequelize.STRING
        }
    });
    
    return Users;
}