module.exports = (sequelize, Sequelize) => {
    const Izin = sequelize.define('izin', {
        keterangan: {
            type: Sequelize.STRING
        },
        jenisIzinId: {
            type: Sequelize.STRING
        },
        acc: {
            type: Sequelize.BOOLEAN
        },
        berkas: {
            type: Sequelize.STRING
        },
        pesan: {
            type: Sequelize.STRING
        },
    });

    return Izin;
}