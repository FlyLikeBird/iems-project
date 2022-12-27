import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import ChartContainer  from './ChartContainer';
import Loading from '@/pages/components/Loading';
import style from '../../IndexPage.css';

const { TabPane } = Tabs;
let timer;
function EleMonitorManager({ dispatch, user, eleMonitor, fields }) {
    const { startDate, timeType, theme } = user;
    const { allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    const { chartInfo, optionList, currentOption, typeRule, isLoading } = eleMonitor;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    useEffect(()=>{     
        dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1'}});                      
        dispatch({ type:'eleMonitor/init'}); 
        timer = setInterval(()=>{
            dispatch({ type:'eleMonitor/fetchChartInfo' });
        },3 * 60 * 1000)         
        return ()=>{
            dispatch({ type:'eleMonitor/cancelAll'});
            clearInterval(timer);
            timer = null;
        }
    },[])
    const sidebar = (
        <div className={style['card-container']}>
            <Tabs  
                className={style['custom-tabs']}
                activeKey={currentField.field_id + ''}                        
                onChange={fieldKey=>{
                    let field = fieldList.filter(i=>i.field_id == fieldKey )[0];
                    dispatch({type:'fields/toggleField', payload:{ visible:false, field } } );
                    new Promise((resolve, reject)=>{
                        dispatch({type:'fields/fetchFieldAttrs', resolve, reject })
                    }).then(()=>{
                        dispatch({type:'eleMonitor/fetchChartInfo' });
                        dispatch({ type:'eleMonitor/fetchTypeRule'});
                    })
            }}>
                {                       
                    fieldList.map(field=>(
                        <TabPane 
                            key={field.field_id} 
                            tab={field.field_name}
                        >
                            {
                                treeLoading
                                ?
                                <Spin className={style['spin']} size='large' />
                                :
                                <Tree
                                    className={style['custom-tree']}
                                    expandedKeys={expandedKeys}
                                    onExpand={temp=>{
                                        dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                    }}
                                    selectedKeys={[currentAttr.key]}
                                    treeData={fieldAttrs}
                                    onSelect={(selectedKeys, {node})=>{                                    
                                        dispatch({type:'fields/toggleAttr', payload:{ key:node.key, title:node.title } });
                                        dispatch({type:'eleMonitor/fetchChartInfo' });
                                        dispatch({ type:'eleMonitor/fetchTypeRule'});
                                    }}
                                />
                            }
                        </TabPane>
                    ))
                }
            </Tabs>
        </div>
    );
    const content = (
        <div>
            <div className={style['card-container']}>
                {
                    isLoading 
                    ?
                    <Loading />
                    :
                    null
                }
                {
                    Object.keys(chartInfo).length 
                    ?
                    <ChartContainer 
                        theme={theme} 
                        data={chartInfo} 
                        startDate={startDate} 
                        timeType={timeType} 
                        typeRule={typeRule}
                        optionList={optionList}
                        currentOption={currentOption}
                        currentAttr={currentAttr}
                        dispatch={dispatch} 
                    />
                    :
                    <Spin className={style['spin']} size='large' />
                }
            </div>
        </div>
    );
    return <ColumnCollapse sidebar={sidebar} content={content} optionStyle={{ height:'100%', backgroundColor:'#05050f'}} />
}

export default connect(({ user, eleMonitor, fields})=>({ user, eleMonitor, fields }))(EleMonitorManager);
