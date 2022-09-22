const express = require('express');
const router = express.Router();
const JamKerjaController = require('../../controllers/admin/JamKerjaController');
const {verifyToken} = require('../../config/verifyToken');

router.get('/', verifyToken, JamKerjaController.index);
router.get('/getLokasiKantor', verifyToken, JamKerjaController.getLokasiKantor);
router.get('/active', verifyToken, JamKerjaController.jamKerjaActive);
router.post('/create', verifyToken, JamKerjaController.create);
router.put('/:id/update', verifyToken, JamKerjaController.update);
router.put('/:id/updateActive', verifyToken, JamKerjaController.updateActive);
router.delete('/:id/delete', verifyToken, JamKerjaController.delete);

module.exports = router;