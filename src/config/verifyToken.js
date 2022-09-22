const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    const token = req.header('auth-token-admin');

    if(!token){
        return res.status(400).json({
            status: res.statusCode,
            message: 'Akses dilarang!'
        });
    }
    
    try{
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        req.user = verified;
        next();
    }catch(err){
        res.status(400).json({
            status: res.statusCode,
            message: 'Invalid token'
        });
    }

}

exports.verifyTokenKaryawan = (req, res, next) => {
    const token = req.header('auth-token-karyawan');

    if(!token){
        return res.status(400).json({
            status: res.statusCode,
            message: 'Akses dilarang!'
        });
    }
    
    try{
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        req.user = verified;
        next();
    }catch(err){
        res.status(400).json({
            status: res.statusCode,
            message: 'Invalid token'
        });
    }

}

exports.verifyTokenPresensi = (req, res, next) => {
    try{
        jwt.verify(req.body.token, process.env.SECRET_KEY);
        next();
    }catch(err){
        res.status(400).json({
            message: 'Invalid token presensi'
        });
    }
}