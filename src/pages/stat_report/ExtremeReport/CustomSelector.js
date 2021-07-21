import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Button, Card, Radio, Select, DatePicker, message, TimePicker } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import style from '../../IndexPage.css';
import moment from 'moment';
const { Option } = Select;
const { RangePicker } = DatePicker;

function CustomSelector({ dispatch, timeType, eleType, startDate, endDate, onDispatch, hasSelect }){
    const dateRef = useRef();
    return (
            <div style={{ display:'flex', alignItems:'center' }}>
                <Radio.Group size='small' buttonStyle="solid" style={{ marginRight:'20px' }} value={timeType} onChange={e=>{
                    let value = e.target.value;
                    dispatch({ type:'extremeReport/toggleTimeType', payload:value });
                    if ( onDispatch && typeof onDispatch ) onDispatch();
                    
                }}>
                    <Radio.Button value='1'>日</Radio.Button>
                    <Radio.Button value='2'>月</Radio.Button>
                    <Radio.Button value='3'>年</Radio.Button>
                </Radio.Group>     
                <div style={{ display:'inline-flex'}}>
                    <div className={style['date-picker-button-left']} onClick={()=>{
                        let date = new Date(startDate.format('YYYY-MM-DD'));
                        let start,end;
                        if ( timeType === '1'){
                            start = end = moment(date).subtract(1,'days');
                        } else if ( timeType === '2' ){
                            start = moment(date).subtract(1,'months').startOf('month');
                            end = moment(date).subtract(1,'months').endOf('month');
                        } else if ( timeType === '3'){
                            start = moment(date).subtract(1,'years').startOf('year');
                            end = moment(date).subtract(1,'years').endOf('year');
                        }
                        dispatch({ type:'extremeReport/setDate', payload:{ startDate:start, endDate:end }});
                        if ( onDispatch && typeof onDispatch ) onDispatch();                        
                    }}><LeftOutlined /></div>
                    {
                        timeType === '1' 
                        ?
                        <DatePicker size='small' ref={dateRef} value={startDate} locale={zhCN} allowClear={false} onChange={value=>{
                            dispatch({ type:'extremeReport/setDate', payload:{ startDate:value, endDate:value }});
                            if ( onDispatch && typeof onDispatch ) onDispatch();                
                            if ( dateRef.current && dateRef.current.blur ) dateRef.current.blur();
                        }} />
                        :
                        <RangePicker size='small' ref={dateRef} value={[startDate, endDate]} picker='date' locale={zhCN} allowClear={false} onChange={momentArr=>{
                            dispatch({ type:'extremeReport/setDate', payload:{ startDate:momentArr[0], endDate:momentArr[1] }});
                            if ( onDispatch && typeof onDispatch ) onDispatch(); 
                            
                            if ( dateRef.current && dateRef.current.blur ) dateRef.current.blur();
                        }}/>
                    }
                    
                    <div className={style['date-picker-button-right']} onClick={()=>{
                        let date = new Date(startDate.format('YYYY-MM-DD'));
                        let start,end;
                        if ( timeType === '1'){
                            start = end = moment(date).add(1,'days');
                        } else if ( timeType === '2' ){
                            start = moment(date).add(1,'months').startOf('month');
                            end = moment(date).add(1,'months').endOf('month');
                        } else if ( timeType === '3'){
                            start = moment(date).add(1,'years').startOf('year');
                            end = moment(date).add(1,'years').endOf('year');
                        }
                        dispatch({ type:'extremeReport/setDate', payload:{ startDate:start, endDate:end }});
                        if ( onDispatch && typeof onDispatch ) onDispatch(); 
                    }}><RightOutlined /></div>
                </div>
                {
                    hasSelect 
                    ?
                    <div style={{ display:'inline-flex', alignItems:'center', color:'#000', margin:'0 20px' }}>
                        <div>电力类别:</div>
                        <Select size='small' className={style['custom-select']} style={{ marginLeft:'6px', width:'140px' }} value={eleType} onChange={value=>{
                            dispatch({ type:'extremeReport/toggleEleType', payload:value });
                            if ( onDispatch && typeof onDispatch ) onDispatch(); 
                        }}>
                            <Option value='1'>功率</Option>
                            <Option value='2'>电压</Option>
                            <Option value='3'>电流</Option>
                            <Option value='4'>功率因素</Option>
                        </Select>
                    </div> 
                    :
                    false
                }
                    
            </div>
            
            
    )
};

CustomSelector.propTypes = {
};

export default CustomSelector