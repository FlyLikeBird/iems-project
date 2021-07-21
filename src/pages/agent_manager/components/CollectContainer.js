import React, { useEffect, useRef } from 'react';
import { PieChartOutlined, ApartmentOutlined } from '@ant-design/icons';
import style from '../AgentMonitor.css';
// import collectIcons from '../../../../public/agent/collect-icon.png';

import icon0 from '../../../../public/agent/icons/0.png';
import icon1 from '../../../../public/agent/icons/1.png';
import icon2 from '../../../../public/agent/icons/2.png';
import icon3 from '../../../../public/agent/icons/3.png';
import icon4 from '../../../../public/agent/icons/4.png';
import icon5 from '../../../../public/agent/icons/5.png';
import icon6 from '../../../../public/agent/icons/6.png';
import icon7 from '../../../../public/agent/icons/7.png';
import icon8 from '../../../../public/agent/icons/8.png';
import icon9 from '../../../../public/agent/icons/9.png';
import icon10 from '../../../../public/agent/icons/10.png';
import icon11 from '../../../../public/agent/icons/11.png';
import icon12 from '../../../../public/agent/icons/12.png';
import icon13 from '../../../../public/agent/icons/13.png';
import icon14 from '../../../../public/agent/icons/14.png';

const collectIconsPosition = {
    'sound_light':icon1,
    'ele_meter':icon3,
    'illumination':icon4,
    'combustible':icon5,
    'gate':icon6,
    'annihilator':icon7,
    'gas_meter':icon8,
    'camera':icon0,
    'water_meter':icon9,
    'water_level':icon10,
    'smoke':icon14,
    'shock':icon2,
    'gateway':icon12,
    'temperature':icon13
};
const collectIconsMap = {
    'sound_light':0,
    'ele_meter':1,
    'illumination':2,
    'combustible':3,
    'gate':4,
    'annihilator':5,
    'gas_meter':6,
    'camera':7,
    'water_meter':8,
    'water_level':9,
    'smoke':10,
    'shock':11,
    'gateway':12,
    'temperature':13
};
const dotStyle = {
    display:'inline-block',
    width:'6px',
    height:'6px',
    borderRadius:'50%',
    marginRight:'4px'
}


function CollectContainer({ data }){
    const scrollDom = useRef();
    useEffect(()=>{
        function handleScroll(e){
            e.preventDefault();
            if ( e.wheelDelta >0 || e.detail > 0){
                // 滚轮向上滚动时
                scrollDom.current.scrollLeft = scrollDom.current.scrollLeft - 100;
            } else if ( e.wheelDelta <0 || e.detail < 0 ){
                scrollDom.current.scrollLeft = scrollDom.current.scrollLeft + 100;
            }
        }
        if ( scrollDom.current ){            
            scrollDom.current.addEventListener('wheel',handleScroll);
        }
        return ()=>{
            if ( scrollDom.current ){
                scrollDom.current.removeEventListener('wheel', handleScroll);
            }
        }
    },[])
    return (
        <div className={style['middle']} style={{ bottom:'2%', height:'10%'}}>
            {/* 采集器在线数 */}
            <div className={style['item-container']}>
                <div className={style['item-title']}>
                    <div className={style['item-title-bg']}></div>
                    <div className={style['item-title-text']}>
                        <ApartmentOutlined />
                        采集器在线数
                    </div>
                </div>
                <div className={style['item-content']}>
                    <div className={style['layout-container'] + ' ' +style['collect-scroll-container']} ref={scrollDom}>
                        {
                            data.codeArr && data.info 
                            ?
                            Object.keys(data.codeArr).map((key,index)=>(
                                <div key={index} className={style['layout-item-wrapper']} style={{
                                    width:'12%',
                                    paddingRight:'6px',
                                    height:'100%'
                                }}>
                                    <div className={style['layout-item']} style={{
                                        border:'1px solid #79f6f3',
                                        backgroundColor:'rgba(125, 254, 249, 0.1)',
                                        borderRadius:'6px',
                                        paddingLeft:'10px'
                                        // borderImage:`url(${collectBg}) 6 repeat`,
                                        // position:'relative'
                                    }}>
                                        <div className={style['layout-content']}>
                                            <img src={collectIconsPosition[key]} style={{ height:'80%', width:'auto' }} />
                                            <div style={{ marginLeft:'6px', whiteSpace:'nowrap' }}>
                                                <div className={style['sub-text']}>{ data.codeArr[key] }</div>
                                                <div style={{ color:'#7dfffa'}}>{ data.info[key] }</div>
                                            </div>
                                        </div>
                                    </div>      
                                </div>
                                
                            ))
                            :
                            null
                        }
                        <div style={{
                            position:'absolute',
                            right:'0',
                            top:'-30px',
                            display:'flex',
                            alignItems:'center',
                            fontSize:'0.8rem'
                        }}>
                            <div style={{ margin:'0 10px'}}><span style={{ ...dotStyle, backgroundColor:'#84e87a'}}></span>正常</div>
                            <div><span style={{ ...dotStyle, backgroundColor:'#da0e0f' }}></span>异常</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CollectContainer;