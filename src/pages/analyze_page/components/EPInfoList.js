import React, { useState, useEffect, useRef } from 'react';
import { Tooltip, Input, InputNumber } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import style from '@/pages/IndexPage.css';

let timer = null;
function getResult(lineInfo, x){
    let result = 0;
    if ( lineInfo && lineInfo.slope ){
        result = Math.round(lineInfo.slope * x + lineInfo.r);
    }
    return result;
}
function EPInfoList({ data, theme }){
    const { lineInfo, avgEnergy, eEnergy, eEnergyPercent, proposal } = data;
    const [value, setValue] = useState('');
    const [energy, setEnergy] = useState(0);
    useEffect(()=>{
        clearInterval(timer);
        timer = setTimeout(()=>{
            if ( value ) {
                setEnergy(getResult(lineInfo, value));
            } else {
                setEnergy(0);
            }
        },800)
    },[value]);
    return (
        <div style={{ display:'flex', height:'110px', paddingBottom:'1rem', color:'#fff' }}>
            <div style={{ flex:'1', background:'#1545ff', display:'flex', alignItems:'center', padding:'0 1rem', marginRight:'1rem', borderRadius:'4px' }}>
                <div>
                    <div style={{ marginBottom:'0.5rem' }}>产品电单耗</div>
                    <div>
                        <span className={style['data']} style={{ fontSize:'1.6rem', color:'#fff' }}>45.3</span>
                        <span className={style['sub-text']}>kwh/台</span>
                    </div>
                </div>         
            </div>
            <div style={{ flex:'1', display:'flex', justifyContent:'space-around', alignItems:'center', background:'#7042fb', padding:'0 1rem', marginRight:'1rem', borderRadius:'4px' }}>
                <div>
                    <div style={{ marginBottom:'0.5rem' }}>基础能耗e</div>
                    <div>
                        <span className={style['data']} style={{ fontSize:'1.6rem', color:'#fff' }}>{ lineInfo ? (+lineInfo.constant).toFixed(1) : 0 }</span>
                        <span className={style['sub-text']}>kwh</span>
                    </div>
                </div>
                <div>
                    <div style={{ marginBottom:'0.5rem' }}>占比</div>
                    <div>
                        <span className={style['data']} style={{ fontSize:'1.6rem', color:'#fff' }}>{ eEnergyPercent ? (+eEnergyPercent).toFixed(1) : 0 }</span>
                        <span className={style['sub-text']}>%</span>
                    </div>
                </div>              
            </div>
            <div style={{ flex:'2', background:'#5bb9e3', display:'flex', alignItems:'center', padding:'0 1rem',  marginRight:'1rem', borderRadius:'4px' }}>
                <div>
                    <div style={{ marginBottom:'0.5rem' }}>改善建议</div>
                    <div>
                        <div>{ proposal || '-- -- ' }</div>
                    </div>
                </div>
                                    
            </div>
            <div style={{ flex:'2', whiteSpace:'nowrap', background: theme === 'dark' ? '#191932' : '#fff', display:'flex', alignItems:'center', padding:'0 1rem', borderRadius:'4px' }}>
                <div style={{ marginRight:'2rem' }}>
                    <div style={{ marginBottom:'0.5rem' }}>能耗推测<Tooltip title='基于回归模型方程预测对应产量的能源消耗量'><ExclamationCircleOutlined style={{ marginLeft:'0.5rem' }} /></Tooltip></div>
                    <div>
                        <span style={{ marginRight:'0.5rem' }}>输入产量</span>
                        <InputNumber size='small' min={0} style={{ width:'100px' }} onChange={value=>setValue(value)} />
                        <span>台</span>
                    </div>
                </div>
                <div>
                    <div style={{ marginBottom:'0.5rem' }}>预测用电</div>
                    <div >
                        <span className={style['data']} style={{ fontSize:'1.6rem', lineHeight:'1.6rem', color:'#fff' }}>{ energy }</span>
                        <span className={style['sub-text']}>kwh</span>
                    </div>
                </div>                    
            </div>
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(EPInfoList, areEqual);