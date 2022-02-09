import request from '../utils/request';
import { translateObj } from '../utils/translateObj';
import { apiToken } from '../utils/encryption';

export function getRoleList(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/user/getrolelist', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getRolePermission(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/user/getrolemenu', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function editRolePermission(data = {}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/user/setrolemenu', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function getUserList(data={}) {
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/user/getuserlist', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        }); 
}

export function createUser(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/user/adduser', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        });
}

export function editUser(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/user/edituser', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        });
}

export function deleteUser(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/user/deluser', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        });
}

export function updatePassword(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/index/updateuserpw', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        });
}

export function getUserPermission(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/user/getusermenu', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        });
}

export function setUserPermission(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/user/setusermenu', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        });
}

export function getUserRegion(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/user/getuserregion', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        });
}

export function setUserRegion(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/user/setuserregion', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        });
}

// 获取公司所有计量区域
export function getAllRegions(data={}){
    let token = apiToken();
    data.token = token;
    let str = translateObj(data);
    return request('/field/getfieldattrtree', { 
        method:'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body:str
        });
}




