const {getLibur} = require('../../utils/helper');

exports.getLibur = async (req, res) => {
    const thn = req.query.tahun?req.query.tahun:new Date(Date.now()).getFullYear();
    const bln = req.query.bulan?req.query.bulan:new Date(Date.now()).getMonth();
    try{
        const hariLibur = await getLibur(thn, bln);

        res.status(200).json(hariLibur)
    }catch(error){
        res.status(400).json({
            message: 'Ada kesalahan',
            error: error
        })
    }
}