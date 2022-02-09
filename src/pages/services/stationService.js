import request from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';
import config from '../../../config';

export function getAirStation(data = {}){
    data.token = apiToken();
    let str = translateObj(data);
    return request('/scene/getairscene', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getGasStationInfo(data = {}){
    data.token = apiToken();
    let str = translateObj(data);
    return request('/gas/getgasinfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getAirMachData(data = {}){
    data.token = apiToken();
    let str = translateObj(data);
    return request('/eleroommonitor/getmachdata', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}



