import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import { IconFont } from '@/pages/components/IconFont';
import ChartContainer  from './ChartContainer';
import style from '../EleMonitor.css';
import IndexStyle from '../../IndexPage.css';
const { TabPane } = Tabs;

function HighVolManager({ dispatch, user, highVol, eleMonitor, global }){
    
    const { incomingList, currentIncoming, incomingInfo, chartInfo, optionType, isLoading } = highVol;
    useEffect(()=>{
        new Promise((resolve, reject)=>{
            dispatch({ type:'highVol/fetchIncoming', payload:{ resolve, reject }});
        })
        .then(()=>{
            dispatch({ type:'highVol/init'});
        })
        return ()=>{
            dispatch({ type:'highVol/cancelAll'});
        }
    },[]);
    const sidebar = (
            <div className={IndexStyle['card-container']}>
                <div className={IndexStyle['card-title']}>进线选择</div>
                <div className={IndexStyle['card-content']}>
                    {
                        incomingList.length 
                        ?
                        <div className={style['list-container-vertical']}>
                            {
                                incomingList.map((item,index)=>(
                                    <div key={index} style={{ textAlign:'center', color: currentIncoming.in_id === item.in_id ? '#03a4fe' : '#a3a3ad'}} onClick={()=>{
                                        if ( item.in_id !== currentIncoming.in_id ){
                                            dispatch({ type:'highVol/toggleIncoming', payload:item });
                                            dispatch({ type:'highVol/init'});
                                        }
                                    }}>
                                        <div><IconFont style={{ fontSize:'10rem', margin:'10px 0' }} type='iconVector1' /></div>
                                        <div>{ item.name }</div>
                                    </div>
                                ))
                            }
                        </div>
                        :
                        <Spin className={style['spin']} size='large' />
                    }
                </div>
            </div>
    );
    const content = (
        <div>
            <div className={IndexStyle['card-container-wrapper']} style={{ height:'36%', paddingRight:'0'}}>
                <div className={IndexStyle['card-container']}>
                    <div className={IndexStyle['card-title']}>进线状态</div>
                    <div className={IndexStyle['card-content']}>
                        <div className={ user.theme === 'dark' ? style['flex-container'] + ' ' + style['dark'] : style['flex-container']}>
                            {
                                incomingInfo.infoList && incomingInfo.infoList.length 
                                ?
                                incomingInfo.infoList.map((item,index)=>(
                                    <div key={index} className={style['flex-item']} style={{ width:'calc((100% - 56px)/5)'}}>
                                        <div className={style['flex-item-title']}>{ item.title }</div>
                                        <div className={style['flex-item-content']}>
                                            {
                                                item.child && item.child.length 
                                                ?
                                                item.child.map((sub)=>(
                                                    <div style={{ height:'16%', display:'flex', alignItems:'center', }}>
                                                        <div className={style['flex-item-symbol']} style={{ backgroundColor:sub.type === 'A' ? '#eff400' : sub.type === 'B' ? '#00ff00' : sub.type === 'C' ? '#ff0000' : '#01f1e3' }}></div>
                                                        <div>{ sub.title }</div>
                                                        <div style={{ flex:'1', height:'1px', backgroundColor: user.theme === 'dark' ? '#34557e' : '#e4e4e4', margin:'0 6px'}}></div>
                                                        <div style={{ fontSize:'1.2rem' }}>{ sub.value ? sub.value + ' ' + sub.unit : '-- --' }</div>
                                                    </div>
                                                ))
                                                :
                                                null
                                                
                                            
                                            }
                                        </div>
                                    </div>
                                )) 
                                :
                                <Spin className={style['spin']} size='large' />
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className={IndexStyle['card-container-wrapper']} style={{ height:'64%', paddingRight:'0', paddingBottom:'0'}}>
                <div className={IndexStyle['card-container']}>
                    {
                        Object.keys(chartInfo).length 
                        ?
                        <ChartContainer theme={user.theme} data={chartInfo} dispatch={dispatch} startDate={eleMonitor.startDate} timeType={eleMonitor.timeType} optionType={optionType} isLoading={isLoading} />
                        :
                        <Spin className={style['spin']} size='large' />
                    }
                </div>
            </div>
        </div>
    );
    return <ColumnCollapse sidebar={sidebar} content={content} optionStyle={{ height:'100%', backgroundColor:'#05050f'}} />
   
}

export default connect(({ user, highVol, eleMonitor, fields})=>({ user, highVol, eleMonitor, fields }))(HighVolManager);
