import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Radio, Spin, Skeleton, Tooltip, Button, Select, message } from 'antd';
import { LoginOutlined, LogoutOutlined, HomeOutlined, ToTopOutlined, DownOutlined, RightOutlined, RedoOutlined   } from '@ant-design/icons';
const { Option } = Select;
// 调整比例 最大值和最小值的比例设定为20倍
let padding = 60;
let margin = 2;
let attrBoxWidth = 100;
let attrBoxHeight = 20;
let minHeight = 16;
let maxHeight = minHeight * 16;
const strokeColor = '#f7f7f7';
// 汇总能源起始位置
// 能源流向起始位置
let entryPoint = 0;
let flowPoint = 140;
let flowDistance = 460;

const energyColors = {
    'ele':'rgba(87, 226, 159, 0.8)',
    'water':'rgba(9, 193, 253, 0.8)',
    'gas':'rgba(0, 112, 192, 0.8)',
    'hot':'rgba(249, 203, 62, 0.8)'
};

const energyEntryColors = {
    'ele':'rgba(87, 226, 159, 1)',
    'water':'rgba(9, 193, 253, 1)',
    'gas':'rgba(0, 112, 192, 1)',
    'hot':'rgba(249, 203, 62, 1)'
}

function getTypeEnergy(arr, minCost, maxCost, type){
    let splitMode = +maxCost/+minCost >= 20 ? true : false;

    return arr.map((item,i)=>{
        let obj = {};
        obj.attr_id = item.attr_id;
        obj.attr_name = item.attr_name;
        obj.attr_output = item.attr_output;
        obj.cost = item.cost;
        obj.type = type;
        obj.energy = item.energy;
        // 如果成本值不为0 ，根据最小值计算相应比例，如果为0并且是电能源时，等于默认盒子最小高度
        // 如果最大值和最小值的差值过大，则采取限定比例分割(splitMode)，否则就按成本的正常比例
        let itemHeight;
        if ( splitMode ){
            if ( item.cost ){
                if ( item.cost === minCost ){
                    itemHeight = minHeight;
                } else if ( item.cost === maxCost ){
                    itemHeight = maxHeight;
                } else {
                    let temp = Math.round((item.cost/minCost)/(maxCost/minCost) * maxHeight);
                    itemHeight = temp < minHeight  ? minHeight : temp;
                }
            } else {
                if ( type === 'ele'){
                    itemHeight = minHeight;
                } else {
                    itemHeight = 0;
                }
            }
        } else {
            if ( item.cost ){
                if ( item.cost === minCost ){
                    itemHeight = minHeight;
                } else {
                    itemHeight = Math.round((item.cost/minCost) * minHeight);
                }
            } else {
                if ( type === 'ele') {
                    itemHeight = minHeight;
                } else {
                    itemHeight = 0;
                }
            }
        }
        // 比例过大情况下计算得出的itemHeight<16直接置为16
        obj.itemHeight = itemHeight;
        obj.totalCost = item.totalCost;
        obj.totalEnergy = item.totalEnergy;
        return obj;
    })
}

function findMinEnergyCost(arr){
    if ( !arr || !arr.length ) return {};
    let attrsCost = {}, attrs = [], minCost, maxCost, attrsWidth = {}, totalCost = 0;
    // 其他能源在横向轴的占比
    let attrEnergyPercent={}; 
    arr.forEach(item=>{
        totalCost += +item.totalCost;
        attrs.push({ attr_id:item.attr_id, attr_name:item.attr_name, attr_output:item.output });
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
            if ( key === 'ele' || key === 'water' || key === 'gas') {
                if(!attrsCost[key]){
                    attrsCost[key] = [];                   
                    attrsCost[key].push({ cost:item.cost[key], attr_id:item.attr_id, attr_name:item.attr_name, attr_output:item.output, energy:item.energy[key], totalCost:item.totalCost, totalEnergy:item.totalEnergy });                               
                } else {
                    attrsCost[key].push({ cost:item.cost[key], attr_id:item.attr_id, attr_name:item.attr_name, attr_output:item.output, energy:item.energy[key], totalCost:item.totalCost, totalEnergy:item.totalEnergy } );          
                }
            }
            
        });
    });
    let temp=[];
    // 找出能源流向中的最小成本，以最小值作为比例基本, 排除掉最小值为0的情况
    Object.keys(attrsCost).forEach(key=>{ 
        temp = temp.concat(attrsCost[key].map(i=>i.cost).filter(i=>i));
    });
    temp = temp.sort((a,b)=>a-b);
    minCost =  temp[0];
    maxCost = temp[temp.length-1];
    Object.keys(attrsCost).map(key=>{
        attrsCost[key] = getTypeEnergy(attrsCost[key], minCost, maxCost, key);
    });
    // 计算出每个维度属性盒子的宽度
    let { ele, ...rest } = attrsCost;
    let restEnergys = Object.keys(rest).map(key=>attrsCost[key]);
    attrs.forEach((attr, i)=>{
        let attr_width = getAttrWidth(restEnergys,i)
        attr.attr_width = attr_width < attrBoxWidth ? attrBoxWidth : attr_width;
    });
    return {
        attrs,
        attrsCost,
        attrEnergyPercent,
        minCost,
        totalCost
    }
}

function getAttrWidth(arr, i){
    let sum = 0;
    arr.forEach(item=>{
        sum+=item[i].itemHeight;
    });
    return sum;
}

function sumAttrWidth(arr, i){
    let sum = 0;
    if ( i===0 ) return sum;
    sum = arr.slice(0, i).reduce((sum,cur)=>sum+= cur.attr_width ,0);
    return sum;
}

// 累加Y轴坐标值
function sumHeight(typeEnergy, i){
    let sum = 0;
    if ( i === 0) return sum;
    sum = typeEnergy.slice(0,i).reduce((sum,cur)=>sum+=cur.itemHeight,0)
    return sum;  
}


function sumVerticalWidth(attrsCost, i, j){
    let sum = 0;
    if ( i === 0 || i === 1 ) return sum;
    let { ele, ...rest } = attrsCost;
    Object.keys(rest).slice(0,i-1).map(key=>{
        sum += attrsCost[key][j].itemHeight;
    })
    return sum;
}

let posX, posY, offsetLeft, offsetTop, canDrag = false;
function EfficiencyFlowChart({ data, rankInfo, fieldList, currentField, dispatch, parentNodes, chartLoading, onFetchData, onSetLevel, mode, forReport }){     
    const containerRef = useRef();
    const infoRef = useRef();
    const { attrsCost, attrs, minCost, totalCost } = findMinEnergyCost(data);
    const [viewBox, setViewBox] = useState({ x:0, y:0, width:0, height:0 });
    const [timeType, toggleTimeType] = useState('2');
    const [scaleRatio, setScaleRatio] = useState('1');
    const [currentAttr, setCurrentAttr] = useState(null);
    console.log(attrsCost);
    useEffect(()=>{
        if( attrsCost && attrsCost['ele'] ){
            // 控制能流图的整体缩放
            let container = containerRef.current;
            let containerWidth = containerRef.current.offsetWidth;
            let containerHeight = containerRef.current.offsetHeight;     
            let chartWidth = flowDistance + sumAttrWidth(attrs, attrs.length);
            let chartHeight = Object.keys(attrsCost).map(i=>attrsCost[i]).reduce((sum,cur)=>{
                let temp = sumHeight(cur, cur.length);
                sum+= temp;
                return sum;
            },0);
            let xRatio = chartWidth /  containerWidth ;
            let yRatio = chartHeight / containerHeight;
            // let finalRatio;
            // console.log(containerWidth, containerHeight);
            // console.log(chartWidth, chartHeight);
            // console.log(xRatio, yRatio);
            // 选择缩放比例大的轴的比例，确保整个图形完整显示出来，不会被裁剪掉
            // finalRatio = xRatio < yRatio ? yRatio : xRatio;      
            let finalWidth = Math.floor( containerWidth * xRatio) ;
            let finalHeight = Math.floor( containerHeight * yRatio ) ;
            setViewBox({ x:0, y:0, width:finalWidth, height:finalHeight });

            // 监听鼠标滚轮事件
            const handleScale = (e)=>{
                e.preventDefault();
                e.stopPropagation();
                setScaleRatio(scaleRatio=>{
                    let temp;
                    if ( e.wheelDelta < 0 ){
                        temp = scaleRatio * 0.6;
                        if ( temp <= 0.1 ) {
                            return scaleRatio;
                        }
                    } else {
                        temp = scaleRatio * 1.4;
                    }
                    return temp;
                })
            }
            // 监听拖动事件
            const handleMouseDown = (e)=>{
                e.stopPropagation();
                e.preventDefault();
                posX  = e.clientX;
                posY = e.clientY;
                offsetLeft = container.offsetLeft;
                offsetTop = container.offsetTop;
                canDrag = true;
            }
            const handleMouseMove = (e)=>{
                e.stopPropagation();
                e.preventDefault();
                if ( canDrag ){
                    container.style.left = offsetLeft + e.clientX - posX + 'px' ;
                    container.style.top = offsetTop + e.clientY - posY + 'px';
                }
            }
            const handleMouseUp = (e)=>{
                e.stopPropagation();
                e.preventDefault();
                canDrag = false;
            }
            container.addEventListener('mousewheel',handleScale);
            container.addEventListener('mousedown', handleMouseDown);
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseup', handleMouseUp);
            return ()=>{
                container.removeEventListener('mousewheel', handleScale);
                // container.removeEventListener();
            }
        }
    },[data]);
    useEffect(()=>{
        // 异步生成动效
        if ( attrsCost && attrsCost['ele'] ){
            let types = Object.keys(attrsCost);
            for(var i=0;i<types.length;i++){
                (function(i){
                    setTimeout(()=>{
                        // console.log(i);
                        let doms = document.getElementsByClassName(`energy-${i}`);
                        for(let j=0;j<doms.length;j++){
                            if ( i === 0 ) {
                                doms[j].style.width = doms[j].getAttribute('data-width');
                            } else {
                                doms[j].style.strokeDashoffset = 0;
                            }
                        }
                    },i*1000)
                })(i)
            }

        }                    
    },[data]);
   
    return (
                chartLoading
                ?
                <Spin />
                :
                !attrsCost || !attrsCost['ele'] 
                ?
                null
                :
                <div style={{ width:'100%', height:'100%', position:'relative', textAlign:'center' }} >
                    <div style={{ fontSize:'1.2rem', color:'#000', textDecoration:'underline', paddingTop:'6px' }}>能源流向图</div>
                    <div style={{ position:'absolute', top:'0', right:'0', backgroundColor:'#ade6f6', color:'#000', textAlign:'center', padding:'20px' }}>
                        <div>能源成本竞争力</div>
                        <div style={{ fontSize:'1.4rem', fontWeight:'bold' }}>排名第<span style={{ fontWeight:'bold', color:'red'}}>{ rankInfo ? rankInfo.rank : '' }</span>位</div>
                    </div>
                    <div style={{ position:'absolute', left:'20px', top:'40px', zIndex:'100' }}>
                        {
                            parentNodes && parentNodes.length 
                            ?
                            parentNodes.map((node,index)=>(
                                <div key={index} style={{ display:'inline-block', verticalAlign:'top' }}>
                                    <span style={{ border:'1px solid #d9d9d9', padding:'2px 6px', cursor:'pointer', fontSize:'0.8rem'}} onClick={()=>{
                                        new Promise(( resolve, reject)=>{
                                            if ( onFetchData && typeof onFetchData === 'function') {
                                                onFetchData({ attr_id:node.attr_id, resolve, reject, timeType });
                                            }
                                        })
                                        .then(()=>{
                                            let temp = parentNodes.slice(0, index+1);
                                            // console.log(temp);
                                            onSetLevel(temp);
                                        })
                                        .catch(msg=>message.info(msg))
                                    }}>{ node.attr_name }</span>
                                    {
                                        index === parentNodes.length - 1 
                                        ?
                                        null
                                        :
                                        <span style={{ margin:'0 10px'}}><RightOutlined  style={{ color:'#c7c7c7'}} /></span>
                                    }
                                </div>
                            ))
                            :
                            null
                        }
                    </div>
                    <div style={{ position:'absolute', top:'10px', left:'20px', zIndex:'100' }}>
                        {/* 控制时间维度，按年度/月度 */}
                        <Radio.Group 
                            size='small' 
                            value={timeType} 
                            onChange={e=>{
                                let currentParentNode = parentNodes[parentNodes.length-1];
                                onFetchData({ timeType:e.target.value, attr_id:currentParentNode ? currentParentNode.attr_id : null });
                                toggleTimeType(e.target.value);
                        }}>
                            <Radio.Button key='1' value='1'>年度</Radio.Button>
                            <Radio.Button key='2' value='2'>月度</Radio.Button>
                        </Radio.Group>
                        <Button size='small' style={{ marginLeft:'10px' }} shape='circle' icon={<RedoOutlined />} onClick={(e)=>{
                            e.stopPropagation();
                            setScaleRatio('1');
                            let container = containerRef.current;
                            if ( container ){
                                container.style.left = '0px';
                                container.style.top = '0px';
                            }
                        }} />
                        <Select size='small' style={{ width:'100px', marginLeft:'10px' }} value={[currentField.field_id]} onChange={value=>{
                            let current = fieldList.filter(i=>i.field_id === value )[0];
                            let currentParentNode = parentNodes[parentNodes.length-1];
                            dispatch({ type:'efficiency/toggleField', payload:{ data:current }});
                            dispatch({ type:'efficiency/setLevelInfo', payload:[{ attr_name:'能流图入口', attr_id:'' }]} );
                            onFetchData({ timeType });
                        }}>
                            {
                                fieldList && fieldList.length
                                ?
                                fieldList.map((item,index)=>(
                                    <Option key={index} value={item.field_id}>{ item.field_name }</Option>
                                ))
                                :
                                null
                            }
                        </Select>
                    </div>
                    <div style={{ zIndex:'200', width:'180px', color:'#fff', textAlign:'left', padding:'10px', whiteSpace:'nowrap', backgroundColor:'rgba(0,0,0,0.6)', position:'absolute', borderRadius:'6px', display: currentAttr && currentAttr.attr_id ? 'block':'none', left:'30px', top:'50%', transform:'translateY(-50%)' }}>
                        <div>
                            <span>属性:</span>
                            <span style={{ marginLeft:'4px'}}>{ currentAttr && currentAttr.attr_name }</span>
                        </div>
                        <div>
                            <span>能耗值:</span>
                            <span style={{ marginLeft:'4px'}}>{ Math.floor( currentAttr && currentAttr.energy) }/kw</span>
                        </div>
                        <div>
                            <span>成本:</span>
                            <span style={{ marginLeft:'4px'}}>{ Math.floor( currentAttr && currentAttr.cost)}/元 </span>
                        </div>
                        <div>
                            <span>成本占比:</span>
                            <span style={{ marginLeft:'4px'}}>{ currentAttr && totalCost ? (currentAttr.cost / totalCost * 100).toFixed(1) : 0.0 }%</span>
                        </div>
                    </div>
                        
                    <div style={{ position:'absolute', top:'60px', left:'40px', right:'40px', bottom:'20px' }}>
                        <div style={{ width:'100%', height:'100%', position:'absolute', top:'0', left:'0', transform:`scale(${scaleRatio})`}} ref={containerRef}>
                        <svg 
                            width='100%'
                            height='100%'
                            id='my-svg'
                            style={{ overflow:'visible' }}
                            viewBox={ `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
                            preserveAspectRatio="xMidYMid meet"
                            onMouseOut={(e)=>{
                                let related = e.toElement || e.relatedTarget;
                                if ( e.currentTarget.contains(related)){
                                    return;
                                } else {
                                    setCurrentAttr(null);
                                }
                            }}
                            // viewBox={ forReport ? '' : `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
                            // preserveAspectRatio={ forReport ? '' : "xMidYMid meet" } 
                        >
                            {
                                // 计量区域维度列表
                                attrs && attrs.length
                                ?
                                attrs.map((attr,i)=>(                            
                                    (function(attr,i){
                                        let rectX = flowDistance + sumAttrWidth(attrs, i);
                                        let rectY = sumHeight(attrsCost['ele'], i);
                                        let itemHeight = attrsCost['ele'][i].itemHeight - margin;
                                        return (
                                            <g key={attr.attr_id}>
                                                <rect 
                                                    x={rectX} 
                                                    y={rectY} 
                                                    width={ attr.attr_width - margin} 
                                                    height={itemHeight} 
                                                    style={{fill:'#2c3b4d'}}                
                                                />
                                                <text fill='#fff' onClick={()=>{
                                                    new Promise((resolve, reject)=>{
                                                        onFetchData({ attr_id:attr.attr_id, timeType, resolve, reject });
                                                    })
                                                    .then(()=>{
                                                        parentNodes.push(attr);
                                                        onSetLevel(parentNodes);
                                                    })
                                                    .catch((msg)=>{                                          
                                                        message.info(msg);
                                                    })

                                                }} style={{ cursor:'pointer' }} alignmentBaseline='middle' textAnchor='middle' x={`${rectX + attr.attr_width/2}`} y={rectY + itemHeight/2}>{`${attr.attr_name}`}</text>
                                                <text fill='#000' fontSize='12px' alignmentBaseline='bottom' textAnchor='middle' x={`${rectX + attr.attr_width/2}`} y={rectY - 4} >{ `${Math.floor(attr.attr_output)}元/万元产值` }</text>
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
                                    let seriesHeight = i === 0 ? 0 :  Object.keys(attrsCost).slice(0,i).map(i=>attrsCost[i]).reduce((sum,cur)=>{
                                        let temp = sumHeight(cur, cur.length);
                                        sum+= temp;
                                        return sum;
                                    },0);  
                                    return attrsCost[energyKey].map((attr,j)=>(
                                        (function(attr,j){
                                             // 横向轴坐标值   
                                            let currentItemHeight = sumHeight(attrsCost[energyKey], j );                                 
                                            let rectY = seriesHeight + currentItemHeight;
                                            let itemHeight = attr.itemHeight - margin ;
                                            let width = flowDistance + sumAttrWidth(attrs, j) - flowPoint;
                                            // 其他能源描边坐标值
                                            let pathWidth = width  + flowPoint + itemHeight/2 + sumVerticalWidth(attrsCost, i, j);
                                            let pathStartY = rectY + attr.itemHeight/2;
                                            let pathEndY = sumHeight(attrsCost['ele'], j) + attrsCost['ele'][j].itemHeight;

                                            let pathLength = ( pathWidth- flowPoint ) // 横向路径
                                                            + ( pathStartY - pathEndY ) // 竖向路径
                                            let outputText = `${Math.floor(attr.attr_output)}元/万元产值`;                              
                                            return (
                                                <g key={`${i}-${j}`} onMouseOver={()=>setCurrentAttr(attr)} onMouseOut={(e)=>{
                                                    // let related = e.toElement || e.relatedTarget;
                                                    // let svg = document.getElementById('my-svg');
                                                    // console.log(related.nodeName);
                                                    // if ( svg.contains(related) ) {
                                                    //     return ;
                                                    // } else {
                                                    //     setCurrentAttr(null);
                                                    // }
                                                
                                                }}>
                                                    {
                                                        attr.type === 'ele'
                                                        ?
                                                        <rect
                                                            x={flowPoint}
                                                            y={rectY}
                                                            width={ attr.cost ? '0' : width}
                                                            data-width={width}
                                                            height={itemHeight}
                                                            className={`energy-${i}`}
                                                            style={{ fill : energyColors['ele'] , transition:'all 1s'  }}
                                                        >
                                                        </rect>
                                                        :                            
                                                        attr.cost 

                                                        ?
                                                        <path
                                                            d={`M${flowPoint} ${pathStartY} H${pathWidth} V${pathEndY}`}
                                                            stroke={ energyColors[attr.type] }
                                                            fill='none'
                                                            strokeWidth={attr.itemHeight - margin} 
                                                            className={`energy-${i}`}
                                                            strokeWidth={attr.itemHeight - margin} 
                                                            strokeDasharray={`${pathLength} ${pathLength}`}
                                                            strokeDashoffset={pathLength}
                                                            style={{ transition:'all 1s'}}
                                                        />
                                                        :
                                                        null                                                                                               
                                                    }
                                                    <text alignmentBaseline='middle' textAnchor='left' fill='#000' x={ flowPoint + 20 } y={rectY+(itemHeight/2)}>{ `￥${Math.floor(attr.cost)}元 / ${Math.floor(attr.energy)}kwh`}</text>

                                                </g>
                                            )
                                        })(attr,j)
                                    ))
                                    
                                })
                            }
                            {
                                // 能源入口图形
                                Object.keys(attrsCost).map((energyKey,i)=>{
                                    let seriesHeight = i === 0 ? 0 :  Object.keys(attrsCost).slice(0,i).map(i=>attrsCost[i]).reduce((sum,cur)=>{
                                        let temp = sumHeight(cur, cur.length);
                                        sum+= temp;
                                        return sum;
                                    },0);
                                    let rectX = entryPoint;
                                    let rectY = seriesHeight;
                                    let rectHeight = sumHeight(attrsCost[energyKey], attrsCost[energyKey].length) - margin;
                                    let energyType = energyKey === 'ele' ? '电' :
                                    energyKey === 'water' ? '水' :
                                    energyKey === 'gas' ? '气' :
                                    energyKey === 'hot' ? '热' : '';
                                    return (
                                        <g key={energyKey}>
                                            <rect 
                                                x={rectX} 
                                                y={rectY} 
                                                width={flowPoint - margin} 
                                                height={rectHeight} 
                                                style={{fill: energyEntryColors[energyKey] }}
                                            />
                                            <text alignmentBaseline='middle' textAnchor='middle' x={ flowPoint/2 } y={rectY+(rectHeight/2)}>{ energyType } </text>
                                        </g>
                                    )
                                })
                            }
                            
                        </svg>
                        </div>
                    </div>
                </div>
                       
    )
        
}

// function areEqual(prevProps, nextProps){
//     if ( prevProps.data !== nextProps.data || prevProps.parentNodes !== nextProps.parentNodes || prevProps.chartLoading !== nextProps.chartLoading  ) {
//         return false;
//     } else {
//         return true;
//     }
// }

// export default React.memo(EfficiencyFlowChart, areEqual);
export default EfficiencyFlowChart;