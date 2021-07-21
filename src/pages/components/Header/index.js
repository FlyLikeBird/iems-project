import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
import { Dropdown, Menu, Button, Badge, Popover, Radio, Modal, Tag, Switch } from 'antd';
import { createFromIconfontCN, DownOutlined, CloudOutlined, UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined, AlertOutlined, AudioOutlined, AudioMutedOutlined, SoundOutlined  } from '@ant-design/icons';
import ScrollTable from '@/pages/page_index/components/ScrollTable';
import style from './Header.css';
import { getToday } from '@/pages/utils/parseDate';

import avatarBg from '../../../../public/avatar-bg.png';
import UploadLogo from './UploadLogo';

let timer;
let week = new Date().getDay();
let firstMsg = true;
let alarmTimer = null;

const weekObj = {
    0:'周日',
    1:'周一',
    2:'周二',
    3:'周三',
    4:'周四',
    5:'周五',
    6:'周六',
}

const IconFont = createFromIconfontCN({
    scriptUrl:'//at.alicdn.com/t/font_2314993_bryih7jtrtn.js'
});

const Header = ({ data, onDispatch, sidebarWidth, collapsed, msg })=> {
    let { userInfo, weatherInfo, thirdAgent, newThirdAgent, currentCompany, fromAgent, theme } = data;
    const [curTime, updateTime] = useState(getToday(2));
    const [muted, setMuted] = useState(false);
    const [visible, toggleVisible] = useState(false);
    const containerRef = useRef();
    useEffect(()=>{
        timer = setInterval(()=>{
            updateTime(getToday(2));
        },1000);
        var video = document.createElement('video');
        video.style.display = 'none';
        video.id = 'my-audio';
        video.src = '/alarm.mp4';
        video.muted = true;
        video.autoPlay = true;
        video.loop = true;
        containerRef.current.appendChild(video);
        function handleUnload(e){
            window.opener.postMessage({ type:'close', companyId:currentCompany.company_id });
        }
        window.addEventListener('unload', handleUnload);
        return ()=>{
            firstMsg = true;
            clearInterval(timer);
            clearTimeout(alarmTimer);
            window.removeEventListener('unload', handleUnload);
        }
    },[]);
    
    useEffect(()=>{
        if ( Object.keys(msg).length ){
            if ( !firstMsg && !muted ){
                function run(){   
                    let audio = document.getElementById('my-audio');
                    if ( audio ){
                        audio.currentTime = 0;
                        audio.muted = false;
                        alarmTimer = setTimeout(()=>{
                            audio.muted = true;
                        },5000);
                    }              
                }
                run();
            } 
            firstMsg = false;
        }
    },[msg]);
    return (
        <div ref={containerRef} className={ theme === 'dark' ? style['container'] + ' ' + style['dark'] : style['container']}>
            <UploadLogo visible={visible} onClose={()=>toggleVisible(false)} onDispatch={onDispatch} />
            <div className={style['content-container']}>
                <div className={style['img-container']} style={{ width: sidebarWidth + 'px', cursor:'pointer' }} onClick={()=>{
                    // 如果是代理商账户或者是打开的子窗口，不具备设置logo权限，仅针对企业级终端用户
                    if ( !fromAgent && !userInfo.agent_id ) {
                        toggleVisible(true);
                    }
                }}>
                    <img src={ currentCompany.head_logo_path || thirdAgent.logo_path || newThirdAgent.logo_path } style={{ width:'100%', display: collapsed ? 'none' : 'inline-block' }} />
                    <img src={ currentCompany.mini_logo_path || thirdAgent.mini_logo_path || newThirdAgent.mini_logo_path } style={{ width:'100%', display: collapsed ? 'inline-block' : 'none'}} />
                </div>
                <div onClick={()=>onDispatch({type:'user/toggleCollapsed'})} className={style['collapse-button']} style={{ top:'50%', transform:'translateY(-50%)', left:sidebarWidth + 20 + 'px'}}>
                    {
                        collapsed 
                        ?
                        <MenuUnfoldOutlined />
                        :
                        <MenuFoldOutlined />
                    }
                </div>
                <div style={{ position:'absolute', top:'50%', transform:'translateY(-50%)', left:sidebarWidth + 20 + 40 + 'px' }}>
                    <Switch checked={ theme === 'light' ? false : true } onChange={(boolean)=>{
                        if ( boolean ) {    
                            onDispatch({ type:'user/toggleTheme', payload:'dark'});
                        } else {
                            onDispatch({ type:'user/toggleTheme', payload:'light'});
                        }
                    }} />     
                </div>
                <div className={style['title-container']}>
                    <div className={style['title']}>{ `${currentCompany.company_name}-智慧能源管理系统`}</div>
                </div>
                <div className={style['weather-container']}>
                    <div>
                        <span>{ curTime + '  '+ `(${weekObj[week]})` }</span>
                        <span style={{ margin:'0 10px'}}>{ weatherInfo.city }</span>
                        <span>{ weatherInfo.weather }</span>
                        <span style={{ margin:'0 10px'}}>|</span>
                    </div>
                    
                    <div style={{ cursor:'pointer', display:'inline-flex', alignItems:'center'  }}>
                        <AlertOutlined style={{ marginRight:'6px', fontSize:'1.2rem' }} />
                        <Popover content={<ScrollTable data={ msg.detail || []}/>}>
                            <Badge count={msg.count} onClick={()=>onDispatch(routerRedux.push('/energy/alarm_manage/alarm_execute'))} />
                        </Popover>
                        <IconFont style={{ fontSize:'1.2rem', margin:'0 10px'}} type={ muted ? 'iconsound-off' : 'iconsound'} onClick={()=>{
                            setMuted(!muted);
                            let audio = document.getElementById('my-audio');
                            if ( muted ){
                                audio.muted = false;
                            } else {
                                audio.muted = true;
                            }
                        }}></IconFont>
                        <span style={{ margin:'0 10px' }}>|</span>
                    </div>
                   
                    <div style={{ display:'flex', alignItems:'center'}}>
                        <div style={{ width:'24px', height:'24px', borderRadius:'50%', backgroundColor:'#8888ac', backgroundRepeat:'no-repeat', backgroundSize:'cover', backgroundImage:`url(${avatarBg})`}}></div>
                        <div>{userInfo.user_name}</div>
                        <Tag color="blue">{ fromAgent ? '中台商' : userInfo.role_name }</Tag>
                    </div>
                    <span style={{ cursor:'pointer' }}>
                        {
                            fromAgent 
                            ?
                            <Tag color='#2db7f5' onClick={()=>{
                                if ( window.opener ){
                                    window.opener.postMessage({ type:'close', companyId:currentCompany.company_id });
                                    
                                }
                            }}>返回中台</Tag>
                            :
                            <Tag color='#2db7f5' onClick={()=>{
                                onDispatch({ type:'user/loginOut'});
                            }}>退出</Tag>
                        }
                        
                    </span>
                </div>
            </div>       
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data 
        || prevProps.collapsed !== nextProps.collapsed 
        || prevProps.sidebarWidth !== nextProps.sidebarWidth
        || prevProps.msg.count !== nextProps.msg.count    
    ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(Header, areEqual) ;