import request from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getEleQualityIndex(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Elequality/index', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getEleBalance(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Elequality/balance', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getEleHarmonic(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Elequality/harmonic', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}