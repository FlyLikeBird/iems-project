import React from 'react';
import style from './template2.css';

function EnergyProcess({ data, energyMaps }){

    return (
        <div className={style['flex-container']}>
            {
                data.map((item,index)=>(
                    <div className={style['flex-item']} key={index}>
                        <div className={style['flex-item-content']}>
                            <span style={{ width:'10%', paddingLeft:'10px', color:'#506575' }}>{`${energyMaps[item.key] ? energyMaps[item.key].type_name : ''}`}</span>
                            <span className={style['process-container']}>
                                <span className={style['process-item']} style={{
                                    width: item.percent + '%',
                                    backgroundColor:item.energy < item.quota ? '#5dbbee' : '#ff9937'
                                }}></span>
                                {/* 定位指针 */}
                                <div className={style['flex-pointer']} style={{
                                    left: item.percent + '%',
                                    borderColor:item.energy ? item.energy < item.quota ? '#5dbbee' : '#ff9937' : '#5dbbee'    
                                }}>
                                    { `${item.energy} ${item.unit}`}
                                    <div className={style['arrow']} style={{ borderBottom: item.energy ? item.energy < item.quota ?  '10px solid #5dbbee' : '10px solid #ff9937' : '10px solid #5dbbee'  }}></div>
                                </div>
                            </span>
                            <span style={{ width:'22%', paddingLeft:'10px', fontSize:'1.2rem', whiteSpace:'nowrap' }}>{`${item.quota} ${item.unit}`}</span>
                        </div>
                        
                    </div>
                ))
            }
        </div>
    )
}

export default EnergyProcess;