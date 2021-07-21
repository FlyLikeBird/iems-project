import React, { useRef, useState, useEffect, useMemo } from 'react';
import { routerRedux } from 'dva/router';
import { Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, RedoOutlined } from '@ant-design/icons';
// 父节点属性
const pNodeTitleHeight = 30;
const pNodeWidth = 180;
const pNodeHeight = 80;
const pNodePadding = 20;
const pNodeMargin = 40;
const radius = 4;
const lineRadius = 2;
const progressHeight = 4;
const fontSize = 12;
const bigFontSize = 16;
const fontColor = '#000';
// 线条属性
const lineOffset = pNodeWidth/2;
const lineWidth = 1;
const lineColor = '#ccc';
const busLineHeight = 40;
const branchLineHeight = 40;
let loaded = false;
let treeData = [];
// 图形最大宽度，最大高度
let graphMaxWidth = 0, graphMaxHeight = 0;

let moveX = 0, moveY = 0, offset_left = 0, offset_top = 0, canDrag = false, triggerClick = true;
// parentNode 是相对的父节点 ，rootNode 是固定的第二级父节点
function formatData(sourceData, node = sourceData, deep = 0, index, parentNode = null, rootNode = null ){
    if ( loaded ) return ;
    node.deep = deep;
    // 第二级节点
    if ( deep === 1 ){ 
        node.childDeep = 0;
        node.childCount = 0;
        node.posX = 0;
        node.posY = pNodeHeight + busLineHeight + branchLineHeight + pNodeMargin;
        // 累计前一个同级节点所有子节点所占的宽度总和
        for(let i=0;i<index;i++){
            let childDeep = sourceData.children[i].childDeep;
            node.posX +=  pNodeWidth + ( childDeep === 0 ? 0 : (childDeep - 1)  * pNodeWidth ) + pNodeMargin;
        }
        rootNode = node;
        // 记录根节点下最后一个父节点的位置
        sourceData.lastNodePos = node.posX;
    }
    // 深层级子节点
    if ( deep >= 2 ){
        node.childIndex = rootNode.childCount;
        node.posX = parentNode.posX + pNodeWidth;
        node.posY = rootNode.posY +  node.childIndex  * ( pNodeHeight + pNodePadding ) ;
        node.marginTop = parentNode.posY + pNodeHeight;
    }
    
    if(node.children && node.children.length){
        node.children.map((item, index)=>{
            let temp = deep;
            let nextDeep = ++temp;
            // 判断条件确保只保存最深层节点的层级数
            if ( rootNode && ( rootNode.childDeep <= nextDeep ) ){
                rootNode.childDeep = nextDeep;
            }
            // 记录父节点下所有的子节点个数
            if ( rootNode ){
                rootNode.childCount = rootNode.childCount + 1;
            }
            formatData(sourceData, item, nextDeep, index, node, rootNode);
        })
    } 
}

function createNode( node, data, onDispatch ){
    let posX = node.deep === 0 ? ( node.children && node.children.length === 1 ? 0 : ( graphMaxWidth - pNodeWidth ) / 2 ) : node.posX;
    let posY = node.deep === 0 ? pNodeMargin : node.posY;
    // let pointX = posX - ( pNodeWidth/2 - lineOffset );
    let pointX  = posX - pNodeWidth/2;
    let pointY = node.marginTop;
    let temp = node.quota ? (node.energy/node.quota*100).toFixed(1) : 0.0;
    let percent = node.quota ? +temp >= 100 ? pNodeWidth : temp : 0;
    let bgColor = node.quota && node.energy >= node.quota  ? '#f56363' : '#65cae3';
    // console.log(data);
    return (
        <g key={node.key} style={{ cursor:'pointer' }} onClick={()=>{
            if ( triggerClick ){
                onDispatch({type:'fields/toggleAttr', payload:node});
                onDispatch({type:'efficiencyQuota/fetchTree'});
            } 
        }}>
            <rect rx={radius} ry={radius} x={posX} y={posY} width={pNodeWidth} height={pNodeHeight} style={{ fill:'#fff', stroke:'#ccc', strokeWidth:1 }} />
            <rect rx={radius} ry={radius} x={posX} y={posY} width={pNodeWidth} height={pNodeTitleHeight} style={{ fill:bgColor }} />
            <text alignmentBaseline='middle' x={posX + 10} y={posY+pNodeTitleHeight/2} style={{ fill:'#fff'}}>{ node.title }</text>
            <text alignmentBaseline='middle' x={posX + 10} y={posY+pNodeTitleHeight + fontSize * 1.5 }>
                <tspan style={{ fontSize:bigFontSize, fontWeight:'bold', fill:fontColor }}>{ Math.floor(node.energy) }</tspan>
                <tspan dx={4} style={{ fontSize:fontSize, fill:'#ccc' }}>kwh</tspan>
            </text>
            <text alignmentBaseline='middle' x={posX + 10} y={posY+pNodeTitleHeight + fontSize * 2 * 1.5  }>
                <tspan style={{ fontSize:fontSize, fill:'#ccc' }}>定额值:{ node.quota }</tspan>
                <tspan dx={4} style={{ fontSize:fontSize, fill:'#ccc' }}>kwh</tspan>
                <tspan dx={4} style={{ fontSize:fontSize, fill:'#ccc' }}>{`(${ node.quota ? (node.energy / node.quota * 100 ).toFixed(1) : 0.0 }%)`}</tspan>
            </text>
            <rect rx={lineRadius} ry={lineRadius} x={posX} y={ posY + pNodeHeight - progressHeight} width={pNodeWidth} height={progressHeight} style={{ fill:'#e8e8e8' }} />
            <rect rx={lineRadius} ry={lineRadius} x={posX} y={ posY + pNodeHeight - progressHeight} width={percent} height={progressHeight} style={{ fill:bgColor }} />
            {
                node.deep === 0 && node.children
                ?
                <g>
                    <line key='1' x1={ node.children.length === 1 ? pNodeWidth/2 : graphMaxWidth/2} y1={pNodeHeight + pNodeMargin} x2={ node.children.length === 1 ? pNodeWidth/2 : graphMaxWidth/2} y2={pNodeMargin + pNodeHeight + busLineHeight } style={{ fill:'none', stroke:lineColor, strokeWidth:lineWidth }} />
                    {
                        node.children.length === 1 
                        ?
                        null
                        :
                        <line key='2' x1={lineOffset} y1={ pNodeMargin + pNodeHeight + busLineHeight} x2={node.lastNodePos + lineOffset } y2={ pNodeMargin + pNodeHeight+busLineHeight} style={{ fill:'none', stroke:lineColor, strokeWidth:lineWidth }} />
                    }
                </g>
                :
                node.deep === 1
                ?
                <line 
                    // 如果只有一个父级节点，中线对齐
                    x1={ data.children && data.children.length === 1 ? posX + pNodeWidth/2 : posX+lineOffset} 
                    y1={posY} 
                    x2={ data.children && data.children.length === 1 ? posX + pNodeWidth/2 : posX+lineOffset} 
                    y2={posY-branchLineHeight} 
                    style={{ fill:'none', stroke:lineColor, strokeWidth:lineWidth }}
                ></line>
                :
                node.deep >= 2
                ?
                <polyline 
                    points={`${pointX},${pointY} ${pointX},${posY+pNodeHeight/2} ${posX},${posY+pNodeHeight/2}`}
                    style={{ fill:'none', stroke:lineColor, strokeWidth:lineWidth }}
                />
                :
                null
            }

        </g>
    )
}

function createNodeTree(node, sourceData, onDispatch ){
    if ( loaded ) return ;
    treeData.push(createNode(node, sourceData, onDispatch));
    if ( node.children && node.children.length ){
        node.children.map((childNode)=>{
            createNodeTree(childNode, sourceData, onDispatch );
        })
    }
}

function getGraphMaxWidth(data){
    // console.log(data);
    graphMaxWidth = 0;
    graphMaxHeight = 0;
    if ( !data.children ){
        graphMaxWidth = pNodeWidth;
        graphMaxHeight = pNodeHeight;
    } else {
        let temp = data.children.concat().sort((a,b)=>b.childCount - a.childCount);
        if ( data.children.length === 1 ){
            graphMaxWidth += pNodeWidth + ( data.children[0].childDeep === 0 ?  0 : data.children[0].childDeep - 1 ) * pNodeWidth ; 
            graphMaxHeight += pNodeMargin + pNodeHeight + busLineHeight + branchLineHeight + pNodeHeight + pNodePadding + data.children[0].childCount * ( pNodePadding + pNodeHeight );
        } else {
            data.children.forEach((node,index)=>{
                graphMaxWidth += pNodeWidth + ( node.childDeep === 0 ? 0 : node.childDeep - 1 ) * pNodeWidth + pNodeMargin;
            });
            graphMaxWidth = graphMaxWidth - pNodeMargin;
            graphMaxHeight = pNodeMargin + pNodeHeight + busLineHeight + branchLineHeight + pNodeHeight + pNodePadding + temp[0].childCount * ( pNodeHeight + pNodePadding );
        }
        // console.log(graphMaxWidth, graphMaxHeight);
    }
}
// 树状图数据渲染机制是递归从最外层到最内层
function EfficiencyTree({ data, onDispatch, currentField, currentAttr, forReport }) {   
    let containerRef = useRef(null);
    let [transformInfo, setTransformInfo] = useState('');
    let [globalScale, setGlobalScale] = useState(1);
    // 添加层级标签
    formatData(data);
    getGraphMaxWidth(data);
    // 渲染树组件
    createNodeTree(data, data, onDispatch);
    loaded = true;
    useEffect(()=>{
        // 限制树图在容器内
        if ( containerRef && containerRef.current ){
            let container = containerRef.current;
            let containerWidth = container.offsetWidth ;
            let containerHeight = container.offsetHeight ;
            // console.log(containerWidth, containerHeight);
            // console.log(graphMaxWidth,graphMaxHeight);
            let xRatio = graphMaxWidth / containerWidth;
            let yRatio = graphMaxHeight / containerHeight ;
            // console.log(xRatio, yRatio);
            let transformInfo, xMove, yMove, finalRatio;
            // 如果树图包含在容器中，则不缩放，定位至中心即可
            if ( xRatio <= 1 && yRatio <= 1) {
                xMove = (containerWidth - graphMaxWidth)/2;
                yMove = (containerHeight - graphMaxHeight)/2;
                transformInfo = `translate(${xMove}, ${yMove})`;
                setTransformInfo(transformInfo);
            } else {
                // x轴或者y轴方向超出容器，开启缩放
                if ( xRatio <= yRatio ) {
                    // Y轴方向缩放
                    finalRatio = 1/yRatio;
                    yMove = 0;
                    // 最后除以finalRatio是考虑到scale会影响到translate的距离
                    xMove = ( containerWidth - graphMaxWidth * finalRatio ) /2 /finalRatio;
                    setTransformInfo(`scale(${finalRatio}) translate(${xMove}, ${yMove})`);
                } else {
                    // X轴方向缩放
                    finalRatio = 1/xRatio;
                    xMove = 0;
                    yMove = ( containerHeight - graphMaxHeight*finalRatio) /2/finalRatio ;
                    setTransformInfo(`scale(${finalRatio}) translate(${xMove},${0}) `);
                }
            }
            // 添加滚轮事件
            const handleScale = (e)=>{
                e.preventDefault();
                e.stopPropagation();
                setGlobalScale(scaleRatio=>{
                    let temp;
                    if ( e.wheelDelta < 0 ){
                        temp = scaleRatio * 0.8;
                    } else {
                        temp = scaleRatio * 1.2;
                    }
                    return temp;
                })
            }
            // 添加滚轮缩放事件
            container.addEventListener('mousewheel',handleScale);
            // 拖动事件开始
            const handleMouseDown = (e)=>{
                e.stopPropagation();
                e.preventDefault();
                let x = e.clientX, y = e.clientY;
                moveX = x;
                moveY = y;
                offset_left = container.offsetLeft;
                offset_top = container.offsetTop;
                container.style.cursor = 'move';
                canDrag = true;
                triggerClick = true;
            }
            const handleMouseMove = (e)=>{
                e.stopPropagation();
                e.preventDefault();
                if ( !canDrag ) return ;
                let currentX = e.clientX, currentY = e.clientY;
                container.style.left = currentX -  moveX  + offset_left  + 'px';
                container.style.top = currentY -  moveY  + offset_top  + 'px';
                triggerClick = false;
                // console.log(e.clientX, e.clientY);
            }
            const handleMouseUP = (e)=>{
                e.stopPropagation();
                e.preventDefault();
                canDrag = false;
                container.style.cursor = 'default';
            }
            container.addEventListener('mousedown', handleMouseDown);
            container.addEventListener('mouseup', handleMouseUP);   
            window.addEventListener('mousemove', handleMouseMove);
            return ()=>{
                container.removeEventListener('mousewheel',handleScale);
                container.removeEventListener('mousedown', handleMouseDown);
                container.removeEventListener('mouseup', handleMouseUP);
                window.removeEventListener('mousemove', handleMouseMove);
                loaded = false;
                treeData = [];
            }
        }
    },[]);
    return (     
        <div style={{ height:'100%', position:'relative', overflow:'hidden' }} >
            <div style={{ position:'absolute', top:'50%', left:'20px', marginTop:'-16px', zIndex:'100' }}>
                <Button shape='circle' icon={<RedoOutlined />} onClick={(e)=>{
                    e.stopPropagation();
                    setGlobalScale(1);
                    let container = containerRef.current;
                    if ( container ){
                        container.style.left = '0px';
                        container.style.top = '0px';
                    }
                }} />
            </div>
            <div 
                style={{ 
                    position:'absolute', 
                    width:'100%', 
                    height:'100%', 
                    top:'0', 
                    left:'0', 
                    transform:`scale(${globalScale})`
                }}  
                ref={containerRef} 
            >
                
                <svg id='my-svg' width='100%' height='100%' style={{ backgroundColor: forReport ? '#f7f7f7' : '#fff'}} >
                    <g 
                        transform={transformInfo}
                    >    
                        {
                            treeData
                        }      
                    </g>
                </svg>
            </div>
        </div>
        
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(EfficiencyTree, areEqual);
