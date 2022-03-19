import React, { useState } from 'react';
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

function CalendarContainer({ theme }){
    let [mode, setMode] = useState('month');
    let [dataType, setDataType] = useState('cost');
    let [currentEnergy, setCurrentEnergy] = useState('total');
    let [currentDate, setCurrentDate] = useState(moment(new Date()));
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
                        setCurrentDate(moment(new Date(`${obj.value}-${currentDate.month() + 1}`)))
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
                        setCurrentDate(moment(new Date(`${currentDate.year()}-${obj.value}`)));
                    }}
                >
                    {
                        months.map((item,i)=>(
                            <Option key={item} value={item}>{ item + ' ' + '月' }</Option>
                        ))
                    }
                </Select>
                <Radio.Group style={{ marginRight:'1rem' }} className={style['custom-radio']} value={mode} onChange={e=>{
                    setMode(e.target.value);
                }}>
                    <Radio.Button key='month' value='month' >日</Radio.Button>
                    <Radio.Button key='year' value='year'>月</Radio.Button>
                </Radio.Group>
                <Radio.Group className={style['custom-radio']} value={dataType} onChange={e=>{
                    setDataType(e.target.value);
                }}>
                    <Radio.Button key='cost' value='cost' >成本</Radio.Button>
                    <Radio.Button key='energy' value='energy'>能耗</Radio.Button>
                </Radio.Group>
                <Radio.Group className={style['custom-radio']} value={currentEnergy} onChange={e=>{
                    setCurrentEnergy(e.target.value);
                }}>
                    {
                        [{ key:'total', value:'总' }].map((type,i)=>(
                            <Radio.Button key='cost' value='cost' >成本</Radio.Button>
                        ))
                    }
                </Radio.Group>
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <CustomCalendar 
                    currentDate={currentDate} 
                    onChangeDate={value=>setCurrentDate(value)} 
                    theme={theme} 
                    mode={mode}
                />
            </div>
        </div>
    )
}

export default CalendarContainer;