import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Tabs, Tree, Spin } from 'antd';
import style from '../IndexPage.css';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import EffLineChart from './components/EffLineChart';

const { TabPane } = Tabs;
let tabList = [
    { tab:'万元产值比', key:'2', unit:'元/万元' }, { tab:'人当能效', key:'1', unit:'元/人'}, { tab:'面积能效', key:'4', unit:'元/㎡'}, { tab:'产量能效', key:'5', unit:'元/件'}
];
function EffRank({ dispatch, user, fields, carbon }){
    const { allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    const { effLoading ,carbonEff, activeKey } = carbon;
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
                        dispatch({type:'carbon/fetchCarbonEff', payload:{ type:'1' }});
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
                                        expandedKeys={expandedKeys}
                                        onExpand={temp=>{
                                            dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                        }}
                                        selectedKeys={[currentAttr.key]}
                                        treeData={fieldAttrs}
                                        onSelect={(selectedKeys, {node})=>{
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            dispatch({type:'carbon/fetchCarbonEff', payload:{ type:'1'}});
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
                    dispatch({type:'carbon/fetchCarbonEff', payload:{ type:'1' }});
                }} />
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div className={style['card-container']}>
                {
                    Object.keys(carbonEff).length 
                    ?                
                    <EffLineChart data={carbonEff} theme={user.theme} info={{ tab:'人当能效', key:'1', unit:'元/人'}} startDate={user.startDate} timeType={user.timeType} />                                  
                    :
                    <Spin className={style['spin']} />
                }
                </div>
            </div>
        </div>
    );
    useEffect(()=>{
        dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});    
        dispatch({ type:'carbon/initCarbonEff', payload:{ type:'1' }});                                                     
    },[])
    return (
        <ColumnCollapse sidebar={sidebar} content={content} />
    )
}

export default connect(({ user, fields, carbon })=>({ user, fields, carbon }))(EffRank);