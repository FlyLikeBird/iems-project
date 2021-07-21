import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Link, withRouter } from 'dva/router';
import { Spin, Upload, Button, Modal, message, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined, FullscreenOutlined, DownloadOutlined, PlusOutlined, FullscreenExitOutlined, UploadOutlined } from '@ant-design/icons';
import style from './FullscreenSlider.css';
import html2canvas from 'html2canvas';
import config from '../../../../config';

let eventAdd = false;
let subWindow = null;
function getBase64(file){
    return new Promise(( resolve, reject)=>{
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = ()=> resolve(reader.result);
        reader.onerror = (error)=> reject(error);
    })
}
// sourceData = 全屏组件包含的内部组件的数据 
function FullscreenSlider({ data, sourceData, interval, isLoading, dispatch, collapsed, currentPath, currentIndex, user, location, isFulled, delay = 0}){
    let timerRef = useRef(null);
    let itemRef = useRef({ smallWidth:0, fullWidth:0 });
    const sourceDataRef = useRef();
    sourceDataRef.current = sourceData;
    let [visible, toggleVisible] = useState(false);
    let [fileList, setFileList] = useState([]);
    let [sliderInfo, setSliderInfo] = useState({ useTransition:false, positions:[], current:0, freeze:false });
    let sliderRef = useRef(null);
    
    const containerRef = useRef();
    const contentRef = useRef();

    // 下载图片
    const handleDownloadImg = ()=>{
        let infoDoms = contentRef.current.getElementsByClassName('info-container');
        let info2Doms = contentRef.current.getElementsByClassName('info-container-2');
        let tagDoms = contentRef.current.getElementsByClassName('point-container');
        // 去掉信息框的动画样式
        if ( infoDoms && infoDoms.length ){
            infoDoms[0].classList.remove('animate__animated','animate__bounceInLeft');
        }
        if ( info2Doms && info2Doms.length ){
            for( let i = 0;i<info2Doms.length;i++){
                info2Doms[i].classList.remove('animate__animated','animate__bounceInLeft');
            }
        }
        if ( tagDoms && tagDoms.length){
            for(let i=0;i<tagDoms.length;i++){
                tagDoms[i].classList.remove('motion');
            }
        }
        html2canvas(contentRef.current, { allowTaint:false, useCORS:true})
            .then(canvas=>{
                let MIME_TYPE = "image/png";
                let url = canvas.toDataURL(MIME_TYPE);
                let linkBtn = document.createElement('a');
                linkBtn.download = '拟态图';          
                linkBtn.href = url;
                linkBtn.dataset.downloadurl = [MIME_TYPE, linkBtn.download, linkBtn.href].join(':');
                document.body.appendChild(linkBtn);
                linkBtn.click();
                document.body.removeChild(linkBtn);
                console.log(tagDoms);
                setTimeout(()=>{
                    if ( tagDoms && tagDoms.length){
                        for(let i=0;i<tagDoms.length;i++){
                            tagDoms[i].classList.add('motion');
                        }
                    }
                },100)
            })
    }
    // 鼠标移入dom内，停止自动轮播
    const  handleMouseOver = (e)=>{
        clearInterval(timerRef.current); 
        // console.log(target);
        // console.log(relatedTarget);
        // if ( target.contains(relatedTarget)) {
        //     // 内部mouseover事件不处理
        // } else {
        //     console.log('mouse over');
        // } 
    };
    // 鼠标移出，重新开始自动轮播
    const handleMouseOut = (e)=>{
        if ( currentPath === '/global_fullscreen' ) return ;
        let target = e.currentTarget;
        let relatedTarget = e.toElement || e.relatedTarget;
        if ( target.contains(relatedTarget) ) {
            return ;
        } else {
            let clearIndex = startSlider();
            timerRef.current = clearIndex;
        }       
    };
    // 调整拟态图的缩放比例
    const fixImgWidth = ()=>{
            let containerWidth = contentRef.current.offsetWidth;
            let containerHeight = contentRef.current.offsetHeight;
            let finalRatio;
            // console.log(containerWidth);
            let allImageContainers = contentRef.current.getElementsByClassName('img-container');
            // console.log(allImageContainers);
            //  根据容器宽度和图像实际宽度计算出横向的缩放比例
            for(var i=0,len=allImageContainers.length;i<len;i++){
                let imgDom = allImageContainers[i];
                // console.log(imgDom);
                let imgWidth = imgDom.getAttribute('data-width');
                let imgHeight = imgDom.getAttribute('data-height');
                let widthRatio = imgWidth / containerWidth;
                let heightRatio = imgHeight / containerHeight;
                finalRatio = widthRatio < heightRatio ? widthRatio : heightRatio;
                let fixWidth = imgWidth/finalRatio;
                let fixHeight = imgHeight/finalRatio;
                imgDom.style.width = fixWidth + 'px';
                imgDom.style.height = fixHeight + 'px';
            }
    };
    const moveItems = (direction)=>{
        let { current, positions } = sliderRef.current;
        let itemWidth = contentRef.current.offsetWidth;
        let nextIndex = direction === 'left' ? --current : ++current;
        let tempArr = positions.map((item,i)=>{
            let offset = direction === 'left' ? itemWidth : -itemWidth;
            return item + offset;
        });
        
        setSliderInfo({ current:nextIndex, positions:tempArr, useTransition:true });
    };
    // 左右button手动切换逻辑
    const handleToggle = (direction)=>{
        let itemWidth = contentRef.current.offsetWidth;
        let tempArr;
        let { current, freeze } = sliderRef.current;
        if ( freeze ) return ;
        // 到达左边界限
        if ( current === 0 && direction === 'left') {
            current = data.length - 1;
            tempArr = data.map((item,i)=>{
                if ( i === 0 ) return 0;
                return -(data.length-i)*itemWidth;
            });
            setSliderInfo({ ...sliderInfo, useTransition:false, positions:tempArr, current });
            setTimeout(()=>{
                setSliderInfo((prevState)=>{
                    tempArr = prevState.positions.map(i=>i + itemWidth );
                    return { ...prevState, useTransition:true, positions: tempArr, freeze:true };
                })
            },100);
            
            setTimeout(()=>{
                setSliderInfo((prevState)=>{
                    tempArr = prevState.positions.map((item,index)=>{
                        if ( index === 0 ) {
                            return - prevState.current * itemWidth;
                        } else {
                            return item;
                        }
                    });
                    return { ...prevState, useTransition:false, positions:tempArr, freeze:false };
                });
            },1500)
        // 到达右边界限
        } else if ( current === data.length - 1  && direction === 'right' ) {
            current = 0;
            // 最后一项保持原位，其余项根据次序回归到初始状态准备下一次轮播
            tempArr = data.map((item,i)=>{
                if ( i === data.length -1 ) return 0;
                return i*itemWidth + itemWidth;
            });
            setSliderInfo({ ...sliderInfo, useTransition:false, positions:tempArr, current });
            setTimeout(()=>{
                setSliderInfo((prevState)=>{
                    tempArr = prevState.positions.map(i=>i-itemWidth);
                    return { ...prevState, useTransition:true, positions:tempArr, freeze:true };
                });
            },100);
            setTimeout(()=>{
                setSliderInfo((prevState)=>{
                    tempArr = prevState.positions.map((item,index)=>{
                        if ( index === data.length -1 ) {
                            return index*itemWidth;
                        } else {
                            return item;
                        }
                    });
                    return { ...prevState, useTransition:false, positions:tempArr,  freeze:false };
                });
            },1500);
        } else {
            // 正常滚动范围内
            moveItems(direction);
        }           
    };
    const startSlider = ()=>{
        if ( interval === 0 ){
            // 单个全屏
            return ;
        } else {
            let clearIndex = setInterval(()=>{
                handleToggle('right');
            }, interval * 1000);
            return clearIndex;
        }
    };
    // 及时更新sliderInfo信息
    useEffect(()=>{
        sliderRef.current = sliderInfo;
    },[sliderInfo]);
    // 设置每一项的初始位置
    useEffect(()=>{
        if ( interval === 0 || data.length <= 1 ) return;
        let temp;
        let itemWidth = containerRef.current.offsetWidth;
        itemRef.current.smallWidth = itemWidth;
        if ( currentIndex ){
            // 根据currentIndex设置当前索引
            temp = data.map((item,i)=>{
                if ( i < currentIndex ) {
                    return -(currentIndex - i )*itemWidth;
                } else if ( i === currentIndex ){
                    return 0;
                } else {
                    return (i - currentIndex) * itemWidth;
                }
            });
        } else {
            // 否则按照初始状态
            temp = data.map((item,i)=>i*itemWidth);
        }
        setSliderInfo({ ...sliderInfo, current:currentIndex, positions:temp });
        fixImgWidth();
    },[]);
    // 开启自动轮播
    useEffect(()=>{
        let timer = startSlider();
        timerRef.current = timer;
        return ()=>{
            clearInterval(timerRef.current);
            eventAdd = false;
        }
    },[]);
    // 当菜单项折叠时调整图像宽高
    useEffect(()=>{
        let { positions } = sliderRef.current;
        if ( positions && positions.length ){
            let prevItemWidth = itemRef.current.smallWidth;
            let nextItemWidth = contentRef.current.offsetWidth;
            itemRef.current.smallWidth = nextItemWidth;
            // console.log(prevItemWidth);
            // console.log(nextItemWidth);
            let temp = positions.map((item,i)=>{
                let prevIndex = Math.floor(item/prevItemWidth);
                return prevIndex * nextItemWidth;
            });
            setSliderInfo({ ...sliderRef.current, useTransition:false, positions:temp });
        } 
        fixImgWidth(); 
    },[collapsed]);
    // 注册message事件用来父子窗口之间通信
    useEffect(()=>{
        function handleMessage(e){
            if ( e.data === 'loaded'){
                let obj = {
                    user:{ ...user, socket:null, startDate:'', endDate:'' },
                    from:window.location.pathname,
                    state:sourceDataRef.current,
                }                    
                if ( subWindow ){
                    subWindow.postMessage(obj, location.origin);
                }
            }
            if ( e.data ==='closed' ){
                subWindow = null;
            }
        }
        window.addEventListener('message', handleMessage);
        return ()=>{
            window.removeEventListener('message',handleMessage);
            subWindow = null;
        }
    },[])
    const handleFullscreen = ()=>{
        // if ( currentPath === '/global_fullscreen') {
        //     // 回退到跳转之前的页面
        //     history.push({
        //         pathname:location.from,
        //         state:location.state,
        //         noRefresh:true
        //     });
        // } else {
        //     history.push({
        //         pathname:'/global_fullscreen',
        //         from:currentPath,
        //         index:sliderInfo.current,
        //         state:sourceData
        //     });
        // }
        // console.log(window.location);
        let origin = window.location.pathname;
        let url = `${window.location.origin}/global_fullscreen`;
        if(!subWindow){
            subWindow = window.open(url, window.location.origin + origin);
        } else {
            subWindow.focus();
        }
    }
    
    const onRemove = file => {
        let index = fileList.indexOf(file);
        let newArr = fileList.slice();
        newArr.splice(index,1);
        setFileList(newArr);
    };
    const beforeUpload = ( file )=>{
        // 图片大小不能超过5M ， 图片长宽比 > 1.6 && < 2.5
        // console.log(file);
        let isJpgOrPng = file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/png';
        if ( !isJpgOrPng ) {
            message.error('请上传正确的图片格式');
            return false;
        }
        let isLt5M = file.size / 1024 / 1024 < 5;
        if ( !isLt5M ) {
            message.info('图片大小不能超过5M');
            return false;
        }
        getBase64(file)
        .then(url=>{
            file.preview = file.url = url;
            let image = new Image();
            image.src = url;
            image.onload = ()=>{
                let ratio = image.width / image.height;
                if ( ratio < 1.6 || ratio > 2.5 ){
                    message.info('上传图片必须满足长宽比大于1.6且小于2.5');
                } else {
                    setFileList([file]);
                }
            } 
        })
        return false;
        
    }

    const handleUpload = ()=>{
        
    };
    const uploadButton = (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>上传图片</div>
        </div>
      );
    return (
        <div ref={containerRef} className={style['container']} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
            <div ref={contentRef} className={style['content-container']}>
                <div className={style['item-container']}>  
                {
                    data && data.length 
                    ?
                    data.map((item,i)=>(
                        <div
                            className={style['item']}
                            key={i} 
                            style={{ 
                                transform:`translateX(${sliderInfo.positions[i]}px)`,
                                transition: sliderInfo.useTransition ? 'transform 1.5s' : 'none',
                            }}>
                            { item }
                        </div>
                    ))
                    :
                    <Spin className={style['spin']} size='large' />
                }
                </div>
                
            </div>
            {/*  左右控制button */}
            { data.length > 1 ? <div className={`${style['button']} ${style['left']}`} onClick={()=>handleToggle('left')}><LeftOutlined /></div> : null }
            { data.length > 1 ? <div className={`${style['button']} ${style['right']}`} onClick={()=>handleToggle('right')}><RightOutlined /></div> : null }
            {/* 指示点 */}
            <div className={style['dot-container']}>
                {
                    data && data.length && data.length > 1
                    ?
                    data.map((item,index)=>(
                        <div key={index} className={ index === sliderInfo.current ? `${style['dot']} ${style['current']}` : style['dot'] }></div>
                    ))
                    :
                    null
                }
            </div>
            <Modal visible={visible} onCancel={()=>toggleVisible(false)} okText='上传' cancelText='取消' onOk={()=>{
                // console.log(fileList);
                if ( !fileList.length ){
                    message.info('请上传图片');
                } else {
                    new Promise((resolve, reject)=>{
                        let action = currentPath === '/energy/energy_manage' ? 'energy/setSceneInfo' : currentPath === '/energy/alarm_manage' ? 'alarm/setSceneInfo' : '';
                        dispatch({ type:action, payload:{ file:fileList[0], resolve, reject }})
                    })
                    .then(()=>toggleVisible(false))
                    .catch(msg=>message.error(msg))
                }
            }}>
                <Upload 
                    fileList={fileList} 
                    listType="picture-card"
                    onRemove={(file)=>onRemove(file)} 
                    onPreview={file=>{}}
                    beforeUpload={(file)=>beforeUpload(file)}
                >
                    {
                        !fileList.length
                        ?
                        uploadButton
                        :
                        null
                    }
                </Upload>
            </Modal>
            {/* 全屏展示 */}
            {
                isLoading
                ?
                null
                :
                <div className={style['action-container']}>
                    {
                        currentPath === '/energy/energy_manage' || currentPath === '/energy/alarm_manage'
                        ?
                        <Tooltip title='上传公司图片'><span onClick={()=>toggleVisible(true)}><UploadOutlined /></span></Tooltip>
                        :
                        null
                    }
                    <Tooltip title='下载图片'><span onClick={handleDownloadImg}><DownloadOutlined /></span></Tooltip>
                    {
                        !isFulled
                        ?
                        <Tooltip title='全屏显示'><span onClick={()=>handleFullscreen()}><FullscreenOutlined /></span></Tooltip>
                        :
                        null
                    }
                </div>
            }
        </div>
    )
}

  
export default withRouter(FullscreenSlider);
