import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Radio, Spin, Skeleton, Tooltip } from 'antd';

let padding = 60;
let attrBoxWidth = 100;
let attrBoxHeight = 20;
let minHeight = 20;
const colors = ['#57e29f','#65cae3','#198efb','#f1ac5b'];
const strokeColor = '#f7f7f7';
// 汇总能源起始位置
// 能源流向起始位置
let startFlow = 200;
let entryFlow = 100;
let tempKeys = [];

function getTypeEnergy(arr, minUnit, type, attrEnergyPercent){
    return arr.map((item,i)=>{
        let obj = {};
        obj.attr_id = item.attr_id;
        obj.attr_name = item.attr_name;
        obj.cost = item.cost;
        obj.type = type;
        obj.energy = item.energy;
        obj.itemHeight = Math.round(( obj.cost / minUnit ) * minHeight );
        obj.verticalItemWidth =  type === 'ele' ? 0 :  attrEnergyPercent[item.attr_name][type] ;
        obj.totalCost = item.totalCost;
        obj.totalEnergy = item.totalEnergy;
        return obj;
    })
}

function findMinEnergyCost(arr, energyList){
    let attrsCost = {}, attrs = [], minUnit;
    // 其他能源在横向轴的占比
    let attrEnergyPercent={}; 
    arr.forEach(item=>{
        attrs.push({ attr_id:item.attr_id, attr_name:item.attr_name });
        let { ele, ...rest } = item.cost;
        let tempObj = {};
        let tempSum = 0;
        // 计算出各个维度属性其他能源的占比情况
        Object.keys(rest).forEach(key=>{
            tempSum += rest[key];
        });
        Object.keys(rest).forEach(key=>{
            if ( rest[key] ) {
                tempObj[key] =  Math.floor(rest[key]/tempSum*100);
            }
        }); 
        attrEnergyPercent[item.attr_name] = tempObj;
        Object.keys(item.cost).forEach(key=>{
            // if ( key === 'ele' || key === 'water' || key === 'gas') {
                if(!attrsCost[key]){
                    attrsCost[key] = [];
                    // 过滤掉成本为0 的情况
                    if ( item.cost[key] ) {
                        attrsCost[key].push({ cost:item.cost[key], attr_id:item.attr_id, attr_name:item.attr_name, energy:item.energy[key], totalCost:item.totalCost, totalEnergy:item.totalEnergy });               
                    }
                } else {
                    if ( item.cost[key] ) {
                        attrsCost[key].push({ cost:item.cost[key], attr_id:item.attr_id, attr_name:item.attr_name, energy:item.energy[key], totalCost:item.totalCost, totalEnergy:item.totalEnergy } );          
                    }
                }
            // }
            
        });
    });
    let temp=[];
    // 找出能源流向中的最小成本，以最小值作为比例基本
    Object.keys(attrsCost).forEach(key=>{
        temp = temp.concat(attrsCost[key].map(i=>i.cost));
    });
    minUnit =  temp.sort((a,b)=>a-b)[0];
    Object.keys(attrsCost).map(key=>{
        attrsCost[key] = getTypeEnergy(attrsCost[key], minUnit, key, attrEnergyPercent);
    });
    console.log(attrsCost);
    return {
        attrs,
        attrsCost,
        attrEnergyPercent,
        minUnit
    }
}
// 累加Y轴坐标值
function sumHeight(typeEnergy, attrs, cur, type){
    let sum = 0;
    let attrNames = typeEnergy.map(i=>i.attr_name);
    console.log(cur);
    for(var i=0 ; i < cur ; i++){
        // 判断某项能源成本是否为0 ，为空则加上盒子的最小高度;
        if ( !attrNames.includes(attrs[i].attr_name)) {
            sum += type === 'ele' ? attrBoxHeight : 0;
        } else {
            sum += typeEnergy.filter(item=>item.attr_name === attrs[i].attr_name)[0].itemHeight;
        }     
    }
    console.log(sum);
    return sum;  
}

function getSeriesHeight(typeEnergy, attrs, type){
    let sum = 0;
    let attrNames = typeEnergy.map(i=>i.attr_name);
    for(let i=0,len=attrs.length;i<len;i++){
        if ( !attrNames.includes(attrs[i].attr_name)) {
            sum += type === 'ele' ? attrBoxHeight : 0;
        } else {
            sum += typeEnergy.filter(item=>item.attr_name === attrs[i].attr_name)[0].itemHeight;
        }
    }
    return sum;
}

function sumVerticalWidth(attrsCost, i, attr_name){
    let sum = 0;
    if ( i === 0 ) return sum;
    let { ele, ...rest } = attrsCost;
    Object.keys(rest).slice(0,i-1).map(i=>attrsCost[i]).forEach(typeEnergy=>{
        let mapResult = typeEnergy.filter(i=>i.attr_name === attr_name);
        sum += mapResult && mapResult.length ? mapResult[0].verticalItemWidth : 0;
    });
    return sum;
}

function findAttrIndex(attrs, attr_name){
    let index ; 
    attrs.forEach((item,i)=>{
        if ( attrs[i].attr_name == attr_name ) {
            index = i;
        }
        return ;
    });
    return index;
}

function EfficiencyFlowChart({ data, energyList }){ 
    const containerRef = useRef();
    const { attrsCost, attrs, attrEnergyPercent, minUnit } = findMinEnergyCost(data, energyList);
    const [center,setCenter] = useState({x:0,y:0});
    useEffect(()=>{
        setCenter({x:containerRef.current.offsetWidth/2,y:containerRef.current.offsetHeight/2});
    },[]);
    const scaleX = containerRef && containerRef.current ? containerRef.current.offsetWidth * 2 : 0;
    const scaleY = containerRef && containerRef.current ? containerRef.current.offsetHeight * 2 : 0;
    console.log(attrEnergyPercent);
    const allEnergyTypes = Object.keys(attrsCost);

    return (
        <div style={{width:'100%', height:'100%'}} ref={containerRef}>
            <svg width='100%' height='100%' /*viewBox={`${center.x} ${center.y} ${scaleX} ${scaleY}`}*/>
                    {
                        attrs && attrs.length
                        ?
                        attrs.map((attr,i)=>(                            
                            (function(attr,i){
                                let rectX = center.x + attrBoxWidth*i;
                                let rectY = padding + sumHeight(attrsCost['ele'], attrs, i, 'ele');
                                let mapAttrToType = attrsCost['ele'].filter(i=>i.attr_name === attr.attr_name)[0];
                                let itemHeight = mapAttrToType ? mapAttrToType.itemHeight : attrBoxHeight;
                                return (
                                    <g key={attr.attr_id}>
                                        <rect x={rectX} y={rectY} width={attrBoxWidth} height={itemHeight} style={{fill:'#2c3b4d'}} />
                                        <text fill='#fff' alignmentBaseline='middle' textAnchor='middle' x={`${rectX + attrBoxWidth/2}`} y={rectY + itemHeight/2}>{attr.attr_name}</text>
                                    </g>
                                );
                            })(attr,i)
                        ))
                        :
                        null
                    }
                    {
                        // 能源分流向图形
                        Object.keys(attrsCost).map((energyKey,i)=>{ 
                            // 各个能源种类累加的总高度
                            let seriesHeight = energyKey === 'ele' ? 0 :  Object.keys(attrsCost).slice(0,i).map(i=>attrsCost[i]).reduce((sum,cur)=>{
                                let temp = getSeriesHeight(cur, attrs, cur[0].type);
                                sum+= temp;
                                return sum;
                            },0);  
                            return attrsCost[energyKey].map((attr,j)=>(
                                (function(attr,j){
                                    let index = findAttrIndex(attrs, attr.attr_name);                            
                                     // 横向轴坐标值                                    
                                    let rectY = padding + seriesHeight + sumHeight(attrsCost[energyKey], attrs, index, energyKey);
                                    let itemHeight = attr.itemHeight;
                                    // 竖轴
                                    let relativeVerticalX = sumVerticalWidth(attrsCost, i, attr.attr_name);
                                    let verticalRectX = center.x + index*attrBoxWidth + relativeVerticalX  ;
                                    let width =  center.x - startFlow + verticalRectX - center.x ;
                                    // 获取竖向矩形的高度
                                    let mapAttrToType = attrsCost['ele'].filter(i=>i.attr_name === attr.attr_name)[0];
                                    let verticalItemHeight = mapAttrToType ? mapAttrToType.itemHeight : attrBoxHeight;
                                    let verticalRectY = padding + sumHeight(attrsCost['ele'], attrs, index, 'ele') + verticalItemHeight;
                                    // 根据能源占比获得宽度
                                    let verticalRectWidth = attr.verticalItemWidth;
                                    let verticalRectHeight = rectY - verticalRectY + itemHeight;
                                    return (
                                        <g key={`${i}-${j}`}>
                                            <rect
                                                x={startFlow}
                                                y={rectY}
                                                width='0'
                                                height={itemHeight}
                                                style={{fill:colors[i],stroke:strokeColor,strokeWidth:2}}
                                            >
                                                <animate attributeName="width" from="0" to={width} begin="0.5s" dur="1s" fill='freeze' />
                                            </rect>
                                            {
                                                attr.type !== 'ele' 
                                                ?
                                                <rect
                                                    x={verticalRectX}
                                                    y={rectY}
                                                    width={verticalRectWidth}
                                                    height={verticalRectHeight}
                                                    style={{fill:colors[i],stroke:strokeColor,strokeWidth:2}}
                                                    opacity='0'
                                                >
                                                    <animate attributeName="y" from={rectY} to={verticalRectY} begin="1.5s" dur="1s" fill='freeze' />
                                                    <animate attributeName="opacity" from='0' to='0.6' begin="1.5s" dur="0.5s" fill='freeze' />
                                                </rect>
                                                :
                                                null
                                            }                                           
                                            <text fill='#fff' alignmentBaseline='middle' textAnchor='start' x={startFlow + 20} y={rectY+attr.itemHeight/2} >
                                                {`￥${attr.cost}元 / ${attr.energy} kwh `}
                                                <animate attributeName="opacity" from="0" to="1" begin="1s" dur="1s" />
                                            </text>                                            
                                        </g>
                                    )
                                })(attr,j)
                            ))

                        })
                    }
                    {
                        // 能源入口图形
                        Object.keys(attrsCost).map((energyKey,i)=>{
                            let seriesHeight = Object.keys(attrsCost).slice(0,i).map(i=>attrsCost[i]).reduce((sum,cur)=>{
                                let temp = getSeriesHeight(cur, attrs, cur[0].type);
                                sum+= temp;
                                return sum;
                            },0);  
                            let rectX = entryFlow;
                            let rectY = padding + seriesHeight;
                            let rectHeight = getSeriesHeight(attrsCost[energyKey], attrs, energyKey);
                            let energyType = energyKey === 'ele' ? '电' :
                            energyKey === 'water' ? '水' :
                            energyKey === 'gas' ? '气' :
                            energyKey === 'hot' ? '热' : '';
                            return (
                                <g>
                                    <rect x={rectX} y={rectY} width='0' height={rectHeight} style={{fill:colors[i]}}>
                                        <animate attributeName="width" from='0' to={startFlow-entryFlow} begin="0s" dur="0.5s" fill='freeze' />

                                    </rect>
                                    <text alignmentBaseline='middle' textAnchor='middle' x={ rectX + (startFlow-entryFlow)/2} y={rectY+(rectHeight/2)}>{ energyType } </text>
                                </g>
                            )
                        })
                    }
                                
                   
                        
                    
            </svg>
        </div>
    )
        
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(EfficiencyFlowChart, areEqual);
