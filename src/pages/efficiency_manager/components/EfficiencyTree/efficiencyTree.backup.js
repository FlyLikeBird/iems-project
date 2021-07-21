import React, { useRef, useEffect, useMemo } from 'react';
import { routerRedux } from 'dva/router';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import progressBg from '../../../../../public/progress.png';
// deep 表示树结构的层级关系
let deep = 0;
function formatData(data){
    data.name = data.title;
    data.deep = deep;
    // if ( data.deep === 0 ){
    //     data.symbol = 'emptyCircle';
    //     data.symbolSize = 10;
    // }
    // if ( data.deep === 1 ){
    //     data.symbol = 'pin';
    //     data.symbolSize = 20;
    // }
    if(data.children && data.children.length){
        ++deep;
        data.children.map(i=>{
            formatData(i);
        })
    } 
}

function getCanvas(isWarning, percent){
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f1f1f1';
    // 完整进度条
    ctx.rect(0,0,300,200);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = isWarning ? '#e83320' : '#65cae3';
    // 进度条占比
    let width = percent === 0 ? 0 : Math.round(300*(percent/100));
    ctx.rect(0,0,width,200);
    ctx.fill();
    return canvas;
}

const warningProgress = {}, normalProgress = {};
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
    }
}
// 树状图数据渲染机制是递归从最外层到最内层
function EfficiencyTree({ data, onDispatch, currentField, currentAttr }) {   
    formatData(data);
    const onEvents = {
        'click':(params)=>{
            if(params.componentType === 'series' && params.type === 'click'){
                // console.log(currentAttr);
                onDispatch(routerRedux.push({
                    pathname:'/info_manage_menu/quota_manage',
                    query:{
                        fieldId:currentField.field_id,
                        attrNode:params.data,
                        energyType:5
                    }
                }));
            }
        },
        'mounseover':(params)=>{
            console.log(params);
            // console.log('helo');
        }
    };
    const echartsRef = useRef();
    return (     
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%'}}
            onEvents={onEvents}
            option={{
                tooltip: {
                    show:false,
                    trigger: 'item',
                    formatter: '{b}: {c}'
                },
                series:[
                    {
                        type: 'tree',       
                        data: [data],      
                        left: '6%',
                        right: '6%',
                        top: '20%',
                        bottom: '20%',      
                        orient: 'vertical',  
                        edgeShape:'polyline',
                        // expandAndCollapse: true, 
                        symbol:'rect',
                        symbolSize:[20,20],
                        // 默认不开启缩放
                        roam:true,
                        label: {
                            backgroundColor: '#fff',
                            align:'center',
                            verticalAlign: 'middle',
                            borderColor: '#e6e6e6',
                            borderWidth: 1,
                            borderRadius: 6,
                            color:'rgba(0, 0, 0, 0.65)',
                            width:160,
                            formatter: params=>{
                                // console.log(data);
                                console.log(params);
                                let temp = (params.data.energy/params.data.quota*100).toFixed(1)
                                let percent = params.data.quota ? temp >= 100 ? 100 : temp : 0;
                                let over = params.data.quota && params.data.energy >= params.data.quota  ? true : false;
                                
                                return [
                                    `{${over ? 'warningTitle':'normalTitle'}|${params.data.name}}`,
                                    `{value|${Math.floor(params.data.energy)}}{unit|kwh}`,
                                    `{info|定额值:${params.data.quota}}{unit|${params.data.quota ? 'kwh':''}} {percent|${percent ? percent+'%':'电能额度未设定'}}`,
                                    `{${over? `warningProgress${Math.round(percent)}`: `normalProgress${Math.round(percent)}`}|}`
                                ].join('\n');                               
                            },
                            rich: {//给不同的数据应用不同的样式
                                warningTitle: {
                                    width:140,
                                    color: '#fff',
                                    backgroundColor:'#e83320',
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
                                info:{
                                    color:'rgba(0, 0, 0, 0.65)',
                                    padding:[10,0,10,10],
                                    align:'left',
                                    fontSize:10
                                },
                                ...warningProgress,
                                ...normalProgress
                            }
                        },   
                        emphasis:{
                            label:{
                                color:'red'
                            }
                        },
                        leaves: {
                            label: {
                                verticalAlign: 'middle',
                                align: 'center'
                            }
                        },                    
                        animationDurationUpdate: 750
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
