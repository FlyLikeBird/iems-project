import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useMemo } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Spin, Skeleton, Button, Badge,  message } from 'antd';
import { PieChartOutlined, AlertFilled, LeftOutlined, RightOutlined,  } from '@ant-design/icons';
import headerBg from '../../../public/agent-header-bg.png';
import agentBg from '../../../public/agent-bg.png';
import style from './AgentMonitor.css';
// import AgentMonitor from './AgentMonitor';
// import ProjectList from './ProjectList';
// import SceneEntry from './SceneEntry';
// import Test from './Test';

function caclContentHeight(container, img, layout, setLayout){
    let ratio = container.offsetWidth / img.width ;
    let calcHeight = layout.head * ratio;
    img.style.width = '100%';
    img.style.height = 'auto';
    setLayout({ head:calcHeight, content:container.offsetHeight - calcHeight });
}

function getImageInfo(url, container, layout, setLayout){
    let img = new Image();
    img.src = url;
    if(img.complete){
        caclContentHeight(container, img, layout, setLayout)
    } else {
        img.onload = function(){
            caclContentHeight(container, img, layout, setLayout)
        }
    }
    container.appendChild(img);
}


const buttonStyle ={
    display:'inline-block',
    backgroundColor:'#8cecfc',
    padding:'4px 6px',
    margin:'0 6px',
    color:'#000',
    fontSize:'0.8rem',
    borderBottomLeftRadius:'6px',
    borderBottomRightRadius:'6px',
    cursor:'pointer'
}
function getSum(data){
    let sum = 0;
    if ( data && Object.keys(data).length ){
        Object.keys(data).forEach(key=>{
            let province = data[key];
            let provinceSum = 0;
            if ( Object.keys(province).length ) {
                Object.keys(province).forEach(cityKey=>{
                    provinceSum += province[cityKey].reduce(( total, cur)=>{ total += cur.warning_cnt; return total }, 0);
                })
            };
            sum += provinceSum;
        });
    }
    return sum;
}
let subWindows = {}
const projectsMap = {
    energy_manage:'iot',
    aiot:'e',
    air_compressor:'acs',
    hy_switch_system:'safe',
    hy_ele_room:'pr'
};
function AgentIndex({ dispatch, user, match, location, children }){
    const containerRef = useRef();
    const { userInfo } = user;
    let [sumAlarm, setSumAlarm] = useState(0);
    useEffect(()=>{
        setSumAlarm(getSum(userInfo.city));
    },[userInfo])
    // const [layout, setLayout] = useState({ head:56, content:0 });
    // useEffect(()=>{
    //     // 获取图片的原始尺寸，根据原始宽高和容器宽高比算出缩放比例，然后算出可用内容展示区
    //     getImageInfo(bg, containerRef.current, layout, setLayout);
    // },[]);
    // console.log(match);
    // console.log(location);
    useEffect(()=>{
        window.name = 'parent';
        window.handleTooltipClick = (userId, companyId)=>{ 
            if ( !companyId ) return;
            let temp = window.location.host.split('-');
            let prefix = temp.length === 2 ? temp[1].split('.')[0] : '';
            let linkPath = ( prefix ? projectsMap['energy_manage'] + '-' + prefix : projectsMap['energy_manage'] ) + '.' + window.g.host + '.com';
            let url = `http://${linkPath}?pid=${Math.random()}&&userId=${userId}&&companyId=${companyId}`;
            if ( !subWindows[companyId] ) {
                let sub = window.open(url);
                subWindows[companyId] = sub;
            } else {
                if ( subWindows[companyId] ) {
                    subWindows[companyId].focus();
                }
            }
        }
        function handleMessage(e){
            if ( e.data.type === 'close' ){
                // 删除打开的企业子窗口项目
                if ( subWindows[e.data.companyId] && subWindows[e.data.companyId].close ) {
                    subWindows[e.data.companyId] = null;
                }
            }      
        }
        function handleUnload(e){
            Object.keys(subWindows).forEach(key=>{
                if ( subWindows[key] && subWindows[key].close ){
                    subWindows[key].close();
                    subWindows[key] = null;
                }
            });
        }
        
        window.addEventListener('message', handleMessage);
        window.addEventListener('unload', handleUnload);
        return ()=>{
            window.handleTooltipClick = null;
            window.removeEventListener('message', handleMessage);
            window.removeEventListener('unload', handleUnload);
            Object.keys(subWindows).forEach(key=>{
                if ( subWindows[key] && subWindows[key].close ){
                    subWindows[key].close();
                    subWindows[key] = null;
                }
            });
            subWindows = {};
        }
    },[])
    return (
        <div className={style['container']} ref={containerRef}>
            <div className={style['content-container']} style={{ 
                top:'0', 
                height:'100%',
                backgroundImage:`url(${agentBg})`, 
                backgroundRepeat:'no-repeat',
                backgroundSize:'cover'
            }}>
                { children }
                {
                    match.url === '/agentMonitor' || match.url === '/agentMonitor/monitor'
                    ?
                    <div style={{ 
                        position:'absolute', 
                        top:0,
                        left:0,
                        width:'100%', 
                        zIndex:'2'
                        // top:-layout.head + 'px'
                    }}>
                        <img src={headerBg} style={{ width:'100%' }} />
                        <div style={{ position:'absolute', left:'50%', top:'18px', fontSize:'2rem', letterSpacing:'0.8rem', transform:'translateX(-50%)' }}>AIOT物联感知系统监控中台</div>
                        <div style={{ position:'absolute', right:'23%', top:'55px' }}>
                            <Badge count={sumAlarm} overflowCount={999} style={{ cursor:'pointer' }} onClick={()=>{
                                history.push('/agentMonitor/alarm');
                            }}>
                                <AlertFilled size='small' style={{ fontSize:'1.4rem', color:'#7dfffa' }} />
                            </Badge>
                        </div>
                        <div style={{ position:'absolute', right:'20px', top:'0' }}>
                            {/* <span style={buttonStyle} onClick={()=>{
                                if ( containerRef.current ){
                                    window.alert(containerRef.current.offsetWidth + '/' + containerRef.current.offsetHeight);
                                }
                            }}>分辨率</span>
                            
                            <span style={buttonStyle} onClick={()=>dispatch(routerRedux.push('/agentMonitor/test'))}>测试布局</span> */}
                            {
                                location.pathname !== '/agentMonitor' 
                                ?
                                <span style={buttonStyle} onClick={()=>{
                                    history.push('/agentMonitor');
                                }}>返回主页</span>
                                :
                                null
                            }
                            <span style={buttonStyle} onClick={()=>history.push('/agentMonitor/entry')}>快速入口</span>
                            <span style={buttonStyle} onClick={()=>history.push('/agentMonitor/project')}>项目列表</span>
                            <span style={buttonStyle} onClick={()=>{
                                dispatch({type:'user/loginOut'});
                            }}>退出登录</span>
                        </div>
                    </div>
                    :
                    null
                }
                
            </div> 
               
        </div>
    )
}

export default connect(({ user })=>({ user }))(AgentIndex);