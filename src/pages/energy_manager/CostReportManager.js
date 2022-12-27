import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Select, Checkbox,  Button, Modal, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import EnergyTable from './components/EnergyTable';
import ReportDocument from './components/ReportDocument';
import { energyIcons } from '@/pages/utils/energyIcons';
import style from '../IndexPage.css';
import Loading from '@/pages/components/Loading';

const { TabPane } = Tabs;
const { Option } = Select;
let timer;
let hourData = [];
for(var i=0;i<=24;i++){
    let temp = i < 10 ? '0' + i : i;
    hourData.push({ key:i, value:temp + ' : 00'});
}
function CostReportManager({ dispatch, user, costReport, fields, worktime }) {
    const { list, currentWorktime } = worktime;
    const { reportInfo, dataType, isDeep, startHour, showTimePeriod, isLoading } = costReport;
    const { energyList, energyInfo, allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    const { currentCompany, pagesize, timeType, startDate, endDate, theme } = user;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
   
    useEffect(()=>{
        // 3 * 60 * 1000
        timer = setInterval(()=>{
            dispatch({ type:'costReport/fetchCostReport' });
        },3 * 60 * 1000)
        return ()=>{
            clearInterval(timer);
            timer = null;
            dispatch({ type:'costReport/reset'});
        }
    },[])
    const sidebar = (
        <div>
            <div className={style['card-container']}>
                <Tabs className={style['custom-tabs']} activeKey={energyInfo.type_id} onChange={activeKey=>{
                    let temp = energyList.filter(i=>i.type_id === activeKey)[0];
                    dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                    dispatch({ type:'costReport/setDeep', payload:false });
                    new Promise((resolve, reject)=>{
                        dispatch({ type:'fields/init', payload:{ resolve, reject }});
                    })
                    .then((node)=>{
                        dispatch({ type:'costReport/fetchCostReport'});
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
                                        dispatch({ type:'costReport/setDeep', payload:false });
                                        new Promise((resolve, reject)=>{
                                            dispatch({type:'fields/fetchFieldAttrs', resolve, reject })
                                        })
                                        .then(()=>{
                                            dispatch({ type:'costReport/fetchCostReport'});
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
                                                    <div>
                                                        <Checkbox style={{ margin:'10px 10px 0 10px', color: theme === 'dark' ? '#fff' : 'rgba(0,0,0,.85)' }} checked={isDeep} onChange={e=>{
                                                            let checked = e.target.checked;
                                                            dispatch({ type:'costReport/setDeep', payload:checked });
                                                            dispatch({ type:'costReport/fetchCostReport' });
                                                        }}>是否下钻展开</Checkbox>
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
                                                                dispatch({ type:'costReport/fetchCostReport' });
                                                            }}
                                                        />
                                                    </div>
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
                <div style={{ height:'40px', display:'flex' }}>
                    <Radio.Group size='small' buttonStyle='solid' className={style['custom-radio']} style={{ marginRight:'20px' }} value={dataType} onChange={e=>{
                        dispatch({ type:'costReport/toggleDataType', payload:e.target.value });
                        dispatch({ type:'costReport/fetchCostReport' });
                    }}>
                        <Radio.Button value='1'>成本</Radio.Button>
                        <Radio.Button value='2'>能耗</Radio.Button>
                    </Radio.Group>
                    <CustomDatePicker onDispatch={()=>{
                        dispatch({ type:'costReport/fetchCostReport' });
                    }} />
                    {
                        list.length 
                        ?
                        <Select style={{ width:'160px', marginLeft:'1rem' }} className={style['custom-select']} value={currentWorktime.id} onChange={value=>{
                            let temp = value === 0 ? { id:0 } : list.filter(i=>i.id === value )[0];
                            dispatch({ type:'worktime/setCurrentWorktime', payload:temp });
                            dispatch({ type:'costReport/fetchCostReport' });
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
                    <div style={{ marginLeft:'1rem' }}>
                        <span style={{ color: user.theme === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.8)' }}>起始基准点 : </span>
                        <Select style={{ width:'140px' }} className={style['custom-select']} value={startHour} onChange={value=>{
                            dispatch({ type:'costReport/setStartHour', payload:value });
                            dispatch({ type:'costReport/fetchCostReport' });
                        }}>
                            {
                                hourData.map(item=>(
                                    <Option key={item.key} value={item.key}>{ item.value }</Option>
                                ))
                            }
                        </Select>
                    </div>
                    <Checkbox style={{ margin:'4px 0 0 1rem', color: theme === 'dark' ? '#fff' : 'rgba(0,0,0,.85)' }} checked={showTimePeriod} onChange={e=>{
                        let checked = e.target.checked;
                        dispatch({ type:'costReport/setTimePeriod', payload:checked });
                        dispatch({ type:'costReport/fetchCostReport' });
                    }}>是否按尖峰平谷时段展开</Checkbox>
                </div>
                <div style={{ height:'calc( 100% - 40px)'}}>
                    <div className={style['card-container']}>                      
                        <EnergyTable
                            data={reportInfo}
                            dataType={dataType}
                            companyName={currentCompany.company_name}
                            timeType={timeType}
                            pagesize={pagesize}
                            dispatch={dispatch}
                            energyInfo={energyInfo}
                            startDate={startDate}
                            theme={theme}
                            showTimePeriod={showTimePeriod}
                        />
                    </div>
                </div>
            </div>
    );
   
    return (  
        <ColumnCollapse sidebar={sidebar} content={content} />
            
    );
}

export default connect(({ user, costReport, fields, worktime })=>({ user, costReport, fields, worktime }))(CostReportManager);
