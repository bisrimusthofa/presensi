const express = require('express');
require('dotenv/config');
const cors = require('cors');
const path = require('path');
const db = require('./src/models');
const app = express();
const http = require('http').createServer(app);
const Socket = require('./src/utils/socket');
const {cronJadwal} = require('./src/config/cronJadwal');
const { cronRekapPresensi } = require('./src/config/cronRekap');

let whitelist = [
    'http://localhost:8080',
    'http://localhost:8081'
];

let corsOption = {
    origin: (origin, callback)=>{
        if(whitelist.indexOf(origin) !== -1 || !origin){
            callback(null, true);
        }else{
            callback(new Error('Not allowed by CORS'));
        }
    }
};

//Middleware
app.use(cors(corsOption));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use('/images', express.static(path.join(__dirname, 'images')));
db.sequelize.sync();
const io = require('socket.io')(http, {
    allowEIO3: true,
    cors: {
        origin: whitelist,
        credentials: true
    }
});
new Socket(io).socketConfig();

/* Set jadwal otomatis dan rekap presensi per jam 9 malam */
cronJadwal();
cronRekapPresensi();

//import routes admin
const authAdminApi = require('./src/routes/admin/auth');
const roleApi = require('./src/routes/admin/Role');
const jabatanApi = require('./src/routes/admin/Jabatan');
const adminApi = require('./src/routes/admin/Admin');
const karyawanApi = require('./src/routes/admin/Karyawan');
const lokasiKantorApi = require('./src/routes/admin/LokasiKantor');
const jamKerjaApi = require('./src/routes/admin/JamKerja');
const jenisIzinApi = require('./src/routes/admin/JenisIzin');
const jenisCutiApi = require('./src/routes/admin/JenisCuti');
const presensiApi = require('./src/routes/admin/presensi');
const izinApi = require('./src/routes/admin/Izin');
const cutiApi = require('./src/routes/admin/Cuti');
const liburApi = require('./src/routes/admin/Libur');

//define routes admin
app.use('/admin/auth', authAdminApi);
app.use('/admin/roles', roleApi);
app.use('/admin/jabatan', jabatanApi);
app.use('/admin', adminApi);
app.use('/admin/karyawan', karyawanApi);
app.use('/admin/lokasi-kantor', lokasiKantorApi);
app.use('/admin/jam-kerja', jamKerjaApi);
app.use('/admin/jenis-izin', jenisIzinApi);
app.use('/admin/jenis-cuti', jenisCutiApi);
app.use('/admin/presensi', presensiApi);
app.use('/admin/izin', izinApi);
app.use('/admin/cuti', cutiApi);
app.use('/admin/hari-libur', liburApi);

//import routes karyawan
const authKaryawanApi = require('./src/routes/karyawan/auth');
const presensiKaryawanApi = require('./src/routes/karyawan/presensi');
const izinKaryawanApi = require('./src/routes/karyawan/izin');
const cutiKaryawanApi = require('./src/routes/karyawan/cuti');

//define routes karyawan
app.use('/auth', authKaryawanApi);
app.use('/presensi', presensiKaryawanApi);
app.use('/izin', izinKaryawanApi);
app.use('/cuti', cutiKaryawanApi);

http.listen(process.env.PORT, ()=>{
    console.log(`Server jalan di http://localhost:${process.env.PORT}`);
})