const express = require('express');
const router = express.Router();
const PresensiController = require('../../controllers/karyawan/PresensiController');
const {verifyTokenKaryawan, verifyTokenPresensi} = require('../../config/verifyToken');

router.get('/presensiOneWeek/:id', verifyTokenKaryawan, PresensiController.oneWeek);
router.get('/:id', verifyTokenKaryawan, PresensiController.index);
router.post('/create', verifyTokenKaryawan, verifyTokenPresensi, PresensiController.create);

module.exports = router;