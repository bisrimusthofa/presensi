const express = require('express');
const router = express.Router();
const LokasiKantorController = require('../../controllers/admin/LokasiKantorController');
const {verifyToken} = require('../../config/verifyToken');

router.get('/', verifyToken, LokasiKantorController.index);
router.post('/create', verifyToken, LokasiKantorController.create);
router.put('/:id/update', verifyToken, LokasiKantorController.update);
router.delete('/:id/delete', verifyToken, LokasiKantorController.delete);

module.exports = router;