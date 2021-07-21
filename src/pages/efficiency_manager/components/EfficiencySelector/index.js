import React, { useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Button, Card, Radio, Select, DatePicker, TimePicker } from 'antd';
import zhCN from 'antd/es/date-picker/locale/zh_CN';

const { Option } = Select;
const { RangePicker } = DatePicker;
const hourList = [];
for(var i=0;i<24;i++){
    let hour = +i;
    hour = hour < 10 ? '0' + hour +'时' : ''+hour+'时';
    hourList.push(hour);
}

function EfficiencySelector({ dispatch, costReport, forChart }){
    let { timeType, startTime, endTime, curRatio } = costReport;
    let [startHourList, changeStart] = useState(hourList);
    let [endHourList, changeEnd] = useState(hourList);
    return (
        <div>
            <div className='select-container'>
                <span>选择周期:</span>
                <Select value={timeType} onChange={value=>{
                    dispatch({type:'costReport/toggleTimeType', payload:value });
                    dispatch({type:'costReport/fetchCostReport'});
                }}>
                    <Option key='1' value='1'>年周期</Option>
                    <Option key='2' value='2'>月周期</Option>
                    <Option key='3' value='3'>日周期</Option>

                </Select>
            </div>
            {
                timeType === '3' ?
                <div className='select-container'>
                    <span>开始时间:</span>
                    <Select value={startTime} onChange={value=>{
                        dispatch({type:'costReport/changeStartEndTime', payload : { startTime:value, endTime }});
                        let startValue = +value.slice(0, value.length-1);
                        let tempArr = endHourList.filter(i=>{
                            return +i.slice(0,i.length-1) > startValue;
                        });
                        changeEnd(tempArr);
                    }}>
                        {
                            startHourList.map(i=>(
                                <Option key={i} value={i}>{i}</Option>
                            ))
                        }
                    </Select>
                    <span style={{marginLeft:'20px'}}>结束时间:</span>
                    <Select value={endTime} onChange={value=>{
                        dispatch({type:'costReport/changeStartEndTime', payload : { startTime, endTime:value }});
                    }}>
                        {
                            endHourList.map(i=>(
                                <Option key={i} value={i}>{i}</Option>
                            ))
                        }
                    </Select>
                    <Button style={{marginLeft:'10px'}} type="primary" onClick={()=>dispatch({type:'costReport/fetchCostReport'})}>确定</Button>
                </div>
                :
                <div className='select-container'>
                    <span>{ timeType === '1' ? '选择月' : '选择日' } </span>
                    {
                        timeType === '1' || timeType === '2' ?
                        <RangePicker locale={zhCN} allowClear={false} picker={ timeType=== '1' ? 'month' : 'date'} value={[startTime, endTime]} onChange={(a,b)=>{
                            dispatch({type:'costReport/changeStartEndTime', payload:{ startTime:a[0], endTime:a[1] } });
                            dispatch({type:'costReport/fetchCostReport'});
                            
                        }} />
                        : null
                    }
                </div>
            }
            <div className='button-container'>
                <Radio.Group buttonStyle="solid" value={timeType} onChange={e=>{
                    dispatch({type:'costReport/toggleTimeType', payload:e.target.value});
                    dispatch({type:'costReport/fetchCostReport'});
                }}>
                    <Radio.Button value='3'>今日</Radio.Button>
                    <Radio.Button value='2'>本月</Radio.Button>
                    <Radio.Button value='1'>本年</Radio.Button>
                </Radio.Group>
            </div>
            {
                forChart
                ?
                <div className='button-container'>
                    <Radio.Group buttonStyle="solid" value={curRatio} onChange={e=>{
                        dispatch({type:'costReport/toggleRatio', payload:e.target.value});
                    }}>
                        <Radio.Button value='1'>同比</Radio.Button>
                        <Radio.Button value='2'>环比</Radio.Button>
                    </Radio.Group>
                </div>
                :
                null
            }
        </div>                
    )
};

EfficiencySelector.propTypes = {
};

export default connect( ({ costReport }) => ({ costReport }))(EfficiencySelector);