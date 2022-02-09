import request from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getCarbonIndex(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/carbon/index', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getCarbonTrend(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/carbon/carbontrend', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getCarbonAttrInfo(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/carbon/attrcarboninfo', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getCarbonRegionRank(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/carbon/carbonregiontrend', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getCarbonEff(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/carbon/energyeff', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

