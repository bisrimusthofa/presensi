const compareTime = (time1, op, time2) => {
    if(op == '<'){
        return Date.parse(`02/09/1999 ${time1}`) < Date.parse(`02/09/1999 ${time2}`)
    }else if(op == '>'){
        return Date.parse(`02/09/1999 ${time1}`) > Date.parse(`02/09/1999 ${time2}`)
    }else if(op == '='){
        return Date.parse(`02/09/1999 ${time1}`) == Date.parse(`02/09/1999 ${time2}`)
    }else{
        return NaN;
    }
    
}

module.exports = compareTime;