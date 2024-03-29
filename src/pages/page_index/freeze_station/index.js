import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Button, message } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { Graph } from '@antv/x6';
import frozenTower from '../../../../public/frozenTower.png';
import frozenMach from '../../../../public/frozenMach.png';
import waterPump from '../../../../public/waterPump.png';
import waterCollector from '../../../../public/waterCollector.png';
import waterDispatcher from '../../../../public/waterDispatcher.png';
import measureMach from '../../../../public/measureMach3.png';
import style from './station.css';

import { createFrozenTowerPort, createWaterPumpPort, createFrozenMachPort, getDefaultEdgeStyle, allEdges } from './portConfig';
let largePadding = 40, middlePadding = 20, smallPadding = 10;

const nodes = [
    { key:1, x:100, y:60, label:'冷却塔1#', width:96, height:140, url:frozenTower, ports:createFrozenTowerPort() },
    { key:2, x:100 + 96 + middlePadding , y:60, label:'冷却塔2#', width:96, height:140, url:frozenTower, ports:createFrozenTowerPort(), innerPorts:[{ source:'port4', target:'port3', color:'#09eca8' }]  },
    { key:3, x:100 + ( 96 + middlePadding ) * 2, y:60, label:'冷却塔3#', width:96, height:140, url:frozenTower, ports:createFrozenTowerPort(), innerPorts:[{ source:'port4', target:'port3', color:'#09eca8' }] },
    { key:4, x:100 + ( 96 + middlePadding ) * 3, y:60, label:'冷却塔4#', width:96, height:140, url:frozenTower, ports:createFrozenTowerPort(), innerPorts:[{ source:'port1', target:'port3', color:'#09eca8' }] },
    { key:5, x:640, y:140, label:'制冷主机1#', bindMeters:[{ registerCode:'MEIYI7610HZVIS01', type:'hot' }, { registerCode:'042202000205', type:'ele' }],  width:210, height:113, url:frozenMach, ports:createFrozenMachPort(), innerPorts:[{ source:'port5', target:'port1', color:'#09eca8' }, { source:'port7', target:'port3', color:'#ae2afe'}] },
    { key:6, x:640, y:140 + 113 + middlePadding , label:'制冷主机2#', width:210, height:113, url:frozenMach, ports:createFrozenMachPort(), innerPorts:[{ source:'port5', target:'port1', color:'#09eca8' }, { source:'port2', target:'port6', color:'#09eca8' }, { source:'port7', target:'port3', color:'#ae2afe'}, { source:'port4', target:'port8', color:'#099eec' }] },
    { key:7, x:640, y:140 + ( 113 + middlePadding ) * 2, label:'制冷主机3#', width:210, height:113, url:frozenMach, ports:createFrozenMachPort(), innerPorts:[{ source:'port5', target:'port1', color:'#09eca8' }, { source:'port2', target:'port6', color:'#09eca8' }, { source:'port7', target:'port3', color:'#ae2afe'}, { source:'port4', target:'port8', color:'#099eec' }] },
    { key:8, x:640, y:140 + ( 113 + middlePadding ) * 3, label:'制冷主机4#', width:210, height:113, url:frozenMach, ports:createFrozenMachPort() },
    { key:9, x:300, y:330, label:'水泵1', width:51, height:67, url:waterPump, ports:createWaterPumpPort() },
    { key:10, x:300, y:330 + 67 + middlePadding, label:'水泵2', width:51, height:67, url:waterPump, ports:createWaterPumpPort(), innerPorts:[{ source:'port4', target:'port3', color:'#09eca8'}] },
    { key:11, x:300, y:330 + ( 67 + middlePadding ) * 2, label:'水泵3', width:51, height:67, url:waterPump, ports:createWaterPumpPort(), innerPorts:[{ source:'port4', target:'port3', color:'#09eca8'}] },
    { key:12, x:300, y:330 + ( 67 + middlePadding ) * 3, label:'水泵4', width:51, height:67, url:waterPump, ports:createWaterPumpPort() },
    { key:13, x:1140, y:330, label:'水泵5', width:51, height:67, url:waterPump, ports:createWaterPumpPort()},
    { key:14, x:1140, y:330 + 67 + middlePadding, label:'水泵6', width:51, height:67, url:waterPump, ports:createWaterPumpPort(), innerPorts:[{ source:'port3', target:'port4', color:'#099eec'}] },
    { key:15, x:1140, y:330 + ( 67 + middlePadding ) * 2, label:'水泵7', width:51, height:67, url:waterPump, ports:createWaterPumpPort(), innerPorts:[{ source:'port3', target:'port4', color:'#099eec'}] },
    { key:16, x:1140, y:330 + ( 67 + middlePadding ) * 3, label:'水泵8', width:51, height:67, url:waterPump, ports:createWaterPumpPort()  },
    { key:17, x:1000, y:40, label:'集水器', width:192, height:69, url:waterCollector, ports:createFrozenTowerPort() },
    { key:18, x:1300, y:40, label:'分水器', width:192, height:69, url:waterDispatcher, ports:createFrozenTowerPort() },
    { key:19, x:1100, y:150, label:'冷量计', bindMeters:[{ registerCode:'MEIYI7610HZVIS01', type:'hot' }], width:278, height:103, url:measureMach },
]

let graph = null;
let nodeMaps = {};
let ratio = -0.25;


function getPortPos(box, obj){
    let prevX = Number(obj.x.replace('%','')) / 100 ; 
    let prevY = Number(obj.y.replace('%','')) / 100;
    return { x:box.x + box.width * prevX, y:box.y + box.height * prevY };
}
function FreezeStation({ dispatch, user, monitorIndex }){
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
            if ( node.attrs.label.text.includes('制冷主机') || node.attrs.label.text.includes('冷量计') ) {
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
                        let arr = node.attrs.label.text.includes('冷量计') 
                            ? 
                            [] 
                            : 
                            [
                                { title:'瞬时流量', value:data1.speedFlow, unit:'m³/h'},
                                { title:'瞬时热量', value:data1.speedHot, unit:'GJ/h'},
                                { title:'累计流量', value:data1.cumulativeFlow, unit:'m³'},
                                { title:'累计冷量', value:data1.cumulativeHot, unit:'GJ' }
                            ];
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
                            text:item.label.includes('水泵') ? '' : item.label,
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
                // console.log(vertices);
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
                            sourceMarker:{ name:'circle', r:1, fill:item.attrs.line.stroke },
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
                graph.zoom(ratio);
                graph.centerContent();
            }
            dispatch({ type:'monitorIndex/fetchFrozenStationSumInfo' });
        }
    },[authorized])
    
    return (
        <div style={{ height:'100%', padding:'1rem 1rem 2rem 1rem', position:'relative' }}>
            {/* 绝对定位-信息窗口 */}
            <div  style={{ 
                display:Object.keys(info).length ? 'block' : 'none', 
                position:'absolute', 
                left:( info.pos ? info.pos.x : 0 ) + 'px', 
                top: ( info.pos ? info.pos.y + ( containerWidth <= 1440 ? 140 * ( 1- ratio ) : 140 ) - ( info.size === 'small' ? 146 : 236 ) : 0 ) + 'px', 
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
            {/* 汇总信息 */}
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

export default connect(({ user, monitorIndex })=>({ user, monitorIndex }))(FreezeStation);