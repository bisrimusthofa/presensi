const express = require('express');
const router = express.Router();
const PresensiController = require('../../controllers/admin/PresensiController');
const {verifyToken} = require('../../config/verifyToken');

router.get('/', verifyToken, PresensiController.index);
router.get('/getuser', verifyToken, PresensiController.getUser);
router.get('/perkaryawan', verifyToken, PresensiController.perKaryawan);
router.get('/perbulan', verifyToken, PresensiController.perBulan);
router.get('/generateQRCode', verifyToken, PresensiController.generateQRCode);

module.exports = router;