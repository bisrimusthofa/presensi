const express = require('express');
const router = express.Router();
const multer = require('multer');
const AdminController = require('../../controllers/admin/AdminController');
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

router.get('/', verifyToken, AdminController.index);
router.post('/create', verifyToken, uploadPhoto.single('photo'), AdminController.create);
router.put('/:id/update', verifyToken, uploadPhoto.single('photo'), AdminController.update);
router.delete('/:id/delete', verifyToken, AdminController.delete);

module.exports = router;