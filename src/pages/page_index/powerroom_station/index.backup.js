import React, { useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import { createFromIconfontCN } from '@ant-design/icons';
import style from './monitorIndex.css';
import PieChart from './components/PieChart';
import RadarChart from './components/RadarChart';
import WarningBarChart from './components/WarningBarChart.js';
import WarningTrendChart from './components/WarningTrendChart.js';
import PowerRoomScene from './PowerRoomScene';
// import PowerRoomScene from './PowerRoom_backup';
import MonitorTable from './components/MonitorTable';
import ScrollCom from './components/ScrollCom';
import FullscreenHeader from '../../components/FullscreenHeader';
import platformIcons from '../../../../public/icons/platform.png';
import energyIcons from '../../../../public/icons/energyIcons.png';
import envIcons from '../../../../public/icons/envIcons.png';
import bg from '../../../../public/monitor_bg.jpg';

const IconFont = createFromIconfontCN({
    scriptUrl:'//at.alicdn.com/t/font_2517897_hi5dt2qokmi.js'
});
let timer;
function isFullscreen(){
    return document.fullscreenElement    ||
           document.msFullscreenElement  ||
           document.mozFullScreenElement ||
           document.webkitFullscreenElement || false;
}
function MonitorIndex({ dispatch, user, monitorIndex, children }){
    const { monitorInfo, sceneList, currentScene, sceneIndex, sceneLoading } = monitorIndex;
    const { userInfo, authorized, containerWidth, fullscreen } = user;
    const cameraRef = useRef();
    let isLoading = Object.keys(monitorInfo).length ? false : true;
    useEffect(()=>{  
        return ()=>{
            dispatch({ type:'monitorIndex/cancelAll'});
            clearInterval(timer);
            timer = null;
        }
    },[]);
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'monitorIndex/init'});
            timer = setInterval(()=>{
                dispatch({ type:'monitorIndex/fetchMonitorInfo', payload:{ noLoading:true }});
            },3 * 60 * 1000 )
        }
    },[authorized])
    let isFulled = isFullscreen();
    return (
        <div className={style['container']} style={{ backgroundImage:`url(${bg})` }}>
                {
                    isFulled 
                    ?
                    <FullscreenHeader title='智慧电房监控系统' />
                    :
                    null
                }
                {/* 配电房场景列表 */}
                <div className={style['btn-group']} style={{ left:'20%', transform:'none', color:'#fff', top: isFulled ? '66px' : '6px' }}>
                    <span>当前:</span>
                    <span>{ currentScene.scene_name || '' }</span>
                </div>
                <div className={style['btn-group']} style={{ top: isFulled ? '66px' : '6px' }}>
                    {
                        sceneList.map((item,index)=>(
                            <span key={index} className={ item.scene_id === currentScene.scene_id ? style['btn-item'] + ' ' + style['selected'] : style['btn-item']} onClick={()=>{
                                if ( item.scene_id !== currentScene.scene_id ){
                                    dispatch({ type:'monitorIndex/toggleCurrentScene', payload:{ currentScene:item, sceneIndex:index + 1 }});
                                    dispatch({ type:'monitorIndex/fetchMonitorInfo'});
                                }                           
                            }}>{ index + 1 }</span>
                        ))
                    }
                </div>
                {/* 左侧悬浮窗 */}
                <div className={style['left']} style={{ top : isFulled ? '60px' : '0', height : isFulled ? 'calc( 100% - 60px)' : '100%' }}>
                    <div className={style['card-container']} style={{ height:'25%' }}>
                        <div className={style['card-title']}>
                            <div className={style['card-title-content']}>
                                <span className={style['symbol']}></span>
                                <span style={{ margin:'0 6px'}}>规模概要</span>
                                <span className={style['symbol']}></span>
                            </div>
                            <div className={style['symbol2']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                isLoading 
                                ?
                                <Spin className={style['spin']} />
                                :
                                <div className={style['flex-container']}>
                                    {
                                        monitorInfo.totalInfoList.map((item,index)=>(
                                            <div key={index} className={style['flex-item']}>
                                                <div className={style['flex-icon']} style={{ backgroundImage:`url(${platformIcons})`, backgroundPosition:`-${index* ( containerWidth <= 1440 ? 24 : 38 )}px 0`}}></div>
                                                <div className={style['flex-content']}>
                                                    <div className={style['flex-text']}>{ item.title }</div>
                                                    <div>
                                                        <span className={style['flex-data']}>{ item.value }</span>
                                                        <span className={style['flex-unit']}>{ item.unit }</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            }
                        </div>
                    </div>
                    <div className={style['card-container']} style={{ height:'25%' }}>
                        <div className={style['card-title']}>
                            <div className={style['card-title-content']}>
                                <span className={style['symbol']}></span>
                                <span style={{ margin:'0 6px'}}>近7日告警趋势</span>
                                <span className={style['symbol']}></span>
                            </div>
                            <div className={style['symbol2']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                isLoading 
                                ?
                                <Spin className={style['spin']} />
                                :
                                <WarningBarChart data={monitorInfo.warningSeven} />                            
                            }
                        </div>
                    </div>
                    <div className={style['card-container']} style={{ height:'25%' }}>
                        <div className={style['card-title']}>
                            <div className={style['card-title-content']}>
                                <span className={style['symbol']}></span>
                                <span style={{ margin:'0 6px'}}>本月告警监控</span>
                                <span className={style['symbol']}></span>
                            </div>
                            <div className={style['symbol2']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                isLoading 
                                ?
                                <Spin className={style['spin']} />
                                :
                                <PieChart data={monitorInfo.orderInfo} />                            
                            }
                        </div>
                    </div>
                    {/* <div className={style['card-container']} style={{ height:'25%' }}>
                        <div className={style['card-title']}>
                            <div className={style['card-title-content']}>
                                <span className={style['symbol']}></span>
                                <span style={{ margin:'0 6px'}}>本月未处理告警</span>
                                <span className={style['symbol']}></span>
                            </div>
                            <div className={style['symbol2']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                isLoading
                                ?
                                <Spin className={style['spin']} />
                                :
                                <MonitorTable data={monitorInfo.warningDetail} />                              
                            }
                        </div>
                    </div> */}
                    <div className={style['card-container']} style={{ height:'25%' }}>
                        <div className={style['card-title']}>
                            <div className={style['card-title-content']}>
                                <span className={style['symbol']}></span>
                                <span style={{ margin:'0 6px'}}>变压器负荷</span>
                                <span className={style['symbol']}></span>
                            </div>
                            <div className={style['symbol2']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                isLoading 
                                ?
                                <Spin className={style['spin']} />
                                :
                                <ScrollCom data={monitorInfo.transmerInfo} />
                            }
                        </div>
                    </div>
                </div>
                {/* 左侧悬浮窗-----结束 */}
                {/* 右侧悬浮窗 */}
                <div className={style['right']} style={{ top : isFulled ? '60px' : '0', height : isFulled ? 'calc( 100% - 60px)' : '100%' }}>
                    {/* 能耗信息 */}
                    <div className={style['card-container']} style={{ height:'30%' }}>
                        <div className={style['card-title']}>
                            <div className={style['card-title-content']}>
                                <span className={style['symbol']}></span>
                                <span style={{ margin:'0 6px'}}>能耗信息</span>
                                <span className={style['symbol']}></span>
                            </div>
                            <div className={style['symbol2']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                isLoading 
                                ?
                                <Spin className={style['spin']} />
                                :
                                <div className={style['flex-container']}>
                                    {
                                        monitorInfo.energyInfoList.map((item,index)=>(
                                            <div className={style['flex-item']} key={index}>
                                                <div className={style['flex-icon']} style={{ backgroundImage:`url(${energyIcons})`, backgroundPosition:`-${index*( containerWidth <= 1440 ? 24 : 38 )}px 0`}}></div>
                                                <div className={style['flex-content']}>
                                                    <div className={style['flex-text']} style={{ color:'#04fde7' }}>{ item.title }</div>
                                                    <div>
                                                        <span className={style['flex-data']}>{ item.value }</span>
                                                        <span className={style['flex-unit']}>{ item.unit }</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            }
                        </div>
                    </div>
                    {/* 环境监测 */}
                    {/* <div className={style['card-container']} style={{ height:'32%' }}>
                        <div className={style['card-title']}>
                            <div className={style['card-title-content']}>
                                <span className={style['symbol']}></span>
                                <span style={{ margin:'0 6px'}}>环境监测</span>
                                <span className={style['symbol']}></span>
                            </div>
                            <div className={style['symbol2']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                isLoading 
                                ?
                                <Spin className={style['spin']} />
                                :
                                <div className={style['flex-container']}>
                                    {
                                        monitorInfo.envInfoList.map((item,index)=>(
                                            <div className={style['flex-item']} key={index}>
                                                <div className={style['flex-icon']} style={{ width: containerWidth < 1440 ? '24px' : '40px', height: containerWidth < 1440 ? '24px' : '40px', backgroundImage:`url(${envIcons})`, backgroundPosition:`-${index*( containerWidth <= 1440 ? 24 : 40 )}px 0`}}></div>
                                                <div className={style['flex-content']}>
                                                    <div className={style['flex-text']}>{ item.title }</div>
                                                    <div>
                                                        <span className={style['flex-data']}>{ item.value }</span>
                                                        <span className={style['flex-unit']}>{ item.unit }</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            }
                        </div>
                    </div> */}
                    {/* 用电分析 */}
                    <div className={style['card-container']} style={{ height:'38%' }}>
                        <div className={style['card-title']}>
                            <div className={style['card-title-content']}>
                                <span className={style['symbol']}></span>
                                <span style={{ margin:'0 6px'}}>用电分析</span>
                                <span className={style['symbol']}></span>
                            </div>
                            <div className={style['symbol2']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                isLoading 
                                ?
                                <Spin className={style['spin']} />
                                :
                                <RadarChart data={monitorInfo.grade} />
                            }
                        </div>
                    </div>
                    {/* 能耗趋势 */}
                    <div className={style['card-container']} style={{ height:'32%' }}>
                        <div className={style['card-title']}>
                            <div className={style['card-title-content']}>
                                <span className={style['symbol']}></span>
                                <span style={{ margin:'0 6px'}}>能耗趋势</span>
                                <span className={style['symbol']}></span>
                            </div>
                            <div className={style['symbol2']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                isLoading 
                                ?
                                <Spin className={style['spin']} />
                                :
                                <WarningTrendChart data={monitorInfo.view} />                            
                            }
                        </div>
                    </div>
                </div>
                {/* 右侧悬浮窗结束 ----- */}
                {/* 中部悬浮窗 */}
                <div className={style['middle']}>
                    {
                        sceneLoading
                        ?
                        <Spin className={style['spin']} />
                        :
                        <PowerRoomScene dispatch={dispatch} currentCompany={user.currentCompany} currentScene={currentScene} sceneIndex={sceneIndex} fullscreen={fullscreen}  />
                        
                        
                    }
                </div>
                {/* 底部悬浮窗 */}
                {/* <div className={style['bottom']}>
                    <div className={style['card-container']} style={{ height:'100%' }}>
                        <div className={style['card-title']} style={{ width:'30%' }}>
                            <div className={style['card-title-content']}>
                                <span className={style['symbol']}></span>
                                <span style={{ margin:'0 6px'}}>能耗趋势</span>
                                <span className={style['symbol']}></span>
                            </div>
                            <div className={style['symbol2']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                isLoading 
                                ?
                                <Spin className={style['spin']} />
                                :
                                <WarningTrendChart data={monitorInfo.view} />                            
                            }
                        </div>
                    </div>
                </div> */}
                {/* 底部悬浮窗结束----- */}            
        </div>
    )
}

export default connect(({ user, monitorIndex })=>({ user, monitorIndex }))(MonitorIndex);