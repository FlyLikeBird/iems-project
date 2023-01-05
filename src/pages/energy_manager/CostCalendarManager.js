import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Card, Spin, Tree, Tabs, Button, Skeleton, Calendar, DatePicker, Radio } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CalendarContainer from './components/CalendarContainer';
import style from '../IndexPage.css';
import Loading from '@/pages/components/Loading';
import moment from 'moment';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function CostCalendarManager({ dispatch, user, fields, baseCost }){
    const { timeType, startDate, endDate, theme, authorized } = user;
    const { isLoading, calendarInfo } = baseCost;
    const { allFields, currentField, currentAttr, energyList, energyInfo, expandedKeys, treeLoading } = fields;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
    // console.log(fieldAttrs);
    let [mode, setMode] = useState('month');
    let [currentDate, setCurrentDate] = useState(moment(new Date()));
    let dateArr = currentDate.format('YYYY-MM-DD').split('-');
    useEffect(()=>{
        if ( authorized ){
            dispatch({ type:'baseCost/initCalendar', payload:{ mode, year:dateArr[0], month:dateArr[1] }})
        }
    },[authorized])
    const sidebar = (
        <div>
            <div className={style['card-container']}>
                <Tabs className={style['custom-tabs']} activeKey={energyInfo.type_id} onChange={activeKey=>{
                    let temp = energyList.filter(i=>i.type_id === activeKey)[0];
                    dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                    new Promise((resolve, reject)=>{
                        dispatch({ type:'fields/init', payload:{ resolve, reject }});
                    })
                    .then((node)=>{
                        dispatch({ type:'baseCost/fetchCalendar', payload:{ mode, year:dateArr[0], month:dateArr[1] }})
                    })
                }}>
                    {
                        energyList.map((item,index)=>(
                            <TabPane key={item.type_id} tab={item.type_name}>
                                <Tabs  
                                    className={style['custom-tabs']}
                                    activeKey={currentField.field_id + ''}  
                                    type='card'                      
                                    onChange={fieldKey=>{
                                        let field = fieldList.filter(i=>i.field_id == fieldKey )[0];
                                        dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                                        new Promise((resolve, reject)=>{
                                            dispatch({type:'fields/fetchFieldAttrs', resolve, reject })
                                        })
                                        .then(()=>{
                                            dispatch({ type:'baseCost/fetchCalendar', payload:{ mode, year:dateArr[0], month:dateArr[1] }})
                                        })
                                        
                                }}>
                                    {   
                                        fields.isLoading
                                        ?
                                        null
                                        :
                                        fieldList && fieldList.length
                                        ?                    
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
                                                            dispatch({ type:'baseCost/fetchCalendar', payload:{ mode, year:dateArr[0], month:dateArr[1] }})
                                                        }}
                                                    />
                                                }
                                            </TabPane>
                                        ))
                                        :
                                        <div className={style['text']} style={{ padding:'1rem'}}>
                                            <div>{`${energyInfo.type_name}能源类型还没有设置维度`}</div>
                                            <div style={{ padding:'1rem 0'}}><Button type='primary' onClick={()=>{
                                                history.push(`/energy/info_manage_menu/field_manage?type=${energyInfo.type_code}`);
                                            }} >设置维度</Button></div>
                                        </div>
                                    }
                                </Tabs>
                            </TabPane>
                        ))
                    }
                </Tabs>
            </div>
        </div>
    );
    const content = (
        <div>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            {
                Object.keys(calendarInfo).length 
                ?
                <CalendarContainer 
                    theme={theme} 
                    data={calendarInfo} 
                    onDispatch={action=>dispatch(action)} 
                    energyInfo={energyInfo} 
                    isLoading={isLoading}
                    mode={mode}
                    currentDate={currentDate}
                    onUpdateDate={obj=>setCurrentDate(obj)}
                    onUpdateMode={mode=>setMode(mode)} 
                />
                :
                null
            }
        </div>
    );
    return <ColumnCollapse sidebar={sidebar} content={content} />
}

export default connect(({ user, fields, baseCost })=>({ user, fields, baseCost }))(CostCalendarManager);