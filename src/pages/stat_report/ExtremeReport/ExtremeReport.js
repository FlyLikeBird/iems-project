import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import CustomTable from './CustomTable';

import style from '../../IndexPage.css';

const { TabPane } = Tabs;

function ExtremeReport({ dispatch, user, extremeReport, fields }) {
    const { sourceData, eleType, isLoading } = extremeReport;
    const { allFields, currentField, currentAttr, treeLoading } = fields;
    const { currentCompany, pagesize, timeType, startDate, endDate } = user;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    const sidebar = (
        <div>
            <div className={style['card-container']}>
                <Tabs className={style['custom-tabs']} activeKey={currentField.field_id + ''} onChange={activeKey=>{
                    let field = fieldList.filter(i=>i.field_id == activeKey )[0];
                    dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                    new Promise((resolve)=>{
                        dispatch({type:'fields/fetchFieldAttrs', resolve })
                    }).then(()=>{
                        dispatch({type:'extremeReport/fetchExtremeReport'});

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
                                            if(!selected) return;
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            dispatch({type:'extremeReport/fetchExtremeReport'});
                                            
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
        
                sourceData.length
                ?
                <div>
                    <div style={{ height:'40px' }}>
                        <CustomDatePicker onDispatch={()=>{
                            dispatch({type:'extremeReport/fetchExtremeReport'});
                        }} />
                    </div>
                    <div className={style['card-container']} style={{ height:'calc(100% - 40px)'}}>
                        <CustomTable 
                            pagesize={pagesize}
                            data={sourceData}
                            timeType={timeType}
                            eleType={eleType}
                            companyName={currentCompany.company_name}
                            startDate={startDate}
                            endDate={endDate}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
                
                :
                <Skeleton className={style['skeleton']} />
           
    );
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'extremeReport/cancelAll'});
        }
    },[])
    return (  
        <ColumnCollapse sidebar={sidebar} content={content} />
            
    );
}

export default connect(({ user, extremeReport, fields})=>({ user, extremeReport, fields }))(ExtremeReport);
