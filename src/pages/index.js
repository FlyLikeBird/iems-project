import React, { Component, useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, Redirect } from 'dva/router';
import style from './IndexPage.css';
import { Table, Button, Modal, Dropdown } from 'antd';
import { MailOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Menu from './components/Menu';
import Header from './components/Header';
import noticeImg from '../../public/notice2.png';
function isFullscreen(){
    return document.fullscreenElement    ||
           document.msFullscreenElement  ||
           document.mozFullScreenElement ||
           document.webkitFullscreenElement || false;
}

function ProjectIndex({ dispatch, user, children }){
    let {  currentMenu, userInfo, authorized, fromAgent, currentCompany, collapsed, containerWidth, msg, notice, theme } = user;
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
    let isFulled = isFullscreen();
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
                <div style={{ height:'100%'}}>
                    {/* 系统通知信息 */}
                    {
                        Object.keys(notice).length 
                        ?
                        <div style={{ position:'absolute', left:'0', top:'0', width:'100%', height:'100%', background:'rgba(0, 0, 0, 0.65)', zIndex:'200' }}>
                            <div style={{ width:'430px', height:'500px', backgroundImage:`url(${noticeImg})`, backgroundRepeat:'no-repeat', backgroundSize:'cover', position:'absolute', left:'50%', top:'50%', zIndex:'10', transform:'translate(-50%, -50%)' }}>
                                <CloseCircleOutlined style={{ position:'absolute', top:'-10px', right:'-6px', fontSize:'2rem', color:'#fff' }} onClick={()=>{
                                    dispatch({ type:'user/getNotice', payload:{ data:{} }});
                                }} />
                                <div style={{ marginTop:'180px', padding:'1rem 2rem', fontSize:'1.2rem' }}>
                                    <div style={{ margin:'1rem 0'}}>
                                        <div>通告内容:</div>
                                        <div style={{ fontWeight:'bold' }}>{ notice.content }</div>
                                    </div>
                                    <div style={{ margin:'1rem 0'}}>
                                        <div>开始时间：</div>
                                        <div style={{ fontWeight:'bold' }}>{ notice.show_begin_date }</div>
                                    </div>  
                                    <div style={{ margin:'1rem 0'}}>
                                        <div>结束时间：</div>
                                        <div style={{ fontWeight:'bold' }}>{ notice.show_end_date }</div>
                                    </div>                                
                                </div>                          
                            </div>
                        </div>
                        
                        :
                        null
                    }
                        
                    
                    <Header data={user} onDispatch={action=>dispatch(action)} collapsed={collapsed} sidebarWidth={sidebarWidth} msg={msg} theme={theme}  />
                    <div className={style['main-content']} style={ isFulled && ( currentMenu.path === 'ai_gas_station' || currentMenu.path === 'power_room' ) ? { height:'100%' } : {} }>
                        <div className={ theme==='dark' ? style['sidebar-container'] + ' ' + style['dark'] : style['sidebar-container']} style={{ width: sidebarWidth + 'px' }} >
                            <Menu />
                        </div>
                        <div className={style['content-container']} style={{ left: isFulled && ( currentMenu.path === 'ai_gas_station' || currentMenu.path === 'power_room' ) ? '0' : sidebarWidth + 'px' }}>                  
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

export default connect(({ user }) => ({ user }))( ProjectIndex );