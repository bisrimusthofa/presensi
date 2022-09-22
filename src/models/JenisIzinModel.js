module.exports = (sequelize, Sequelize) => {
    const JenisIzin = sequelize.define('jenis_izin', {
        jenis_izin: {
            type: Sequelize.STRING,
            required: true
        }
    });

    return JenisIzin;
}