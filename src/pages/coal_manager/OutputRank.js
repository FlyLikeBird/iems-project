import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Tabs, Tree, Button,  Spin } from 'antd';
import style from '../IndexPage.css';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import EffLineChart from './components/EffLineChart';

const { TabPane } = Tabs;

function EffRank({ dispatch, user, fields, carbon }){
    const { allFields, currentField, currentAttr, energyList, energyInfo, expandedKeys, treeLoading } = fields;
    const { effLoading ,carbonEff, typeRule, activeKey } = carbon;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
    const sidebar = (
        <div className={style['card-container']}>
                <Tabs className={style['custom-tabs']} activeKey={energyInfo.type_id} onChange={activeKey=>{
                    let temp = energyList.filter(i=>i.type_id === activeKey)[0];
                    dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                    new Promise((resolve, reject)=>{
                        dispatch({ type:'fields/init', payload:{ resolve, reject }});
                    })
                    .then((node)=>{
                        dispatch({type:'carbon/fetchCarbonEff', payload:{ type:'5' }});
                        dispatch({ type:'carbon/fetchTypeRule', payload:{ warning_type:'yield_effect'}})
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
                                            dispatch({type:'carbon/fetchCarbonEff', payload:{ type:'5' }});
                                            dispatch({ type:'carbon/fetchTypeRule', payload:{ warning_type:'yield_effect'}})
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
                                                            dispatch({type:'carbon/fetchCarbonEff', payload:{ type:'5' }});
                                                            dispatch({ type:'carbon/fetchTypeRule', payload:{ warning_type:'yield_effect'}})
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
    );
   
    const content = (
        <div style={{ position:'relative' }}>
            {
                effLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'40px' }}>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({type:'carbon/fetchCarbonEff', payload:{ type:'5' }});
                    dispatch({ type:'carbon/fetchTypeRule', payload:{ warning_type:'yield_effect'}});
                }} />
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div className={style['card-container']}>
                {
                    Object.keys(carbonEff).length 
                    ?                
                    <EffLineChart data={carbonEff} theme={user.theme} currentAttr={currentAttr} typeRule={typeRule} dispatch={dispatch} info={{ tab:'产量能效', key:'5', unit:'元/件', warning_type:'yield_effect' }} startDate={user.startDate} timeType={user.timeType} />                                  
                    :
                    <Spin className={style['spin']} />
                }
                </div>
            </div>
        </div>
    );
    useEffect(()=>{
        dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});    
        dispatch({ type:'carbon/initCarbonEff', payload:{ type:'5', warning_type:'yield_effect' }});                                                     
    },[])
    return (
        <ColumnCollapse sidebar={sidebar} content={content} />
    )
}

export default connect(({ user, fields, carbon })=>({ user, fields, carbon }))(EffRank);