module.exports = (sequelize, Sequelize) => {
    const Cuti = sequelize.define('cuti', {
        keterangan: {
            type: Sequelize.STRING
        },
        tgl_mulai: {
            type: Sequelize.DATE
        },
        tgl_selesai: {
            type: Sequelize.DATE
        },
        jenisCutiId: {
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
        userId: {
            type: Sequelize.STRING
        }
    });

    return Cuti;
}