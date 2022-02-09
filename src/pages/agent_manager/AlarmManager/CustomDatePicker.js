import React, { useRef } from 'react';
import { connect } from 'dva';
import { DatePicker, Radio } from 'antd';
import { LeftOutlined, RightOutlined, FileExcelOutlined } from '@ant-design/icons';
import style from '@/pages/components/CustomDatePicker/CustomDatePicker.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';

const { RangePicker } = DatePicker;


function CustomDatePicker({ dateInfo, onUpdateDate, size }){
    const { startDate, endDate } = dateInfo;
    const inputRef = useRef();
    return (
        <div className={style['container'] + ' ' + style['dark'] }>    
            <div style={{ display:'inline-flex'}}>
                <div className={style['date-picker-button-left']} style={{ backgroundColor:'#1890ff'}} onClick={()=>{
                    if ( startDate ){
                        let temp = startDate.format('YYYY-MM-DD');
                        let start = moment(temp).subtract(1,'months').startOf('month');
                        let end = moment(temp).subtract(1,'months').endOf('month');  
                        onUpdateDate({ startDate:start, endDate:end });                      
                    }         
                }}><LeftOutlined /></div>
                
                <RangePicker ref={inputRef} size={size || 'small'} locale={zhCN} className={style['custom-date-picker']} value={[startDate, endDate]} onChange={arr=>{
                    let startDate, endDate;
                    if ( arr && arr.length ){
                        startDate = arr[0];
                        endDate = arr[1];
                    } else {
                        startDate = null;
                        endDate = null;
                    }
                    onUpdateDate({ startDate, endDate });
                    if ( inputRef.current && inputRef.current.blur ) inputRef.current.blur();
                }}/>
                               
                <div className={style['date-picker-button-right']} style={{ backgroundColor:'#1890ff'}} onClick={()=>{
                    if ( startDate ){
                        let temp = startDate.format('YYYY-MM-DD');                      
                        let start = moment(temp).add(1,'months').startOf('month');
                        let end = moment(temp).add(1,'months').endOf('month');                    
                        onUpdateDate({ startDate:start, endDate:end });                      
                    }
                    
                }}><RightOutlined /></div>
            </div>
            
        </div>
    )
}

export default CustomDatePicker;