import request from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getEnergyType(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/quotafill/getquotatype', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getQuotaList(data={}) {
    let token = apiToken();
    data.token = token;
    let str = translateObj(data)
    return request('/quotafill/getquotalist', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getQuotaTemplate(data={}){
    data.token = apiToken();
    let str = translateObj(data);
    return str;
}

export function fillQuota(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data)
    return request('/quotafill/fillquota', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function importQuota(data={}){
    let token = apiToken();
    let { company_id, file } = data;
    let formData = new FormData();
    formData.append('file', file);
    formData.append('company_id', company_id);
    formData.append('token',token);
    return request('/quotafill/import', { 
        method:'POST',
        body:formData
        }); 
}

export function exportQuota(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    let config = window.g;
    let url = `http://${config.apiHost}/api/export/exportquota?${str}`;
    return url;
}

export function importTpl(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    let config = window.g;
    let url = `http://${config.apiHost}/api/export/createquotatpl?${str}`;
    
    return url;
}

