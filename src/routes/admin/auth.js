const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/admin/AuthController');

router.post('/', AuthController.login);

module.exports = router;