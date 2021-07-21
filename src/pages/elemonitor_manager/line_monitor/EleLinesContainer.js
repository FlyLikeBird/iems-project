import React, { useEffect, useRef, useState } from 'react';
import { Radio, Modal, Button, Spin } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';
import style from '../EleMonitor.css'
import ChartContainer from './ChartContainer';
import html2canvas from 'html2canvas';

var btnWidth = 54, btnHeight = 26, padding = 14;
function drawImage(ctx, img, width, height){
    // console.log('draw');
    ctx.drawImage(img, 0, 0, width, height);
}

function drawRoundRect(ctx, x, y, width, height, radius, data){
    // 左上角
    ctx.save();
    ctx.translate(x,y);
    // 绘制圆角矩形
    ctx.beginPath();
    ctx.arc(-(width/2 - radius), radius, radius, Math.PI, Math.PI * 1.5);
    ctx.lineTo(width/2 - radius, 0);
    ctx.arc(width/2 - radius, radius, radius, Math.PI * 1.5, Math.PI * 2);
    ctx.lineTo(width/2, height - radius);
    ctx.arc(width/2- radius, height - radius, radius, 0, Math.PI / 2);
    ctx.lineTo(-(width/2 - radius), height);
    ctx.arc(-(width/2 - radius), height - radius, radius, Math.PI/2, Math.PI);
    ctx.closePath();
    var linearGradient = ctx.createLinearGradient(0,0,0,height);
    linearGradient.addColorStop(0,'#079efd');
    linearGradient.addColorStop(1,'#6c36f2');
    ctx.fillStyle = linearGradient;
    ctx.fill();
    // 渲染button文字 
    ctx.beginPath();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.fillText( '详情', 0, height/2);
    // 渲染电表数据
    ctx.textAlign = 'start';
    ctx.textBaseline = 'top';
    data.forEach((item,index)=>{
        ctx.beginPath();
        ctx.fillStyle = item.type === 'A' ? '#eff400' : item.type === 'B' ? '#00ff00' : item.type === 'C' ?  '#ff0000' :'#079efd';
        ctx.fillText(`${item.title}:${item.value} ${item.unit}`, -width/2, padding + height + index * 20 );
        ctx.closePath();
    })
    ctx.restore();
}

function drawInfo(ctx, x, y, data){
    let obj = [
        { title:'Uab', value:Math.round(data.U12), unit:'V', type:'A'},
        { title:'Ubc', value:Math.round(data.U23), unit:'V', type:'B'},
        { title:'Uca', value:Math.round(data.U31), unit:'V', type:'C'},
        { title:'Ia', value:Math.round(data.A1), unit:'A', type:'A'},
        { title:'Ib', value:Math.round(data.A2), unit:'A', type:'B'},
        { title:'Ic', value:Math.round(data.A3), unit:'A', type:'C'},
        { title:'PF', value:(+data.PF).toFixed(2), unit:'cosΦ' }
    ];
    drawRoundRect(ctx, x, y, btnWidth, btnHeight, 4, obj);
}

function getImageBlob(url, cb) {
    var xhr = new XMLHttpRequest();    
    xhr.open('get', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function() {
    // if(this.status == 200) {
    //     var img = new Image();
    //     img.onload = function() {
            
    //     }   
    //     img.src = URL.createObjectURL(this.response);             
    //     }
    };
    xhr.send();
}

let canvas, ctx;
let id = 0;
function EleLinesContainer({ currentScene, dispatch, eleDetail, startDate, timeType, isLoading }){
    console.log(eleDetail);
    const containerRef = useRef();
    const [currentMach, setCurrentMach] = useState('');
    const machPos = useRef({});
    const sceneRef = useRef();
    useEffect(()=>{
        let container = containerRef.current;
        canvas = document.createElement('canvas');
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        ctx = canvas.getContext('2d');
        function handleClick(e){
            // console.log('click');
            let x = e.clientX - canvas.getBoundingClientRect().left;
            let y = e.clientY - canvas.getBoundingClientRect().top;
            // console.log(machPos.current);
            // console.log(sceneRef.current);
            Object.keys(machPos.current).forEach(key=>{
                let { x0, x1, y0, y1 } = machPos.current[key];
                if ( x >= x0 && x<= x1 && y >= y0 && y <= y1 ) {
                    let temp = sceneRef.current.details.filter(i=>i.mach_id == key )[0];
                    setCurrentMach(temp);
                }
            })
        }
        containerRef.current.appendChild(canvas); 
        canvas.addEventListener('click', handleClick);  
        return ()=>{
            canvas.removeEventListener('click', handleClick);
            canvas = null;
            ctx = null;
        }
    },[])
    useEffect(()=>{
        let container = containerRef.current;
        // console.log(container.offsetLeft,container.offsetTop);
        // 清空上次绘制的电路图
        sceneRef.current = currentScene;
        ctx.clearRect(0,0,canvas.width, canvas.height);
        let img = new Image();
        img.src = currentScene.bg_image_path;
        img.onload = ()=>{
            
            let heightRatio = ( container.offsetHeight - ( padding * 2 + btnHeight + 7 * 20) ) / img.height;
            let widthRatio = ( container.offsetWidth - 20)  / img.width;
            let finalRatio = widthRatio > heightRatio ? heightRatio : widthRatio;
            let fixHeight = img.height * finalRatio;
            let fixWidth = img.width * finalRatio;
            let offsetWidth = (container.offsetWidth - fixWidth ) / 2;
            ctx.save();
            ctx.translate( offsetWidth, 4); 
            drawImage(ctx, img, fixWidth, fixHeight);
            currentScene.details.forEach(item=>{
                let x,y;
                if ( item.direc === 'bottom'){
                    x = fixWidth * item.pos_left / 100 ;
                    y = fixHeight + 10;
                } else if ( item.direc === 'right'){
                
                }
                machPos.current[item.mach_id] = { x0:Math.round( offsetWidth + x - btnWidth/2),x1:Math.round( offsetWidth + x + btnWidth/2), y0:y, y1:y+btnHeight };
                drawInfo(ctx, x, y, item);
            })
            ctx.restore();
           
        }
       
    },[currentScene]);
    
    return (
        <div style={{ height:'100%', position:'relative' }}>
            <Button type='primary' style={{ position:'absolute', top:'10px', left:'10px' }} onClick={()=>{
               
                    // let MIME_TYPE = "image/png";
                    // let url = canvas.toDataURL(MIME_TYPE);
                    // console.log(url);
                    // // 生成一个a元素
                    // var a = document.createElement('a')
                    // // 创建一个单击事件
                    // var event = new MouseEvent('click')                    
                    // // 将a的download属性设置为我们想要下载的图片名称，若name不存在则使用‘下载图片名称’作为默认名称
                    // a.download = '线路图';
                    // // 将生成的URL设置为a.href属性
                    // a.href = url
                    // // 触发a的单击事件
                    // a.dispatchEvent(event);
                    
                
            }}><FileImageOutlined /></Button>
            <Modal
                visible={ currentMach ? true : false }
                footer={null}
                className={style['custom-modal']}
                width='86vw'
                height='86vh'
                bodyStyle={{ padding:'24px 36px 24px 24px' }}
                destroyOnClose={true}
                onCancel={()=>{
                    setCurrentMach('');
                    dispatch({ type:'eleMonitor/resetDetail'});
                }}
            >
                
                <ChartContainer currentMach={currentMach} dispatch={dispatch} isLoading={isLoading} data={eleDetail} startDate={startDate} timeType={timeType} />
                   
            </Modal>
            <div ref={containerRef} style={{ height:'100%' }}></div>
        </div>
    )
}

export default EleLinesContainer;