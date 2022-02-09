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

export function getTotalAlarm(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/agent/getrecordlist', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function getSumTrend(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/agent/warninganalyz', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function getProjectTrend(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/agent/warningrank', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
// 告警处理接口
export function getLogType(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getlogtype', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function confirmRecord(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/operwarning', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getHistoryLog(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getmachhistorylog', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getProgressLog(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/warn/getrecordlog', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function uploadImg(data={}){
    let token = apiToken();
    let { company_id, file } = data;
    let formData = new FormData();
    formData.append('file', file);
    formData.append('token',token);
    return request('/upload/upload', { 
        method:'POST',
        body:formData
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


