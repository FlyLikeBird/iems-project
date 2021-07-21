import request from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function addIncomingLine(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/line/addincoming', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getIncomingLine(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/line/getincoming', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function editIncomingLine(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/line/updateincoming', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function deleteIncomingLine(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/line/delincoming', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function addMainLine(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/line/addmainline', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getMainLine(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/line/getmainline', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function editMainLine(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/line/updatemainline', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function deleteMainLine(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/line/delmain', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getMachs(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/line/getmach', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

