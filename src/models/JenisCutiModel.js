module.exports = (sequelize, Sequelize) => {
    const JenisIzin = sequelize.define('jenis_cuti', {
        jenis_cuti: {
            type: Sequelize.STRING,
            required: true
        }
    });

    return JenisIzin;
}