import React, { Component } from 'react';
import { Table } from 'antd';
import style from './TooltipInfo.css';


function TooltipInfo({ data, allTypes }) {
    let { tag_name, energy_type } = data;
    let types = Object.keys(energy_type).map(key=>{
        let currentEnergy = allTypes.filter(i=>i.type_code === key)[0];
        energy_type[key]['type_name'] = currentEnergy.type_name;
        energy_type[key]['coalRatio'] = currentEnergy.coal_ratio;
        energy_type[key]['unit'] = currentEnergy.unit;
        return energy_type[key];
    });

    // console.log(types);
    // console.log(data);
    // console.log(allTypes);
    return (
        <div className={style['container']}>
            <div className={style['title']}>{`${tag_name}能耗总览`}</div>
            <div className={style['item']}>
                <span>能源类型</span>
                {
                    types && types.length
                    ?
                    types.map((type,index)=>(
                        <span key={index}>{type.type_name}</span>
                    ))
                    :
                    null
                }
                <span>折标煤</span> 
            </div>
            <div className={style['item']}>
                <span>单位</span>
                {
                    types && types.length
                    ?
                    types.map((type,index)=>(
                        <span key={index}>{type.unit}</span>
                    ))
                    :
                    null
                } 
                <span>tce</span>
            </div>
            <div className={style['item']}>
                <span>今日能耗</span>
                {
                    types && types.length
                    ?
                    types.map((type,index)=>(
                        <span key={index} className={style['text']}>{type.dayEnergy}</span>
                    ))
                    :
                    null
                } 
                <span className={style['text']}>{((+types[0].coalRatio)*(+types[0].dayEnergy)).toFixed(2)}</span>
            </div>
            <div className={style['item']}>
                <span>本月能耗</span>
                {
                    types && types.length
                    ?
                    types.map((type,index)=>(
                        <span key={index} className={style['text']}>{type.monthEnergy}</span>
                    ))
                    :
                    null
                } 
                <span className={style['text']}>{((+types[0].coalRatio)*types[0].monthEnergy).toFixed(2)}</span>
            </div>
            <div className={style['item']}>
                <span>本年能耗</span>
                {
                    types && types.length
                    ?
                    types.map((type,index)=>(
                        <span key={index} className={style['text']}>{type.yearEnergy}</span>
                    ))
                    :
                    null
                } 
                <span className={style['text']}>{((+types[0].coalRatio)*types[0].yearEnergy).toFixed(2)}</span>
            </div>
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(TooltipInfo, areEqual);
