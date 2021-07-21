import request from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getMeterType(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/metercheck/getchecktype', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getMeterList(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/metercheck/getchecklist', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function fillMeter(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/metercheck/fillcheck', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function exportMeter(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    let url = `http://192.168.20.33:8880/api/export/exportcheck?${str}`;
    return url;
}

export function importMeterTpl(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    let url = `http://192.168.20.33:8880/api/export/createchecktpl?${str}`;
    return url;
}

export function importMeter(data={}){
    let token = apiToken();
    let { company_id, file } = data;
    let formData = new FormData();
    formData.append('file', file);
    formData.append('company_id', company_id);
    formData.append('token',token);
    return request('/metercheck/import', { 
        method:'POST',
        body:formData
        }); 
}

