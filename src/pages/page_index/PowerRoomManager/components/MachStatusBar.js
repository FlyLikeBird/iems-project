import React from 'react';
import ReactEcharts from 'echarts-for-react';
import style from '../PowerRoom.css';

const data = [];
for( var i=0;i<10;i++){
    data.push({ title:'智能电表', online:Math.round(Math.random()*10) + 5, total:20 })
}

let barWidth = 10;

function MachStatusBar({ data }){
    let list = [];
    Object.keys(data).forEach(key=>{
        list.push({ ...data[key], online:data[key].total - data[key].outline });
    })
    return (
        <div className={style['vertical-flex-container']}>
            {
                list && list.length 
                ?
                list.map((item,index)=>(
                    <div key={index} className={style['flex-item']}>
                        <div style={{ flex:'1'}}>{ item.name }</div>
                        <div className={style['progress-container']}>
                            <div className={style['progress']} style={{ width:`${item.total ? item.online/item.total * 100 : 0}%`, backgroundColor:'#4492ff' }}></div>
                        </div>
                        <div style={{ flex:'1' }}>{ `${item.online}/${item.total}` }</div>
                    </div>
                ))
                :
                null
            }

        </div>
    )
}

export default MachStatusBar;