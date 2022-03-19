import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomTable from './CustomTable';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import style from '../../IndexPage.css';

const { TabPane } = Tabs;

function EleReport({ dispatch, user, extremeReport, fields }) {
    const { sourceData, eleType, checkedKeys, isLoading } = extremeReport;
    const { allFields, currentField, currentAttr, energyList, energyInfo, expandedKeys, treeLoading } = fields;
    const { currentCompany, pagesize, timeType ,startDate, endDate  } = user;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    const sidebar = (
        <div>
            <div className={style['card-container']}>              
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
                            dispatch({type:'extremeReport/select', payload:temp });
                            dispatch({type:'extremeReport/fetchEleReport'});     
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
                                            dispatch({type:'extremeReport/select', payload:checkedKeys.checked });
                                            dispatch({type:'extremeReport/fetchEleReport'});                                            
                                        }}
                                        treeData={fieldAttrs}
                                    />
                                }
                            </TabPane>
                        ))
                        :
                        <div className={style['text']} style={{ padding:'1rem' }}>
                            <div>{`${energyInfo.type_name}能源类型还没有设置维度`}</div>
                            <div style={{ padding:'1rem 0'}}><Button type='primary' onClick={()=>{
                                history.push(`/energy/info_manage_menu/field_manage?type=${energyInfo.type_code}`);
                            }} >设置维度</Button></div>
                        </div>
                    }
                </Tabs>                    
            </div>
        </div>
    );
    const content = (  
        <div style={{ position:'relative' }}>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'40px' }}>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({type:'extremeReport/fetchEleReport'});
                }} />
            </div>
            <div className={style['card-container']} style={{ height:'calc(100% - 40px)'}}>
                <CustomTable 
                    data={sourceData}
                    companyName={currentCompany.company_name}
                    timeType={timeType}
                    pagesize={pagesize}
                    startDate={startDate}
                    endDate={endDate}
                    isLoading={isLoading}
                />
            </div>
        </div>                                          
    );
    return (  
        <ColumnCollapse sidebar={sidebar} content={content} />
            
    );
}

export default connect(({ user, extremeReport, fields})=>({ user, extremeReport, fields }))(EleReport);
