import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';


let timer;
function isFullscreen(){
    return document.fullscreenElement    ||
           document.msFullscreenElement  ||
           document.mozFullScreenElement ||
           document.webkitFullscreenElement || false;
}

function WaterStation({ dispatch, user }){
    let { userInfo, authorized, companyList, currentCompany, msg } = user;  
    let temp = window.location.host.split('-');
    let prefix = temp.length === 2 ? temp[1].split('.')[0] : '';
    let linkPath = ( prefix ? 'acs' + '-' + prefix : 'acs' ) + '.h1dt.com'; 
    return (
        authorized 
        ?
        <iframe
            src={`https://client.xuncaitech.cn/third/BSJ`}
            width='100%'
            height='100%'
            style={{ border:'none' }}
        ></iframe>
        :
        null
    )
}

function areEqual(prevProps, nextProps){
    return true;
}
export default connect(({ user })=>({ user }))(React.memo(WaterStation, areEqual));