import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { PlayCircleOutlined } from '@ant-design/icons';
import bgImg from '../../../../public/freeze_img.png';
let initWidth = 1478, initHeight = 772;
const points = [
    { left:0.5, top:0.34, status:0 },
    { left:0.5, top:0.54, status:0 },
    { left:0.5, top:0.73, status:0 },
    { left:0.5, top:0.93, status:0 }
];
const statusMaps = {
    0:'#42c940',
    1:'red'
}
function FreezeStation({ dispatch, user }){
    const { authorized, theme } = user;
    const containerRef = useRef();
    const imgRef = useRef();
    useEffect(()=>{
        let containerWidth = containerRef.current.offsetWidth;
        let containerHeight = containerRef.current.offsetHeight;
        let xRatio = initWidth / containerWidth;
        let yRatio = initHeight / containerHeight;
        let direc = xRatio <= yRatio ? 'vertical' : 'horizon';
        let finalRatio = direc === 'vertical' ? yRatio : xRatio;
        let fixWidth = direc === 'vertical' ? initWidth / finalRatio : containerWidth;
        let fixHeight = direc === 'vertical' ? containerHeight : initHeight / finalRatio;   
        imgRef.current.style.width = fixWidth + 'px';
        imgRef.current.style.height = fixHeight + 'px';
    },[]);
    return (
        <div style={{ height:'100%', padding:'1rem 1rem 2rem 1rem' }}>
            <div style={{ height:'10rem', marginBottom:'1rem', backgroundColor:theme === 'dark' ? '#191932' : '#fff' }}></div>
            <div style={{ height:'calc( 100% - 11rem)' }} ref={containerRef}>
                <div ref={imgRef} style={{ position:'relative', margin:'auto' }}>
                    <img src={bgImg} style={{ width:'100%', height:'100%' }} />
                    {
                        
                        points.map((item,index)=>(
                            <div
                                key={index}
                                style={{
                                    color:'#fff',
                                    position:'absolute',
                                    borderRadius:'6px',
                                    padding:'4px 6px',
                                    top:item.top * 100 + '%',
                                    left:item.left * 100 + '%',
                                    backgroundColor:statusMaps[item.status],
                                    transform:'translate(-50%, -50%)'
                                }}
                                
                            ><PlayCircleOutlined style={{ marginRight:'4px' }} />运行中</div>
                        ))
                        
                    }
                </div>
            </div>
        </div>
    )
}

export default connect(({ user })=>({ user }))(FreezeStation);