import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useMemo } from 'react';
import { connect } from 'dva';
import { Spin, Skeleton } from 'antd';
import { PieChartOutlined, CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import style from '../AgentMonitor.css';
import LineChart from './LineChart';
import BarChart from './BarChart';
import PieChart from './PieChart';
import WarningMap from './WarningMap';
import WarningRankBarChart from './WarningRankBarChart';
import WarningTrendBarChart from './WarningTrendBarChart';

import warningBg from '../../../../public/agent/warning-bg.png';

const dotStyle = {
    display:'inline-block',
    width:'6px',
    height:'6px',
    borderRadius:'50%',
    marginRight:'4px'
}

function AgentMonitor2({ dispatch, user, agentMonitor }){
    const { warningType, warningMonitor, warningStatus, warningRank, warningTrend } = agentMonitor;
    return (
        
        <div style={{ width:'100%', height:'100%', padding:'20px 40px 0 40px'}}>
                    <div className={style['left']} >
                        {/* 告警越限 */}
                        <div className={style['item-container']} style={{ height:'50%'}}>
                            <div className={style['item-title']}>
                                <div className={style['item-title-bg']}></div>
                                <div className={style['item-title-text']}>
                                    <PieChartOutlined />
                                    告警越限
                                </div>
                            </div>
                            <div className={style['item-content']}>
                                {
                                    warningMonitor && Object.keys(warningMonitor).length
                                    ?

                                    <div style={{ height:'100%' }}>
                                        <div style={{ height:'50%'}}>
                                            <LineChart data={warningMonitor} forWarning />
                                        </div>
                                        <div style={{ height:'50%'}}>
                                            <BarChart xData={warningMonitor.year.date} yData={warningMonitor.year.record} />
                                        </div>
                                    </div>
                                    :
                                    <Spin className={style['spin']} />
                                }
                            </div>
                        </div>
                        {/* 告警种类 */}
                        <div className={style['item-container']} style={{ height:'50%'}}>
                            <div className={style['item-title']}>
                                <div className={style['item-title-bg']}></div>
                                <div className={style['item-title-text']}>
                                    <PieChartOutlined />
                                    告警种类
                                </div>
                            </div>
                            <div className={style['item-content']}>
                                <div className={style['layout-container']}>
                                    {
                                        warningType.info && warningType.type 
                                        ?
                                        Object.keys(warningType.info).map((key,index)=>(
                                            <div key={index} className={style['layout-item-wrapper']} style={{
                                                height:'20%',
                                                paddingRight:'6px',
                                               paddingBottom:'6px'
                                            }}>
                                                <div className={style['layout-item']} style={{
                                                    borderTop:'12px solid transparent',
                                                    borderRight:'28px solid transparent',
                                                    borderBottom:'26px solid transparent',
                                                    borderLeft:'45px solid transparent',
                                                    borderImage:`url(${warningBg}) 12 28 26 45 repeat`
                                                }}>
                                                    <div style={{
                                                        position:'absolute',
                                                        left:'50%',
                                                        top:'50%',
                                                        transform:'translate(-50%,-50%)',
                                                        whiteSpace:'nowrap',
                                                        textAlign:'center'
                                                    }}>
                                                        <div className={style['sub-text']}>{ warningType.type[key] }</div>
                                                        <div className={style['text']} style={{ color:'#efb935', margin:'6px 0'}}>{ warningType.info[key] }</div>
                                                    </div>
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
                                        fontSize:'1rem'
                                    }}>
                                        <CaretRightOutlined style={{ color:'#fca532' }} />
                                        <span style={{ margin:'0 10px 0 20px'}}>总告警数</span>
                                        <span className={style['special-font']} style={{ margin:'0 20px', color:'#fca532' }}>
                                            { warningType.info ? Object.keys(warningType.info).map(key=>warningType.info[key]).reduce((sum,cur)=>{
                                                sum+=cur;
                                                return sum;
                                            },0) : '--' }
                                        </span>
                                        <CaretLeftOutlined style={{ color:'#fca532' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 中间地图监控 */}
                    <div className={style['middle']}>
                        <div className={style['item-container']} style={{ height:'100%' }}>
                            {
                                Object.keys(user.agentMsg).length 
                                ?
                                <WarningMap dispatch={dispatch} warningInfo={user.agentMsg} />
                                :
                                <Spin className={style['spin']} />
                            }
                        </div>
                    </div>
                    <div className={style['right']}>
                        {/* 访问量 */}
                        <div className={style['item-container']} style={{ height:'33%'}}>
                            <div className={style['item-title']}>
                                <div className={style['item-title-bg']}></div>
                                <div className={style['item-title-text']}>
                                    <PieChartOutlined />
                                    工单分类
                                </div>
                            </div>
                            <div className={style['item-content']}>
                                {
                                    warningStatus && Object.keys(warningStatus).length 
                                    ?
                                    <PieChart data={warningStatus} dispatch={dispatch} />
                                    :
                                    <Spin className={style['spin']} />
                                }
                            </div>
                        </div>
                        {/* 各项排名 */}
                        <div className={style['item-container']} style={{ height:'33%' }}>
                            <div className={style['item-title']}>
                                <div className={style['item-title-bg']}></div>
                                <div className={style['item-title-text']}>
                                    <PieChartOutlined />
                                    项目工单榜
                                </div>
                            </div>
                            <div className={style['item-content']}>
                                <WarningRankBarChart data={warningRank} dispatch={dispatch} />
                            </div>
                        </div>
                        <div className={style['item-container']} style={{ height:'33%' }}>
                            <div className={style['item-title']}>
                                <div className={style['item-title-bg']}></div>
                                <div className={style['item-title-text']}>
                                    <PieChartOutlined />
                                    工单趋势
                                </div>
                            </div>
                            <div className={style['item-content']}>
                                <WarningTrendBarChart data={warningTrend} dispatch={dispatch} />
                            </div>
                        </div>
                    </div>
        </div>
    )
}


export default connect(({ user, agentMonitor})=>({ user, agentMonitor }))(AgentMonitor2);