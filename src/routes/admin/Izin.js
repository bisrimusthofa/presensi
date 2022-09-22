const express = require('express');
const router = express.Router();
const Izin = require('../../controllers/admin/IzinController');
const {verifyToken} = require('../../config/verifyToken');

router.get('/', verifyToken, Izin.index);
router.get('/all', verifyToken, Izin.all);
router.post('/acc', verifyToken, Izin.acc);
router.post('/tolak', verifyToken, Izin.tolak);

module.exports = router;