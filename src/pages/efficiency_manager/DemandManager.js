import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Card, Tabs, Radio, Tree, message, DatePicker, Skeleton, Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import DemandMonitor from './DemandMonitor';
import DemandAnalyz from './DemandAnalyz';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import { energyIcons } from '@/pages/utils/energyIcons';
import style from '../IndexPage.css';
import moment from 'moment';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
const { TabPane } = Tabs;

function DemandManager({ dispatch, user, demand, fields }){
    const { timeType, startDate, endDate } = user;
    const { machList, currentMach, referTime, demandInfo, demandLoading } = demand;
    const { allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    const [activeKey, setActiveKey] = useState('1');
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'demand/resetDemand' });
        }
    },[]);
    const sidebar = (
        <div>
            <div className={style['card-container']}>
                <Tabs  className={style['custom-tabs']} activeKey={currentField.field_id+''} onChange={innerActiveKey=>{
                    let field = fieldList.filter(i=>i.field_id == innerActiveKey )[0];
                    dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                    new Promise((resolve, reject)=>{
                        dispatch({type:'fields/fetchFieldAttrs', resolve, reject })
                    }).then(()=>{
                        if ( activeKey === '1'){
                            dispatch({ type:'demand/fetchDemand'});
                        } else if (activeKey === '2'){
                            dispatch({ type:'demand/fetchAnalyz'});
                        }
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
                                    <Spin />
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
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            if ( activeKey === '1'){
                                                dispatch({ type:'demand/fetchDemand'});
                                            } else if (activeKey === '2'){
                                                dispatch({ type:'demand/fetchAnalyz'});
                                            }
                                        }}
                                    />
                                }
                            </TabPane>
                        ))
                    }
                </Tabs>
            </div>
            
        </div>
    );
    const content = (
        Object.keys(demandInfo).length 
        ?
        <div>        
            <div style={{ height:'40px' }}>
                {
                    activeKey === '1' 
                    ?
                    // 实时需量使用局部独立的日期控件，不受全局控制
                    <div style={{ display:'inline-flex'}}>
                        <div className={style['date-picker-button-left']} onClick={()=>{
                            let date = new Date(referTime.format('YYYY-MM-DD'));
                            let temp = moment(date).subtract(1,'days');
                            dispatch({type:'demand/setDate', payload:temp });
                            dispatch({type:'demand/fetchDemand'});
                        }}><LeftOutlined /></div>
                        <DatePicker size='small' className={style['custom-date-picker']} locale={zhCN} value={referTime} allowClear={false} onChange={moment=>{
                            dispatch({type:'demand/setDate', payload:moment });
                            dispatch({type:'demand/fetchDemand'});
                        
                        }} />
                        <div className={style['date-picker-button-right']} onClick={()=>{
                            let date = new Date(referTime.format('YYYY-MM-DD'));
                            let temp = moment(date).add(1,'days');
                            dispatch({type:'demand/setDate', payload:temp });
                            dispatch({type:'demand/fetchDemand'});
                        }}><RightOutlined /></div>
                    </div>
                    :
                    <CustomDatePicker onDispatch={()=>{
                        dispatch({ type:'demand/fetchAnalyz'});
                    }} />
                }
            </div>
            <div style={{ height:'calc( 100% - 40px)' }}>
                <Tabs className={`${style['custom-tabs']} ${style['flex-tabs']}`} activeKey={activeKey} tabBarStyle={{ marginBottom:'0' }} onChange={activeKey=>{
                    if ( activeKey === '1' && !Object.keys(demand.demandInfo).length ) {
                        dispatch({ type:'demand/fetchDemand'});
                    } 
                    if ( activeKey === '2' && !Object.keys(demand.analyzInfo).length ){
                        dispatch({ type:'demand/fetchAnalyz'});
                    }
                    setActiveKey(activeKey);
                }}>
                    <TabPane tab='实时需量' key='1'>
                        <DemandMonitor demand={demand} dispatch={dispatch} theme={user.theme} />
                    </TabPane>
                    <TabPane tab='需量分析' key='2'>
                        <DemandAnalyz demand={demand} dispatch={dispatch} theme={user.theme} loading={demandLoading} />
                    </TabPane>
                </Tabs>
            </div>   
        </div>
        :
        <Skeleton active className={style['skeleton']} />
    )
    return (
        <ColumnCollapse sidebar={sidebar} content={content} />
    )
}

export default connect(({ user, demand, fields })=>({ user, demand, fields }))(DemandManager)