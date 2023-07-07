import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Button, message } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { Graph } from '@antv/x6';

import valve from '../../../../public/valve.png';
import airMach from '../../../../public/airMach.png';
import airTank from '../../../../public/airTank.png';
import connector from '../../../../public/connector.png';
import dryingMach from '../../../../public/dryingMach.png';
import flowMeasure from '../../../../public/flowMeasure.png';
import nitrogenProducer from '../../../../public/nitrogenProducer.png';


import { createAirMachPort, createDryingMachPort, createAirTankPort, createNitrogenProducerPort, createNitrogenTankPort, getDefaultEdgeStyle, allEdges } from './portConfig';
let largePadding = 100, middlePadding = 60, smallPadding = 40;

const nodes = [ 
    { key:1, x:20, y:200, label:'空压机', width:229, height:207, url:airMach, ports:createAirMachPort()  },
    { key:2, x:249 + middlePadding , y:264, label:'冷干机', width:196, height:143, url:dryingMach, ports:createDryingMachPort(), innerPorts:[{ source:'port3', target:'port1', color:'#099eec'}, { source:'port2', target:'port4', color:'#099eec'}] },
    { key:3, x:465 + middlePadding + largePadding , y:264, label:'空气储气罐', width:109, height:264, url:airTank, ports:createAirTankPort() },
    { key:4, x:734 + middlePadding * 2, y:100, label:'制氮机', width:348, height:253, url:nitrogenProducer, ports:createNitrogenProducerPort() },
    { key:5, x:734 + 348 + middlePadding * 3 + smallPadding, y:100, label:'氮气储气罐', width:109, height:264, url:airTank, ports:createNitrogenTankPort() },
    { key:6, x:734 + 348 + 109 + middlePadding * 3 + smallPadding * 2 + 20, y:146, label:'流量计', bindMeters:[{ registerCode:'WEITAIHZVIS02', type:'gas-flow' }, { registerCode:'209136460035', type:'ele' }], width:103, height:95, url:flowMeasure },
    // 一些阀门节点，计算位置，不算实际连接节点
    { key:7, x:210, y:120, label:'阀门01', width:45, height:28, url:valve },
    { key:8, x:249 + middlePadding, y:120, label:'阀门02', width:45, height:28, url:valve },
    { key:9, x:477, y:120, label:'阀门03', width:45, height:28, url:valve },
    { key:10, x:249 + middlePadding + 76, y:60, label:'阀门04', width:45, height:28, url:valve },
    { key:11, x:569, y:60, label:'阀门05', width:45, height:28, url:valve },
    { key:12, x:734 + middlePadding * 2 - 20, y:206, label:'阀门06', width:45, height:28, url:valve },
    { key:13, x:734 + 348 + middlePadding * 3 + smallPadding , y:40, label:'阀门07', width:45, height:28, url:valve },
    { key:14, x:734 + 348 + middlePadding * 3 + smallPadding + 119, y:212, label:'阀门08', width:45, height:28, url:valve },

    // 一些连接点
    { key:15, x:255, y:120, label:'连接器01', width:48, height:125, url:connector },
    { key:16, x:520, y:120, label:'连接器02', width:48, height:125, url:connector },
    { key:17, x:590, y:120, label:'连接器03', width:48, height:125, url:connector },
    { key:18, x:734 + 348 + middlePadding * 3 + smallPadding - 60, y:40, label:'连接器04', width:48, height:125, url:connector }
]

let graph = null;
let nodeMaps = {};

function getPortPos(box, obj){
    let offsetX = obj.x.includes('%') ? box.x + box.width * Number( obj.x.replace('%','')) / 100 : box.x + Number(obj.x); 
    let offsetY = obj.y.includes('%') ? box.y + box.height * Number(obj.y.replace('%','')) / 100 : box.y + Number(obj.y);
    
    return { x:offsetX, y:offsetY };
}
function NitrogenStation({ dispatch, user, monitorIndex }){
    const { authorized, theme, containerWidth } = user;
    const { infoList } = monitorIndex;
    const containerRef = useRef();
    const [info, setInfo] = useState({});
    useEffect(()=>{
        
        graph = new Graph({
            container:containerRef.current,
            width:containerRef.current.offsetWidth,
            height:containerRef.current.offsetHeight,
            interacting: {
                nodeMovable: false
            }
        });
       
        graph.on('node:mouseenter',({ e, node, view })=>{
            if ( node.attrs.label.text && node.attrs.label.text.includes('流量计') ) {
                // 请求实时数据
                let bindMeters = nodes.filter(i=>i.key === node.data.key)[0].bindMeters;
                if ( bindMeters && bindMeters.length ) {
                    // 请求实时数据
                    Promise.all(
                        bindMeters.map(i=>{
                            return new Promise((resolve, reject)=>{
                                dispatch({ type:'monitorIndex/fetchMachData', payload:{ register_code:i.registerCode, mach_type:i.type, resolve, reject }})
                            })
                        })
                    )
                    .then(([data1, data2])=>{
                        // data1是冷量表或者气表， data2是电表
                        let box = node.getBBox();
                        let infoSize = node.attrs.label.text.includes('冷量计') ? 'small' : 'large';
                        
                        let arr = [
                                { title:'瞬时流量', value:data1.speed, unit:'m³/h'},
                                { title:'累计流量', value:data1.cumulative, unit:'m³'},
                            ]
                        if ( data1.son && data1.son.length ) {
                            data1.son.forEach(item=>{
                                arr.push({ title:item.name, value:item.value, unit:item.unit });
                            });
                        }
                        let scaleRatio = containerWidth <= 1440 ? ( 1 + ratio ) : 1;
                        arr.push({ title:'记录时间', value:data1.record_time, unit:'' });
                        setInfo({ params:arr, size:infoSize, label:node.attrs.label.text, pos:{ x:box.x * scaleRatio, y:box.y * scaleRatio, width:box.width * scaleRatio, height:box.height * scaleRatio }});
                    })
                    
                } 
            }
        })
        graph.on('node:mouseleave', ({})=>{
            setInfo({});
        })
        if ( localStorage.getItem('x6')){
            graph.fromJSON(JSON.parse(localStorage.getItem('x6')));
            graph.getNodes().forEach(item=>{
                if ( item.data.key ) {
                    nodeMaps[item.data.key] = item;
                }
            });
        } else {
            nodes.forEach((item)=>{               
                let node = graph.addNode({
                    shape:item.label === '锚点' ? 'circle' : 'image',
                    imageUrl:item.url,
                    width:item.width,
                    height:item.height,
                    x:item.x,
                    y:item.y,
                    data:{
                        key:item.key,
                        innerPorts:item.innerPorts
                    },
                    zIndex:5,
                    attrs:{
                        label:{ 
                            text:item.label.includes('阀门') || item.label.includes('连接器') ? '' : item.label,
                            fill:'#fff',
                            refX: item.label === '冷量计' ? '100%' : 0.5,
                            refY:'100%',
                            refY2:10
                        }
                    },
                    ports:item.ports || []
                });
                nodeMaps[item.key] = node;
            })
            // 连接所有节点内部的连接桩
            graph.getNodes().forEach((item, index)=>{
                if ( item.ports && item.data.innerPorts ) {
                    item.data.innerPorts.forEach(innerPort=>{
                        graph.addEdge({
                            source:{ cell:nodeMaps[item.data.key], port:innerPort.source },
                            target:{ cell:nodeMaps[item.data.key], port:innerPort.target },
                            zIndex:0,
                            attrs:{
                                line:{
                                    stroke:innerPort.color, 
                                    strokeWidth:8,
                                    targetMarker:{ name:'classic', width:12, height:16 },
                                }
                                
                            }
                        })
                        graph.addEdge({
                            source:{ cell:nodeMaps[item.data.key], port:innerPort.source },
                            target:{ cell:nodeMaps[item.data.key], port:innerPort.target },
                            zIndex:0,
                            attrs:{
                                line:{
                                    stroke:'rgba(0, 0, 0, 0.65)', 
                                    strokeWidth:4,
                                    strokeDasharray:'20,1', 
                                    targetMarker:{ name:'classic', width:14, height:16, fill:innerPort.color },
                                    style:{ 
                                        animation:'ant-line 30s infinite linear'
                                    }
                                }
                                
                            }
                        })
                    })
                }
            })
            // 连接节点外部的连接桩  
            allEdges.forEach(item=>{
                // 计算节点的位置
                // 计算起点和终点连接桩的绝对位置，生成顶点坐标
                let vertices = [];
                if ( item.dots && item.dots.length ) {
                    item.dots.forEach(sub=>{
                        let portInfo = nodeMaps[sub.cell].getPort(sub.port);
                        let temp = getPortPos(nodeMaps[sub.cell].getBBox(), portInfo.args );
                        vertices.push({ x:temp.x, y:temp.y });
                    })
                }
                // 外层管道
                graph.addEdge({
                    ...item,
                    zIndex:0,
                    source:{ cell:nodeMaps[item.source.cell], port:item.source.port },
                    vertices,
                    target:{ cell:nodeMaps[item.target.cell], port:item.target.port }
                })
                // 内层管道

                graph.addEdge({
                    ...item,
                    attrs:{ 
                        line:{ 
                            stroke:'rgba(0, 0, 0, 0.65)', 
                            strokeWidth:4,
                            strokeDasharray:'20,1', 
                            sourceMarker:{ name:'circle', r:2, fill:item.attrs.line.stroke },
                            targetMarker:{ name:'classic', width:14, height:16, fill:item.attrs.line.stroke },
                            style:{ 
                                animation:'ant-line 30s infinite linear'
                            }
                        }
                    },
                    zIndex:0,
                    vertices,
                    source:{ cell:nodeMaps[item.source.cell], port:item.source.port },
                    target:{ cell:nodeMaps[item.target.cell], port:item.target.port }
                })
            })
        }
        return ()=>{
            graph = null;
            nodeMaps = {};
        }
    },[]);
    useEffect(()=>{
        if ( graph && authorized ) {
            if ( containerWidth < 1440 ) {
                graph.zoom(-0.25);
                graph.centerContent();
            }
            dispatch({ type:'monitorIndex/fetchNitrogenStationSumInfo'});
        }
    },[authorized])
    
    return (
        <div style={{ height:'100%', padding:'1rem 1rem 2rem 1rem', position:'relative' }}>
            {/* 绝对定位-信息窗口 */}
            <div  style={{ 
                display:Object.keys(info).length ? 'block' : 'none', 
                position:'absolute', 
                left:( info.pos ? info.pos.x : 0 ) + 'px', 
                top: ( info.pos ? info.pos.y + 140 - 236 : 0 ) + 'px', 
                zIndex:'10', 
                background:'rgba(2, 2, 6, 0.9)', 
                borderRadius:'6px', 
                border:'1px solid #024268' 
            }}>         
                <div style={{ backgroundColor:'#03a3fe', color:'#fff', padding:'4px 1rem', textAlign:'center', borderTopLeftRadius:'6px', borderTopRightRadius:'6px' }}>{ info.label || '' }</div>
                <div style={{ padding:'1rem' }}>
                    {
                        info.params && info.params.length 
                        ?
                        info.params.map((item, index)=>(
                            <div key={index} style={{ display:'flex', alignItems:'center' }}>
                                <div style={{ color:'rgba(255, 255, 255, 0.65)' }}>{ item.title }</div>
                                <div style={{ flex:'1', margin:'0 6px', height:'2px', backgroundColor:'rgba(255, 255, 255, 0.15)' }}></div>
                                <div style={{ color:'#fff' }}>{`${item.value} ${item.unit}`}</div>
                            </div>
                        ))
                        :
                        null
                    }
                   
                </div>
            </div>
            <div style={{ display:'flex', color: theme === 'dark' ? '#fff' : '#000', alignItems:'center', justifyContent:'space-around', height:'140px', backgroundColor:theme === 'dark' ? '#191932' : '#fff' }}>
                {
                    infoList.map((item, index)=>(
                        <div key={index} style={{ textAlign:'center' }}>
                            <div>
                                <span style={{ fontSize:'2rem' }}>{ item.value || 0 }</span>
                                <span style={{ fontSize:'1rem', color: theme === 'dark' ? 'rgba(255, 255, 255, 0.65)' : '#000', margin:'0 4px' }}>{`(${item.unit})`}</span>
                            </div>
                            <div style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.65)' : '#000' }}>{ item.title }</div>
                        </div>
                    ))
                }
             
            </div>
            <div style={{ height:'calc( 100% - 140px)' }} ref={containerRef}>
                
            </div>
        </div>
    )
}

export default connect(({ user, monitorIndex })=>({ user, monitorIndex }))(NitrogenStation);