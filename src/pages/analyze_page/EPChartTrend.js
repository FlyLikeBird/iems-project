import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Tree, Spin, Modal, DatePicker, Tabs, Select, Table, Button, Skeleton } from 'antd';
import { LeftOutlined, RightOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import TrendLineChart from './components/TrendLineChart';
import Loading from '@/pages/components/Loading';
import style from '@/pages/IndexPage.css';
const { TabPane } = Tabs;
const { Option } = Select;

function EPChartTrend({ dispatch, user, fields, analyze }){
    const { authorized, timeType, theme } = user;
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'user/toggleTimeType', payload:'3' });
            dispatch({ type:'analyze/initEPTrend'});
        }
    },[authorized]);
    let inputRef = useRef();
    let { treeLoading, allFields, currentField, energyList, currentAttr, energyInfo, expandedKeys } = fields;
    let { isLoading, EPTrendInfo } = analyze;
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
                        dispatch({type:'analyze/fetchEPChartTrend'});
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
                                            dispatch({type:'analyze/fetchEPChartTrend'});
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
                                                            dispatch({type:'analyze/fetchEPChartTrend'});
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
        <div>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'40px' }}>
                <CustomDatePicker noDay={true} noMonth={true} noWeek={true} onDispatch={()=>{
                    dispatch({type:'analyze/fetchEPChartTrend'});
                }}/>
            </div>
            <div className={style['card-container']} style={{ height:'calc( 100% - 40px'}}>
                <TrendLineChart data={EPTrendInfo} theme={theme} timeType={timeType} />
            </div>
        </div>
            
    );
    return ( <ColumnCollapse sidebar={sidebar} content={content} />)

}

export default connect(({ user, fields, analyze })=>({ user, fields, analyze }))(EPChartTrend);