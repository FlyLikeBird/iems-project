import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Radio } from 'antd';
import PowerRoomIndex from './PowerRoomIndex';
import PowerRoomMach from './PowerRoomMach';
import PowerRoomEleLines from './PowerRoomEleLines';
import style from './PowerRoom.css';

const navList = [
    { key:'index', title:'监控主页', path:'/' },
    { key:'mach', title:'设备概况', path:'/mach_info'},
    { key:'ele_lines', title:'电力线路', path:'/ele_lines'}
];

function PowerRoomManager({ dispatch, match, location }){
    let pathArr = location.pathname.split('/');
    // 判断当前哪个功能路由模块
    let current = '';
    let lastParams = pathArr[pathArr.length - 1];
    if ( !lastParams || lastParams === 'power_room' ) {
        current = 'index';
    } else if ( lastParams === 'ele_lines') {
        current = 'ele_lines';
    } else if( location.pathname.includes('/power_room/mach_info')) {
        current = 'mach'
    }   
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'powerRoom/reset' });
        }
    },[])
    return (
        <div className={style['container']}>
            <div className={style['nav-container']}>
                {
                    navList.map((item,index)=>(
                        <Link key={index} to={`/energy/global_monitor/power_room${item.path}`} style={{
                            backgroundColor: current === item.key ? '#3f8fff' : '#fff',
                            color : current === item.key ? '#fff' : '#7e7e73'
                        }}>{ item.title }</Link>
                    ))
                }
            </div>
            <div className={style['content-container']}>
                <Switch>
                    <Route exact path={`${match.url}`} component={PowerRoomIndex}/>
                    <Route path={`${match.url}/mach_info`} component={PowerRoomMach} />   
                    <Route exact path={`${match.url}/ele_lines`} component={PowerRoomEleLines} />
                </Switch>  
            </div>  
        </div>
        
    )
}

export default connect()(PowerRoomManager);