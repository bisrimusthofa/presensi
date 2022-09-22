const db = require('../models');
const JamKerja = db.JamKerja;
const Op = db.Sequelize.Op;
const cron = require('node-cron');
const {checkLibur} = require('../utils/helper');

const setAktifJadwal = async () => {       
        try{
            await JamKerja.update({isActive: 0}, {
                where: {
                    isActive : {
                        [Op.eq]: 1
                    }
                }
            });
            await JamKerja.update({isActive: 1}, {where: {
                hari: {
                    [Op.eq]: new Date(Date.now()).getDay()
                }
            }});

        }catch(error){
            return error
        }
}

const setNonAktifJadwal = async () => {
    try{
        await JamKerja.update({isActive: 0}, {
            where: {
                isActive : {
                    [Op.eq]: 1
                }
            }
        });

    }catch(error){
        return error
    }
}

exports.cronJadwal = (req, res) => {
    try{
        cron.schedule('0 4 * * 1-5', async () => {
            /* check libur */
            let libur = await checkLibur();
            if(!libur || libur == null){
                await setAktifJadwal();
            }else{
                await setNonAktifJadwal();
            }
        });
    }catch(err){
        console.log(err);
    }
}