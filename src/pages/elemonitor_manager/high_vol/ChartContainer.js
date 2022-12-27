import React from 'react';
import { Radio, DatePicker } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import style from '../../IndexPage.css';
import LineChart from '../components/LineChart';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';

const buttons = [
    { title:'需量', code:'1', unit:'kw' },
    { title:'电压', code:'2', unit:'V' },
    { title:'视在', code:'3', unit:'kw' },
    { title:'有功', code:'4', unit:'kw' },
    { title:'无功', code:'5', unit:'kvar' },
    { title:'电流', code:'6', unit:'A' },
];

function ChartContainer({ data, dispatch, startDate, timeType, optionType, theme, isLoading }){
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
                <Radio.Group size='small' style={{ marginRight:'14px' }} className={style['custom-radio']} value={optionType} onChange={e=>{
                    dispatch({ type:'highVol/toggleOptionType', payload:e.target.value });
                    dispatch({ type:'highVol/fetchIncomingChart'});
                }}>
                    {
                        buttons.map((item,index)=>(
                            <Radio.Button value={item.code} key={item.code}>{ item.title }</Radio.Button>
                        ))
                    }
                </Radio.Group>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({ type:'highVol/fetchIncomingChart'});
                }} />
            </div>
            <div style={{ height:'calc( 100% - 50px)'}}>
                <LineChart theme={theme} timeType={timeType} startDate={startDate} xData={data.date} yData={data.energy} y2Data={data.energySame} unit={buttons.filter(i=>i.code === optionType)[0].unit } />
            </div>
        </div>
    )
}

export default ChartContainer;