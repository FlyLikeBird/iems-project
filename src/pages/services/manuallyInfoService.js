import request from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getInfoType(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/infofill/getinfotype', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getInfoList(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/infofill/getinfolist', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function fillInfo(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/infofill/fillinfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function exportInfo(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    let url = `http://192.168.20.33:8880/api/export/exportinfofill?${str}`;
    return url;
}

export function importTpl(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    let url = `http://192.168.20.33:8880/api/export/createinfotpl?${str}`;
    return url;
}

export function importInfo(data={}){
    let token = apiToken();
    let { company_id, file } = data;
    let formData = new FormData();
    formData.append('file', file);
    formData.append('company_id', company_id);
    formData.append('token',token);
    return request('/infofill/import', { 
        method:'POST',
        body:formData
        }); 
}

