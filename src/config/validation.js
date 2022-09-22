const joi = require('joi');
const Joi = joi.extend(require('joi-phone-number'));

//validasi Admin
exports.createAdminValidation = (data) => {
    const schema = Joi.object({
        nama: Joi.string().required(),
        tempat_lahir: Joi.string().required(),
        tgl_lahir: Joi.date().required(),
        jenis_kelamin: Joi.string().required(),
        kecamatan: Joi.string().required(),
        kabupaten: Joi.string().required(),
        provinsi: Joi.string().required(),
        alamat: Joi.string().required(),
        email: Joi.string().email(),
        photo: Joi.string(),
        password: Joi.string().min(6).required(),
        no_hp: Joi.string().phoneNumber({defaultCountry: 'ID', format: 'national'}),
    })

    return schema.validate(data)
}

exports.updateAdminValidation = (data) => {
    const schema = Joi.object({
        id: Joi.string().required(),
        nama: Joi.string().required(),
        tempat_lahir: Joi.string().required(),
        tgl_lahir: Joi.date().required(),
        jenis_kelamin: Joi.string().required(),
        kecamatan: Joi.string().required(),
        kabupaten: Joi.string().required(),
        provinsi: Joi.string().required(),
        alamat: Joi.string().required(),
        email: Joi.string().email(),
        photo: Joi.string(),
        password: Joi.string().min(6),
        no_hp: Joi.string().phoneNumber({defaultCountry: 'ID', format: 'national'}),
    })

    return schema.validate(data)
}

exports.loginUserValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email(),
        password: Joi.string().min(6).required()
    })

    return schema.validate(data)
}

//Validasi role
exports.createRoleValidation = (data) => {
    const schema = joi.object({
        nama_role: Joi.string().required()
    })

    return schema.validate(data)
}

//Validasi jabatan
exports.createJabatanValidation = (data) => {
    const schema = joi.object({
        nama_jabatan: joi.string().required()
    })

    return schema.validate(data)
}

//validasi karyawan
exports.createKaryawanValidation = (data) => {
    const schema = Joi.object({
        nama: Joi.string().required(),
        tempat_lahir: Joi.string().required(),
        tgl_lahir: Joi.date().required(),
        jenis_kelamin: Joi.string().required(),
        kecamatan: Joi.string().required(),
        kabupaten: Joi.string().required(),
        provinsi: Joi.string().required(),
        alamat: Joi.string().required(),
        email: Joi.string().email(),
        photo: Joi.string(),
        password: Joi.string().min(6).required(),
        no_hp: Joi.string().phoneNumber({defaultCountry: 'ID', format: 'national'}),
        jabatanId: Joi.string().required()
    })

    return schema.validate(data)
}

exports.updateKaryawanValidation = (data) => {
    const schema = Joi.object({
        id: Joi.string().required(),
        nama: Joi.string().required(),
        tempat_lahir: Joi.string().required(),
        tgl_lahir: Joi.date().required(),
        jenis_kelamin: Joi.string().required(),
        kecamatan: Joi.string().required(),
        kabupaten: Joi.string().required(),
        provinsi: Joi.string().required(),
        alamat: Joi.string().required(),
        email: Joi.string().email(),
        photo: Joi.string(),
        password: Joi.string().min(6),
        no_hp: Joi.string().phoneNumber({defaultCountry: 'ID', format: 'national'}),
        jabatanId: Joi.string().required()
    })

    return schema.validate(data)
}

//Validasi lokasi_kantor
exports.createLokasiKantorValidation = (data) => {
    const schema = joi.object({
        lat: joi.number().required(),
        lng: joi.number().required(),
        nama_lokasikantor: joi.string().required()
    })

    return schema.validate(data)
}

exports.updateLokasiKantorValidation = (data) => {
    const schema = joi.object({
        lat: joi.number().required(),
        lng: joi.number().required(),
        nama_lokasikantor: joi.string().required(),
    }).unknown()

    return schema.validate(data)
}

//Validasi Jam Kerja
exports.createJamKerjaValidation = (data) => {
    const schema = joi.object({
        hari: joi.number().required(),
        jam_masuk: joi.string().required(),
        jam_pulang: joi.string().required(),
        lokasiKantorId: joi.string().required(),
        isActive: joi.number().optional().max(1)
    })

    return schema.validate(data);
}

exports.updateJamKerjaValidation = (data) => {
    const schema = joi.object({
        jam_masuk: joi.string().required(),
        jam_pulang: joi.string().required(),
        lokasiKantorId: joi.string().required(),
    }).unknown()

    return schema.validate(data);
}

//Jenis Izin
exports.createJenisIzinValidation = (data) => {
    const schema = joi.object({
        jenis_izin: joi.string().required()
    })

    return schema.validate(data)
}

//Jenis Cuti
exports.createJenisCutiValidation = (data) => {
    const schema = joi.object({
        jenis_cuti: joi.string().required()
    })

    return schema.validate(data)
}

//Presensi
exports.createPresensiValidation = (data) => {
    const schema = joi.object({
        jam_masuk: joi.string().required(),
        jam_pulang: joi.string().required(),
        userId: joi.string().required()
    })

    return schema.validate(data)
}

/* ===================================================== Karyawan ======================================= */
//Izin
exports.createIzinValidation = (data) => {
    const schema = joi.object({
        keterangan: joi.string().required(),
        berkas: joi.string(),
        pesan: joi.string(),
        jenisIzinId: joi.string().required(),
        userId: joi.string().required()
    })

    return schema.validate(data)
}

//Cuti
exports.createCutiValidation = (data) => {
    const schema = joi.object({
        keterangan: joi.string().required(),
        tgl_mulai: joi.string(),
        tgl_selesai: joi.string(),
        berkas: joi.string(),
        pesan: joi.string(),
        jenisCutiId: joi.string().required(),
        userId: joi.string().required()
    })

    return schema.validate(data)
}

//Presensi
exports.createPresensiKaryawanValidation = (data) => {
    const schema = joi.object({
        jam_presensi: joi.string().required(),
        userId: joi.string().required(),
        lng: joi.number().required(),
        lat: joi.number().required(),
        token: joi.string().required(),
    })

    return schema.validate(data)
}