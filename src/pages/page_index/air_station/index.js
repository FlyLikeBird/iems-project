import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'dva';
import { Tooltip, Button } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import style from './AirStation.css';
import ReactEcharts from 'echarts-for-react';
import PageItem from './components/PageItem';

let timer = null;
function AirStation({ dispatch, airStation, location }){
    let { data } = airStation;
    let { bg_img, record } = data;
    let [current, setCurrent] = useState(0);
    let [rect, setRect] = useState({ width:0, height:0});
    const containerRef = useRef();
    console.log(location);
    useEffect(()=>{
        dispatch({ type:'airStation/fetchAirStation', payload:{ userid:location.query.userid } });
        timer = setInterval(function(){
            dispatch({ type:'airStation/fetchAirStation' })
        },1000 * 60);
        handleResize();
        function handleResize(){
            setRect({ width:containerRef.current.offsetWidth, height:containerRef.current.offsetHeight });
        }
        window.addEventListener('resize', handleResize);
        return ()=>{
            clearInterval(timer);
            timer = null;
            window.removeEventListener('resize', handleResize);
        }
    },[]);
    
    function handleToggle(direc){
        let target = containerRef.current;
        if ( direc === 'up') {
            current += 1;
        } else {
            current -= 1;    
        }
        setCurrent(current);
    }
    return (
        <div ref={containerRef} className={style['container']}>
            {
                bg_img && bg_img.length && bg_img.length > 1 
                ?
                <div className={style['btn-group']}>
                    <div onClick={()=>handleToggle('up')}><Button type='primary' icon={<CaretUpOutlined />} disabled={current === 0 ? true : false }></Button></div>
                    <div onClick={()=>handleToggle('down')}><Button type='primary' icon={<CaretDownOutlined />} disabled={current === -6 ? true : false }></Button></div>
                </div>
                :
                null
            }
            
            <div className={style['scroll-container']} style={{ transform:`translateY(${current * 100}%)` }}>
                {
                    bg_img && bg_img.length 
                    ?
                    bg_img.map((src,index)=>(
                        <div className={style['scroll-item']}>
                            <PageItem 
                                path={src} 
                                key={index}
                                rect={rect}
                                data={data.sourceData && data.sourceData.length ? data.sourceData[index] : [] }
                            />
                        </div>
                    ))
                    :
                    null
                }
            </div>
            
            
        </div>
    )
}

export default connect(({ airStation })=>({ airStation }))(AirStation);
