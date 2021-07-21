import request, { requestImg } from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getMonitorInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Agentmonitor/monitor', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getTodayEnergy(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Agentmonitor/gettodayenergy', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getDataLoad(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Agentmonitor/gettodaydata', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function getDayActiveDevice(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Agentmonitor/getDayActiveDevice', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function getProjectList(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/agentmonitor/getsceneproject', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getWarningRank(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/agentmonitor/getwarningtyperank', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getOutputRank(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Agentmonitor/getoutputrank', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getCoalRank(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Agentmonitor/getcoalrank', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getWarningPercent(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Agentmonitor/getwarningcatedist', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getMeterMach(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Agentmonitor/getmeterinfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getWarningType(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/agentmonitor/getwarningtype', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getWarningMonitor(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/agentmonitor/warningmonitor', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getWarningStatus(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/agentmonitor/getwarninginfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getFinishTrend(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Agentmonitor/companywarning', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getWarningTrend(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/agentmonitor/warningtrend', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}


