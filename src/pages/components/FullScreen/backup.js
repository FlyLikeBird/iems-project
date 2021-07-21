import React, { Component, useState, useRef, useEffect, createRef } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Radio,Button, Tooltip  } from 'antd';
import html2canvas from 'html2canvas';
import { ArrowUpOutlined, ArrowDownOutlined, FullscreenOutlined, FullscreenExitOutlined, VideoCameraAddOutlined, DownloadOutlined } from '@ant-design/icons';
import TooltipInfo from './components/TooltipInfo';
import style from './FullScreen.css';
import canvasStyle from '../../routes/EnergyManagerPage/EnergyManager.css';

function FullScreen(){
    const handleDownloadImg = ()=>{
        // html2canvas(this.renderDom, { allowTaint:false, useCORS:true})
        //     .then(canvas=>{
        //         let MIME_TYPE = "image/png";
        //         let url = canvas.toDataURL(MIME_TYPE);
        //         let linkBtn = document.createElement('a');
        //         linkBtn.download = '能源成本拟态图';
        //         linkBtn.href = url;
        //         linkBtn.dataset.downloadurl = [MIME_TYPE, linkBtn.download, linkBtn.href].join(':');
        //         document.body.appendChild(linkBtn);
        //         linkBtn.click();
        //         document.body.removeChild(linkBtn);
        //     })
    }

    // handleScale(){
    //     if ( this.state.zoom ){
    //         //  缩小回正常尺寸
    //         let canvasContainer = document.getElementsByClassName(canvasStyle['canvas-container'])[0];
    //         canvasContainer.appendChild(this.dom);
    //         document.body.removeChild(this.screenDom);
    //     } else {
    //         //  放大到全屏
    //         let screenDom = document.createElement('div');
    //         screenDom.style.width = '100%';
    //         screenDom.style.height = '100%';
    //         screenDom.style.position = 'absolute';
    //         screenDom.style.top = '0px';
    //         screenDom.style.left = '0px';
    //         screenDom.appendChild(this.dom);
    //         this.screenDom = screenDom;
    //         document.body.appendChild(screenDom);
    //     }
        
    //     this._fixImgWidth();
    //     this.setState({zoom:!this.state.zoom})
    // }

    // componentDidMount(){
    //     console.log('mounted')
    //     this._fixImgWidth();
    // }

    // componentDidUpdate(){
    //     this._fixImgWidth();
    //     console.log('update');
    // }
    
    // componentWillUnmount(){
    //     console.log('will unmount');
    //     this.dom = null;
    //     this.renderDom = null;
    //     this.imgContainer = null;
    //     this.screenDom = null;
    // }

    // _fixImgWidth(){
    //     const { sceneInfo : { imageInfo }} = this.props;
    //     const container = this.dom;
    //     if ( container && imageInfo ){
    //         //  根据容器宽度和图像实际宽度计算出横向的缩放比例
    //         let xRatio = container.offsetWidth/imageInfo.width;
    //         //  图像的实际高度乘以比例保证不变形
    //         let imgHeight = imageInfo.height*xRatio;
    //         this.imgContainer.style.width = container.offsetWidth +'px';
    //         this.imgContainer.style.height = imgHeight+'px';
    //     }  
    // }
    const [zoom, toggleZoom] = useState(false);
    const contentRef = useRef();
    console.log('fullscreen render()...');
    useEffect(()=>{
        setTimeout(()=>{
            console.log(contentRef);
            if ( contentRef && contentRef.current){
                console.log(contentRef.current.offsetWidth,contentRef.current.offsetHeight);
            }
            
        },500);
    });
    return (
        <div className={ zoom ? `${style['container']} ${style['zoom']}` : style['container']}>
                <div ref={contentRef} className={style['content-container']}>
                    <div 
                        className={style['img-container']} 
                        // ref={dom=>this.imgContainer=dom} 
                        // 通过this._fixImgWidth 动态调整图像容器的宽高，每次父容器宽高变化时自动更新
                    >
                        <img src={imgURL}  style={{width:'100%',height:'100%'}} />
                        {/* {
                            tags && tags.length
                            ?
                            
                            tags.map((tag,index)=>(
                                <Tooltip 
                                    key={index} 
                                    trigger="click" 
                                    placement="rightTop" 
                                    title={<TooltipInfo data={tag} />} 
                                    overlayClassName={style["tooltip"]}
                                >
                                    <div className={`${style['tag-container']} animate__animated animate__rotateInDownLeft`} style={{ left:tag.pos_left+'%', top:tag.pos_top+'%'}}>
                                        <div className={style['tag']}>{ tag.tag_name }</div>
                                        <div className={style['sub-tag']}>{`今日总成本: ${tag.cost}元`}</div>
                                    </div>
                                </Tooltip>                               
                            ))
                            :
                            null
                        } */}
                    </div>
                    {/* <div className={`${style['info-container']} animate__animated animate__bounceInLeft`}>
                        <div>今日能源成本竞争力</div>
                        <div className={style['text']}>排名<span style={{color:'red', padding:'0 4px'}}>1</span>位</div>
                    </div> */}
                </div>
                
                <div className={style['action-container']}>
                    <span onClick={()=>this.handleDownloadImg()}>
                        <DownloadOutlined />
                    </span>
                    <span onClick={()=>{
                        this.props.dispatch({type:'user/addToSlider'});
                        this.props.dispatch(routerRedux.push('/auto_slider'))
                    }}><VideoCameraAddOutlined /></span>
                    <span onClick={()=>this.handleScale()}>{ zoom ? <FullscreenExitOutlined /> : <FullscreenOutlined/>}</span>
                </div>
            </div>

    )
    // render(){
    //     const zoom = false;
    //     const { sceneInfo, imgURL } = this.props;
    //     const { scene, tags } = sceneInfo;
    //     console.log('fullscreen render()...');
    //     return (
    //         <div ref={dom=>this.dom = dom }  className={ zoom ? `${style['container']} ${style['zoom']}` : style['container']}>
    //             <div ref={dom=>this.renderDom = dom } className={style['content-container']}>
    //                 <div 
    //                     className={style['img-container']} 
    //                     ref={dom=>this.imgContainer=dom} 
    //                     // 通过this._fixImgWidth 动态调整图像容器的宽高，每次父容器宽高变化时自动更新
    //                 >
    //                     <img src={imgURL}  style={{width:'100%',height:'100%'}} />
    //                     {
    //                         tags && tags.length
    //                         ?
                            
    //                         tags.map((tag,index)=>(
    //                             <Tooltip 
    //                                 key={index} 
    //                                 trigger="click" 
    //                                 placement="rightTop" 
    //                                 title={<TooltipInfo data={tag} />} 
    //                                 overlayClassName={style["tooltip"]}
    //                             >
    //                                 <div className={`${style['tag-container']} animate__animated animate__rotateInDownLeft`} style={{ left:tag.pos_left+'%', top:tag.pos_top+'%'}}>
    //                                     <div className={style['tag']}>{ tag.tag_name }</div>
    //                                     <div className={style['sub-tag']}>{`今日总成本: ${tag.cost}元`}</div>
    //                                 </div>
    //                             </Tooltip>                               
    //                         ))
    //                         :
    //                         null
    //                     }
    //                 </div>
    //                 <div className={`${style['info-container']} animate__animated animate__bounceInLeft`}>
    //                     <div>今日能源成本竞争力</div>
    //                     <div className={style['text']}>排名<span style={{color:'red', padding:'0 4px'}}>1</span>位</div>
    //                 </div>
    //             </div>
                
    //             <div className={style['action-container']}>
    //                 <span onClick={()=>this.handleDownloadImg()}>
    //                     <DownloadOutlined />
    //                 </span>
    //                 <span onClick={()=>{
    //                     this.props.dispatch({type:'user/addToSlider', payload:{dom:this}});
    //                     this.props.dispatch(routerRedux.push('/auto_slider'))
    //                 }}><VideoCameraAddOutlined /></span>
    //                 <span onClick={()=>this.handleScale()}>{ zoom ? <FullscreenExitOutlined /> : <FullscreenOutlined/>}</span>
    //             </div>
    //         </div>
    //     );
    // }
    
}

export default FullScreen;
