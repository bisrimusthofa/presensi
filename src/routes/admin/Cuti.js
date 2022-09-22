const express = require('express');
const router = express.Router();
const Cuti = require('../../controllers/admin/CutiController');
const {verifyToken} = require('../../config/verifyToken');

router.get('/', verifyToken, Cuti.index);
router.get('/getAcc', verifyToken, Cuti.getAcc);
router.post('/acc', verifyToken, Cuti.acc);
router.post('/tolak', verifyToken, Cuti.tolak);
router.get('/riwayatCuti/:id', verifyToken, Cuti.getRiwayatCuti);

module.exports = router;