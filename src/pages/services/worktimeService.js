import request, { requestImg } from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getWorktimeList(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Rostering/getlist', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function addWorktime(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Rostering/add', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function updateWorktime(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Rostering/update', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function delWorktime(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Rostering/delete', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}


