import React, { useState, useEffect } from 'react';
import { Select, Radio, Calendar } from 'antd';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import CustomCalendar from '@/pages/components/CustomCalendar'; 
import style from '@/pages/IndexPage.css';
import moment from 'moment';
const { Option } = Select;

let years = [], months = [];
for(let i = 2020;i<2050;i++){
    years.push(i);
}
for(let i=1;i<=12;i++){
    months.push(i);
}

function CalendarContainer({ data, theme, onDispatch, energyInfo, isLoading, mode, currentDate, onUpdateMode, onUpdateDate }){
    let dateArr = currentDate.format('YYYY-MM').split('-');
    return (
        <div style={{ height:'100%' }}>
            <div style={{ height:'40px' }}>
                <Select 
                    className={style['custom-select']}
                    value={{ value:+dateArr[0] }}
                    labelInValue={true}
                    style={{ width:'100px', marginRight:'0.5rem' }}
                    onChange={obj=>{
                        onUpdateDate(moment(new Date(`${obj.value}-${currentDate.month() + 1}`)));
                        onDispatch({ type:'baseCost/fetchCalendar', payload:{ mode, year:obj.value, month:dateArr[1] }})
                    }}
                >
                    {
                        years.map((item,i)=>(
                            <Option key={item} value={item}>{ item + ' ' + '年' }</Option>
                        ))
                    }
                </Select>
                <Select 
                    className={style['custom-select']}
                    value={{ value:+dateArr[1] }}
                    labelInValue={true}
                    style={{ width:'100px', marginRight:'1rem' }}
                    onChange={obj=>{
                        onUpdateDate(moment(new Date(`${currentDate.year()}-${obj.value}`)));
                        onDispatch({ type:'baseCost/fetchCalendar', payload:{ mode, year:dateArr[0], month:obj.value }});
                    }}
                >
                    {
                        months.map((item,i)=>(
                            <Option key={item} value={item}>{ item + ' ' + '月' }</Option>
                        ))
                    }
                </Select>
                <Radio.Group style={{ marginRight:'1rem' }} className={style['custom-radio']} value={mode} onChange={e=>{
                    onUpdateMode(e.target.value);
                    onDispatch({ type:'baseCost/fetchCalendar', payload:{ mode:e.target.value, year:dateArr[0], month:dateArr[1] }});
                }}>
                    <Radio.Button key='month' value='month' >日</Radio.Button>
                    <Radio.Button key='year' value='year'>月</Radio.Button>
                </Radio.Group>
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                {
                    isLoading 
                    ?
                    null
                    :
                    <CustomCalendar 
                        data={data}
                        currentDate={currentDate} 
                        onChangeDate={value=>onUpdateDate(value)} 
                        onDispatch={action=>onDispatch(action)}
                        theme={theme} 
                        mode={mode}
                        energyInfo={energyInfo}
                    />
                }
                
            </div>
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme || prevProps.isLoading !== nextProps.isLoading ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(CalendarContainer, areEqual);