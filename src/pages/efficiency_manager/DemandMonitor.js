import React, { useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, DatePicker, Skeleton, message } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, LeftOutlined, RightOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import DemandLineChart from './components/DemandLineChart';
import DemandGauge from './components/DemandGauge';
import CountUp from 'react-countup';
import style from '../IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';

const { TabPane } = Tabs;
function format(dateStr){
    return dateStr.substring(5,dateStr.length);
}

function DemandMonitor({ dispatch, demand, theme }) {
    const { energyList, energyInfo, machList, currentMach, demandInfo, referTime, treeLoading } = demand;
    const infoData = demandInfo.info ? demandInfo.info : { };
    
    return ( 
        Object.keys(demandInfo).length 
        ?
        <div style={{ height:'100%'}}>
            <div className={style['card-container-wrapper']} style={{ display:'block', height:'26%', paddingRight:'0' }}>
                <div className={style['card-container-wrapper']} style={{ width:'30%', paddingBottom:'0' }}>
                    <div className={style['card-container']}>
                        <DemandGauge data={demandInfo.info} />
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ width:'30%', paddingBottom:'0' }}>
                    <div className={style['card-container']}>
                        <div className={style['card-title']}>今日概况</div>
                        <div className={style['card-content']}>
                            <div className={style['flex-container']}>
                                <div className={style['flex-item']}>
                                    <div>本日最小需量(kw)</div>
                                    <div className={style['data']} style={{ color:'#1890ff' }}>{ infoData.today_min && infoData.today_min.demand }</div>
                                    <div style={{ opacity:'0' }}>--</div>
                                </div>
                                <div className={style['flex-item']}>
                                    <div>本日最大需量(kw)</div>
                                    <div className={style['data']} style={{ color:'#1890ff' }}>{ infoData.today_max && infoData.today_max.demand }</div>
                                    <div style={{ opacity:'0' }}>--</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ width:'40%', paddingBottom:'0', paddingRight:'0' }}>
                    <div className={style['card-container']}>
                        <div className={style['card-title']}>本月概况</div>
                        <div className={style['card-content']}>
                            <div className={style['flex-container']}>
                                <div className={style['flex-item']}>
                                    <div>本月最大需量(kw)</div>
                                    <div className={style['data']} style={{ color:'#1890ff' }}>{ infoData.month_max_demand }</div>
                                    {
                                        infoData.month_max_demand 
                                        ?
                                        <span style={{ color:'#1890ff', fontSize:'0.8rem'}}>{ format(infoData.month_max_demand_date) }</span>
                                        :
                                        <div style={{ opacity:'0' }}>--</div>
                                    }
                                </div>
                               
                                <div className={style['flex-item']}>
                                    <div>变压器容量(kva)</div>
                                    <div className={style['data']} style={{ color:'#1890ff' }}>
                                        {
                                            infoData.kva_value 
                                            ?
                                            <span>{infoData.kva_value}</span>
                                            :
                                            null
                                        }
                                    </div>
                                    <div style={{ opacity:'0' }}>--</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={style['card-container-wrapper']} style={{ display:'block', height:'74%', paddingBottom:'0', paddingRight:'0' }}>
                <div className={style['card-container']}>
                    
                    <DemandLineChart data={demandInfo} theme={theme} />
                        
                </div>
            </div>    
        </div> 
        :
        <Skeleton active className={style['skeleton']} />
    )
}

export default DemandMonitor;
