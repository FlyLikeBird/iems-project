import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { Graph } from '@antv/x6';
import frozenTower from '../../../../public/frozenTower.png';
import frozenMach from '../../../../public/frozenMach.png';
import waterPump from '../../../../public/waterPump.png';
import waterCollector from '../../../../public/waterCollector.png';
import waterDispatcher from '../../../../public/waterDispatcher.png';
import measureMach from '../../../../public/measureMach.png';
import style from './station.css';

import { createFrozenTowerPort, createWaterPumpPort, createFrozenMachPort, defaultEdgeStyle, allEdges } from './portConfig';
let largePadding = 40, middlePadding = 20, smallPadding = 10;

const nodes = [
    { key:1, x:100, y:60, label:'冷却塔1#', width:96, height:140, url:frozenTower, ports:createFrozenTowerPort(), innerPorts:[{ source:'port1', target:'port3' }, { source:'port4', target:'port2' }]},
    { key:2, x:100 + 96 + middlePadding , y:60, label:'冷却塔2#', width:96, height:140, url:frozenTower, ports:createFrozenTowerPort(), innerPorts:[{ source:'port1', target:'port3'}, { source:'port4', target:'port2' }] },
    { key:3, x:100 + ( 96 + middlePadding ) * 2, y:60, label:'冷却塔3#', width:96, height:140, url:frozenTower, ports:createFrozenTowerPort(), innerPorts:[{ source:'port1', target:'port3'}, { source:'port4', target:'port2' }] },
    { key:4, x:100 + ( 96 + middlePadding ) * 3, y:60, label:'冷却塔4#', width:96, height:140, url:frozenTower, ports:createFrozenTowerPort(), innerPorts:[{ source:'port1', target:'port3'}, { source:'port4', target:'port2' }] },
    { key:5, x:640, y:130, label:'制冷主机1#', width:210, height:113, url:frozenMach, ports:createFrozenMachPort(), innerPorts:[{ source:'port5', target:'port1'}, { source:'port2', target:'port6'}, { source:'port7', target:'port3'}, { source:'port4', target:'port8'}] },
    { key:6, x:640, y:130 + 113 + middlePadding , label:'制冷主机2#', width:210, height:113, url:frozenMach, ports:createFrozenMachPort(), innerPorts:[{ source:'port5', target:'port1'}, { source:'port2', target:'port6'}, { source:'port7', target:'port3'}, { source:'port4', target:'port8'}] },
    { key:7, x:640, y:130 + ( 113 + middlePadding ) * 2, label:'制冷主机3#', width:210, height:113, url:frozenMach, ports:createFrozenMachPort(), innerPorts:[{ source:'port5', target:'port1'}, { source:'port2', target:'port6'}, { source:'port7', target:'port3'}, { source:'port4', target:'port8'}] },
    { key:8, x:640, y:130 + ( 113 + middlePadding ) * 3, label:'制冷主机4#', width:210, height:113, url:frozenMach, ports:createFrozenMachPort(), innerPorts:[{ source:'port5', target:'port1'}, { source:'port2', target:'port6'}, { source:'port7', target:'port3'}, { source:'port4', target:'port8'}] },
    { key:9, x:300, y:330, label:'水泵1', width:51, height:67, url:waterPump, ports:createWaterPumpPort(), innerPorts:[{ source:'port1', target:'port3'}, { source:'port4', target:'port2'}] },
    { key:10, x:300, y:330 + 67 + middlePadding, label:'水泵2', width:51, height:67, url:waterPump, ports:createWaterPumpPort(), innerPorts:[{ source:'port1', target:'port3'}, { source:'port4', target:'port2'}] },
    { key:11, x:300, y:330 + ( 67 + middlePadding ) * 2, label:'水泵3', width:51, height:67, url:waterPump, ports:createWaterPumpPort(), innerPorts:[{ source:'port1', target:'port3'}, { source:'port4', target:'port2'}] },
    { key:12, x:300, y:330 + ( 67 + middlePadding ) * 3, label:'水泵4', width:51, height:67, url:waterPump, ports:createWaterPumpPort(), innerPorts:[{ source:'port1', target:'port3'}, { source:'port4', target:'port2'}] },
    { key:13, x:1060, y:330, label:'水泵5', width:51, height:67, url:waterPump, ports:createWaterPumpPort(), innerPorts:[{ source:'port3', target:'port1'}, { source:'port2', target:'port4' }] },
    { key:14, x:1060, y:330 + 67 + middlePadding, label:'水泵6', width:51, height:67, url:waterPump, ports:createWaterPumpPort(), innerPorts:[{ source:'port3', target:'port1'}, { source:'port2', target:'port4' }] },
    { key:15, x:1060, y:330 + ( 67 + middlePadding ) * 2, label:'水泵7', width:51, height:67, url:waterPump, ports:createWaterPumpPort(), innerPorts:[{ source:'port3', target:'port1'}, { source:'port2', target:'port4' }] },
    { key:16, x:1060, y:330 + ( 67 + middlePadding ) * 3, label:'水泵8', width:51, height:67, url:waterPump, ports:createWaterPumpPort(), innerPorts:[{ source:'port3', target:'port1'}, { source:'port2', target:'port4' }] },
    { key:17, x:940, y:60, label:'集水器', width:192, height:69, url:waterCollector, ports:createFrozenTowerPort() },
    { key:18, x:1200, y:60, label:'分水器', width:192, height:69, url:waterDispatcher, ports:createFrozenTowerPort() },
    { key:19, x:1533, y:40, label:'冷量计', width:379, height:103, url:measureMach },
    // // 锚点
    // // 1-4水泵流向冷却塔1#
    // { key:20, x:200, y:370, label:'锚点', width:2, height:2 },
    // // 制冷主机4#流向1-4水泵
    // { key:21, x:468, y:330 + ( 73 + middlePadding ) * 3 + 43, label:'锚点', width:2, height:2 },
    // // 1-4冷却塔流向制冷主机4#
    // { key:22, x:564, y:20, label:'锚点', width:2, height:2 }
]
const statusMaps = {
    0:'#42c940',
    1:'red'
}
let graph = null;
let nodeMaps = {};

function FreezeStation({ dispatch, user }){
    const { authorized, theme } = user;
    const containerRef = useRef();
    const imgRef = useRef();
    useEffect(()=>{
        
        graph = new Graph({
            container:containerRef.current,
            width:containerRef.current.offsetWidth,
            height:containerRef.current.offsetHeight
        });
       
        // graph.on('node:mouseenter',({ e, node, view })=>{
        //     console.log(e);
        //     console.log(node);
        //     console.log(view);
        //     console.log(node.getBBox());
        // })
        if ( localStorage.getItem('x6')){
            graph.fromJSON(JSON.parse(localStorage.getItem('x6')));
            graph.getNodes().forEach(item=>{
                nodeMaps[item.data.key] = item;
            })
            // 连接所有节点内部的连接桩
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
            graph.getNodes().forEach(item=>{
                if ( item.ports && item.data.innerPorts ) {
                    item.data.innerPorts.forEach(innerPort=>{
                        graph.addEdge({
                            ...defaultEdgeStyle,
                            source:{ cell:nodeMaps[item.data.key], port:innerPort.source },
                            target:{ cell:nodeMaps[item.data.key], port:innerPort.target }
                        })
                    })
                }
            })         
        }
        return ()=>{
            graph = null;
            nodeMaps = {};
        }
    },[])
    console.log('render');
    return (
        <div style={{ height:'100%', padding:'1rem 1rem 2rem 1rem' }}>
            <div style={{ height:'10rem', marginBottom:'1rem', backgroundColor:theme === 'dark' ? '#191932' : '#fff' }}>
                <Button onClick={()=>{
                    console.log(graph.getNodes());
                }}>查看所有节点</Button>
                <Button onClick={()=>{
                    localStorage.setItem('x6', JSON.stringify(graph.toJSON()));
                }}>保存</Button>
                
                <Button onClick={()=>{        
                    setTimeout(()=>{                    
                        allEdges.forEach(item=>{
                            graph.addEdge({
                                ...item,
                                source:{ cell:nodeMaps[item.source.cell], port:item.source.port },
                                target:{ cell:nodeMaps[item.target.cell], port:item.target.port }
                            })
                        })
                    },1000)
                    
                }} >更新</Button>
            </div>
            <div style={{ height:'calc( 100% - 11rem)' }} ref={containerRef}>
            </div>
        </div>
    )
}

export default connect(({ user })=>({ user }))(FreezeStation);