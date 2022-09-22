const express = require('express');
const router = express.Router();
const IzinController = require('../../controllers/karyawan/IzinController');
const {verifyTokenKaryawan} = require('../../config/verifyToken');
const multer = require('multer');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/izin');
    },
    filename: (req, file, cb) => {
        let format = file.mimetype.split('/');
        cb(null, new Date().getTime() + '.' + format[1]);
    }
})

const fileFilter = (req, file, cb) =>{
    console.log('filter')
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'application/pdf'){
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const uploadBerkas = multer({storage: fileStorage, fileFilter: fileFilter});

router.get('/jenis-izin', verifyTokenKaryawan, IzinController.jenisIzin);
router.get('/:id', verifyTokenKaryawan, IzinController.index);
router.post('/create', verifyTokenKaryawan, uploadBerkas.single('berkas'), IzinController.create);
router.delete('/batalizin', verifyTokenKaryawan, IzinController.delete);

module.exports = router;