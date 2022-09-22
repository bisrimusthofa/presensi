const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/karyawan/AuthController');

router.post('/', AuthController.login);
router.put('/setToken/:id', AuthController.setToken);

module.exports = router;