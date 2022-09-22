const dbConfig = require('../config/dbConfig');

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorAliases: false,
    pool: dbConfig.pool
});

try {
    sequelize.authenticate();
    console.log('Database terkoneksi.');
  } catch (error) {
    console.error('Error koneksi database:', error);
  }

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//model dan relasi role dan user dan jabatan
db.role = require('./RoleModel.js')(sequelize, Sequelize);
db.jabatan = require('./JabatanModel.js')(sequelize, Sequelize);
db.user = require('./UserModel.js')(sequelize, Sequelize);
db.role.hasMany(db.user, {as: 'user'});
db.jabatan.hasMany(db.user, {as: 'user'})
db.user.belongsTo(db.role, {as: 'role'});
db.user.belongsTo(db.jabatan, {as: 'jabatan'});

//model dan relasi lokasi kerja dan jam kerja
db.lokasi_kantor = require('./LokasiKantorModel')(sequelize, Sequelize);
db.JamKerja = require('./JamKerjaModel')(sequelize, Sequelize);
db.lokasi_kantor.hasMany(db.JamKerja, {foreignKey: 'lokasiKantorsId'}, {as: 'jam_kerja'});
db.JamKerja.belongsTo(db.lokasi_kantor,  {foreignKey: 'lokasiKantorsId'}, {as: 'lokasi_kantor'});

//model dan relasi presensi dengan user dan jam kerja
db.presensi = require('./PresensiModel')(sequelize, Sequelize);
db.JamKerja.hasOne(db.presensi, {foreignKey: 'jamKerjaId'}, {as: 'presensi'});
db.presensi.belongsTo(db.JamKerja, {foreignKey: 'jamKerjaId'}, {as: 'jam_kerja'});
db.user.hasMany(db.presensi, {foreignKey: 'userId'}, {as: 'presensi'});
db.presensi.belongsTo(db.user, {foreignKey: 'userId'}, {as: 'user'});

//izin
db.jenis_izin = require('./JenisIzinModel')(sequelize, Sequelize);
db.izin = require('./IzinModel')(sequelize, Sequelize);
db.jenis_izin.hasMany(db.izin, {foreignKey: 'jenisIzinId'}, {as: 'izin'});
db.izin.belongsTo(db.jenis_izin, {foreignKey: 'jenisIzinId'}, {as: 'jenis_izin'});
db.izin.hasOne(db.presensi, {foreignKey: 'izinId'}, {as: 'presensi'});
db.presensi.belongsTo(db.izin, {foreignKey: 'izinId'}, {as: 'izin'});

//cuti
db.jenis_cuti = require('./JenisCutiModel')(sequelize, Sequelize);
db.cuti = require('./CutiModel')(sequelize, Sequelize);
db.jenis_cuti.hasMany(db.cuti, {foreignKey: 'jenisCutiId'}, {as: 'cuti'});
db.cuti.belongsTo(db.jenis_cuti, {foreignKey: 'jenisCutiId'}, {as: 'jenis_cuti'});
db.user.hasMany(db.cuti, {foreignKey: 'userId'}, {as: 'cuti'});
db.cuti.belongsTo(db.user, {foreignKey: 'userId'}, {as: 'user'});

module.exports = db