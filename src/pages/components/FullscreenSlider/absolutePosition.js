import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Spin } from 'antd';
import { LeftOutlined, RightOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import style from './FullscreenSlider.css';

let screenDom;
let freeze = false;

function FullscreenSlider({ data, interval, delay = 0}){
    let [current, setCurrent] = useState(0);
    let [timer, setTimer] = useState(null);
    let [zoom, setZoom] = useState(false);
    const containerRef = useRef();
    const contentRef = useRef();
    // 鼠标移入dom内，停止自动轮播
    const  handleMouseOver = (e)=>{
        clearInterval(timer);
        let target = e.currentTarget;
        let relatedTarget = e.relatedTarget || e.fromElement;
        // console.log(target);
        // console.log(relatedTarget);
        // if ( target.contains(relatedTarget)) {
        //     // 内部mouseover事件不处理
        // } else {
        //     console.log('mouse over');
        // } 
    };
    // 鼠标移出，重新开始自动轮播
    const handleMouseOut = ()=>{
        if ( zoom ) return ;
        let clearIndex = startSlider();
        setTimer(clearIndex);
    };
    // 左右button手动切换逻辑
    const handleToggle = (direction)=>{
        // 当切换状态中时，button无效
        console.log(freeze);
        if ( freeze ) return ;
        let nextIndex;
        if ( current === 0 && direction === 'left') {
            nextIndex = data.length - 1;
        } else if ( current === data.length - 1 && direction === 'right' ) {
            nextIndex = 0;
        } else {
            nextIndex = direction === 'left' ? --current : ++current;
        }
        setCurrent(nextIndex);
        freeze = true;
        setTimeout(()=>{
            freeze = false;
        },1000);
    };
    // 放大至全屏展示
    const handleZoom = ()=>{
        if(zoom){
            document.body.removeChild(screenDom);
            containerRef.current.appendChild(contentRef.current);
            let clearIndex = startSlider();
            setTimer(clearIndex);
        } else {
            //  放大到全屏
            screenDom = document.createElement('div');
            screenDom.style.position = 'absolute';
            screenDom.style.top = '0px';
            screenDom.style.bottom = '0px';
            screenDom.style.left = '0px';
            screenDom.style.right = '0px';
            screenDom.style.overflow = 'hidden';
            screenDom.appendChild(contentRef.current);
            document.body.appendChild(screenDom);
            clearInterval(timer);
        }
        setZoom(!zoom);
    };
    const startSlider = ()=>{
        let clearIndex = setInterval(()=>{
            ++current;
            if ( current === data.length ) {
                current = 0;
            }
            setCurrent(current);
        }, interval * 1000);
        return clearIndex;
    };
    useEffect(()=>{
        console.log('effect');
        let clearIndex = startSlider();
        setTimer(clearIndex);
        return ()=>{
            clearInterval(timer);
        }
    },[data]);

    return (
        <div ref={containerRef} className={style['container']} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            <div ref={contentRef}>
                <div className={style['item-container']}  >  
                {
                    data && data.length 
                    ?
                    data.map((item,index)=>(
                        <div 
                            className={ index === current ? `${style['item']} ${style['current']}` : style['item']}  
                            key={index} 
                            style={{ backgroundColor:index === 0 ? 'blue' : index === 1 ? 'green' : 'yellow'}}>
                            { item }
                        </div>
                    ))
                    :
                    <Spin />
                }
                </div>
                {/*  左右控制button */}
                <div className={`${style['button']} ${style['left']}`} onClick={()=>handleToggle('left')}><LeftOutlined /></div>
                <div className={`${style['button']} ${style['right']}`} onClick={()=>handleToggle('right')}><RightOutlined /></div>
                {/* 指示点 */}
                <div className={style['dot-container']}>
                    {
                        data && data.length
                        ?
                        data.map((item,index)=>(
                            <div key={index} className={ index === current ? `${style['dot']} ${style['current']}` : style['dot'] }></div>
                        ))
                        :
                        null
                    }
                </div>
                {/* 全屏展示 */}
                <div className={style['action-container']}>
                    <span onClick={handleZoom}>
                        {
                            zoom ? <FullscreenExitOutlined /> : <FullscreenOutlined />
                        }
                    </span>
                </div>
            </div>
        </div>
    )
}

export default FullscreenSlider;