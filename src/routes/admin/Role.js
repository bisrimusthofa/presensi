const express = require('express');
const router = express.Router();
const RoleController = require('../../controllers/admin/RoleController');
const {verifyToken} = require('../../config/verifyToken');

router.get('/', verifyToken, RoleController.index);
router.post('/create', verifyToken, RoleController.create);
router.put('/:id/update', verifyToken, RoleController.update);
router.delete('/:id/delete', verifyToken, RoleController.delete);

module.exports = router;