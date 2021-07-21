import React, { useContext, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Table, Input, Button, Popconfirm, Form } from 'antd';
import echarts from 'echarts';
import style from '../AgentMonitor.css';
import returnImg from '../../../../public/agent/return.png';
import labelBg from '../../../../public/agent/label-bg.png';
import pointBg from '../../../../public/agent/point.png';
import userActivityBg from '../../../../public/agent/userActivity-bg.png';
import newWarning from '../../../../public/agent/new-warning.png';
import { mapNameToCode } from '../mapNameToCode';

const infoList = [
    { key:'公司', value:'西文思'},
    { key:'位置', value:'配电房'},
    { key:'设备', value:'变压器#1'},
    { key:'告警类型', value:'三相电流不平衡'},
    { key:'告警时间', value:'2020-12-01'}
];

let example = {
    area: "惠城区",
    cate_code: 3,
    city: "惠州市",
    company_name: "华翊智能科技有限公司",
    date_time: "2020-10-12 10:19:07",
    lat: "23.017062",
    lng: "114.357668",
    mach_name: "一号楼电表",
    province: "广东省",
    record_id: 265,
    region_name: "一号车间",
    type_name: "通讯异常",
    warning_direction: 0,
    warning_info: "设备通讯异常",
    warning_value: ""
}
let timer = null;
let frameTimer = null;
let defaultCode = '100000';
let myChart;
let chinaCenter = [104.299012, 28.480215];
let firstLoaded = true;

function WarningMap({ warningInfo, dispatch }){
    const containerRef = useRef(null);
    async function fetchData(obj = { code:defaultCode, name:'全国' }){
        let data;
        if ( myChart && myChart.clear ){
            myChart.clear();
        }
        import('../../../../public/maps/'+obj.code + '.json')
        .then((data)=>{
            // console.log(data);
            echarts.registerMap('selfMap3', data);
            let option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}<br/>{c} (p / km2)'
                },
                toolbox: {
                    show:false,
                    orient: 'vertical',
                    left: 'right',
                    top: 'center',
                    feature: {
                        dataView: {readOnly: false},
                        restore: {},
                        saveAsImage:{}
                    }
                },
                geo:{
                    map:'selfMap3',
                    aspectScale: 0.75,
                    zoom:0.02,
                    itemStyle:{
                        areaColor:'#95f9fb',
                    },
                    layoutCenter:['50%','50%'],
                    layoutSize:'90%',
                    itemStyle:{
                        // borderColor:'#9ceffd',
                        // borderWidth:6,
                        shadowColor:'#0c4d74',
                        shadowOffsetX:4,
                        shadowOffsetY:8
                    }     
                },
                series: [
                    {
                        type:'map',
                        map:'selfMap3',
                        zoom:0.02,
                        aspectScale: 0.75,
                        itemStyle:{
                            areaColor:'#207eb8',
                            borderColor: '#1b72a7',
                            borderWidth: 1,
                        },
                        layoutCenter:['50%','50%'],
                        layoutSize:'90%',
                        label:{
                            show:false,
                            distance:4,
                            fontSize:10,
                            color:'#fff'   
                        },
                        emphasis:{
                            itemStyle:{},
                            label:{
                                color:'#fff'
                            }
                        },
                        data: data && data.features ? data.features.map(item=>item.properties) : []
                    }
                ]
            };
            myChart.setOption(option, true);
            function renderMotion(){
                let prevOption = myChart.getOption();
                let scaleRatio = prevOption.geo[0].zoom;
                scaleRatio += 0.02;
                prevOption.geo[0].zoom = scaleRatio;
                prevOption.series[0].zoom = scaleRatio;
                if ( scaleRatio >= 1 ){
                    prevOption.geo[0].itemStyle.borderColor='#9ceffd';
                    prevOption.geo[0].itemStyle.borderWidth = 6;
                    prevOption.series[0].label.show = true;
                    let scatterChart = {
                        type:'effectScatter',
                        name:'effectScatter',
                        coordinateSystem:'geo',
                        rippleEffect: {
                            brushType: 'stroke',
                            scale:4
                        },
                        showEffectOn: 'render',
                        symbol:'circle',
                        itemStyle:{
                            color:'#d80e10',

                        },
                        label:{
                            show:true,
                            position:'top',
                            align:'left',
                            backgroundColor:{
                                image:newWarning
                            },
                            width:180,
                            height:100, 
                            offset:[8,-86],
                            formatter:(params)=>{
                                return [
                                    `{title|${warningInfo.company_name}}`,
                                    `{mach|${warningInfo.mach_name}}`,
                                    `{data|${warningInfo.type_name}}`,
                                    `{region|${warningInfo.region_name}}`
                                ].join('\n');
                            },
                            
                            rich:{
                                title:{
                                    width:180,
                                    height:24,
                                    color:'#fff',
                                    fontSize:12,
                                    padding:[0,0,0,10]
                                },
                                mach:{
                                    fontSize:12,
                                    width:180,
                                    height:20,
                                    color:'#fff',
                                    padding:[0,0,0,10]
                                },
                                data:{
                                    fontSize:20,
                                    width:180,
                                    height:30,
                                    color:'#fff',
                                    padding:[0,0,0,10]
                                },
                                region:{
                                    fontSize:12,
                                    height:20,
                                    width:180,
                                    color:'#fff',
                                    padding:[0,0,0,10]
                                }
                            }
                        },
                        data:[{ name:warningInfo.company_name, value:[+warningInfo.lng, +warningInfo.lat, 10]}]
                    }
                    let point = myChart.convertToPixel('geo',[+warningInfo.lng, +warningInfo.lat]);
                    if ( point && point.length ){
                        // console.log([point, [point[0], point[1]-80], [point[0] + 20, point[1] - 100]]);
                        prevOption.graphic = [{
                            type:'polyline',
                            shape:{
                                points:[point, [point[0], point[1]-90], [point[0] + 10, point[1] - 100]]
                            },
                            zlevel:10,
                            style:{
                                lineWidth:1,
                                stroke:'#d90e0e'
                            }
                        }]
                    }
                    prevOption.series.push(scatterChart);
                    myChart.setOption(prevOption);
                    window.cancelAnimationFrame(frameTimer);
                    dispatch({ type:'agentMonitor/toggleRunning', payload:false });
                    return;
                } else {
                    myChart.setOption(prevOption);
                    frameTimer = window.requestAnimationFrame(renderMotion);
                }                
            }
            renderMotion();
        })
    }
     // 注册echarts实例
     useEffect(()=>{
        let dom = containerRef.current;
        myChart = echarts.init(dom);
        function handleResize(){
            myChart.resize();
        }
        window.addEventListener('resize', handleResize);
        return ()=>{
            // 卸载时注销事件，重置状态
            firstLoaded = true;
            myChart = null; 
            window.cancelAnimationFrame(frameTimer);
            window.removeEventListener('resize', handleResize);
            
        }
    },[]);
    function removeChart(){
        return new Promise((resolve, reject)=>{
            function renderMotion2(){
                let prevOption = myChart.getOption();
                let scaleRatio = prevOption.geo[0].zoom;
                scaleRatio -= 0.02 ;
                prevOption.series[0].label.show = false;
                prevOption.series = [prevOption.series[0]];
                prevOption.geo[0].zoom = scaleRatio;
                prevOption.series[0].zoom = scaleRatio;
                if ( scaleRatio <= 0 ){
                    window.cancelAnimationFrame(frameTimer);
                    if (myChart && myChart.clear ){
                        myChart.clear();
                    }
                    resolve();
                    return;
                } else {
                    myChart.setOption(prevOption);
                    frameTimer = window.requestAnimationFrame(renderMotion2);
                }                
            }
            renderMotion2();
        })
    }
    function startMotion(data){
        window.cancelAnimationFrame(frameTimer);
        if(firstLoaded){
            // 首次加载直接请求数据
            fetchData(data)
            .then(()=>{
                firstLoaded = false;
            })
        } else {
            // 先清除之前渲染的地图，再开启请求motion
            removeChart()
            .then(()=>{
                fetchData(data);
            })
        }
    }
    // 监听provice变化,实时显示最新告警数据,请求相应的省份地图数据
    useEffect(()=>{
        console.log(warningInfo);
        console.log(mapNameToCode[warningInfo.province]);
        startMotion({ name:warningInfo.province, code:mapNameToCode[warningInfo.province]});
    },[warningInfo]);
   
    return (
        <div style={{ position:'relative', height:'100%', width:'100%'}}>
            <div 
            ref={containerRef} 
            style={{ position:'absolute', top:'0px', height:'80%', width:'100%'}}
            // onMouseOver={handleMouseOver}
            // onMouseOut={handleMouseOut}
            ></div>
            <div style={{ 
                position:'absolute', 
                left:'40px', 
                top:'60px', 
                color:'#fff',
                border:'6px solid transparent',
                borderImage:`url(${labelBg}) 6 repeat`,
                backgroundColor:'#0d3d70'
            }}>
                <span style={{ padding:'0 6px'}}>
                    <span>当前:</span>
                    <span style={{ marginLeft:'6px'}}>{ warningInfo.province || '' }</span>
                </span>
            </div>
            {/* {
                currentProvince && currentProvince.name 
                ?
                <div style={{ position:'absolute', right:'0', bottom:'40px', color:'#fff', zIndex:'10', cursor:'pointer' }} onClick={()=>{
                    
                }}>
                    <div style={{ width:'120px' }}><img src={returnImg} style={{ width:'100%' }} /></div>
                    <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', whiteSpace:'nowrap' }}>
                        { currentCity && currentCity.name ? `返回${currentProvince.name}` : '返回全国'}
                    </div>
                </div>
                :
                null
            } */}
            <div style={{ 
                position:'absolute', 
                width:'0', 
                top:'80%',
                height:'100px',  
                left:'50%', 
                transform:'translateX(-50%)',
                backgroundColor:'rgb(16, 66, 109, 0.5)',
                border:'10px solid transparent',
                borderImage:`url(${userActivityBg}) 10 repeat`, 
                animation:`${style['motion2']} 1s ease-in forwards`
            }}>
                <div style={{ height:'100%', display:'flex', alignItems:'center', opacity:0, animation:`${style['motion3']} 1s 1s ease-out forwards` }}>
                    {
                        infoList.map((item,index)=>(
                            <div key={index} style={{ flex:'1', whiteSpace:'nowrap', marginRight:'10px' }}>
                                <div style={{ color:'#16e6ff' }}>{ item.key }</div>
                                <div style={{ fontSize:'1rem', marginTop:'6px'}}>{ 
                                    index === 0 ? warningInfo.company_name || '--' :
                                    index === 1 ? warningInfo.region_name || '--' :
                                    index === 2 ? warningInfo.mach_name || '--': 
                                    index === 3 ? warningInfo.type_name || '--':
                                    index === 4 ? warningInfo.date_time || '--' : ''
                                }</div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
        
    
    )
}


export default WarningMap;