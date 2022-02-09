import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Select, Button, Modal, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import EnergyTable from './components/EnergyTable';
import ReportDocument from './components/ReportDocument';
import { energyIcons } from '@/pages/utils/energyIcons';
import style from '../IndexPage.css';
import Loading from '@/pages/components/Loading';
import moment from 'moment'; 
import zhCN from 'antd/es/date-picker/locale/zh_CN';

const { TabPane } = Tabs;
const { Option } = Select;
let timer;
let keepState = true;
let hourData = [];
for(var i=0;i<24;i++){
    let temp = i < 10 ? '0' + i : i;
    hourData.push({ key:i, value:temp + ' : 00'});
}
function CostReportManager({ dispatch, user, costReport, fields }) {
    let [startHour, setStartHour] = useState(0);
    const { reportInfo, dataType, isLoading } = costReport;
    const { energyList, energyInfo, allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    const { currentCompany, pagesize, timeType, startDate, endDate } = user;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
    let startHourRef = useRef();
    useEffect(()=>{
        startHourRef.current = startHour;
    },[startHour])
    useEffect(()=>{
        // 3 * 60 * 1000
        timer = setInterval(()=>{
            keepState = true;
            dispatch({ type:'costReport/fetchCostReport', payload:{ startHour:startHourRef.current }});
        },3 * 60 * 1000)
        return ()=>{
            clearInterval(timer);
            timer = null;
            keepState = true;
        }
    },[])
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
                                                        expandedKeys={expandedKeys}
                                                        onExpand={temp=>{
                                                            dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                                        }}
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
    useEffect(()=>{
        // 筛选时间段功能点击筛选Button才触发，默认不触发
        if ( keepState ){
            
        } else {
            setStartHour(0);
        }
        keepState = false;
    },[reportInfo])
    const content = (
            
            Object.keys(reportInfo).length
            ?
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
                        keepState = true;
                        dispatch({ type:'costReport/fetchCostReport', payload:{ startHour }});
                    }}>
                        <Radio.Button value='1'>成本</Radio.Button>
                        <Radio.Button value='2'>能耗</Radio.Button>
                    </Radio.Group>
                    <CustomDatePicker onDispatch={()=>{
                        keepState = true;
                        dispatch({ type:'costReport/fetchCostReport', payload:{ startHour }});
                    }} />
                    <div style={{ marginLeft:'1rem' }}>
                        <span style={{ color: user.theme === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.8)' }}>起始基准点 : </span>
                        <Select style={{ width:'140px' }} className={style['custom-select']} value={startHour} onChange={value=>{
                            setStartHour(value);
                            keepState = true;
                            dispatch({ type:'costReport/fetchCostReport', payload:{ startHour:value }});
                        }}>
                            {
                                hourData.map(item=>(
                                    <Option key={item.key} value={item.key}>{ item.value }</Option>
                                ))
                            }
                        </Select>
                    </div>
                    
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
                        />
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
