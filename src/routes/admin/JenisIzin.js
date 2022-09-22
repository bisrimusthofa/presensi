const express = require('express');
const router = express.Router();
const JenisIzin = require('../../controllers/admin/JenisIzinController');
const {verifyToken} = require('../../config/verifyToken');

router.get('/', verifyToken, JenisIzin.index);
router.post('/create', verifyToken, JenisIzin.create);
router.put('/:id/update', verifyToken, JenisIzin.update);
router.delete('/:id/delete', verifyToken, JenisIzin.delete);

module.exports = router;