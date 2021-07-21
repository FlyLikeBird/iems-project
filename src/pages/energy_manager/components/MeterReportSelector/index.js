import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Button, Card, Radio, Select, DatePicker, message, TimePicker } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import style from '../../../IndexPage.css';
import moment from 'moment';
const { Option } = Select;
const { RangePicker } = DatePicker;

function MeterReportSelector({ dispatch, meterReport }){
    let { timeType, startTime, endTime } = meterReport;
    const dateRef = useRef();
    return (
            <div style={{ display:'flex', alignItems:'center' }}>
                <Radio.Group size='small' buttonStyle="solid" style={{ marginRight:'20px' }} value={timeType} onChange={e=>{
                    let value = e.target.value;
                    dispatch({ type:'meterReport/toggleTimeType', payload:value });
                    dispatch({ type:'meterReport/fetchMeterReport'});
                }}>
                    <Radio.Button value='1'>日</Radio.Button>
                    <Radio.Button value='2'>月</Radio.Button>
                    <Radio.Button value='3'>年</Radio.Button>
                </Radio.Group>
                {
                    timeType === '1'
                    ?
                    <div style={{ display:'inline-flex'}}>
                        <div className={style['date-picker-button-left']} onClick={()=>{
                            let date = new Date(startTime.format('YYYY-MM-DD'));
                            let temp = moment(date).subtract(1,'days');
                            dispatch({ type:'meterReport/setDate', payload:{ startTime:temp, endTime:temp }});                          
                            dispatch({ type:'meterReport/fetchMeterReport'});
                        }}><LeftOutlined /></div>
                        <DatePicker size='small' ref={dateRef} value={startTime} locale={zhCN} allowClear={false} onChange={value=>{
                            dispatch({ type:'meterReport/setDate', payload:{ startTime:value, endTime:value }});                           
                            dispatch({ type:'meterReport/fetchMeterReport'});                           
                            if ( dateRef.current && dateRef.current.blur ) dateRef.current.blur();
                        }} />
                        <div className={style['date-picker-button-right']} onClick={()=>{
                            let todayDate = new Date();
                            let date = new Date(startTime.format('YYYY-MM-DD'));
                            if ( date.getDate() >= todayDate.getDate()) {
                                message.info('请选择合适的日期');
                                return;
                            } else {
                                let temp = moment(date).add(1,'days');
                                dispatch({ type:'meterReport/setDate', payload:{ startTime:temp, endTime:temp }});                             
                                dispatch({ type:'meterReport/fetchMeterReport'});
                            }
                        }}><RightOutlined /></div>
                    </div>
                    :
                    <div style={{ display:'inline-flex'}}>
                        <div className={style['date-picker-button-left']} onClick={()=>{
                            let date = new Date(startTime.format('YYYY-MM-DD'));
                            let start,end;
                            if ( timeType === '2'){
                                start = moment(date).subtract(1,'months').startOf('month');
                                end = moment(date).subtract(1,'months').endOf('month');
                            } else if ( timeType === '3'){
                                start = moment(date).subtract(1,'years').startOf('year');
                                end = moment(date).subtract(1,'years').endOf('year');
                            }
                            dispatch({ type:'meterReport/setDate', payload:{ startTime:start, endTime:end }});                          
                            dispatch({ type:'meterReport/fetchMeterReport'});
                            
                        }}><LeftOutlined /></div>
                        <RangePicker size='small' ref={dateRef} value={[startTime, endTime]} picker={ timeType === '2' ? 'date' : timeType === '3' ? 'month' : ''} locale={zhCN} allowClear={false} onChange={momentArr=>{
                            dispatch({type:'meterReport/setDate', payload:{ startTime:momentArr[0], endTime:momentArr[1]}});                         
                            dispatch({ type:'meterReport/fetchMeterReport'});                          
                            if ( dateRef.current && dateRef.current.blur ) dateRef.current.blur();
                        }}/>
                        <div className={style['date-picker-button-right']} onClick={()=>{
                            let date = new Date(startTime.format('YYYY-MM-DD'));
                            let start,end;
                            if ( timeType === '2'){
                                start = moment(date).add(1,'months').startOf('month');
                                end = moment(date).add(1,'months').endOf('month');
                            } else if ( timeType === '3'){
                                start = moment(date).add(1,'years').startOf('year');
                                end = moment(date).add(1,'years').endOf('year');
                            }
                            dispatch({ type:'meterReport/setDate', payload:{ startTime:start, endTime:end }});                           
                            dispatch({ type:'meterReport/fetchMeterReport'});                       
                        }}><RightOutlined /></div>
                    </div>
                }
            </div>
            
            
    )
};

MeterReportSelector.propTypes = {
};

export default connect(({ meterReport })=>({ meterReport }))(MeterReportSelector);