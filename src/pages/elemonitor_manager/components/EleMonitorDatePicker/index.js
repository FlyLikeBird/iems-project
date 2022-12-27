import React, { useRef } from 'react';
import { connect } from 'dva';
import { DatePicker, Radio } from 'antd';
import { LeftOutlined, RightOutlined, FileExcelOutlined } from '@ant-design/icons';
import style from './CustomDatePicker.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';

const { RangePicker } = DatePicker;


function CustomDatePicker({ dispatch, onDispatch, size, eleMonitor, optionStyle, mode, theme, noToggle, noDay, noWeek, noMonth }){
    const { timeType ,startDate, endDate } = eleMonitor;
    const inputRef = useRef();
    return (
        <div className={ mode === 'dark' || theme === 'dark' ? style['container'] + ' ' + style['dark'] : style['container']} style={optionStyle}>
            {
                noToggle 
                ?
                null
                :
                <Radio.Group size={size || 'small'} style={{ marginRight:'14px' }} buttonStyle='solid' className={style['custom-radio']} value={timeType} onChange={e=>{
                    dispatch({ type:'eleMonitor/toggleTimeType', payload:e.target.value });
                    if(onDispatch && typeof onDispatch === 'function') onDispatch();
                }}>
                    {
                        noDay 
                        ?
                        null
                        :
                        <Radio.Button value='1'>时</Radio.Button>
                    }
                    {
                        noMonth
                        ?
                        null
                        :
                        <Radio.Button value='2'>日</Radio.Button>
                    }
                    {
                        noWeek 
                        ?
                        null
                        :
                        <Radio.Button value='10'>周</Radio.Button>
                    }
                    <Radio.Button value='3'>月</Radio.Button>
                    <Radio.Button value='4'>年</Radio.Button>
                </Radio.Group>
            }
            
            <div style={{ display:'inline-flex'}}>
                <div className={style['date-picker-button-left']} onClick={()=>{
                    let start,end ;
                    let temp = new Date(startDate.format('YYYY-MM-DD'));
                    if ( timeType === '1'){
                        end = start = moment(temp).subtract(1,'days');
                    }
                    if ( timeType === '2'){
                        start = moment(temp).subtract(1,'months').startOf('month');
                        end = moment(temp).subtract(1,'months').endOf('month');
                    } 
                    if ( timeType === '3'){
                        start = moment(temp).subtract(1,'years').startOf('year');
                        end = moment(temp).subtract(1,'years').endOf('year');
                    }
                    if ( timeType === '4') {

                    }
                    if ( timeType === '10' ) {
                        start = moment(temp).startOf('week').subtract(1,'weeks').add(1, 'days');
                        end = moment(temp).endOf('week').subtract(1, 'weeks').add(1, 'days');
                    }
                    dispatch({ type:'eleMonitor/setDate', payload:{ startDate:start, endDate:end }});
                    if(onDispatch && typeof onDispatch === 'function') onDispatch();
                }}><LeftOutlined /></div>
                {
                    timeType === '1'
                    ?
                    <DatePicker ref={inputRef} size={ size || 'small'} locale={zhCN} allowClear={false} className={style['custom-date-picker']} value={startDate} onChange={value=>{                    
                        dispatch({ type:'eleMonitor/setDate', payload:{ startDate:value, endDate:value }});                       
                        if(onDispatch && typeof onDispatch === 'function') onDispatch();
                        if ( inputRef.current && inputRef.current.blur ) inputRef.current.blur();
                    }} />
                    :
                    timeType === '10' 
                    ?
                    <DatePicker ref={inputRef} size={ size || 'small'} locale={zhCN} picker='week' allowClear={false} className={style['custom-date-picker']} value={startDate} onChange={value=>{
                        let start = value.startOf('week').add(1, 'days');
                        let end = value.endOf('week').add(1, 'days');
                        dispatch({ type:'eleMonitor/setDate', payload:{ startDate:start, endDate:end }});
                        if(onDispatch && typeof onDispatch === 'function') onDispatch();
                        if ( inputRef.current && inputRef.current.blur ) inputRef.current.blur();
                    }} />
                    :
                    <RangePicker ref={inputRef} size={size || 'small'} locale={zhCN} allowClear={false} className={style['custom-date-picker']} value={[startDate, endDate]} onChange={arr=>{
                        dispatch({ type:'eleMonitor/setDate', payload:{ startDate:arr[0], endDate:arr[1] }});
                        if(onDispatch && typeof onDispatch === 'function') onDispatch();
                        if ( inputRef.current && inputRef.current.blur ) inputRef.current.blur();
                    }}/>
                }
                
                <div className={style['date-picker-button-right']} onClick={()=>{
                    let start,end;
                    let temp = new Date(startDate.format('YYYY-MM-DD'));
                    if ( timeType === '1'){
                        end = start = moment(temp).add(1,'days');
                    }
                    if ( timeType === '2'){
                        start = moment(temp).add(1,'months').startOf('month');
                        end = moment(temp).add(1,'months').endOf('month');
                    } else if ( timeType === '3'){
                        start = moment(temp).add(1,'years').startOf('year');
                        end = moment(temp).add(1,'years').endOf('year');
                    }
                    dispatch({ type:'eleMonitor/setDate', payload:{ startDate:start, endDate:end }});
                    if(onDispatch && typeof onDispatch === 'function') onDispatch();
                }}><RightOutlined /></div>
            </div>
            
        </div>
    )
}

export default connect(({ eleMonitor })=>({ eleMonitor }))(CustomDatePicker);