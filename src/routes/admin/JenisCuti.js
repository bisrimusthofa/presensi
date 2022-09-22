const express = require('express');
const router = express.Router();
const JenisCuti = require('../../controllers/admin/JenisCutiController');
const {verifyToken} = require('../../config/verifyToken');

router.get('/', verifyToken, JenisCuti.index);
router.post('/create', verifyToken, JenisCuti.create);
router.put('/:id/update', verifyToken, JenisCuti.update);
router.delete('/:id/delete', verifyToken, JenisCuti.delete);

module.exports = router;