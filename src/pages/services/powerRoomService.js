import request, { requestImg } from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';


export function getMonitorInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/scene/home', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getMonitorScenes(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/scene/getscene', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getEleLines(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/scene/getdiagram', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getMachTypes(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/agentmonitor/getmeterinfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getMachList(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/scene/meterlist', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getMachDetail(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/scene/meterdetail', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}


