import request, { requestImg } from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';
import config from '../../../config';

export function getEnergyType(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energycost/getenergytype', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getCostReport(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/costreport/index', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getExtremeReport(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Eleroommonitor/extremumreport', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getEleReport(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/Eleroommonitor/elereport', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getSameRate(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/eleroommonitor/samerate', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getAdjoinRate(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/eleroommonitor/adjoinrate', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getCostAnalyze(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/costreport/compareanalyz', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
// 抄表记录接口
export function getMeterReport(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/costreport/checkcodereport', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function exportReport(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    let url = `http://${config.apiHost}/api/costreport/exportreport?${str}`;
    return url;
}

export function getEleDocument(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/attrcostreport/getattrcostinfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getWaterDocument(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/attrcostreport/getattrwatercostinfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getCompanyFeeRate(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/energycost/getcostrate', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getAnalyzeReport(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/analyz/report', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function translateImgToBase64(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/attrcostreport/imgbase64tofile', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function createDocument(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/attrcostreport/html2pdf', { 
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
