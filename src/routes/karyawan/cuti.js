const express = require('express');
const router = express.Router();
const CutiController = require('../../controllers/karyawan/CutiController');
const {verifyTokenKaryawan} = require('../../config/verifyToken');
const multer = require('multer');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/cuti');
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

router.get('/jenis-cuti', verifyTokenKaryawan, CutiController.jenisCuti);
router.get('/:id', verifyTokenKaryawan, CutiController.index);
router.post('/create', verifyTokenKaryawan, uploadBerkas.single('berkas'), CutiController.create);
router.delete('/batalCuti', verifyTokenKaryawan, CutiController.delete);

module.exports = router;