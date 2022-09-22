module.exports = (sequelize, Sequelize) => {
    const LokasiKantor = sequelize.define('lokasi_kantor', {
        lat: {
            type: Sequelize.FLOAT
        },
        lng: {
            type: Sequelize.FLOAT
        },
        nama_lokasikantor: {
            type: Sequelize.STRING,
            required: true
        }
    });

    return LokasiKantor;
}