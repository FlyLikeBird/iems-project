import React, { Component, useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, Redirect } from 'dva/router';
import style from './IndexPage.css';
import { Table, Button, Dropdown } from 'antd';
import { MailOutlined, UserOutlined, PropertySafetyOutlined, ScheduleOutlined, ProfileOutlined, DoubleRightOutlined, DoubleLeftOutlined } from '@ant-design/icons';
import Menu from './components/Menu';
import Header from './components/Header';

function ProjectIndex({ dispatch, user, children }){
    let { routePath, currentPath, currentProject, currentMenu, userInfo, authorized, fromAgent, currentCompany, collapsed, containerWidth, msg, theme } = user;
    let sidebarWidth = collapsed ? 70 : containerWidth * 0.1 ;
    const containerRef = useRef();
    useEffect(()=>{
        function handleResize(){
            dispatch({ type:'user/setContainerWidth'});
        }
        window.addEventListener('resize', handleResize);
        return ()=>{
            window.removeEventListener('resize', handleResize);
            
        }
    },[]);
    return (
        
        <div 
            ref={containerRef}
            className={
                theme === 'light' 
                ?
                style['container']
                :
                theme === 'dark' 
                ?
                style['container'] + ' ' + style['dark']
                :
                style['container']
            }
        > 
            {
                authorized && userInfo.agent_id && !fromAgent 
                ?
                <Redirect to='/agentMonitor' />
                :
                authorized
                ?
                <div style={{ height:'100%' }}>
                    <Header data={user} onDispatch={action=>dispatch(action)} collapsed={collapsed} sidebarWidth={sidebarWidth} msg={msg} />
                    <div className={style['main-content']}>
                        <div className={style['sidebar-container']} style={{ width: sidebarWidth + 'px' }} >
                            <Menu />
                        </div>
                        <div className={style['content-container']} style={{ left: sidebarWidth + 'px' }}>                  
                            { children }        
                        </div>
                    </div>
                </div>
                :
                null
            } 
        </div>
    )
}

export default connect(({user}) => ({user}))( ProjectIndex );