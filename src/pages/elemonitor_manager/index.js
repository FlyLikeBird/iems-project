import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Switch, Route } from 'dva/router';
import { Menu } from 'antd';
import style from './EleMonitor.css';
import Transformer from './transformer/TransformerManager';
import HighVoltage from './high_vol/HighVolManager';
import EleMonitor from './ele_monitor/EleMonitorManager';
import TerminalMach from './terminal_mach/TerminalMach';
import LineMonitor from './line_monitor/LineMonitor';

const menuList = [
    { menu_code:'1', menu_name:'变压器监测'},
    { menu_code:'2', menu_name:'高压进线管理'},
    { menu_code:'3', menu_name:'电气监控'},
    { menu_code:'4', menu_name:'线路监控'},
    { menu_code:'5', menu_name:'终端监控'},
];

function EleMonitorIndex({ match }) {
    return (  
        <Switch>               
            <Route exact path={`${match.url}/trans_monitor_menu`} component={Transformer}/>  
            <Route exact path={`${match.url}/height_voltage_monitor`} component={HighVoltage} />
            <Route exact path={`${match.url}/ele_son_monitor`} component={EleMonitor} />
            <Route exact path={`${match.url}/ele_line_monitor`} component={LineMonitor} />
            <Route exact path={`${match.url}/mach_monitor_menu`} component={TerminalMach} /> 
            <Route exact path={match.url} component={Transformer} />
        </Switch>       
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.location.pathname !== nextProps.location.pathname ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(EleMonitorIndex, areEqual);

// function EleMonitorIndex({ dispatch, global }){
//     const [subMenu, toggleSubMenu] = useState('1');
//     useEffect(()=>{
//         return ()=>{
//             console.log('ele-monitor unmounted');
//         }
//     },[])
//     return (
//         <div className={style['page-container']} style={{ background:'#05050f' }}>
//             <div className={style['card-container'] + ' ' + style['float-menu-container']} style={{ padding:'0' }}>
//                 <div className={style['card-title']} style={{ padding:'0 14px'}}>导航功能</div>
//                 <div className={style['card-content']}>
//                     <Menu mode='inline' selectedKeys={[subMenu]} onClick={e=>{
//                         toggleSubMenu(e.key);
//                     }}>
//                         {
//                             menuList.map((item,index)=>(
//                                 <Menu.Item key={item.menu_code}>{ item.menu_name }</Menu.Item>
//                             ))
//                         }
//                     </Menu>
//                 </div>
//             </div>
            
//             {
//                 subMenu === '1'  
//                 ?
//                 <Transformer  />
//                 :
//                 subMenu === '2' 
//                 ?
//                 <HighVoltage  />
//                 :
//                 subMenu === '3' 
//                 ?
//                 <EleMonitor />
//                 // :
//                 // subMenu === '4' 
//                 // ?
//                 // <LineMonitor />
//                 :
//                 subMenu === '5' 
//                 ?
//                 <TerminalMach />
//                 :
//                 null
//             }
//         </div>
//     )
// }

// export default connect(({ global })=>({ global }))(EleMonitorIndex);