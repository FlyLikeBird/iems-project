import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Select, Skeleton  } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import AnalyzeChart from './components/AnalyzeChart';
import { getNodeAllChildren } from '@/pages/utils/array';
import Loading from '@/pages/components/Loading';
import style from '../IndexPage.css';

const { TabPane } = Tabs;
const { Option } = Select;

function CostAnalyze({ dispatch, costReport, fields, user, worktime }) {
    const { list, currentWorktime } = worktime;
    const { analyzeInfo, chartInfo, checkedKeys, chartLoading } = costReport;
    const { allFields, energyList, energyInfo, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];

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
                        let temp = [];
                        if ( node.children ) {
                            temp.push(node.key);
                            node.children.map(i=>temp.push(i.key));
                        } else if ( node.key ) {
                            temp.push(node.key);
                        }
                        dispatch({type:'costReport/select', payload:temp});
                        dispatch({type:'costReport/fetchCostAnalyze'});
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
                                            dispatch({type:'costReport/select', payload:temp});
                                            dispatch({type:'costReport/fetchCostAnalyze'});
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
                                                        onCheck={(checkedKeys, { checked, checkedNodes, node })=>{
                                                            let result = checkedKeys.checked;
                                                            if ( checked ){
                                                                // 选中当前节点和此节点的下一级节点                                              
                                                                node.children.map(i=>{
                                                                    if(!result.includes(i.key)) {
                                                                        result.push(i.key);
                                                                    }
                                                                });
                                                            } else {
                                                                // 删除当前节点所有的子节点
                                                                let childKeys = [];
                                                                getNodeAllChildren(node, childKeys);
                                                                result = result.filter(i=>!childKeys.includes(i));
                                                            }
                                                            
                                                            dispatch({type:'costReport/select', payload:result });
                                                            dispatch({type:'costReport/fetchCostAnalyze'});                                            
                                                        }}
                                                        treeData={fieldAttrs}
                                        
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
          
                Object.keys(chartInfo).length 
                ?
                <div style={{ position:'relative' }}>
                    {
                        chartLoading 
                        ?
                        <Loading />
                        :
                        null
                    }
                    <div style={{ display:'flex', height:'40px' }}>
                        <CustomDatePicker onDispatch={()=>{
                            dispatch({type:'costReport/fetchCostAnalyze'});                                            

                        }} />
                        {
                            list.length 
                            ?
                            <Select style={{ width:'160px', marginLeft:'1rem' }} className={style['custom-select']} value={currentWorktime.id} onChange={value=>{
                                let temp = value === 0 ? { id:0 } : list.filter(i=>i.id === value )[0];
                                dispatch({ type:'worktime/setCurrentWorktime', payload:temp });
                                dispatch({ type:'costReport/fetchCostAnalyze'});
                            }}>
                                <Option key={0} value={0}>全部班次</Option>
                                {
                                    list.map((item)=>(
                                        <Option key={item.id} value={item.id}>{ item.name }</Option>
                                    ))
                                }
                            </Select>
                            :
                            null
                        }
                    </div>
                    <div style={{ height:'calc( 100% - 40px)'}}>
                        <div className={style['card-container-wrapper']} style={{ display:'block', height:'16%', paddingRight:'0' }}>
                            {
                                analyzeInfo.map((item,index)=>(
                                    <div key={index} className={style['card-container-wrapper']} style={{ width:'25%', paddingBottom:'0', paddingRight:index === analyzeInfo.length - 1 ? '0' : '1rem' }}>
                                        <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
                                            <div>{ `${item.text }(${item.unit})` }</div>
                                            <div className={style['data']}>{ item.data }</div>   
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        <div className={style['card-container-wrapper']} style={{ display:'block', paddingRight:'0', paddingBottom:'0', height:'84%'}}>
                            <div className={style['card-container']}>
                                <AnalyzeChart 
                                    data={costReport} 
                                    currentField={currentField} 
                                    theme={user.theme}                                    
                                />
                            </div>
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
    },[]);
    return (  
        <ColumnCollapse sidebar={sidebar} content={content} />
    );
}

export default connect(({ costReport, fields, user, worktime })=>({ costReport, fields, user, worktime }))(CostAnalyze);
