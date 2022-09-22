module.exports = (sequelize, Sequelize) => {
    const Jabatan = sequelize.define('jabatan', {
        nama_jabatan: {
            type: Sequelize.STRING
        }
    });

    return Jabatan;
}