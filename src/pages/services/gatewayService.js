import request from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getGateway(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/meter/getgatewaylist', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getAddForm(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/meter/getaddgatewayform', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getEditForm(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/meter/geteditgatewayform', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function addGateway(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/meter/addgateway', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function editGateway(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/meter/editgateway', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function deleteGateway(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/meter/delmeter', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}