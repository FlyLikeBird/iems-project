import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useMemo } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Spin, Skeleton, Button, message } from 'antd';
import { PieChartOutlined, LeftOutlined, RightOutlined, CrownOutlined, TeamOutlined, GlobalOutlined, ApartmentOutlined, LineChartOutlined } from '@ant-design/icons';
import style from './AgentMonitor.css';
import MapChart from './components/MapChart';
import SmallMapChart from './components/SmallMapChart';
import LineChart from './components/LineChart';
import PieChart from './components/PieChart';
import TableCom2 from './components/TableCom2';
import WarningBarChart from './components/WarningBarChart';
import ProjectContainer from './components/ProjectContainer';
import CollectContainer from './components/CollectContainer';
import userActivityBg from '../../../public/agent/userActivity-bg.png';

import platformBg from '../../../public/agent/platform-bg.png';
import collectBg from '../../../public/agent/collect-bg.png';
import collectIcons from '../../../public/agent/agent-collect-icons-2.png';
import icon0 from '../../../public/agent/icons/0.png';
import icon1 from '../../../public/agent/icons/1.png';
import icon2 from '../../../public/agent/icons/2.png';
import icon3 from '../../../public/agent/icons/3.png';
import icon4 from '../../../public/agent/icons/4.png';
import icon5 from '../../../public/agent/icons/5.png';
import icon6 from '../../../public/agent/icons/6.png';
import icon7 from '../../../public/agent/icons/7.png';
import icon8 from '../../../public/agent/icons/8.png';
import icon9 from '../../../public/agent/icons/9.png';
import icon10 from '../../../public/agent/icons/10.png';
import icon11 from '../../../public/agent/icons/11.png';
import icon12 from '../../../public/agent/icons/12.png';
import icon13 from '../../../public/agent/icons/13.png';
import icon14 from '../../../public/agent/icons/14.png';

const collectIconsPosition = {
    'sound_light':icon1,
    'ele_meter':icon3,
    'illumination':icon4,
    'combustible':icon5,
    'gate':icon6,
    'annihilator':icon7,
    'gas_meter':icon8,
    'camera':icon0,
    'water_meter':icon9,
    'water_level':icon10,
    'smoke':icon14,
    'shock':icon2,
    'gateway':icon12,
    'temperature':icon13
};
const iconsPos = {
    'camera':4,
    'combustible':9,
    'ele_meter':3,
    'gas_meter':8,
    'gate':7,
    'gateway':2,
    'illumination':11,
    'smoke':1,
    'sound_light':6,
    'temperature':0,
    'water_level':10,
    'water_meter':5
}
const dotStyle = {
    display:'inline-block',
    width:'6px',
    height:'6px',
    borderRadius:'50%',
    marginRight:'4px'
}
function AgentIndex({ dispatch, agentMonitor, user }){
    const { monitorInfo, todayEnergy, rankInfo, meterInfo, dataLoad, activeDevice, projects, warningRank, warningPercent, warningStatus, finishTrendInfo, currentProvince, currentCity, autoMode } = agentMonitor;
    const containerRef = useRef();
    return (
        <div ref={containerRef} style={{ 
            width:'100%', 
            height:'100%', 
            position:'relative', 
            overflow:'hidden', 
            
        }}>
            {/* 避免层级覆盖，使其他信息框绝对定位悬浮在canvas上面 */}
            {/* 左侧悬浮窗 */}
            <div className={style['left']} style={{ left:'0', padding:'0 20px' }}>
                {/* 平台规模 */}
                <div className={style['item-container']} style={{ height:'34%'}}>
                    <div className={style['item-title']}>
                        <div className={style['item-title-bg']}></div>
                        <div className={style['item-title-text']}>
                            <GlobalOutlined />
                            平台规模
                        </div>
                        
                    </div>
                    <div className={style['item-extra']} style={{ right:'0', top:'6px', fontSize:'0.8rem', color:'#3293b3' }}>
                        平台无故障运行<span style={{ fontSize:'1.2rem', fontWeight:'bold', color:'#fff', margin:'0 4px', backgroundColor:'#7dfffa', color:'#000', padding:'0 10px', borderRadius:'8px' }}>{ monitorInfo.runDay || '--' }</span>天
                    </div>
                    <div className={style['item-content']}>
                        <div className={style['flex-container']} style={{ height:'40px'}}>
                            {
                                monitorInfo && Object.keys(monitorInfo).length
                                ?
                                monitorInfo.infoList.map((item,index)=>(
                                    <div key={item.text} className={style['flex-item']} style={{ paddingLeft:'10px', borderLeft:'4px solid #26b5fe'}}>
                                        <div className={style['sub-text']}>{ item.text }</div>
                                        <div><span className={style['item-data']} style={{ marginRight:'4px' }}>{ item.value }</span><span>{ item.unit }</span></div>
                                    </div>
                                ))
                                :
                                null
                            }
                        </div>
                        <div style={{ height:'calc( 100% - 40px)'}}>
                            <div style={{ display:'inline-block', verticalAlign:'middle', height:'100%', width:'60%'}}>
                                {
                                    monitorInfo && Object.keys(monitorInfo).length
                                    ?
                                    <SmallMapChart 
                                        companys={monitorInfo.companys} 
                                        currentProvince={currentProvince}
                                        dispatch={dispatch}    
                                    />
                                    :
                                    <Spin className={style['spin']} />
                                }
                            </div>
                            <div className={style['scroll-container']} style={{ 
                                border:'10px solid transparent',
                                borderImage:`url(${userActivityBg}) 10 repeat`
                            }}>
                                <div style={{ margin:'0 0 10px 0'}}>各省份项目数</div>
                                {
                                    monitorInfo && Object.keys(monitorInfo).length
                                    ?
                                    monitorInfo.provinProject.map((item, index)=>(
                                        <div key={index} style={{
                                            display:'flex',
                                            verticalAlign:'center',
                                            justifyContent:'space-between',
                                            padding:'4px 10px',
                                            // borderBottom:'1px solid rgba(0,0,0,0.2)'
                                        }}>
                                            <span className={style['sub-text']}>{ item.name }</span>
                                            <span className={style['text']}>{ item.value }</span>
                                        </div>
                                    ))
                                    :
                                    null
                                }
                            </div>
                        </div>
                    </div>
                </div>
                {/* 平台数据负荷 */}
                {/* <div className={style['item-container']} style={{ height:'20%'}}>
                    <div className={style['item-title']}>
                        <div className={style['item-title-bg']}></div>
                        <div className={style['item-title-text']}>
                            <LineChartOutlined />
                            平台数据负荷<span style={{ fontSize:'0.8rem' }}>(/kb)</span>
                        </div>
                    </div>
                    <div className={style['item-content']}>
                        {
                            Object.keys(dataLoad).length
                            ?
                            <LineChart xData={dataLoad.date} yData={dataLoad.dataArr}  />
                            :
                            <Spin className={style['spin']}/>
                        }
                    </div>
                </div> */}
                {/* 数据流量 */}
                <div className={style['item-container']} style={{ height:'20%'}}>
                    <div className={style['item-title']}>
                        <div className={style['item-title-bg']}></div>
                        <div className={style['item-title-text']}>
                            <LineChartOutlined />
                            数据流量<span style={{ fontSize:'0.8rem' }}>(/条)</span>
                        </div>
                    </div>
                    <div className={style['item-content']}>
                        {
                            Object.keys(activeDevice).length
                            ?
                            <LineChart xData={activeDevice.date} yData={activeDevice.value}  />
                            :
                            <Spin className={style['spin']}/>
                        }
                    </div>
                </div>
                {/* DAU */}
                <div className={style['item-container']} style={{ height:'20%'}}>
                    <div className={style['item-title']}>
                        <div className={style['item-title-bg']}></div>
                        <div className={style['item-title-text']}>
                            <TeamOutlined />
                            DAU<span style={{ fontSize:'0.8rem' }}>(/次)</span>
                        </div>
                    </div>
                    <div className={style['item-extra']} style={{ right:'0', top:'6px', fontSize:'0.8rem', color:'#3293b3'}}>
                            日活用户数<span style={{ fontSize:'1.2rem', fontWeight:'bold', color:'#fff', margin:'0 4px', backgroundColor:'#7dfffa', color:'#000', padding:'0 10px', borderRadius:'8px' }}>{ monitorInfo.todayActiveUser || '--' }</span>人
                    </div>
                    <div className={style['item-content']}>
                        {
                            Object.keys(monitorInfo).length
                            ?
                            <LineChart xData={monitorInfo.activeUserDate} yData={monitorInfo.activeUser} y2Data={monitorInfo.lastActiveUser} />
                            :
                            <Spin className={style['spin']}/>
                        }
                    </div>
                </div> 
                {/* 采集器在线数 */}
                <div className={style['item-container']} style={{ height:'34%' }}>
                    <div className={style['item-title']}>
                        <div className={style['item-title-bg']}></div>
                        <div className={style['item-title-text']}>
                        <ApartmentOutlined />
                            采集器在线数
                        </div>
                    </div>
                    <div className={style['item-content']}>
                        <div className={style['layout-container']}>
                            {
                                meterInfo.codeArr && meterInfo.info 
                                ?
                                Object.keys(meterInfo.codeArr).map((key,index)=>(
                                    <div key={index} className={style['layout-item-wrapper']} style={{
                                       paddingRight:'6px',
                                       paddingBottom:'6px',
                                       height:'22%'
                                    }}>
                                        <div className={style['layout-item']} style={{
                                            border:'6px solid transparent',
                                            borderImage:`url(${collectBg}) 6 repeat`,
                                            position:'relative',
                                        }}>
                                            <div className={style['layout-content']}>
                                                <img src={collectIconsPosition[key]} style={{ width:'30%', height:'auto' }} />
                                                <div style={{ marginLeft:'6px' }}>
                                                    <div className={style['sub-text']}>{ meterInfo.codeArr[key] }</div>
                                                    <div style={{ color:'#7dfffa'}}>{ meterInfo.info[key] }</div>
                                                </div>
                                            </div>
                                            <div className={`${style['layout-dot']} ${style['normal']}`}></div>
                                        </div>      
                                    </div>
                                    
                                ))
                                :
                                <Spin className={style['spin']} />
                            }
                            <div style={{
                                position:'absolute',
                                right:'0',
                                top:'-30px',
                                display:'flex',
                                alignItems:'center',
                                fontSize:'0.8rem'
                            }}>
                                <div style={{ margin:'0 10px'}}><span style={{ ...dotStyle, backgroundColor:'#84e87a'}}></span>正常</div>
                                <div><span style={{ ...dotStyle, backgroundColor:'#da0e0f' }}></span>异常</div>
                            </div>
                        </div>
                    </div>
                </div> 
            </div>
            {/* 右侧悬浮窗 */}
            <div className={style['right']} style={{ right:'0', padding:'0 20px' }}>
                {/* 告警占比 */}
                <div className={style['item-container']} style={{ height:'21%'}}>
                    <div className={style['item-title']}>
                        <div className={style['item-title-bg']}></div>
                        <div className={style['item-title-text']}>
                            <PieChartOutlined />
                            告警占比
                        </div>
                    </div>
                    <div className={style['item-content']}>
                        {
                            Object.keys(warningPercent).length 
                            ?
                            <PieChart data={warningPercent} dispatch={dispatch} hasToggle={false} />
                            :
                            <Spin className={style['spin']} />
                        }
                    </div>
                </div>
                {/* 标煤趋势 */}
                <div className={style['item-container']} style={{ height:'20%'}}>
                    <div className={style['item-title']}>
                        <div className={style['item-title-bg']}></div>
                        <div className={style['item-title-text']}>
                            <LineChartOutlined />
                            标煤趋势<span style={{ fontSize:'0.8rem' }}>(/tce)</span>
                        </div>
                    </div>
                    <div className={style['item-content']}>
                        {
                            Object.keys(todayEnergy).length
                            ?
                            <LineChart xData={todayEnergy.date} yData={todayEnergy.energy} />
                            :
                            <Spin className={style['spin']}/>
                        }
                    </div>
                </div>
                {/* 告警状态 */}
                <div className={style['item-container']} style={{ height:'21%'}}>
                    <div className={style['item-title']}>
                        <div className={style['item-title-bg']}></div>
                        <div className={style['item-title-text']}>
                            <PieChartOutlined />
                            告警状态
                        </div>
                    </div>
                    <div className={style['item-content']}>
                        {
                            warningStatus && Object.keys(warningStatus).length 
                            ?
                            <WarningBarChart data={warningStatus} />
                            :
                            <Spin className={style['spin']} />
                        }
                    </div>
                </div>
                {/* 分项排名 */}
                <div className={style['item-container']} style={{ height:'38%' }}>
                    <div className={style['item-title']}>
                        <div className={style['item-title-bg']}></div>
                        <div className={style['item-title-text']}>
                        <CrownOutlined />
                            分项排名
                        </div>
                    </div>
                    <div className={style['item-content']}>
                        {
                            rankInfo && Object.keys(rankInfo).length 
                            ?
                            <TableCom2 dispatch={dispatch} data={rankInfo.rankInfo} />
                            :
                            <Spin className={style['spin']} />
                        }
                    </div>
                </div>
            </div>
            
            {/* 中部悬浮窗 */}
            {/* <CollectContainer data={meterInfo} /> */}
            
            {/* 项目和场景入口 */}
            {/* <ProjectContainer data={projects} /> */}
            {
                Object.keys(monitorInfo).length && user.authorized
                ?
                <MapChart 
                    currentProvince={currentProvince}
                    currentCity={currentCity}
                    dispatch={dispatch}
                    companys={monitorInfo.companys}
                    autoMode={autoMode}
                    agentMsg={user.agentMsg}
                    userId={user.userInfo.user_id}
                />
                :
                <Spin className={style['spin']} size='large' />
            }
        </div>
              
    )
}

export default connect(({ agentMonitor, user })=>({ agentMonitor, user }))(AgentIndex);