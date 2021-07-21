import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';

import { energyIcons } from '@/pages/utils/energyIcons';
import style from '../IndexPage.css';
import MeterReportSelector from './components/MeterReportSelector';
import MeterReportTable from './components/MeterReportTable';
import { downloadExcel } from '@/pages/utils/array';
import moment from 'moment';

const { TabPane } = Tabs;

function MeterReportManager({ dispatch, user, meterReport, fields }) {
    const { list, isLoading, loaded } = meterReport;
    const { allFields, energyList, energyInfo, currentField, currentAttr, treeLoading } = fields;
    const { currentCompany, pagesize, timeType, startDate, endDate, theme } = user;
    const [visible, toggleVisible] = useState(false);
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
    
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
                    .then(()=>{
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
                                        }).then(()=>{
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
                                                        defaultExpandAll={true}
                                                        selectedKeys={[currentAttr.key]}
                                                        treeData={fieldAttrs}
                                                        onSelect={(selectedKeys, { selected, node })=>{
                                                            if(!selected) return;
                                                            dispatch({type:'fields/toggleAttr', payload:node});
                                                            dispatch({type:'meterReport/fetchMeterReport'});
                                                        }}
                                                    />
                                                }
                                            </TabPane>
                                        ))
                                        :
                                        <div className={style['text']} style={{ padding:'1rem'}}>该能源类型还没有设置维度</div>
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
        loaded 
        ?
        <div>
            <div style={{ height:'40px' }}>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({type:'meterReport/fetchMeterReport'});                                            
                }} />
            </div>
            <div className={style['card-container']} style={{ height:'calc(100% - 40px)'}}>
                {
                    isLoading
                    ?
                    <Skeleton active className={style['skeleton']} />
                    :
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
                        companyName={user.currentCompany.company_name}
                    /> 
                }
            </div>
        </div>
        
        :
        <Skeleton active className={style['skeleton']} />
    );
    return (  
        <ColumnCollapse sidebar={sidebar} content={content} />
            
    );
}

export default connect(({ user, meterReport, fields})=>({ user, meterReport, fields }))(MeterReportManager);
