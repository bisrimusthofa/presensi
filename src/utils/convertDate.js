exports.dateToString = (data) => {
    let date = new Date(data);

    let day = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    let bln = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    let hari = day[date.getDay()];
    let tgl = date.getDate();
    let bulan = bln[date.getMonth()];
    let tahun = date.getFullYear();

    return `${hari}, ${tgl} ${bulan} ${tahun}`;
}

exports.dateSlash = (data) => {
    let date = new Date(data);

    let tgl = date.getDate();
    let bulan = date.getMonth()+1;
    let tahun = date.getFullYear();

    return `${tgl.toString().padStart(2, 0)}/${bulan.toString().padStart(2, 0)}/${tahun}`;
}

exports.dateDash = (data) => {
    let date = new Date(data);

    let tgl = date.getDate();
    let bulan = date.getMonth()+1;
    let tahun = date.getFullYear();

    return `${tahun}-${bulan.toString().padStart(2, 0)}-${tgl.toString().padStart(2, 0)}`;
}

exports.dateOneWeekAgo = (data) => {
    let date = new Date(data);

    let dateOneWeek = date.setDate(date.getDate() - 7);
    return dateOneWeek;
}

exports.getTime = (data) => {
    let date = new Date(data);

    let jam = date.getHours();
    let menit = date.getMinutes();

    return `${jam.toString().padStart(2, 0)}:${menit.toString().padStart(2, 0)}:00`;
}