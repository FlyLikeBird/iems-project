import request from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

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

export function addField(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/addfield', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getFieldType(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/getfieldtype', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getFieldAttrs(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/getfieldtree', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function addFieldAttr(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/addfieldattr', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function editFieldAttr(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/editfieldattr', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function deleteFieldAttr(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/delfieldattr', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getFields(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/getfields', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}


export function editField(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/editfield', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function deleteField(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/delfield', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getAttrDevice(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/getattrmach', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getAllDevice(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/getattruseablemach', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function addAttrDevice(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/addattrmach', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function deleteAttrDevice(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/delattrmach', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

// 维度树备份接口
export function saveField(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/backupfield', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function getSavedField(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/getFieldImages', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function delSavedField(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/deleteFieldImages', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function restoreField(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/restoreImage', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function getSavedFieldAttrs(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/getfieldimagetree', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
export function getSavedFieldMachs(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/getattrimagemach', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}
// 查询虚拟节点运算公式
export function getCalcRule(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/attrcalc/getcalcrule', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function addCalcRule(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/attrcalc/addcalcrule', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function editCalcRule(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/attrcalc/updatecalcrule', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function deleteCalcRule(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/attrcalc/delcalcrule', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}