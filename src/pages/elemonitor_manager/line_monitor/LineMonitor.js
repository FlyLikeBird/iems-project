import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import { IconFont } from '@/pages/components/IconFont';
import EleLinesContainer  from './EleLinesContainer';
import style from '../EleMonitor.css';
import IndexStyle from '../../IndexPage.css';

const { TabPane } = Tabs;

function LineMonitor({ dispatch, user, highVol, eleMonitor, fields }) {
    const { eleLoading, eleScenes, currentScene, eleDetail, detailLoading, startDate, timeType } = eleMonitor;
    useEffect(()=>{
        dispatch({ type:'eleMonitor/fetchEleLines'});
        return ()=>{
            dispatch({ type:'eleMonitor/cancelAll'});
        }
    },[])
    const sidebar = (
            <div className={IndexStyle['card-container']}>
                <div className={IndexStyle['card-title']}>进线选择</div>
                <div className={IndexStyle['card-content']}>
                    <div className={ user.theme === 'dark' ? style['list-container'] + ' ' + style['dark'] : style['list-container']}>
                        {
                            eleScenes.length 
                            ?
                            eleScenes.map((item,index)=>(
                                <div className={ item.scene_id === currentScene.scene_id ? style['list-item'] + ' ' + style['selected'] : style['list-item']} key={item.scene_id} onClick={()=>{
                                    dispatch({ type:'eleMonitor/toggleCurrentScene', payload:item });
                                }}>{ item.scene_name }</div>
                            ))
                            :
                            <Spin className={style['spin']} size='large' />
                        }
                    </div>
                    
                </div>
            </div>
    );
    const content = (
        <div>
            <div className={IndexStyle['card-container']}>
                    {
                        eleLoading 
                        ?
                        <Spin className={style['spin']} size='large' />
                        :
                        eleScenes.length 
                        ?
                        <EleLinesContainer 
                            currentScene={currentScene}
                            dispatch={dispatch} 
                            isLoading={detailLoading} 
                            eleDetail={eleDetail} 
                            startDate={global.startDate} 
                            timeType={global.timeType} 
                        />
                        :
                        <div className={style['empty-text']}>还没有配置电路图</div>
                    }
                    
            </div>
        </div>
    );
    return <ColumnCollapse sidebar={sidebar} content={content} optionStyle={{ height:'100%', backgroundColor:'#05050f'}} />
}

export default connect(({ user, highVol, eleMonitor, fields})=>({ user, highVol, eleMonitor, fields }))(LineMonitor);
