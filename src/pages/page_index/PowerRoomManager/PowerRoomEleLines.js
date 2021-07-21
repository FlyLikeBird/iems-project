import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Radio, Spin } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { drawRoundRect, drawRoundRect2 } from './tools';

let infoBoxWidth = 70;
let infoBoxHeight = 120;
let infoBoxPadding = 20;
let topLine = 60;
let bottomLine = 30;
let offsetY = 6;
let marginTop = 20;
let machWidth = 20;
let machHeight = 24;

let arrowWidth =  6;

function d2a(n){
    n-=90;
    return n*Math.PI/180;
}
function drawArc(x, y, r, start, end, color){
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.arc(0, -machHeight/2, r, d2a(start), d2a(end), false );
    ctx.stroke();
    ctx.restore();
}

function drawMach(x, y, width, height, isWarning = false){
    let timer = null;
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    let xOffset = width/2;
    let yOffset = height/2;
    // 顺时针绘制
    ctx.rect(-xOffset, -yOffset, machWidth, machHeight);
    ctx.fillStyle = isWarning ? 'red' : '#1fc48d';
    ctx.fill();
    ctx.beginPath();
    ctx.rect(-xOffset+4, -yOffset+4, machWidth - 8, 4);
    ctx.arc(0, yOffset - 4 - 4 , 4, 0, Math.PI * 2, true);
    ctx.fillStyle = '#fff';
    ctx.fill();
    // 绘制信号icon
    let r = 6, count = 0;
    timer = setInterval(()=>{
        r+=4;
        count++;
        drawArc(leftPos + x , marginTop + y, r, -40, 40, isWarning ? 'red' : '#1fc48d');
        if ( count > 3 ){
            r = 6;
            count = 0;
            ctx.clearRect(leftPos + x - 20, marginTop + y - yOffset - 30, 40, 30 );
        }
    },500);
    timerList.push(timer);
    ctx.restore();
}

let ctx, bgCtx, containerWidth, containerHeight, contentWidth, contentHeight, leftPos = 0, timerList = [];

function drawArrow(ctx, point1, point2, offsetY){
    ctx.beginPath();
    ctx.arc(point1, contentHeight, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#707070';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(point2, contentHeight + topLine + bottomLine);
    ctx.lineTo(point2 + arrowWidth, contentHeight + topLine + bottomLine - 10);
    ctx.lineTo(point2 - arrowWidth, contentHeight + topLine + bottomLine - 10);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(point1, contentHeight);
    ctx.lineTo(point1, contentHeight + topLine - offsetY);
    ctx.lineTo(point2, contentHeight + topLine - offsetY);
    ctx.lineTo(point2, contentHeight + topLine + bottomLine );
    ctx.strokeStyle = '#707070';
    ctx.stroke();
}

function drawEleLines(ctx, data){    
    data.details.sort((a,b)=>+a.pos_left - +b.pos_left);
    let infoBoxStartPos = (containerWidth - data.details.length * ( infoBoxWidth + infoBoxPadding )) / 2;
    let infoBoxY = marginTop + contentHeight + topLine + bottomLine;
    data.details.forEach((mach, index)=>{
        let x = mach.pos_left / 100 * contentWidth;
        let y = mach.pos_top / 100 * contentHeight;
        ctx.save();
        ctx.translate(leftPos, marginTop);
        drawMach(x, y, machWidth, machHeight);
        let infoList = [];
        let infoBoxX = index * ( infoBoxWidth + infoBoxPadding );
        infoList.push({ value:mach.A, unit:'A'});
        infoList.push({ value:mach.Kw, unit:'kW'});
        infoList.push({ value:mach.Kvar, unit:'Kvar'});
        infoList.push({ value:mach.PF, unit:'PF'});
        // 绘制连接线
        drawArrow(ctx, x, (infoBoxStartPos + infoBoxX) - leftPos + infoBoxWidth/2, index*offsetY);
        ctx.restore();
        // 绘制底部信息框
        ctx.save();
        ctx.translate(infoBoxStartPos, infoBoxY);
        drawRoundRect2(ctx, infoBoxX,  infoBoxWidth, infoBoxHeight, 6, infoList );
        ctx.restore();
    });
}

function drawImg(bgCtx, img){
    contentHeight = containerHeight - marginTop - infoBoxHeight - 10 - topLine - bottomLine ;
    let ratio = contentHeight / img.height ;
    contentWidth = ratio * img.width;
    leftPos = ( containerWidth - contentWidth ) /2;
    let rightPos =  leftPos + contentWidth;
    bgCtx.drawImage(img, leftPos, marginTop, contentWidth, contentHeight );
}

function draw( bgCtx, ctx, data){
    ctx.clearRect(0, 0, containerWidth, containerHeight);
    bgCtx.clearRect(0, 0, containerWidth, containerHeight);
    if ( timerList.length ){
        timerList.forEach(item=>{
            window.clearInterval(item);
            item = null;
        });
        timerList = [];
    }
    if ( data.imgURL ) {
        drawImg(bgCtx, data.imgURL);
        drawEleLines(ctx, data);
    } else {
        let img = new Image();
        img.src = data.bg_image_path;
        img.onload = function(){
            data.imgURL = img;
            drawImg(bgCtx, img);
            drawEleLines(ctx, data);
        }
    }
}

function PowerRoomEleLines({ dispatch, powerRoom, user }){
    const containerRef = useRef();
    const [list, setList] = useState([]);
    const [current, setCurrent] = useState({});
    const currentRef = useRef();

    useEffect(()=>{
        currentRef.current = current;
    },[current]);
    useEffect(()=>{
        new Promise((resolve, reject)=>{
            dispatch({ type:'powerRoom/fetchEleLines', payload:{ resolve, reject }});
        })
        .then(data=>{
            setList(data);
            if ( data && data.length ){
                setCurrent(data[0]);
                let container = containerRef.current;
                let bgCanvas = document.createElement('canvas');
                let machCanvas = document.createElement('canvas');
                if ( container ){
                    containerWidth = container.clientWidth;
                    containerHeight = container.clientHeight;
                    bgCanvas.width = machCanvas.width = containerWidth;
                    bgCanvas.height = machCanvas.height = containerHeight;
                    bgCanvas.style.position = machCanvas.style.position = 'absolute';
                    bgCanvas.style.top = machCanvas.style.top = '0px';
                    bgCanvas.style.left = machCanvas.style.left = '0px';
                    bgCanvas.style.zIndex = '1';
                    machCanvas.style.zIndex = '10';
                    bgCtx = bgCanvas.getContext('2d');
                    ctx = machCanvas.getContext('2d');
                    draw(bgCtx, ctx, data[0]);
                    container.appendChild(bgCanvas);
                    container.appendChild(machCanvas);
                    // 后期加上canvas悬浮交互效果
                    // console.log(container.offsetLeft, container.offsetTop);
                    // machCanvas.addEventListener('mousemove', (e)=>{
                    //     console.log(e.clientX, e.clientY);

                    // })
                }
                
            }
        });
        
        return ()=>{
            // 清空所有定时器
            if ( timerList.length ){
                timerList.forEach((item)=>{
                    window.clearInterval(item);
                    item = null;
                })
            }
            timerList = [];
        }
    },[]);
    const radioStyle = {
        display: 'block',
        height: '24px',
        lineHeight: '24px',
        fontSize:'0.8rem',
        borderRadius:'0',
        marginTop:'-1px'
    };
    return (
        <div ref={containerRef} style={{ height:'100%', width:'100%' , backgroundColor:'#fff', borderRadius:'6px', position:'relative' }}>
            {
                list && list.length 
                ?
                <Radio.Group size='small' value={current.scene_id} style={{ position:'absolute', left:'10px', top:'10px', zIndex:'20' }} onChange={e=>{
                    let key = e.target.value;
                    let temp = list.filter(i=>i.scene_id == key)[0];
                    draw(bgCtx, ctx, temp);
                    setCurrent(temp);
                }}>
                    {
                        list.map((item,index)=>(
                            <Radio.Button key={item.scene_id} value={item.scene_id} style={radioStyle}>{ item.scene_name }</Radio.Button> 
                        ))
                    }
                </Radio.Group>
                :
                <Spin size='large' style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)'}} />
            }
            
        </div>
        
    )
    
    
}

export default connect(({ user, powerRoom })=>({ user, powerRoom }))(PowerRoomEleLines);