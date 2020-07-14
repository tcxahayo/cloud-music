/**
 * 判断是否为空，空格，空字符串， undefined,长度为0的数组、对象都为空
 * @param {*} value 
 */
export const isEmpty =(value)=>{
    if(value === undefined || value === '' || value === null){
        return true
    }
    if(typeof(value) === 'string'){
        return !Boolean(value.trim());//去掉空格后，是否为空
    }
    if(typeof(value) === 'object'){
        for(let i in value){
            return false
        }
        return true
    }
    return false
}

export const getCount =(value)=>{
    if(value < 0){
        return;
    }
    if(value < 10000){
        return value;
    }else if(Math.floor(value / 10000) < 10000){
        return Math.floor(value/1000)/10 + '万';
    }else{
        return Math.floor(value/10000000) /10 + '亿';
    }
}