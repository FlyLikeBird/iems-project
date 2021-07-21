import React, { useState, useEffect, useRef } from 'react';
import { Modal, Spin, Switch, DatePicker } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import style from '../EleMonitor.css';
import moment from 'moment';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
function initCamera(token, containerRef){
    if ( containerRef.current && containerRef.current.childNodes[0] ) {
        containerRef.current.removeChild(containerRef.current.childNodes[0]);
    }
    if ( containerRef.current ){
        var iframe = document.createElement('iframe');
        iframe.id = 'my-iframe';
        iframe.style.width = containerRef.current.offsetWidth + 'px';
        iframe.style.height = containerRef.current.offsetHeight + 'px';
        iframe.src = `https://open.ys7.com/ezopen/h5/iframe_se?url=ezopen://888888@open.ys7.com/F62907491/1.live&accessToken=${token}`;        
        // iframe.src = `http://open.ys7.com/openlive/temp.m3u8?t=${token}`;
        containerRef.current.appendChild(iframe);
        // 遮挡住播放控件的顶部和尾部
    }
}
function CameraManager({ dispatch, visible, onClose }){
    const containerRef = useRef();
    useEffect(()=>{
        new Promise((resolve, reject)=>{
            dispatch({ type:'envMonitor/fetchCameraToken', payload:{ resolve, reject }})
        })
        .then(token=>{
            initCamera(token, containerRef);
        })
    },[])
    return (
       
        <div className={style['inline-container']} ref={containerRef}>
            
        </div>
    
        
    )
}

export default CameraManager;