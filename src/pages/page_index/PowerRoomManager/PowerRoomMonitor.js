import React, { useEffect, useRef, useState } from 'react';
import { Topology, registerNode } from '@topology/core';
import transformerImg from '../../../../../public/power-room/transformer.png';
import inline from '../../../../../public/power-room/inline.png';
import connect from '../../../../../public/power-room/connect.png';
import feedback from '../../../../../public/power-room/feedback.png';
import { Pagination, Radio, Button } from 'antd';
import { RedoOutlined } from '@ant-design/icons';

let initScale, initOffsetLeft, initOffsetTop;
let machHeight = 100;
const machNameMap = {
    '变压器':transformerImg,
    '进线柜':inline,
    '馈电柜':feedback,
    '联络柜':connect,
    '受总柜':inline,
    '电容柜':inline
};

let offsetLeft = 0, offsetTop = 0, pointX = 0, pointY = 0, canMove= false; 
function PowerRoomMonitor({ data }){
    const containerRef = useRef();
    const contentRef = useRef();
    const [scaleRatio, setScaleRatio] = useState('1');
    // current指当前的配电房信息
    const [currentScene, setCurrentScene] = useState(data[0]);
    const currentSceneRef = useRef(currentScene);

    function fixLayout(){
        // 调整初始化缩放比例
        // 计算图像内容区的总宽度和高度
        // 变压器图片398 * 304
        let container = containerRef.current;
        let content = contentRef.current;
        let totalWidth, totalHeight;
        if ( currentSceneRef && currentSceneRef.current ){
            let mostMachTransformer = currentSceneRef.current.transformer.concat().sort((a,b)=>b.son.length - a.son.length )[0];
            if ( mostMachTransformer ){
                totalWidth = 60 + 130 + 60 + 58 * mostMachTransformer.son.length;
                totalHeight = currentSceneRef.current.transformer.length * 100 + ( currentSceneRef.current.transformer.length ? currentSceneRef.current.transformer.length - 1 : 0) * 30;
                // console.log(totalWidth, totalHeight);
                if ( totalWidth < container.clientWidth && totalHeight < container.clientHeight ){
                    // 在容器内，仅调整定位
                    initOffsetLeft = ( container.clientWidth - totalWidth ) /2;
                    initOffsetTop = ( container.clientHeight - totalHeight ) / 2;
                    content.style.left =  initOffsetLeft + 'px';
                    content.style.top = initOffsetTop + 'px'; 
                    initScale = '1';
                    setScaleRatio('1');
                } else {
                    // 30是顶部padding值
                    let verticalRatio = totalHeight / ( container.clientHeight - 30);
                    let horizonRatio = totalWidth / container.clientWidth;
                    let baseDirection = verticalRatio < horizonRatio ? 'horizon' : 'vertical';
                    let finalRatio = baseDirection === 'horizon' ? horizonRatio : verticalRatio ;
                    let fixWidth, fixHeight;
                    // console.log(verticalRatio, horizonRatio);
                    // console.log(totalWidth, totalHeight);
                    initScale = 1/finalRatio;
                    initOffsetLeft = -( totalWidth - container.clientWidth )/2;
                    initOffsetTop = -( totalHeight - container.clientHeight) /2;
                    content.style.left =  initOffsetLeft + 'px';
                    content.style.top = initOffsetTop + 'px';
                    setScaleRatio(1/finalRatio);

                }
            } else {
                // 如果场景下没有挂载变压器，则清空dom的状态
                setScaleRatio('1');
                content.style.width = container.clientWidth + 'px';
                content.style.height = container.clientHeight + 'px';
                content.style.top = '0px';
                content.style.left = '0px';
            }
        } 
    }
    useEffect(()=>{
        currentSceneRef.current = currentScene;
        fixLayout();
    },[currentScene])
    useEffect(()=>{
        let container = containerRef.current;
        let content = contentRef.current;
        const handleScale = (e)=>{
            e.preventDefault();
            e.stopPropagation();
            if ( currentSceneRef.current && currentSceneRef.current.transformer.length ) {
                setScaleRatio(scaleRatio=>{
                    let temp;
                    if ( e.wheelDelta < 0 ){
                        temp = scaleRatio * 0.8;
                        if ( temp <= 0.3 ) {
                            return scaleRatio;
                        }
                    } else {
                        temp = scaleRatio * 1.2;
                        if ( temp >= 5 ){
                            return scaleRatio;
                        }
                    }
                    return temp;
                })
            }
        }
        const handleMouseDown = e=>{
            e.stopPropagation();
            e.preventDefault();
            pointX = e.clientX;
            pointY = e.clientY;
            offsetLeft = content.offsetLeft;
            offsetTop = content.offsetTop;
            // console.log(offsetLeft, offsetTop);
            if ( currentSceneRef.current && currentSceneRef.current.transformer.length ){
                canMove = true;
                content.style.cursor = 'move';
            }
        }
        const handleMouseMove = e=>{
            if ( canMove ){
                e.preventDefault();
                e.stopPropagation();
                content.style.left = offsetLeft + e.clientX - pointX + 'px';
                content.style.top = offsetTop + e.clientY - pointY + 'px';
            }   
        }
        const handleMouseUp = e=>{
            e.stopPropagation();
            e.preventDefault();
            canMove = false;
            content.style.cursor = 'default';
        }
       
        const handleResize = e=>{
            fixLayout();
        }
        content.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        content.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('mousewheel',handleScale);
        // window.addEventListener('resize', handleResize);
        return ()=>{
            container.removeEventListener('mousewheel', handleScale);
            content.removeEventListener('mousedown', handleMouseDown);
            content.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
            // window.removeEventListener('resize', handleResize);
        }
    },[]);
    
    return (
        <div style={{ height:'100%', position:'relative', overflow:'hidden' }}>
            {/* 场景切换 */}
            <div style={{ position:'absolute', top:'10px', left:'50%', zIndex:'10', transform:'translateX(-50%)', display:'flex', alignItems:'center', whiteSpace:'nowrap'}}>
                <span style={{ marginRight:'10px'}}>配电房</span>
                <Radio.Group className='radio-group' size='small' value={currentScene.scene_id} onChange={e=>{
                    let key = e.target.value;
                    let temp = data.filter(i=>i.scene_id == key)[0];
                    setCurrentScene(temp);
                }}>
                    {
                        data.map(( item, index)=>(
                            <Radio.Button key={item.scene_id} value={item.scene_id}>{ index + 1 }</Radio.Button> 
                        ))
                    }
                </Radio.Group>
            </div>
            {/* 恢复初始状态 */}
            <div style={{ position:'absolute', left:'10px', top:'10px', zIndex:'10' }}>
                <Button size='small' shape='circle' icon={<RedoOutlined />} onClick={(e)=>{
                    e.stopPropagation();
                    setScaleRatio(initScale);
                    if ( contentRef.current ){

                        contentRef.current.style.left = initOffsetLeft + 'px';
                        contentRef.current.style.top = initOffsetTop + 'px';
                    }
                    // console.log(initScale, initOffsetLeft, initOffsetTop);

                }} />
                <span style={{ fontWeight:'bold', marginLeft:'4px' }}>{ currentScene && currentScene.scene_name }</span>
            </div>
            
            <div ref={containerRef} style={{ width:'100%', height:'100%'}}>
                <div ref={contentRef} style={{ 
                    position:'absolute',
                    transform:`scale(${scaleRatio})`
                }}>
                    {
                        currentScene.transformer.length 
                        ?
                        currentScene.transformer.map((transformer,index)=>(
                            <div key={transformer.transformer} style={{ position:'relative', height:machHeight + 'px', marginBottom:'30px', whiteSpace:'nowrap' }}>
                                {/* 进线 */}
                                <div style={{ position:'relative', display:'inline-block', verticalAlign:'top', height:'100%', width:'60px' }}>
                                    <div style={{ position:'absolute', width:'50px', top:'50%', height:'1px', backgroundColor:'#5e5e5e'}}></div>
                                    <div style={{ position:'absolute', top:'30%', fontWeight:'bold' }}>
                                        { transformer.in_volt >= 1000 ? Math.floor(transformer.in_volt/1000) : transformer.in_volt  }
                                        { transformer.in_volt >= 1000 ? 'KV' : 'V' } 
                                    </div>
                                    <div style={{ width:0, height:0, borderTop:'6px solid transparent', borderBottom:'6px solid transparent', borderLeft:'10px solid #616161', position:'absolute', right:'0', top:'50%', marginTop:'-6px'}}></div>
                                </div>
                                <div style={{ position:'relative', display:'inline-block', verticalAlign:'top', height:'100%'}}>
                                    <img src={transformerImg} style={{ height:'100%' }}/>
                                    <div style={{ position:'absolute', bottom:'-20px', left:'50%', transform:'translateX(-50%)', fontSize:'0.6rem' }}>{ transformer.transformer }</div>
                                </div>
                                {/* 出线 */}
                                <div style={{ position:'relative', display:'inline-block', verticalAlign:'top', height:'100%', width:'60px' }}>
                                    <div style={{ position:'absolute', width:'50px', top:'50%', height:'1px', backgroundColor:'#5e5e5e'}}></div>
                                    <div style={{ position:'absolute', left:'4px', top:'30%', fontWeight:'bold' }}>
                                        { transformer.out_volt >= 1000 ? Math.floor(transformer.out_volt/1000) : transformer.out_volt  }
                                        { transformer.out_volt >= 1000 ? 'KV' : 'V' } 
                                    </div>
                                    <div style={{ width:0, height:0, borderTop:'6px solid transparent', borderBottom:'6px solid transparent', borderLeft:'10px solid #616161', position:'absolute', right:'0', top:'50%', marginTop:'-6px'}}></div>
                                </div>
                                {
                                    transformer.son.map((mach,index)=>(
                                        <div key={mach.mach_id} style={{ position:'relative', display:'inline-block', verticalAlign:'top', height:'100%'}}>
                                            <img src={ machNameMap[Object.keys(machNameMap).filter(key=>mach.transformer.includes(key))[0]] } style={{ height:'100%' }} />
                                            <div style={{ position:'absolute', bottom:'-20px', left:'50%', transform:'translateX(-50%)', whiteSpace:'nowrap', fontSize:'0.6rem'}}>{ mach.transformer }</div>
                                        </div>
                                    ))
                                }
                                {/* 进线出线 */}
                                
                            </div>
                        ))
                        :
                        <div style={{ display:'inline-block', position:'absolute', left:'50%', top:'50%', transform:'translate(-50%, -50%)'}}>该配电房下没有挂载变压器</div>
                    }
                </div> 
            </div>
        </div>
    )
}

export default PowerRoomMonitor;