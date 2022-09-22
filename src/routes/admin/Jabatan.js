const express = require('express');
const router = express.Router();
const JabatanController = require('../../controllers/admin/JabatanController');
const {verifyToken} = require('../../config/verifyToken');

router.get('/', verifyToken, JabatanController.index);
router.post('/create', verifyToken, JabatanController.create);
router.put('/:id/update', verifyToken, JabatanController.update);
router.delete('/:id/delete', verifyToken, JabatanController.delete);

module.exports = router;