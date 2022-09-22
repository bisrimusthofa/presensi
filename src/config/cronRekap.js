/* 
- rekap presensi jam 9 malam
- Jika ada yang belum presensi pulang maka dicatat alpa.
- Jika ada izin yang belum ter acc maka otomatis hapus izin dan set presensi karyawan sesuai presensi yang dilakukan karyawan.
*/

const db = require('../models');
const JamKerja = db.JamKerja;
const User = db.user;
const Role = db.role;
const Presensi = db.presensi;
const Izin = db.izin;
const Op = db.Sequelize.Op;
const {dateDash, dateSlash} = require('../utils/convertDate');
const cron = require('node-cron');
const { sequelize } = require('../models');
const {checkLibur} = require('../utils/helper');

const presensiYangHadir = async () => {
    try{
        const presensiMiss = await Presensi.findAll({
            where : {
                [Op.and] : [
                    {
                        jam_pulang : {
                            [Op.eq] : '00:00:00'
                        }
                    },
                    {
                        status : {
                            [Op.eq] : 'hadir'
                        }
                    }
                ]
            },
            raw: true
        });

        if(presensiMiss.length > 0){
            for (const i in presensiMiss) {
                await Presensi.update(
                    {
                        status: 'alpa'
                    }, 
                    {
                        where: {
                            id: presensiMiss[i].id
                        }
                    })
            }
        }

    }catch(error){
        return error;
    }
}

const presensiIzin = async () => {
    try{
        const presensiMiss = await Presensi.findAll({
            where : {
                [Op.and] : [
                    {
                        jam_masuk : {
                            [Op.ne] : '00:00:00'
                        }
                    },
                    {
                        jam_pulang : {
                            [Op.eq] : '00:00:00'
                        }
                    },
                    {
                        status : {
                            [Op.eq] : 'izin'
                        }
                    }
                ]
            },
            raw: true
        });

        if(presensiMiss.length > 0){
            for (const i in presensiMiss) {
                await Presensi.update(
                    {
                        jam_masuk: '00:00:00',
                        status: 'alpa',
                        izinId: null
                    }, 
                    {
                        where: {
                            id: presensiMiss[i].id
                        }
                    })
                await Izin.destroy({where: {id: presensiMiss[i].izinId}});    
            }
        }
    }catch(error){
        return error;
    }
}

const yangTidakPresensi = async () => {
    const dataUser = await User.findAll({
        include: [
            {
                model: Presensi,
                as: 'presensis',
                required: false,
                where: sequelize.where(sequelize.col('presensis.createdAt'), '=', sequelize.fn('DATE', new Date()))
            },
            {
                model: Role,
                as: 'role',
                where: {
                    nama_role: {
                        [Op.substring]: 'Karyawan'
                    }
                }
            }
        ],
        where: sequelize.where(sequelize.col('presensis.userId'), 'IS', null),
        raw: true
    })

    if(dataUser.length > 0){
        /* insert presensi alpa */

         //verify jam kerja
        const dataJamKerja = await JamKerja.findOne({
            where: {
                [Op.and]: [
                    {
                        isActive: 1
                    }
                ]
            },
            raw: true
        });

        //generate ID
        const id =  async (idUser) => {
        let huruf = 'P';
        let tglHariIni = dateSlash(Date.now());
            try{

                /* data max id presensi berdasarkan createdAt hari ini */
                const lastId = await Presensi.findAll({
                    attributes: [[db.sequelize.fn('max', db.sequelize.col("id")), 'maxid']],
                    raw: true,
                    where: {
                        createdAt: {
                            [Op.substring] : `%${dateDash(Date.now())}%`
                        }
                    }
                });

                /* Data tanggal hari ini */

                if(lastId[0].maxid){
                    let number = parseInt(lastId[0].maxid.slice(24, 26));
                    number++;

                    let dataId = number.toString().padStart(2, 0);
                    return `${huruf}/${idUser}/${tglHariIni}/${dataId}`;
                }else{
                    let number = 1;
                    let dataId = number.toString().padStart(2, 0);
                    return `${huruf}/${idUser}/${tglHariIni}/${dataId}`;
                }
            }catch(err){
                console.log(err)
            }
        }

        try{
            for (const key in dataUser) {
                await Presensi.create({
                    id: await id(dataUser[key].id),
                    status: 'alpa',
                    userId: dataUser[key].id,
                    jamKerjaId: dataJamKerja.id
                });
            }
        }catch(error){
            console.log(error)
        }
    }


}

exports.cronRekapPresensi = () => {
    try{
        cron.schedule('0 20 * * 1-5', async () => {
            /* check libur */
            let libur = await checkLibur();
            if(!libur || libur == null){
                await presensiYangHadir();
                await presensiIzin();
                await yangTidakPresensi();
            }
        });
    }catch(err){
        console.log(err);
    }
}