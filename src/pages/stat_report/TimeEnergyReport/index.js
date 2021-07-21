import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomTable from './CustomTable';
import CustomDatePicker from '@/pages/components/CustomDatePicker';

import style from '../../IndexPage.css';

const { TabPane } = Tabs;

function TimeEnergyReport({ dispatch, user, costReport, fields }) {
    const { reportInfo, dataType, isLoading } = costReport;
    const { allFields, energyList, energyInfo, currentField, currentAttr, treeLoading } = fields;
    const { currentCompany, pagesize, timeType, startDate, endDate } = user;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
    const sidebar = (
        <div>
            <div className={style['card-container']}>
                <Tabs className={style['custom-tabs']} activeKey={energyInfo.type_id} onChange={activeKey=>{
                    let temp = energyList.filter(i=>i.type_id === activeKey)[0];
                    dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                    new Promise((resolve, reject)=>{
                        dispatch({ type:'fields/init', payload:{ resolve, reject } });
                    })
                    .then(()=>{
                        dispatch({type:'costReport/fetchCostReport'});
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
                                            dispatch({type:'costReport/fetchCostReport'});
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
                                                            dispatch({type:'costReport/fetchCostReport'}); 
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
        
                Object.keys(reportInfo).length
                ?
                <div>
                    <div style={{ height:'40px' }}>
                        <CustomDatePicker onDispatch={()=>{
                            dispatch({ type:'costReport/fetchCostReport'});
                        }} />
                    </div>
                    <div className={style['card-container']} style={{ height:'calc(100% - 40px)'}}>
                        <CustomTable 
                            dispatch={dispatch}
                            data={reportInfo.value}
                            energyInfo={energyInfo}
                            companyName={currentCompany.company_name}
                            pagesize={pagesize}
                            timeType={timeType}
                            startDate={startDate}
                            endDate={endDate}
                            dataType={dataType}
                            isLoading={isLoading}
                        />
                    </div>
                </div>         
                :
                <Skeleton className={style['skeleton']} />
            
    );
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'costReport/cancelAll'});
        }
    },[])
    return (  
        <ColumnCollapse sidebar={sidebar} content={content} />
            
    );
}

export default connect(({ user, costReport, fields})=>({ user, costReport, fields }))(TimeEnergyReport);
