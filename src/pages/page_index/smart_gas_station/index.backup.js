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

function AgentManager({ dispatch, user, gasStation }){
    let { userInfo, authorized, companyList, msg } = user;
    let { data, sceneLoading } = gasStation;
    let loaded = Object.keys(data).length ? true : false; 
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'gasStation/fetchGasStationInfo'});
            timer = setInterval(()=>{
                dispatch({ type:'gasStation/fetchGasStationInfo'});
            }, 8 * 60 * 1000)
        }    
    },[authorized]);
    useEffect(()=>{
        return ()=>{
            clearInterval(timer);
            timer = null;
            dispatch({ type:'gasStation/reset'});
        } 
    },[])
    let isFulled = isFullscreen();
    return (
        <div className={style['container']} style={{ backgroundImage:`url(${monitorBg})`}}>
            {
                isFulled
                ?
                <FullscreenHeader title='智慧空压站' />
                :
                null
            }
            {
                sceneLoading 
                ?
                <Spin size='large' className={IndexStyle['spin']} />
                :
                <SceneMonitor dispatch={dispatch}  />
            }
            <div className={style['float-container']} style={{ left:'20px', top:isFulled ? '60px' : '0', height : isFulled ? 'calc( 100% - 60px)' : '100%' }}>
                {/* 设备状态 */}
                <div className={IndexStyle['card-container']} style={{ height:'16%', backgroundColor:'transparent', overflow:'hidden' }}>
                    <div className={IndexStyle['card-title']} style={{ color:'#fff', fontWeight:'normal' }}>空压站规模</div>
                    <div className={IndexStyle['card-content']} style={{ padding:'1rem 0'}}>
                        {
                            data.infoList && data.infoList.length 
                            ?
                            <div className={IndexStyle['flex-container']} style={{ textAlign:'left', justifyContent:'space-between' }}>
                                {
                                    data.infoList.map((item,index)=>(
                                        <div className={IndexStyle['flex-item']} key={index}>
                                            <div className={IndexStyle['sub-text']} style={{ color:'rgba(255,255,255,0.6)'}}>{ item.title }</div>
                                            <div className={IndexStyle['data']} style={{ color:'#5cb9f8'}}>{ item.value }</div>
                                        </div>
                                    ))
                                }
                            </div>
                            :
                            <Spin className={IndexStyle['spin']} />
                        }
                    </div>
                </div>
                
                {/* 气电比 改为渐变面积图 */}
                <div className={IndexStyle['card-container']} style={{ height:'21%', backgroundColor:'transparent', overflow:'hidden' }}>
                    <div className={IndexStyle['card-title']} style={{ color:'#fff', fontWeight:'normal' }}><div>近7日气电比<span className={IndexStyle['sub-text']} style={{ color:'rgba(255, 255, 255, 0.6)'}}>(m³/kwh)</span></div></div>
                    <div className={IndexStyle['card-content']} style={{ padding:'0' }}>
                        {
                            loaded
                            ?
                            <AreaLineChart data={data.view.ratio} />
                            :
                            <Spin className={IndexStyle['spin']} />
                        }
                    </div>
                </div>
                {/* 本周耗电量 */}
                <div className={IndexStyle['card-container']} style={{ height:'21%', backgroundColor:'transparent', overflow:'hidden' }}>
                    <div className={IndexStyle['card-title']} style={{ color:'#fff', fontWeight:'normal' }}><div>近7日耗电量<span className={IndexStyle['sub-text']} style={{ color:'rgba(255, 255, 255, 0.6)'}}>(kwh)</span></div></div>
                    <div className={IndexStyle['card-content']} style={{ padding:'0' }}>
                        {
                            loaded 
                            ?
                            <BarChart data={data.view.ele} />
                            :
                            <Spin className={IndexStyle['spin']} />
                        }
                    </div>
                </div>
                {/* 近7日用气量 */}
                <div className={IndexStyle['card-container']} style={{ height:'21%', backgroundColor:'transparent', overflow:'hidden' }}>
                    <div className={IndexStyle['card-title']} style={{ color:'#fff', fontWeight:'normal' }}><div>近7日用气量<span className={IndexStyle['sub-text']} style={{ color:'rgba(255, 255, 255, 0.6)'}}>(m³)</span></div></div>
                    <div className={IndexStyle['card-content']} style={{ padding:'0' }}>
                        {
                            loaded
                            ?
                            <LineChart data={data.view.gas} title='用气量' />
                            :
                            <Spin className={IndexStyle['spin']} />
                        }
                    </div>
                </div>
                {/* 本月加载次数 */}
                <div className={IndexStyle['card-container']} style={{ height:'21%', backgroundColor:'transparent', overflow:'hidden' }}>
                    <div className={IndexStyle['card-title']} style={{ color:'#fff', fontWeight:'normal' }}><div>近7日告警次数<span className={IndexStyle['sub-text']} style={{ color:'rgba(255, 255, 255, 0.6)'}}>(次)</span></div></div>
                    <div className={IndexStyle['card-content']} style={{ padding:'0' }}>
                        {
                            loaded
                            ?
                            <LineChart data={data.view.reload} title='告警数' />
                            :
                            <Spin className={IndexStyle['spin']} />
                        }
                    </div>
                </div>
            </div>
            <div className={style['float-container']} style={{ right:'20px', top:isFulled ? '60px' : '0', height : isFulled ? 'calc( 100% - 60px)' : '100%' }}>
                {/* 本月累计节省电费 */}
                <div className={IndexStyle['card-container']} style={{ height:'16%', backgroundColor:'transparent', overflow:'hidden' }}>
                    <div className={IndexStyle['card-title']} style={{ color:'#fff', fontWeight:'normal' }}>本月累计节省电费</div>
                    <div className={IndexStyle['card-content']}>
                        {
                            loaded 
                            ?
                            <NumberFormat data={data.saveCost ? Math.round(data.saveCost)  : 0 } />
                            :
                            <Spin className={IndexStyle['spin']} />
                        }
                    </div>
                </div>
                {/* 实时监控数据 */}
                <div className={IndexStyle['card-container']} style={{ height:'60%', backgroundColor:'transparent', overflow:'hidden' }}>
                    <div className={IndexStyle['card-title']} style={{ color:'#fff', fontWeight:'normal' }}>实时监控数据</div>
                    <div className={IndexStyle['card-content']}>
                        {
                            loaded 
                            ?
                            <div style={{ height:'100%' }}>
                                <div style={{ height:'50%' }}><GaugeChart name='母管压力' value={data.pressure} unit='bar' /></div>
                                <div style={{ height:'50%' }}><GaugeChart name='瞬时流量' value={data.speed} unit='m³/min' /></div>
                            </div>
                            :
                            <Spin className={IndexStyle['spin']} />
                        }
                    </div>
                </div>
                {/* 告警列表 */}
                <div className={IndexStyle['card-container']} style={{ height:'24%', backgroundColor:'transparent', overflow:'hidden' }}>
                    <div className={IndexStyle['card-title']} style={{ color:'#fff', fontWeight:'normal' }}>告警列表</div>
                    <div className={IndexStyle['card-content']} style={{ padding:'0' }}>
                        {
                            loaded 
                            ?
                            <ScrollTable 
                                thead={[{ title:'位置', key:'region_name', width:'20%'}, { title:'设备', key:'mach_name', width:'22%'}, { title:'分类', key:'type_name', width:'25%', border:true }, { title:'发生时间', key:'first_warning_time', width:'33%' }]} 
                                data={data.warning || []} 
                            />
                            :
                            <Spin className={IndexStyle['spin']} />
                        }
                        
                    </div>
                </div>
            </div>
        </div>
    )
}

export default connect(({ user, gasStation })=>({ user, gasStation }))(AgentManager);