const db = require('../models/index');
const User = db.user;
const JenisIzin = db.jenis_izin;
const Izin = db.izin;
const Presensi = db.presensi;
const Role = db.role;
const JamKerja = db.JamKerja;
const Op = db.Sequelize.Op;
const jwt = require("jsonwebtoken");
const dateFormat = require('../utils/convertDate');
const compareTime = require('../config/compareTime');
const axios = require('axios');

exports.setUser = async (userId, userSocketId) => {
    try{
        const data = await User.update(
                            {
                                socketId: userSocketId
                            },
                            {
                                where: {
                                    id: userId
                                }
                            }
                        );
        return data;
    }catch(err){
        console.log(err)
        return false;
    }
}

exports.getAdmin = async () => {
    try{
        const data = await User.findAll({
            raw: true,
            include: [{
                model: Role,
                as: 'role',
                where: {
                    nama_role: {
                        [Op.substring]: 'Admin'
                    }
                }
            }]
        });
        return data;
    }catch(err){
        console.log(err)
        return false;
    }
}

exports.getLibur = async (tahun, bulan) => {
    try{
        const libur = await axios.get(`https://kalenderindonesia.com/api/APIp6q1GMZB1R/libur/masehi/${tahun}/${bulan}`);

        return libur.data.data.holiday.data
    }catch(error){
        return error
    }
}

exports.checkLibur = async () => {
    let date = new Date(Date.now());
    let bln = date.getMonth()+1;
    let thn = date.getFullYear();
    
    let hariLibur = await this.getLibur(thn, bln);

    let validasiLibur = null;

    /* check libur */
    if(hariLibur){
        hariLibur.forEach((data, i)=>{
            if(dateFormat.dateDash(date) == data.date){
                validasiLibur = data;
            }
        });
    }

    return validasiLibur;
}