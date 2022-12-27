import React, { useState, useEffect } from 'react';
import { Radio, DatePicker } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import style from '../../IndexPage.css';
import LineChart from '../components/LineChart';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';

const buttons = [
    { title:'视在', code:'1', unit:'kw' },
    { title:'有功', code:'2', unit:'kw' },
    { title:'无功', code:'3', unit:'kvar' },
    { title:'负荷率', code:'4', unit:'%' },
]

let sourceData = {};
function ChartContainer({ data, dispatch, isLoading, startDate, timeType, theme }){
    const [option, toggleOption] = useState('1');
    const [sourceData, setSourceData] = useState({});
    useEffect(()=>{
        let temp = {};
        temp.yData = data.viewPower;
        temp.y2Data = data.viewPowerSame;
        setSourceData(temp);
        toggleOption('1');
    },[data]);
    useEffect(()=>{
        let temp = {};
        if ( option === '1'){
            temp.yData = data.viewPower;
            temp.y2Data = data.viewPowerSame;
        } else if ( option === '2'){
            temp.yData = data.usePower;
            temp.y2Data = data.usePowerSame;
        } else if ( option === '3'){
            temp.yData = data.uselessPower;
            temp.y2Data = data.uselessPowerSame;
        } else if ( option === '4'){
            temp.yData = data.loadRatio;
            temp.y2Data = data.loadRatioSame;
        }
        setSourceData(temp);
    },[option]);
    
    return (
        <div style={{ height:'100%', position:'relative' }}>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }

            <div style={{ display:'flex', alignItems:'center', height:'50px', padding:'6px 10px' }}>
                <Radio.Group size='small' style={{ marginRight:'14px' }} className={style['custom-radio']} value={option} onChange={e=>{
                    toggleOption(e.target.value);
                }}>
                    {
                        buttons.map((item,index)=>(
                            <Radio.Button key={item.code} value={item.code}>{ item.title }</Radio.Button>
                        ))
                    }
                </Radio.Group>
                {/* <div className={style['button-group-container']} style={{ marginRight:'20px' }}>
                    {
                        buttons.map((item,index)=>(
                            <div key={index} className={ item.code === option ? style['button-group-item'] + ' ' + style['selected'] : style['button-group-item']} onClick={e=>{
                                toggleOption(item.code);
                            }}>{ item.title }</div>
                        ))
                    }
                </div> */}
                <CustomDatePicker onDispatch={()=>{
                    dispatch({ type:'transformer/fetchMachChartInfo'});
                }} />
            </div>
            
            <div style={{ height:'calc( 100% - 50px)'}}>
                
                <LineChart theme={theme} startDate={startDate} timeType={timeType} xData={data.date} yData={sourceData.yData} y2Data={sourceData.y2Data} unit={buttons.filter(i=>i.code === option)[0].unit } />
                 
            </div>
        </div>
    )
}

export default ChartContainer;