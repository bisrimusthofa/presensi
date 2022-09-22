module.exports = (sequelize, Sequelize) => {
    const JamKerja = sequelize.define('jam_kerja', {
        hari: {
            type: Sequelize.TINYINT
        },
        jam_masuk: {
            type: Sequelize.TIME
        },
        jam_pulang: {
            type: Sequelize.TIME
        },
        lokasiKantorsId: {
            type: Sequelize.STRING,
            required: true
        },
        isActive: {
            type: Sequelize.BOOLEAN
        }
    });

    return JamKerja;
}