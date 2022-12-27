import request from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getRateInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/feerate/getrateinfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function addRate(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/feerate/addrate', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function updateRate(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/feerate/updaterate', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function delRate(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/feerate/delrate', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getCity(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/feerate/getcity', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function addQuarter(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/feerate/addquarter', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function editQuarter(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/feerate/editquarter', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}


export function getBilling(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/feerate/getratelist', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function delQuarter(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/feerate/delquarter', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function isActive(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/feerate/activerate', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function isUnActive(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/feerate/unactive', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}


export function editRate(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/feerate/editrate', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getFeeRate(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energycost/getcostrate', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function setWaterRate(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/feerate/setwaterate', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getTpl(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/feerate/copytplform', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function applyTpl(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/feerate/copytpl', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

