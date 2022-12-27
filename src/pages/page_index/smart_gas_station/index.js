import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import style from './SmartAirStation.css';
import IndexStyle from '@/pages/IndexPage.css';
import AreaLineChart from './components/AreaLineChart';
import LineChart from './components/LineChart';
import BarChart from './components/BarChart';
import GaugeChart from './components/GaugeChart';
import NumberFormat from './components/NumberFormat';
import SceneMonitor from './SceneMonitor';
import ScrollTable from '@/pages/components/ScrollTable';
import FullscreenHeader from '@/pages/components/FullscreenHeader';
import monitorBg from '../../../../public/monitor_bg.jpg'

let timer;
function isFullscreen(){
    return document.fullscreenElement    ||
           document.msFullscreenElement  ||
           document.mozFullScreenElement ||
           document.webkitFullscreenElement || false;
}

function AgentManager({ dispatch, user }){
    let { userInfo, authorized, companyList, currentCompany, msg } = user;  
    let temp = window.location.host.split('-');
    let prefix = temp.length === 2 ? temp[1].split('.')[0] : '';
    let linkPath = ( prefix ? 'acs' + '-' + prefix : 'acs' ) + '.h1dt.com'; 
    return (
        authorized 
        ?
        <iframe
            src={`http://${linkPath}?pid=${Math.random()}&&userId=${userInfo.user_id}&&companyId=${currentCompany.company_id}&&mode=frame`}
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
export default connect(({ user })=>({ user }))(React.memo(AgentManager, areEqual));