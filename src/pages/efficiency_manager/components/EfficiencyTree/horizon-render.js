import React, { useRef, useState, useEffect, useMemo } from 'react';
import { routerRedux } from 'dva/router';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
let loaded = false;
// 父节点属性
const pNodeTitleHeight = 30;
const pNodeWidth = 150;
const pNodeHeight = 100;
const pNodePadding = 10;
const radius = 4;
const progressHeight = 6;
// 子节点属性
const cNodeWidth = 40;
const cNodeHeight = 100;
const cNodePadding = 10;
const fontSize = 14;
// 线条属性
const lineWidth = 1;
const lineColor = '#000';
const busLineHeight = 40;
const branchLineHeight = 40;
// 图形最大宽度，最大高度
let graphMaxWidth, graphMaxHeight;
// deep 表示树结构的层级关系
let treeData;
const sameLevelNodes = {};
function formatData(data, deep = 0, index){
    if ( loaded ) return ;
    data.deep = deep;
    // 将同一层级节点信息缓存起来
    if ( !sameLevelNodes[deep] ){
        sameLevelNodes[deep] = [];
        sameLevelNodes[deep].push(data);
    } else {
        sameLevelNodes[deep].push(data);
    }
    if(data.children && data.children.length){
        data.children.map((item, index)=>{
            let temp = deep;
            formatData(item, ++temp, index);
        })
    } 
}

function findChildNodeIndex(nodeArr, childNode){
    let index = 0;
    console.log(childNode);
            console.log(nodeArr);
    if ( nodeArr && nodeArr.length ){
        for(var i=0;i<nodeArr.length;i++){
            
            if ( nodeArr[i].key === childNode.key ) {
                index = i;
                break;
            }
        }
    }
    return index;
}
   
function createChildNode( data, x, y, maxHeight ){
    return (
        <g>
            <rect rx={radius} ry={radius} x={x} y={y} width={cNodeWidth} height={maxHeight} ></rect>
            <rect rx={radius} ry={radius} x={x} y={y + maxHeight - progressHeight} width={cNodeWidth} height={progressHeight} style={{ fill:'#ccc'}}></rect>
            <text fill='#fff' fontSize={fontSize} textAnchor='middle' x={x+cNodeWidth/2} y={y+fontSize}>
                {
                    data.text.split('').map((text,index)=>(
                        <tspan x={x+cNodeWidth/2} dy={fontSize}>{ text }</tspan>
                    ))
                }
            </text>
        </g>
    )
}

function createParentNode( data, x, y){
    return (
        <g>
            <rect rx={radius} ry={radius} x={x} y={y} width={pNodeWidth} height={pNodeHeight} style={{ fill:'#fff', stroke:'#ccc', strokeWidth:1 }} />
            <rect rx={radius} ry={radius} x={x} y={y} width={pNodeWidth} height={pNodeTitleHeight} />
            <text alignmentBaseline='middle' x={x} y={y+40} >25968 kwh</text>
            <text alignmentBaseline='middle' x={x} y={y+80}>定额值:000kwh</text>
            <rect rx={radius} ry={radius} x={x} y={ y + pNodeHeight - progressHeight} width={pNodeWidth} height={progressHeight} style={{ fill:'blue' }} />
        </g>
    )
}


// 树状图数据渲染机制是递归从最外层到最内层
function EfficiencyTree({ data, onDispatch, currentField, currentAttr }) {   
    let containerRef = useRef(null);
    let [transformInfo, setTransformInfo] = useState('');
    let [globalScale, setGlobalScale] = useState(1);
    // 添加层级标签
    formatData(data);
    // 设置同层级节点信息
    loaded = true;
    console.log(sameLevelNodes);
    treeData = Object.keys(sameLevelNodes).map(key=>sameLevelNodes[key]);
    console.log(treeData);
    graphMaxWidth = treeData.length && treeData[treeData.length-1].length * ( pNodePadding *2 + pNodeWidth );
    graphMaxHeight = treeData.length && ( treeData.length * pNodeHeight +  ( treeData.length - 1 ) * (busLineHeight + branchLineHeight)) ;
    useEffect(()=>{
        // 限制树图在容器内
        if ( containerRef && containerRef.current ){
            let container = containerRef.current;
            let containerWidth = container.offsetWidth;
            let containerHeight = container.offsetHeight;
            console.log(containerWidth, containerHeight);
            console.log(graphMaxWidth,graphMaxHeight);
            let xRatio = graphMaxWidth / containerWidth;
            let yRatio = graphMaxHeight / containerHeight ;
            console.log(xRatio, yRatio);
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
            let svgDom = document.getElementById('my-svg');
            // svgDom.addEventListener('mousewheel',(e)=>{           
            //     setGlobalScale(scaleRatio=>{
            //         let temp;
            //         if ( e.wheelDelta < 0 ){
            //             temp = scaleRatio * 0.6;
            //         } else {
            //             temp = scaleRatio * 1.4;
            //         }
            //         return temp;
            //     })
            // }); 
            return ()=>{
                
            }
        }
    },[]);
    return (     
        <div style={{ height:'100%', position:'relative', overflow:'hidden' }} ref={containerRef} >
            <svg id='my-svg' width='100%' height='100%' style={{ backgroundColor:'#ccc'}} transform={`scale(${globalScale})`}>
                <g 
                    transform={transformInfo}
                >    
                    {
                        treeData.length
                        ?
                        treeData.map((levelNodes,i)=>{
                            let pointX,pointY, lineX, lineY;                     
                            return levelNodes.map((node,j)=>{
                                if ( node.deep === 0){
                                    // 根节点
                                    pointX =  graphMaxWidth/2 - pNodeWidth/2;
                                    pointY = 0;
                                    lineX = pointX + pNodeWidth / 2;
                                    lineY = pNodeHeight ;
                                } else if ( node.deep === treeData.length - 1){
                                    // 最深层节点
                                    pointX = ( pNodePadding * 2 + pNodeWidth ) * j + pNodePadding;
                                    pointY = i * ( pNodeHeight + busLineHeight + branchLineHeight );
                                    lineX = pointX + pNodeWidth / 2 ;
                                    lineY = pointY;
                                } else {
                                    // 中间节点
                                    // 根据当前节点的第一个子节点定位
                                    let firstChildNode = node.children[0];
                                    let cNodeIndex = findChildNodeIndex(sameLevelNodes[node.deep + 1], node.children[0])
                                    pointX = cNodeIndex * ( pNodeWidth + pNodePadding * 2)  + node.children.length * ( pNodeWidth + pNodePadding*2 ) /2 - pNodeWidth /2;
                                    pointY = i * ( pNodeHeight + busLineHeight + branchLineHeight );
                                    lineX = pointX + pNodeWidth / 2;
                                    lineY = pointY;
                                }
                                return (
                                    <g key={`${i}-${j}`}>
                                        <rect rx={radius} ry={radius} x={pointX} y={pointY} width={pNodeWidth} height={pNodeHeight} style={{ fill:'#fff', stroke:'#ccc', strokeWidth:1 }} />
                                        <rect rx={radius} ry={radius} x={pointX} y={pointY} width={pNodeWidth} height={pNodeTitleHeight} />
                                        <text alignmentBaseline='middle' x={pointX} y={pointY+40} >25968 kwh</text>
                                        <text alignmentBaseline='middle' x={pointX} y={pointY+80}>定额值:000kwh</text>
                                        <rect rx={radius} ry={radius} x={pointX} y={ pointY + pNodeHeight - progressHeight} width={pNodeWidth} height={progressHeight} style={{ fill:'blue' }} />
                                        {/* 连接总线 */}
                                        {
                                            
                                        }
                                        {/* 连接分支线 */}
                                        {
                                            node.deep === treeData.length - 1 
                                            ?
                                            <line x1={lineX} y1={lineY} x2={lineX} y2={lineY - branchLineHeight} style={{ stroke:lineColor, strokeWidth:lineWidth }} />
                                            :
                                            node.deep === 0 
                                            ?
                                            <line x1={lineX} y1={lineY} x2={lineX} y2={lineY + branchLineHeight} style={{ stroke:lineColor, strokeWidth:lineWidth }} />
                                            :
                                            <g>
                                                <line x1={lineX} y1={lineY} x2={lineX} y2={lineY - branchLineHeight} style={{ stroke:lineColor, strokeWidth:lineWidth }} />
                                                <line x1={lineX} y1={lineY + pNodeHeight } x2={lineX} y2={lineY + pNodeHeight + branchLineHeight } style={{ stroke:lineColor, strokeWidth:lineWidth }} />
                                            </g>
                                        }
                                    </g>
                                )
                            })
                        })
                        :
                        null
                    }
                    {/* {
                        cNodeArr.map((item,index)=>{
                            let cNodeX = ( cNodePadding * 2 + cNodeWidth) * index + cNodePadding;
                            return createChildNode(item, cNodeX, 200, 1200);
                        })
                    } */}
                </g>
            </svg>
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
