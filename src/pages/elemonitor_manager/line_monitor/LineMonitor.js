import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import { IconFont } from '@/pages/components/IconFont';
import EleLinesContainer2 from './EleLinesContainer2';
import style from '../EleMonitor.css';
import IndexStyle from '../../IndexPage.css';

const { TabPane } = Tabs;
let timer ;
function LineMonitor({ dispatch, user, eleMonitor }) {
    const { startDate, endDate, timeType, currentCompany, theme } = user;
    const { eleLoading, eleScenes, currentScene, linePoints, eleDetail, detailLoading } = eleMonitor;
    useEffect(()=>{
        dispatch({ type:'eleMonitor/fetchEleLines'});
        timer = setInterval(()=>{
            dispatch({ type:'eleMonitor/fetchLinesData'});
        },3 * 60 * 1000)
        return ()=>{
            dispatch({ type:'eleMonitor/cancelAll'});
            clearInterval(timer);
            timer = null;
        }
    },[]);
    const sidebar = (
            <div className={IndexStyle['card-container']}>
                <div className={IndexStyle['card-title']}>线路选择</div>
                <div className={IndexStyle['card-content']}>
                    <div className={ user.theme === 'dark' ? style['list-container'] + ' ' + style['dark'] : style['list-container']}>
                        {
                            eleScenes.length 
                            ?
                            eleScenes.map((item,index)=>(
                                <div className={ item.scene_id === currentScene.scene_id ? style['list-item'] + ' ' + style['selected'] : style['list-item']} key={item.scene_id} onClick={()=>{
                                    dispatch({ type:'eleMonitor/toggleCurrentScene', payload:item });
                                    dispatch({ type:'eleMonitor/fetchLinesData'});
                                }}>{ item.scene_name }</div>
                            ))
                            :
                            null
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
                        <EleLinesContainer2 
                            currentScene={currentScene}
                            data={linePoints}
                            dispatch={dispatch} 
                            isLoading={detailLoading} 
                            eleDetail={eleDetail} 
                            startDate={startDate} 
                            timeType={timeType} 
                            theme={theme}
                            companyName={currentCompany.company_name || '--'}
                        />
                        :
                        <div className={style['empty-text']}>还没有配置电路图</div>
                    } 
                    
            </div>
        </div>
    );
    return <ColumnCollapse sidebar={sidebar} content={content} optionStyle={{ height:'100%', backgroundColor:'#05050f'}} />
}

export default connect(({ user, eleMonitor, fields})=>({ user, eleMonitor, fields }))(LineMonitor);
