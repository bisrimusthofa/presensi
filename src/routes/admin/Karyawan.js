const express = require('express');
const router = express.Router();
const multer = require('multer');
const KaryawanController = require('../../controllers/admin/KaryawanController');
const {verifyToken} = require('../../config/verifyToken');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        let format = file.mimetype.slice(6, 10);
        cb(null, new Date().getTime() + '.' + format);
    }
})

const fileFilter = (req, file, cb) =>{
    console.log('filter')
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const uploadPhoto = multer({storage: fileStorage, fileFilter: fileFilter});

router.get('/', verifyToken, KaryawanController.index);
router.get('/getJabatan', verifyToken, KaryawanController.getJabatan);
router.post('/create', verifyToken, uploadPhoto.single('photo'), KaryawanController.create);
router.put('/:id/update', verifyToken, uploadPhoto.single('photo'), KaryawanController.update);
router.delete('/:id/delete', verifyToken, KaryawanController.delete);

module.exports = router;