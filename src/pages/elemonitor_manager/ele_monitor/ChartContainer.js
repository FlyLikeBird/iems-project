import React from 'react';
import { Radio, DatePicker } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import style from '../../IndexPage.css';
import LineChart from './LineChart';
import EleMonitorDatePicker from '../components/EleMonitorDatePicker';
import Loading from '@/pages/components/Loading';

const buttons = [
    { title:'有功功率', code:'1', unit:'kw' },
    { title:'电流', code:'2', unit:'A' },
    { title:'相电压', code:'3', unit:'V' },
    { title:'线电压', code:'4', unit:'V' },
    { title:'功率因素', code:'5', unit:'cosΦ' },
    { title:'无功功率', code:'6', unit:'kvar' },
    { title:'视在功率', code:'7', unit:'kw' },
    { title:'温度', code:'8', unit:'℃' }
    // { title:'三相不平衡', code:'8', unit:'' },
];

function ChartContainer({ dispatch, data, isLoading, timeType, startDate, optionType, theme }){
    let info = buttons.filter(i=>i.code === optionType)[0] ;
    // console.log(data);
    return (
        <div style={{ height:'100%', position:'relative' }}>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <Radio.Group size='small' style={{ marginLeft:'14px', marginTop:'14px' }} className={style['custom-radio']} value={optionType} onChange={e=>{
                dispatch({ type:'eleMonitor/toggleOptionType', payload:e.target.value });
                dispatch({ type:'eleMonitor/fetchChartInfo'});
            }}>
                {
                    buttons.map((item,index)=>(
                        <Radio.Button value={item.code}>{ item.title }</Radio.Button>
                    ))
                }
            </Radio.Group>
            <EleMonitorDatePicker theme={theme} optionStyle={{ margin:'14px'}} onDispatch={()=>{
                dispatch({ type:'eleMonitor/fetchChartInfo'});
            }} />
            <div style={{ height:'calc( 100% - 90px)'}}>
                <LineChart theme={theme} xData={data.date} energy={data.energy} energyA={ data.energyA} energyB={data.energyB} energyC={data.energyC} info={info} startDate={startDate} timeType={timeType} optionType={optionType} />
            </div>
        </div>
    )
}

export default ChartContainer;