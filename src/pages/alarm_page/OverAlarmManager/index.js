import React, { useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Card, Tabs, Tree, DatePicker, Button, Radio, Spin, Skeleton } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';

import zhCN from 'antd/es/date-picker/locale/zh_CN';
import style from '../../IndexPage.css';
import InfoList from '../EleAlarmManager/components/InfoList';
import BarChart from '../EleAlarmManager/components/BarChart';
import RankBarChart from '../LinkAlarmManager/components/RankBarChart';

const { TabPane } = Tabs;
const { RangePicker }= DatePicker;

function OverAlarmManager({ dispatch, user, overAlarm, fields }){
    const { timeType, startDate, endDate, theme } = user;
    const { allFields, currentField, currentAttr, treeLoading } = fields;
    const { warningInfo, regionAlarmInfo, chartLoading } = overAlarm;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    const dateRef = useRef();
    const sidebar = (
        <div>
            <div className={style['card-container']}>
                <Tabs className={style['custom-tabs']} tabBarStyle={{ padding:'0 10px'}} activeKey={currentField.field_id + ''} onChange={activeKey=>{
                    let field = fieldList.filter(i=>i.field_id == activeKey )[0];
                    dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                    new Promise((resolve)=>{
                        dispatch({type:'fields/fetchFieldAttrs', resolve })
                    }).then(()=>{
                        dispatch({ type:'overAlarm/fetchAttrAlarm'});
                        dispatch({ type:'overAlarm/fetchMachOffline'});
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
                                        defaultSelectedKeys={[currentAttr.key]}
                                        treeData={fieldAttrs}
                                        onSelect={(selectedKeys, {node})=>{
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            dispatch({ type:'overAlarm/fetchAttrAlarm'});
                                            dispatch({ type:'overAlarm/fetchMachOffline'});
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
                    dispatch({ type:'overAlarm/fetchAttrAlarm'});
                    dispatch({ type:'overAlarm/fetchMachOffline'});
                }} />
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <InfoList data={warningInfo.typeTmp} typeCode='over' />
                <div className={style['card-container-wrapper']} style={{ height:'45%'}}>
                    <div className={style['card-container']}>
                        
                        <BarChart data={warningInfo} typeCode='over' timeType={timeType} theme={theme} />
                        
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ height:'45%', paddingBottom:'0' }}>
                    <div className={style['card-container']}>
                        {
                            Object.keys(regionAlarmInfo).length
                            ?
                            <div className={style['card-container-wrapper']}>
                                <RankBarChart data={regionAlarmInfo} typeCode='over' theme={theme} />
                            </div>
                            :
                            <Skeleton className={style['skeleton']} active />
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
            dispatch({ type:'overAlarm/cancelAll'});
        }
    },[])
    return (
        <ColumnCollapse sidebar={sidebar} content={content} />
    )
};

export default connect(({ user, fields, overAlarm })=>({ user, fields, overAlarm }))(OverAlarmManager);