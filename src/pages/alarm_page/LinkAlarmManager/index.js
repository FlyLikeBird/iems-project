import React, { useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Card, Tabs, Tree, DatePicker, Button, Radio, Spin, Skeleton } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';

import style from '../../IndexPage.css';
import InfoList from '../EleAlarmManager/components/InfoList';
import PieChart from './components/PieChart';
import BarChart from './components/BarChart';
import RankBarChart from './components/RankBarChart';

const { TabPane } = Tabs;
const { RangePicker }= DatePicker;

function LinkAlarmManager({ dispatch, user, linkAlarm, fields }){
    const { theme, timeType, startDate, endDate } = user;
    const { allFields, currentField, currentAttr, treeLoading } = fields;
    const { warningInfo, machAlarmInfo, machOfflineInfo, chartLoading } = linkAlarm;
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
                        dispatch({type:'linkAlarm/fetchAll'}); 
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
                                        onSelect={(selectedKeys, { selected, node})=>{
                                            if ( !selected ) return;
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            dispatch({type:'linkAlarm/fetchAll'}); 
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
                    dispatch({type:'linkAlarm/fetchAll'});
                }} />
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <InfoList data={machAlarmInfo} typeCode='link' />
                <div className={style['card-container-wrapper']} style={{ height:'45%', paddingRight:'0' }}>
                    <div className={style['card-container-wrapper']} style={{ width:'35%', paddingBottom:'0' }}>
                        <div className={style['card-container']}>
                            {
                                Object.keys(machAlarmInfo).length
                                ?
                                <PieChart data={machAlarmInfo} total={warningInfo.totalCount} timeType={timeType} theme={theme} />
                                :
                                <Skeleton active className={style['skeleton']} />
                            }
                        </div>
                    </div>
                    <div className={style['card-container-wrapper']} style={{ width:'65%', paddingBottom:'0' }}>
                        <div className={style['card-container']}>
                            <BarChart data={warningInfo} timeType={timeType} typeCode='link' theme={theme} />
                        </div>
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ height:'45%', paddingBottom:'0' }}>
                    <div className={style['card-container']}>
                        {
                            Object.keys(machOfflineInfo).length
                            ?
                            <RankBarChart data={machOfflineInfo} typeCode='link' theme={theme} />
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
            dispatch({ type:'linkAlarm/cancelAll'});
        }
    },[])
    return (
        <ColumnCollapse sidebar={sidebar} content={content} />
    )
};

export default connect(({ user, fields, linkAlarm })=>({ user, fields, linkAlarm }))(LinkAlarmManager);