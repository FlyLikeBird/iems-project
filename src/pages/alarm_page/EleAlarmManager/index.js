import React, { useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Card, Tabs, Tree, DatePicker, Button, Radio, Spin, Skeleton } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import style from '../../IndexPage.css';
import InfoList from './components/InfoList';
import BarChart from './components/BarChart';
import RealTimeChart from './components/RealTimeChart';

const { TabPane } = Tabs;
const { RangePicker }= DatePicker;

function EleAlarmManager({ dispatch, user, eleAlarm, fields }){
    const { theme, timeType, startDate, endDate } = user;
    const { allFields, currentField, currentAttr, treeLoading } = fields;
    const { warningInfo, realTimeInfo, typeCode, dayTimeType, attrLoading, realLoading } = eleAlarm;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    const dateRef = useRef();
    const sidebar = (
        <div>
            <div className={style['card-container']}>
                <Tabs className={style['custom-tabs']} activeKey={currentField.field_id + ''} onChange={activeKey=>{
                    let field = fieldList.filter(i=>i.field_id == activeKey )[0];
                    dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                    new Promise((resolve)=>{
                        dispatch({type:'fields/fetchFieldAttrs', resolve })
                    }).then(()=>{
                        dispatch({ type:'eleAlarm/fetchAttrAlarm'});  
                        dispatch({ type:'eleAlarm/fetchRealTimeAlarm'}); 
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
                                        defaultExpandAll={true}
                                        selectedKeys={[currentAttr.key]}
                                        treeData={fieldAttrs}
                                        onSelect={(selectedKeys, {node})=>{
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            dispatch({ type:'eleAlarm/fetchAttrAlarm'});  
                                            dispatch({ type:'eleAlarm/fetchRealTimeAlarm'});  
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
        
                Object.keys(warningInfo).length 
                ?
                <div>
                    {/* 日期控制器 */}
                    <div style={{ height:'40px' }}>
                        <CustomDatePicker onDispatch={()=>{
                            dispatch({ type:'eleAlarm/fetchAttrAlarm'});
                        }} />
                    </div>
                    <div style={{ height:'calc( 100% - 40px)'}}>
                        <InfoList data={warningInfo.typeTmp} typeCode='ele' />
                        <div className={style['card-container-wrapper']} style={{ height:'45%'}}>
                            <div className={style['card-container']}>
                                {
                                    attrLoading 
                                    ?
                                    <Skeleton active className={style['skeleton']} />
                                    :
                                    <BarChart data={warningInfo} typeCode='ele' timeType={timeType} theme={user.theme} />
                                }
                            </div>
                        </div>
                        <div className={style['card-container-wrapper']} style={{ height:'45%', paddingBottom:'0' }}>
                            <div className={style['card-container']}>
                                {
                                    realLoading 
                                    ?
                                    <Skeleton active className={style['skeleton']} />
                                    :
                                    <RealTimeChart
                                        data={realTimeInfo} 
                                        dispatch={dispatch} 
                                        chartLoading={realLoading}
                                        typeCode={typeCode}
                                        dayTimeType={dayTimeType}
                                        theme={user.theme}
                                    />
                                }                             
                            </div>
                        </div>
                    </div>
                </div>
                :
                <Skeleton className={style['skeleton']} active />
                                                     
    );
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'eleAlarm/cancelAll'})
        }
    },[])
    return (
        <ColumnCollapse sidebar={sidebar} content={content} />
    )
};

export default connect(({ user, fields, eleAlarm })=>({ user, fields, eleAlarm }))(EleAlarmManager);