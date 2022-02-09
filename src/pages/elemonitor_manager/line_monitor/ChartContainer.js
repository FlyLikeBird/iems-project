import React, { useEffect, useState } from 'react';
import style from '../EleMonitor.css';
import LineChart from '../ele_monitor/LineChart';
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
    // { title:'三相不平衡', code:'8', unit:'' },
];

function ChartContainer({ dispatch, currentMach, data, startDate, timeType, isLoading }){
    const [optionType, toggleOptionType] = useState('1');
    useEffect(()=>{
        dispatch({ type:'eleMonitor/fetchEleLinesDetail', payload:{ mach_id:currentMach.mach_id, optionType }});
    },[optionType]);
   
    let info = buttons.filter(i=>i.code === optionType)[0] ;
    return (
        <div style={{ position:'relative', height:'100%' }}>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'2rem', fontSize:'1.2rem', lineHeight:'2rem', color:'#fff'}}>{ `${currentMach.scene_name || ''} -- ${currentMach.meter_name || ''}` }</div>
            <div className={style['button-group-container']}>
                {
                    buttons.map((item,index)=>(
                        <div key={index} className={ item.code === optionType ? style['button-group-item'] + ' ' + style['selected'] : style['button-group-item']} onClick={()=>{
                            toggleOptionType(item.code);
                        }}>{ item.title }</div>
                    ))
                }
            </div>
            <EleMonitorDatePicker theme='dark' optionStyle={{ margin:'16px 0'}} onDispatch={()=>{
                dispatch({ type:'eleMonitor/fetchEleLinesDetail', payload:{ mach_id:currentMach.mach_id, optionType }});
            }} />
            <div style={{ height:'calc( 100% - 2rem -  2rem - 56px)'}}>
                {
                    Object.keys(data).length 
                    ?
                    <LineChart theme='dark' xData={data.date} energy={data.energy} energyA={ data.energyA} energyB={data.energyB} energyC={data.energyC} info={info} startDate={startDate} timeType={timeType} optionType={optionType} />
                    :
                    null
                }
            </div>
        </div>
    )
}

export default ChartContainer;