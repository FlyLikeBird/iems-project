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
let timer;
function TransformerManager({ dispatch, user, transformer, eleMonitor, fields }) {
    const { transformerInfo, machList, currentMach, isLoading, chartInfo } = transformer;
    useEffect(()=>{
        dispatch({ type:'transformer/initTransformer'});
        timer = setInterval(()=>{
            dispatch({ type:'transformer/fetchTransformerInfo'});
            dispatch({ type:'transformer/fetchMachChartInfo'});
        },3 * 60 * 1000)
        return ()=>{
            // console.log('transformer unmounted');
            dispatch({ type:'transformer/cancelAll'});
            clearInterval(timer);
            timer = null;
        }
    },[]);
    const sidebar = (
        <div className={IndexStyle['card-container']}>
            <div className={IndexStyle['card-title']}>变压器选择</div>
            <div className={IndexStyle['card-content']}>
                {
                    machList && machList.length
                    ?
                    <Tree
                        className={IndexStyle['custom-tree']}
                        treeData={machList}
                        selectedKeys={[currentMach.key]}
                        defaultExpandAll={true}
                        showIcon={true}
                        onSelect={(selectedKeys, {node})=>{
                            dispatch({ type:'transformer/toggleMach', payload:{ key:node.key, title:node.title }});
                            dispatch({ type:'transformer/fetchTransformerInfo'});
                            dispatch({ type:'transformer/fetchMachChartInfo'});
                            
                        }}
                    />
                    :
                    <Spin className={style['spin']} size='large' />
                }
            </div>
        </div>
           
    );
    const content = (
        <div>
            <div className={IndexStyle['card-container-wrapper']} style={{ display:'block', height:'36%', paddingRight:'0' }}>
                <div className={IndexStyle['card-container']}>
                    <div className={IndexStyle['card-title']}>{ currentMach.title || '-- --' }</div>
                    <div className={IndexStyle['card-content']}>                             
                        <div className={ user.theme === 'dark' ? style['flex-container'] + ' ' + style['dark'] : style['flex-container']} style={{ position:'relative'}}>
                            {
                                transformerInfo.infoList && transformerInfo.infoList.length
                                ?
                                transformerInfo.infoList.map((item,index)=>(
                                    <div key={item.title} className={style['flex-item']} style={{ width:'calc((100% - 42px)/3)'}}>
                                        <div className={style['flex-item-title']}>
                                            <IconFont style={{ fontSize:'1.2rem', marginRight:'4px' }} type={ item.title === '负荷' ? 'iconfuhe' : item.title === '功率' ? 'icongongshuai' : item.title === '电流/电压' ? 'icondianya' : ''} />{ item.title }
                                        </div>
                                        <div className={style['flex-item-content']}>
                                            {
                                                item.child && item.child.length 
                                                ?
                                                item.child.map((sub)=>(
                                                    <div key={sub.title} style={{ height:'16%', display:'flex', alignItems:'center', }}>
                                                        <div className={style['flex-item-symbol']} style={{ backgroundColor:sub.type === 'A' ? '#eff400' : sub.type === 'B' ? '#00ff00' : sub.type === 'C' ? '#ff0000' : '#01f1e3' }}></div>
                                                        <div>{ sub.title }</div>
                                                        <div style={{ flex:'1', height:'1px', backgroundColor: user.theme === 'dark' ? '#34557e' : '#e4e4e4', margin:'0 6px'}}></div>
                                                        <div style={{ fontSize:'1.2rem' }}>{ sub.value ? ( sub.unit === 'cosΦ' ? (+sub.value).toFixed(2) : (+sub.value).toFixed(0))  + ' ' + sub.unit : '-- --' }</div>
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
            <div className={IndexStyle['card-container-wrapper']} style={{ height:'64%', paddingRight:'0', paddingBottom:'0' }}>
                <div className={IndexStyle['card-container']}>
                    {
                        Object.keys(chartInfo).length 
                        ?
                        <ChartContainer startDate={eleMonitor.startDate} data={chartInfo} dispatch={dispatch} isLoading={isLoading} timeType={eleMonitor.timeType} theme={user.theme} />
                        :
                        <Spin className={style['spin']} size='large' />
                    }
                </div>
            </div>
        </div>
    );
    return <ColumnCollapse sidebar={sidebar} content={content} />
    
}
export default connect(({ user, transformer, eleMonitor, fields})=>({ user, transformer, eleMonitor, fields }))(TransformerManager);
