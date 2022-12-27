import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Tabs, Tree, Spin } from 'antd';
import style from '../IndexPage.css';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import Loading from '@/pages/components/Loading';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import InfoItem from './components/InfoItem';
import LineChart from './components/LineChart';
import BarChart from './components/BarChart';

const { TabPane } = Tabs;
function CoalTrend({ dispatch, user, fields, carbon }){
    const { trendInfoList, carbonTrend, regionRank, carbonLoading } = carbon;
    const { allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
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
                        dispatch({ type:'carbon/fetchAttrInfoList'});
                        dispatch({ type:'carbon/fetchCarbonTrend'});                   
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
                                            dispatch({ type:'carbon/fetchAttrInfoList'});
                                            dispatch({ type:'carbon/fetchCarbonTrend'});

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
                carbonLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'40px' }}>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({ type:'carbon/fetchCarbonTrend'});
                    dispatch({ type:'carbon/fetchCarbonRegionRank'});
                }} />
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div style={{ height:'14%'}}>
                    {
                        trendInfoList.map((item,index)=>(
                            <InfoItem data={item} key={index} />
                        ))
                    }
                </div>
                <div style={{ height:'43%', paddingBottom:'1rem', paddingRight:'0' }}>
                    <div className={style['card-container']}>
                        {
                            Object.keys(carbonTrend).length 
                            ?
                            <LineChart xData={carbonTrend.view.date} yData={carbonTrend.view.energy} y2Data={carbonTrend.view.last} timeType={user.timeType} theme={user.theme} />
                            :
                            <Spin className={style['spin']} />
                        }
                    </div>
                </div>
                <div className={style['card-container']} style={{ height:'43%' }}>
                    {
                        regionRank.length 
                        ?
                        <BarChart data={regionRank} theme={user.theme} />
                        :
                        <Spin className={style['spin']} />
                    }
                </div>
            </div>
        </div>
    );
    useEffect(()=>{
        dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});    
        dispatch({ type:'carbon/initCarbonTrend'});                                                     
    },[])
    return (
        <ColumnCollapse sidebar={sidebar} content={content} />
    )
}

export default connect(({ user, fields, carbon })=>({ user, fields, carbon }))(CoalTrend);