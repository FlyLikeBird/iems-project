import React, { useState, useEffect, useRef } from 'react';
import infoImg from '../../../../public/page-index-template/info-bg.png';
import style from './template2.css';


let repeatTimer;
let timer1;
let timer2;

// 切换索引值
function InfoContainer({ data, energyMaps, totalCost, coal, carbon }){
    const scrollRef = useRef();
    const backRef = useRef();
    let toggleData = [];
    toggleData.push({ title:'总能源成本', value:Math.round(totalCost) });
    Object.keys(data).forEach(key=>{
        toggleData.push({ title:energyMaps[key].type_name + '能源成本', value:Math.round( data[key].cost )})
    });

    let index = 1;
    useEffect(()=>{
        repeatTimer = setInterval(()=>{
            // console.log(indexRef.current);      
            if ( scrollRef.current ){
                scrollRef.current.style.transition = 'transform 1s ease-in';
                scrollRef.current.style.transform = `translate(-50%,-${index*100}%)`;
                // translate(-50%, 100%) 截取translate字符串判断滚动位置
                let str = backRef.current.style.transform.substring(16,19);
                if ( str === '0px' ){
                    timer2 = setTimeout(()=>{
                        backRef.current.style.transition = 'none';
                        backRef.current.style.transform = 'translate(-50%,100%)';
                    },1200)
                    backRef.current.style.transition = 'transform 1s ease-in';
                    backRef.current.style.transform = `translate(-50%,-100%)`; 
                }
                if ( index === toggleData.length ){          
                    timer1 = setTimeout(()=>{
                        scrollRef.current.style.transition = 'none';
                        scrollRef.current.style.transform = `translate(-50%,100%)`;
                        index = 0;
                    },1200);
                    backRef.current.style.transition = 'transform 1s ease-in';
                    backRef.current.style.transform = `translate(-50%,0px)`;         
                }
                index += 1;
            } 
        },3000)
        return ()=>{
            clearInterval(repeatTimer);
            clearTimeout(timer1);
            clearTimeout(timer2);
            repeatTimer = null;
            timer1 = null;
            timer2 = null;
        }
    },[])
    return (
        <div style={{ height:'100%' }}>
            <div className={style['left']}>
                <div className={style['text']}>本月折合标煤</div>
                <div>
                    <span className={style['data']}>{ Math.round(coal) }</span>
                    <span className={style['text']}>tce</span>
                </div>
            </div>
            {/* 滚动模块 */}
            <div ref={scrollRef} className={style['scroll-container']}>
                {
                    toggleData.map((item,index)=>(
                        <div className={style['scroll-item']} key={index}>
                            <div className={style['text']}>{ item.title }</div>
                            <div><span className={style['data']} style={{ fontSize:'3rem' }}>{ item.value }</span><span className={style['text']}>元</span></div>
                        </div>
                    ))
                }
            </div>
             {/* 切换到最后一项的临时状态 */}
             <div ref={backRef} className={style['scroll-container']} style={{ transform:'translate(-50%,100%)'}} >
                <div className={style['scroll-item']} >
                    <div className={style['text']}>{ toggleData[0] ? toggleData[0].title : ''}</div>
                    <div><span className={style['data']} style={{ fontSize:'3rem' }}>{ toggleData[0] ? toggleData[0].value : '' }</span><span className={style['text']}>元</span></div>
                </div>
            </div>
            <div className={style['right']}>
                <div className={style['text']}>本月碳排放</div>
                <div>
                    <span className={style['data']}>{ Math.round(carbon) }</span>
                    <span className={style['text']}>t</span>
                </div>
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

export default React.memo(InfoContainer, areEqual);