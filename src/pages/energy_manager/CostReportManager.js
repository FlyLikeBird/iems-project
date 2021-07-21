import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';

import EnergyTable from './components/EnergyTable';
import ReportDocument from './components/ReportDocument';
import { energyIcons } from '@/pages/utils/energyIcons';
import style from '../IndexPage.css';

const { TabPane } = Tabs;

function CostReportManager({ dispatch, user, costReport, fields }) {
    const { reportInfo, documentInfo, analyzeReport, dataType } = costReport;
    const { energyList, energyInfo, allFields, currentField, currentAttr, treeLoading } = fields;
    const { currentCompany, pagesize } = user;
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
                <div style={{ height:'40px', display:'flex'}}>
                    <Radio.Group size='small' buttonStyle='solid' className={style['custom-radio']} style={{ marginRight:'20px' }} value={dataType} onChange={e=>{
                        dispatch({ type:'costReport/toggleDataType', payload:e.target.value });
                        dispatch({ type:'costReport/fetchCostReport'});
                    }}>
                        <Radio.Button value='1'>成本</Radio.Button>
                        <Radio.Button value='2'>能耗</Radio.Button>
                    </Radio.Group>
                    <CustomDatePicker onDispatch={()=>{
                        dispatch({ type:'costReport/fetchCostReport'});
                    }} />
               
                </div>
                <div style={{ height:'calc( 100% - 40px)'}}>
                    <div className={style['card-container']}>                      
                        <EnergyTable user={user} costReport={costReport} dispatch={dispatch} />
                    </div>
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

export default connect(({ user, costReport, fields})=>({ user, costReport, fields }))(CostReportManager);
