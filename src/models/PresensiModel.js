module.exports = (sequelize, Sequelize) => {
    const Presensi = sequelize.define('presensi', {
        jam_masuk: {
            type: Sequelize.TIME
        },
        jam_pulang: {
            type: Sequelize.TIME
        },
        status: {
            type: Sequelize.ENUM('normal', 'terlambat', 'izin', 'cuti', 'miss', 'libur')
        },
        userId: {
            type: Sequelize.STRING,
            required: true
        },
        izinId: {
            type: Sequelize.STRING,
            required: true
        },
        jamKerjaId: {
            type: Sequelize.STRING,
            required: true
        },
        createdAt: {
            type: Sequelize.DATE,
            required: true
        },
        updatedAt: {
            type: Sequelize.DATE,
            required: true
        }
    });

    return Presensi;
}