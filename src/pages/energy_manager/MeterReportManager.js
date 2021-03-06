import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Select, Tree, Tabs, Button, Modal, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';

import { energyIcons } from '@/pages/utils/energyIcons';
import style from '../IndexPage.css';
import MeterReportSelector from './components/MeterReportSelector';
import MeterReportTable from './components/MeterReportTable';
import Loading from '@/pages/components/Loading';
import { downloadExcel } from '@/pages/utils/array';
import moment from 'moment';

const { TabPane } = Tabs;
const { Option } = Select;
let keepState = true;
let hourData = [];
for(var i=0;i<24;i++){
    let temp = i < 10 ? '0' + i : i;
    hourData.push({ key:i, value:temp + ' : 00'});
}
function MeterReportManager({ dispatch, user, meterReport, fields }) {
    const { list, isLoading, checkedKeys } = meterReport;
    const { allFields, energyList, energyInfo, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    const { currentCompany, pagesize, timeType, startDate, endDate, theme } = user;
    const [visible, toggleVisible] = useState(false);
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
    let [startHour, setStartHour] = useState(0);
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'meterReport/cancelAll'});
        }
    },[])
    const sidebar = (
        <div>
            <div className={style['card-container']} >
                <Tabs className={style['custom-tabs']} activeKey={energyInfo.type_id} onChange={activeKey=>{                 
                    let temp = energyList.filter(i=>i.type_id === activeKey)[0];
                    dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                    new Promise((resolve, reject)=>{
                        dispatch({ type:'fields/init', payload:{ resolve, reject }});
                    })
                    .then((node)=>{
                        let temp = [];
                        if ( node.children ) {
                            temp.push(node.key);
                            node.children.map(i=>temp.push(i.key));
                        } else if ( node.key ) {
                            temp.push(node.key);
                        }
                        dispatch({type:'meterReport/select', payload:temp });
                        dispatch({type:'meterReport/fetchMeterReport'}); 
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
                                        }).then((attrs)=>{
                                            let temp = [];
                                            if ( attrs.length && attrs[0].children ) {
                                                temp.push(attrs[0].key);
                                                attrs[0].children.map(i=>temp.push(i.key));
                                            } else if ( attrs.length ) {
                                                temp.push(attrs[0].key);
                                            }
                                            dispatch({type:'meterReport/select', payload:temp });
                                            dispatch({type:'meterReport/fetchMeterReport'});  
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
                                                        checkable
                                                        checkStrictly
                                                        expandedKeys={expandedKeys}
                                                        onExpand={temp=>{
                                                            dispatch({ type:'fields/setExpandedKeys', payload:temp });                                                     
                                                        }}
                                                        checkedKeys={checkedKeys}
                                                        onCheck={(checkedKeys, e)=>{
                                                            let { checked, checkedNodes, node }  = e;
                                                            if ( node.children && node.children.length  ){
                                                                if ( checked ){
                                                                    node.children.map(i=>{
                                                                        if(!checkedKeys.checked.includes(i.key)) {
                                                                            checkedKeys.checked.push(i.key);
                                                                        }
                                                                    });
                                                                } else {
                                                                    let childKeys = node.children.map(i=>i.key);
                                                                    checkedKeys.checked = checkedKeys.checked.filter(key=>{
                                                                        return !childKeys.includes(key);
                                                                    });
                                                                }
                                                            }
                                                            dispatch({type:'meterReport/select', payload:checkedKeys.checked });
                                                            dispatch({type:'meterReport/fetchMeterReport'});                                            
                                                        }}
                                                        treeData={fieldAttrs}
                                                    />
                                                }
                                            </TabPane>
                                        ))
                                        :
                                        <div className={style['text']} style={{ padding:'1rem' }}>
                                            <div>{`${energyInfo.type_name}?????????????????????????????????`}</div>
                                            <div style={{ padding:'1rem 0'}}><Button type='primary' onClick={()=>{
                                                history.push(`/energy/info_manage_menu/field_manage?type=${energyInfo.type_code}`);
                                            }} >????????????</Button></div>
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
    useEffect(()=>{
        // ?????????????????????????????????Button???????????????????????????
        if ( keepState ){
            
        } else {
            setStartHour(0);
        }
        keepState = false;
    },[list])
    const content = (
        <div style={{ position:'relative' }}>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'40px', display:'flex' }}>
                <CustomDatePicker onDispatch={()=>{
                    keepState = true;
                    dispatch({type:'meterReport/fetchMeterReport', payload:{ startHour }});                                            
                }} />
                <div style={{ marginLeft:'1rem' }}>
                    <span style={{ color: user.theme === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.8)' }}>??????????????? : </span>
                    <Select style={{ width:'140px' }} className={style['custom-select']} value={startHour} onChange={value=>{
                        setStartHour(value);
                        keepState = true;
                        dispatch({ type:'meterReport/fetchMeterReport', payload:{ startHour:value }});
                    }}>
                        {
                            hourData.map(item=>(
                                <Option key={item.key} value={item.key}>{ item.value }</Option>
                            ))
                        }
                    </Select>
                </div>
            </div>
            <div className={style['card-container']} style={{ height:'calc(100% - 40px)'}}>            
                    <MeterReportTable 
                        data={list} 
                        pagesize={pagesize}
                        companyName={currentCompany.company_name}
                        dispatch={dispatch} 
                        isLoading={isLoading}
                        currentField={currentField}
                        currentAttr={currentAttr}
                        timeType={timeType}
                        energyInfo={energyInfo}
                        startTime={startDate}
                        endTime={endDate}
                        theme={theme}
                    /> 
                
            </div>
        </div>
    );
    return (  
        <ColumnCollapse sidebar={sidebar} content={content} />
            
    );
}

export default connect(({ user, meterReport, fields})=>({ user, meterReport, fields }))(MeterReportManager);
