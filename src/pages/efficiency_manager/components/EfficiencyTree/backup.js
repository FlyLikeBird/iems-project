import React, { useRef, useState, useEffect, useMemo } from 'react';
import { routerRedux } from 'dva/router';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import symbolImg from '../../../../../public/tree-symbol.png';
// deep 表示树结构的层级关系
let loaded = false;
const sameLevelNodes = {};
function formatData(data, deep = 0, index){
    if ( loaded ) return ;
    data.name = data.title;
    data.deep = deep;
    if ( deep >= 2 ){
        // 深层子节点
        // 将同一层级节点信息缓存起来
        if ( !sameLevelNodes[deep] ){
            sameLevelNodes[deep] = [];
            sameLevelNodes[deep].push(data);
        } else {
            let prevData = sameLevelNodes[deep][0];
            // 保证数组第一项为字符最多的item
            if ( data.name.length > prevData.name.length ) {
                sameLevelNodes[deep].unshift(data);
            } else {
                sameLevelNodes[deep].push(data);
            }
        }
        data.collapsed = true;
        
    } else {
        if ( deep === 1 && index === 0 ){
            data.collapsed = false;
        } else if ( deep === 1 ){
            data.collapsed = true;
        }
        data.symbol = 'rect';
        data.symbolSize = [100, 100];
        data.label = {
            borderColor:'#dcdcdc',
            borderWidth:1,
            borderRadius:6
        }
    }
    if(data.children && data.children.length){
        data.children.map((item, index)=>{
            let temp = deep;
            formatData(item, ++temp, index);
        })
    } 
}

function setNodeHeight(data, deep = 0){
    if ( deep >= 2 ){
        let maxLength = sameLevelNodes[deep].length ? sameLevelNodes[deep][0].title.length : 0;
        let maxHeight = maxLength * 12;
        data.symbol = 'rect';
        data.symbolSize = [30, maxHeight - 10];
        // 如果电能超过定额值
        if ( data.quota && data.quota < data.energy) {
            data.label = {
                width:30,
                padding:[10,4],
                height: maxHeight,
                backgroundColor:'#f56363',
                color:'#fff',
                borderRadius:6
            }
        } else {
            data.label = {
                width:30,
                padding:[10,4],
                height: maxHeight,
                borderColor:'#dcdcdc',
                borderWidth:1,
                borderRadius:6
            }
        }
    }
    if ( data.children && data.children.length){
        data.children.map((item,index)=>{
            let temp = deep;
            setNodeHeight(item, ++temp);
        })
    }
}

function getCanvas(isWarning, percent){
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e0e0e0';
    // 完整进度条
    // ctx.rect(0, 0, 300, 200)
    ctx.rect(0,0,300,140);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = isWarning ? '#f56363' : '#65cae3';
    // 进度条占比
    let width = percent === 0 ? 0 : Math.round(300*(percent/100));
    ctx.rect(0,0,width,200);
    ctx.fill();
    return canvas;
}

const warningProgress = {},
    normalProgress = {}, 
    leavesWarningProgress = {}, 
    leavesNormalProgress = {},
    spaceItem = {};

for(var i=0;i<=100;i++){
    warningProgress['warningProgress'+i] = {
        width:160,
        height:6,
        backgroundColor:{
            image:getCanvas(true, i)
        },
        borderRadius:30
    };
    normalProgress['normalProgress'+i] = {
        width:160,
        height:6,
        backgroundColor:{
            image:getCanvas(null, i)
        },
        borderRadius:30
    };
    leavesWarningProgress['leavesWarningProgress'+i] = {
        width:38,
        height:6,
        backgroundColor:{
            image:getCanvas(true, i)
        },
        borderRadius:30
    };
    leavesNormalProgress['leavesNormalProgress' + i] = {
        width:38,
        height:6,
        backgroundColor:{
            image:getCanvas(null, i)
        },
        borderRadius:30
    }
}

for(var i=0;i<=300;i++){
    spaceItem['space' + i] = {
        height:i
    }
}


// 树状图数据渲染机制是递归从最外层到最内层
function EfficiencyTree({ data, onDispatch, currentField, currentAttr }) {   
    formatData(data)
    const [treeData, updateTreeData] = useState(data);
    setNodeHeight(data);
    loaded = true;
    const onEvents = {
        // 'click':(params)=>{
        //     if(params.componentType === 'series' && params.type === 'click'){
        //         // console.log(currentAttr);
        //         onDispatch(routerRedux.push({
        //             pathname:'/info_manage_menu/quota_manage',
        //             query:{
        //                 fieldId:currentField.field_id,
        //                 attrNode:params.data,
        //                 energyType:5
        //             }
        //         }));
        //     }
        // },
        'click':(params)=>{
            console.log(params);
            let currentNode = params.data;
        },
        
    };
    const echartsRef = useRef();
    console.log(sameLevelNodes);
    console.log(treeData);
    return (     
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%'}}
            onEvents={onEvents}
            option={{
                tooltip: {
                    trigger: 'item',
                    triggerOn:'mousemove',
                    formatter:(params)=>{
                        if ( params.data.deep >= 2 ){
                            return `
                            <div>
                                <div>${params.data.name}:</div>
                                <div>能耗值:${Math.floor(params.data.energy)} kwh</div>
                                <div>定额值:${params.data.quota} kwh</div>
                                <div>定额占比:${params.data.quota ? (params.data.energy / params.data.quota * 100).toFixed(1) : 0.0} %</div>
                            </div>`;
                        } else {
                            return '';
                        }
                    }
                },
                series:[
                    {
                        type: 'tree',       
                        data: [treeData],      
                        left: '4%',
                        right: '4%',
                        top: '10%',
                        bottom: '10%',      
                        orient: 'vertical',  
                        edgeShape:'polyline',
                        edgeForkPosition:'50%',
                        // symbol:`image://${symbolImg}`,
                        // symbolSize:[40, 100],
                        animate:false,
                        // expandAndCollapse: true, 
                        // 默认不开启缩放
                        roam:'move',                      
                        label: {
                            backgroundColor: '#fff',
                            align:'center',
                            verticalAlign: 'middle',    
                            color:'rgba(0, 0, 0, 0.65)',
                            formatter: params=>{
                                // console.log(params);
                                let temp = params.data.quota ? (params.data.energy/params.data.quota*100).toFixed(1) : 0.0;
                                let percent = params.data.quota ? temp >= 100 ? 100 : temp : 0;
                                let over = params.data.quota && params.data.energy >= params.data.quota  ? true : false;                             
                                // 当子节点嵌套层级大于2，则渲染成缩略图形
                                if ( params.data.deep >= 2 ){
                                    // console.log(params);
                                    let maxLength = sameLevelNodes[params.data.deep].length ? sameLevelNodes[params.data.deep][0].title.length : 0;
                                    let totalHeight = maxLength * 12;
                                    // totalHeight = 计算出的字符高度 + padding值
                                    let spaceHeight = Math.floor(totalHeight + 10 - params.data.title.length * 12 - 6);
                                    let nameArr = params.data.name.split('').map(str=>{                                   
                                        return `${str === '（' ? '︵' : str === '）' ? '︶': str }`;
                                    });
                                    return [                                                                                
                                            ...nameArr,
                                            `{space${spaceHeight}|}`,
                                            // `{${ over ? '' : `leavesNormalProgress${Math.round(percent)}|`}}`,
                                            over ? '' : `{leavesNormalProgress${Math.round(percent)}|}`
                                        ].join('\n')
                                    
                                } else {
                                    return [
                                        `{${over ? 'warningTitle':'normalTitle'}|${params.data.name}}`,
                                        `{value|${Math.floor(params.data.energy)}}{unit|kwh}`,
                                        `{info|定额值:${params.data.quota}}{unit|${params.data.quota ? 'kwh':''}} {percent|${temp ? temp+'%':'电能额度未设定'}}`,
                                        `{${over? `warningProgress${Math.round(percent)}`: `normalProgress${Math.round(percent)}`}|}`
                                    ].join('\n');   
                                }                            
                            },
                            rich: {//给不同的数据应用不同的样式
                                warningTitle: {
                                    width:140,
                                    color: '#fff',
                                    backgroundColor:'#f56363',
                                    padding:10,
                                    align:'left',
                                    borderRadius:[6,6,0,0],
                                    fontSize: 14
                                },                            
                                normalTitle: {
                                    width:140,
                                    color: '#fff',
                                    backgroundColor:'#65cae3',
                                    padding:10,
                                    align:'left',
                                    borderRadius:[6,6,0,0],
                                    fontSize: 14
                                },     
                                                     
                                value: {
                                    color: '#000',
                                    fontSize: 14,
                                    padding:10,
                                    height:20,
                                    align:'left',
                                    fontWeight: 'bold'
                                },
                                unit:{
                                    color:'rgba(0, 0, 0, 0.65)',
                                    fontSize:12,
                                    align:'left'
                                },
                                percent:{
                                    color:'rgba(0, 0, 0, 0.65)',
                                    padding:[0,10,0,0],
                                    align:'right',
                                    fontSize:12
                                },
                                space:{
                                    height:100
                                },
                                info:{
                                    color:'rgba(0, 0, 0, 0.65)',
                                    padding:[10,0,10,10],
                                    align:'left',
                                    fontSize:10
                                },
                                ...warningProgress,
                                ...normalProgress,
                                ...leavesWarningProgress,
                                ...leavesNormalProgress,
                                ...spaceItem
                            }
                        },   
        
                        // animationDurationUpdate: 750
                    }
                ]
            }}
        />   
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
