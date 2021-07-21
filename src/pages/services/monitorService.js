import request, { requestImg } from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getMonitorInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/index/monitor', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getTplInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/index/getcloudinfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getTplRank(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/index/getrank', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getEnergyScene(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energycost/getsceneinfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getEfficiencyScene(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energyefficiency/getenergyeff', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}


export function getSaveSpace(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);  
    return request('/index/savespace', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getAlarmScene(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);  
    return request('/warn/getsceneinfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function fetchImg(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return requestImg('/index/getImage', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}




