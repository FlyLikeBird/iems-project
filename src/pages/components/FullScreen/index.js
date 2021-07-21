import React, { Component, useState, useRef, useEffect, useLayoutEffect, createRef, useMemo } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import { Radio,Button, Tooltip, message  } from 'antd';
import html2canvas from 'html2canvas';
import { ArrowUpOutlined, ArrowDownOutlined, FullscreenOutlined, FullscreenExitOutlined, VideoCameraAddOutlined, DownloadOutlined } from '@ant-design/icons';
import style from './FullScreen.css';
let screenDom;
let prevPath;

function FullScreen({ content, sceneInfo, contentWidth, currentPath }){
    let fullScreenWidth = 0;
    const handleDownloadImg = ()=>{
        let infoDoms = contentRef.current.getElementsByClassName('info-container');
        let tagDoms = contentRef.current.getElementsByClassName('tag-container');
        if ( infoDoms && infoDoms.length ){
            infoDoms[0].classList.remove('animate__animated','animate__bounceInLeft');
        }
        if ( tagDoms && tagDoms.length){
            for(let i=0;i<tagDoms.length;i++){
                tagDoms[i].classList.remove('animate__animated','animate__rotateInDownLeft');
            }
        }
        let renderDom = contentRef.current.getElementsByClassName(style['content-container'])[0];
        html2canvas(renderDom, { allowTaint:false, useCORS:true})
            .then(canvas=>{
                let MIME_TYPE = "image/png";
                let url = canvas.toDataURL(MIME_TYPE);
                let linkBtn = document.createElement('a');
                linkBtn.download = '能源成本拟态图';          
                linkBtn.href = url;
                linkBtn.dataset.downloadurl = [MIME_TYPE, linkBtn.download, linkBtn.href].join(':');
                document.body.appendChild(linkBtn);
                linkBtn.click();
                document.body.removeChild(linkBtn);
            })
    }

    const fixImgWidth = ()=>{
        let { imageInfo } = sceneInfo;    
        if ( imageInfo ){
            let width = contentRef.current.offsetWidth;
            //  根据容器宽度和图像实际宽度计算出横向的缩放比例
            let xRatio = width/imageInfo.width;
            //  图像的实际高度乘以比例保证不变形
            let imgHeight = imageInfo.height*xRatio;
            let imgContainer = contentRef.current.getElementsByClassName('img-container')[0];
            if ( imgContainer ){
                imgContainer.style.width = width +'px';
                imgContainer.style.height = imgHeight+'px';
            }
        }  
    };
    const [zoom, toggleZoom] = useState(false);
    const contentRef = useRef();
    console.log('fullscreen render()...');
    const handleScale = ()=>{
        if ( zoom ){
            //  缩小回正常尺寸
            let canvasContainer = document.getElementsByClassName('canvas-container')[0];
            canvasContainer.appendChild(contentRef.current);
            document.body.removeChild(screenDom);
        } else {
            //  放大到全屏
            screenDom = document.createElement('div');
            screenDom.style.width = '100%';
            screenDom.style.height = '100%';
            screenDom.style.position = 'absolute';
            screenDom.style.top = '0px';
            screenDom.style.left = '0px';
            screenDom.appendChild(contentRef.current);
            document.body.appendChild(screenDom);
        }
        fixImgWidth();
        toggleZoom(!zoom);
    };
    // 注册键盘事件，点击ESC退出全屏
    const handleKeyDown = (e)=>{
        if ( e && e.keyCode === 27 && zoom ) {
            handleScale();
        }
    };
    useEffect(()=>{
        document.addEventListener('keydown', handleKeyDown);
        return ()=>{
            // 相当于 componentWillUnmount
            document.removeEventListener('keydown', handleKeyDown);
        }
    },[zoom]);
    // 每次折叠时，重新计算图像容器的宽高
    useEffect(()=>{
        fixImgWidth();
    },[contentWidth]);

    return (
        // 其中80是外部容器的padding值，20是右边容器的margin-left
        <div ref={contentRef} className={ zoom ? `${style['container']} ${style['zoom']}` : style['container']}>
                <div className={style['content-container']}>{ content }</div>
                <div className={style['action-container']}>
                    <span onClick={handleDownloadImg}>
                        <DownloadOutlined />
                    </span>
                    {/* <span onClick={()=>{
                        message.info('已加入监控面板')
                    }}><VideoCameraAddOutlined /></span> */}
                    <span onClick={handleScale}>                    
                        <Link to="/hello">
                            <span>{ currentPath === '/global_monitor' ? <FullscreenOutlined /> : <FullscreenExitOutlined /> }</span>
                        </Link>
                    </span>
                </div>
            </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.sceneInfo !== nextProps.sceneInfo || prevProps.contentWidth !== nextProps.contentWidth || prevProps.currentPath !== nextProps.currentPath  ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(FullScreen, areEqual);
