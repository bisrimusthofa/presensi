const compareDate = (data1, op, data2) => {
    const date1 = new Date(data1);
    const date2 = new Date(data2)

    if(op == '<'){
        return date1 < date2;
    }else if(op == '>'){
        return date1 > date2;
    }else if(op == '='){
        return date1 == date2;
    }else{
        return NaN;
    }
    
}

module.exports = compareDate;