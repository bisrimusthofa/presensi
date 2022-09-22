const express = require('express');
const router = express.Router();
const LiburController = require('../../controllers/admin/LiburController');
const {verifyToken} = require('../../config/verifyToken');

router.get('/', verifyToken, LiburController.getLibur);

module.exports = router;