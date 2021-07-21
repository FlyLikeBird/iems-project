import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useMemo } from 'react';
import { connect } from 'dva';
import { Spin, Skeleton } from 'antd';
import { PieChartOutlined } from '@ant-design/icons';
import style from '../AgentMonitor.css';
import LineChart from './LineChart';
import SmallMapChart from './SmallMapChart';
import ProjectList from './ProjectList';
import TableCom from './TableCom';

import collectBg from '../../../../public/agent/collect-bg.png';
import collectIcons from '../../../../public/agent/collect-icon.png';
import userActivityBg from '../../../../public/agent/userActivity-bg.png';
import userActivityIcon from '../../../../public/agent/userActivity-icon.png';
import platformBg from '../../../../public/agent/platform-bg.png';
import arrowUp from '../../../../public/agent/arrow-up.png';

import icon0 from '../../../../public/agent/icons/0.png';
import icon1 from '../../../../public/agent/icons/1.png';
import icon2 from '../../../../public/agent/icons/2.png';
import icon3 from '../../../../public/agent/icons/3.png';
import icon4 from '../../../../public/agent/icons/4.png';
import icon5 from '../../../../public/agent/icons/5.png';
import icon6 from '../../../../public/agent/icons/6.png';
import icon7 from '../../../../public/agent/icons/7.png';
import icon8 from '../../../../public/agent/icons/8.png';
import icon9 from '../../../../public/agent/icons/9.png';
import icon10 from '../../../../public/agent/icons/10.png';
import icon11 from '../../../../public/agent/icons/11.png';
import icon12 from '../../../../public/agent/icons/12.png';
import icon13 from '../../../../public/agent/icons/13.png';
import icon14 from '../../../../public/agent/icons/14.png';

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

const dotStyle = {
    display:'inline-block',
    width:'6px',
    height:'6px',
    borderRadius:'50%',
    marginRight:'4px'
}

function Monitor1({ dispatch, agentMonitor }){
    const { todayEnergy, monitorInfo, projectList, currentProvince, currentCity, isRunning, rankInfo, meterInfo } = agentMonitor;
    return (
        <div style={{ position:'absolute', top:'80px', left:'0', width:'100%', height:'calc( 100% - 80px )' }}>
            <div className={style['left']} >
                {/* 平台规模 */}
                <div className={style['item-container']} style={{ height:'36%'}}>
                    <div className={style['item-title']}>
                        <div className={style['item-title-bg']}></div>
                        <div className={style['item-title-text']}>
                            <PieChartOutlined />
                            平台规模
                        </div>
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
                            <div style={{ display:'inline-block', verticalAlign:'middle', height:'100%', width:'70%'}}>
                                {
                                    monitorInfo && Object.keys(monitorInfo).length
                                    ?
                                    <SmallMapChart 
                                        companys={monitorInfo.companys} 
                                        currentProvince={currentProvince}
                                        isRunning={isRunning}
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
                                <div style={{ margin:'10px 0'}}>各省份项目数</div>
                                {
                                    monitorInfo && Object.keys(monitorInfo).length
                                    ?
                                    monitorInfo.provinProject.map((item, index)=>(
                                        <div key={index} style={{
                                            display:'flex',
                                            verticalAlign:'center',
                                            justifyContent:'space-between',
                                            padding:'6px 10px'
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
                <div className={style['item-container']} style={{ height:'24%'}}>
                    <div className={style['item-title']}>
                        <div className={style['item-title-bg']}></div>
                        <div className={style['item-title-text']}>
                            <PieChartOutlined />
                            平台数据负荷
                        </div>
                    </div>
                    <div className={style['item-content']}>
                        {
                            todayEnergy && Object.keys(todayEnergy).length
                            ?
                            <LineChart data={todayEnergy} />
                            :
                            <Spin className={style['spin']}/>
                        }
                    </div>
                </div>
                {/* 采集器在线数 */}
                <div className={style['item-container']} style={{ height:'40%'}}>
                    <div className={style['item-title']}>
                        <div className={style['item-title-bg']}></div>
                        <div className={style['item-title-text']}>
                            <PieChartOutlined />
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
                                       height:'20%'
                                    }}>
                                        <div className={style['layout-item']} style={{
                                            border:'6px solid transparent',
                                            borderImage:`url(${collectBg}) 6 repeat`,
                                            position:'relative'
                                        }}>
                                            <div className={style['layout-content']}>
                                                <img src={collectIconsPosition[key]} style={{ height:'90%', width:'auto' }} />
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
                                null
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
            {/* 中间地图监控 */}
            <div className={style['middle']}>
                <div className={style['item-container']} style={{ height:'100%', position:'relative' }}>
                    <div style={{ height:'24%', position:'absolute', width:'100%', top:'0', zIndex:10 }}>
                        <ProjectList data={projectList} />
                    </div>
                    
                </div>
            </div>
            <div className={style['right']}>
                {/* 访问量 */}
                <div className={style['item-container']} style={{ height:'36%'}}>
                    <div className={style['item-title']}>
                        <div className={style['item-title-bg']}></div>
                        <div className={style['item-title-text']}>
                            <PieChartOutlined />
                            访问量
                        </div>
                    </div>
                    <div className={style['item-content']}>
                        <div className={style['layout-container']} style={{ height:'20%'}}>
                            <div className={style['layout-item-wrapper']} style={{ width:'50%', height:'100%' }}>
                                <div className={style['layout-item']} style={{
                                    backgroundColor:'#082a46',
                                    border:'6px solid transparent',
                                    borderImage:`url(${userActivityBg}) 6 repeat`
                                }}>
                                    <div className={style['layout-content']}>
                                        <img src={userActivityIcon} style={{ height:'100%', width:'auto' }} />
                                        <div>
                                            <div>DAU</div>
                                            <div>
                                                <span className={style['text']}>{ monitorInfo.todayActiveUser ? monitorInfo.todayActiveUser : '0' }</span>
                                                <span>人</span>
                                                <span><img src={arrowUp} style={{ height:'14px' }} /></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>                                        
                        </div>
                        <div style={{ height:'80%'}}>
                        {
                            monitorInfo && Object.keys(monitorInfo).length
                            ?
                            <LineChart data={{ date:monitorInfo.activeUserDate, energy:monitorInfo.activeUser }} />
                            :
                            <Spin className={style['spin']}/>
                        }
                        </div>
                    </div>
                </div>
                {/* 各项排名 */}
                <div className={style['item-container']} style={{ height:'64%' }}>
                    <div className={style['item-title']}>
                        <div className={style['item-title-bg']}></div>
                        <div className={style['item-title-text']}>
                            <PieChartOutlined />
                            各项排名
                        </div>
                    </div>
                    <div className={style['item-content']}>
                        {
                            rankInfo && Object.keys(rankInfo).length 
                            ?
                            <TableCom dispatch={dispatch} data={rankInfo.rankInfo} />
                            :
                            <Spin className={style['spin']} />
                        }
                    </div>
                </div>
            </div>
        </div>
              
    )
}

export default connect(({ agentMonitor})=>({ agentMonitor }))(Monitor1);