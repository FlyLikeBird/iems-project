import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Select, Tree, Tabs, Button, TimePicker, Modal, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomTable from './CustomTable';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import style from '../../IndexPage.css';
import moment from 'moment'; 
import zhCN from 'antd/es/date-picker/locale/zh_CN';

const { TabPane } = Tabs;
const { Option } = Select;
let keepState = true;
let hourData = [];
for(var i=0;i<24;i++){
    let temp = i < 10 ? '0' + i : i;
    hourData.push({ key:i, value:temp + ' : 00'});
}
function TimeEnergyReport({ dispatch, user, costReport, fields }) {
    let [startHour, setStartHour] = useState(0);
    const { reportInfo, dataType, isLoading } = costReport;
    const { allFields, energyList, energyInfo, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    const { currentCompany, pagesize, timeType, startDate, endDate } = user;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
    const sidebar = (
        <div>
            <div className={style['card-container']}>            
                <Tabs  
                    className={style['custom-tabs']}
                    activeKey={currentField.field_id + ''}  
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
                        <div className={style['text']} style={{ padding:'1rem'}}>该能源类型还没有设置维度</div>
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
                    <div style={{ display:'flex', height:'40px' }}>
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
                    <div className={style['card-container']} style={{ height:'calc(100% - 40px)'}}>
                        <CustomTable 
                            dispatch={dispatch}
                            data={reportInfo.value}
                            energyInfo={energyInfo}
                            companyName={currentCompany.company_name}
                            pagesize={pagesize}
                            timeType={timeType}
                            startDate={startDate}
                            endDate={endDate}
                            dataType={dataType}
                        />
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

export default connect(({ user, costReport, fields})=>({ user, costReport, fields }))(TimeEnergyReport);
