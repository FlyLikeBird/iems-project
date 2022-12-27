import React from 'react';
import { Radio, Select } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import style from '../../IndexPage.css';
import LineChart from './LineChart';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
const { Option } = Select;
function ChartContainer({ dispatch, data, optionList, typeRule, currentOption, timeType, startDate, currentAttr, theme }){
    return (
        <div style={{ height:'100%', position:'relative' }}>
            <div style={{ height:'40px', display:'flex', padding:'1rem' }}>
                <Select className={style['custom-select']} style={{ width:'160px', marginRight:'1rem' }} value={currentOption.code} onChange={value=>{
                    let result = optionList.filter(i=>i.code === value )[0];
                    dispatch({ type:'eleMonitor/toggleCurrentOption', payload:result });
                    dispatch({ type:'eleMonitor/fetchChartInfo'});
                    dispatch({ type:'eleMonitor/fetchTypeRule'});
                }}>
                    {
                        optionList.map((item)=>(
                            <Option key={item.code} value={item.code}>{ item.title }</Option>
                        ))
                    }
                </Select>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({ type:'eleMonitor/fetchChartInfo'});
                }} />
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <LineChart dispatch={dispatch} typeRule={typeRule} currentAttr={currentAttr} theme={theme} xData={data.date} energy={data.energy} energyA={ data.energyA} energyB={data.energyB} energyC={data.energyC} info={currentOption} startDate={startDate} timeType={timeType} optionType={currentOption.code} />
            </div>
        </div>
    )
}

export default ChartContainer;