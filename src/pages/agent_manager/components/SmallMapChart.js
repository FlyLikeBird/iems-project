import React, { useContext, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Table, Input, Button, Popconfirm, Form } from 'antd';
import echarts from 'echarts';
import style from '../AgentMonitor.css';


let timer = null;
let defaultCode = '100000';
let myChart;
function SmallMapChart({ companys, currentProvince, isRunning, dispatch }){
    const containerRef = useRef(null);
    // console.log(currentProvince);
    const proviceRef = useRef(null);
    const isRunningRef = useRef(isRunning);
    useEffect(()=>{
        isRunningRef.current = isRunning;
    },[isRunning])
    useEffect(()=>{
        proviceRef.current = currentProvince;
    },[currentProvince]);
    function fetchData(obj = { code:defaultCode, name:'全国' }){
        import('../../../../public/maps/' + obj.code +'.json')
        .then((data)=>{
            // 当展示全国地图时，为了显示效果，去除掉海南省周边零碎岛屿
            data = data.default ? data.default : data;
            if ( obj.name === '全国') {   
                let temp = data.features.map(item=>{
                        if ( item.properties.name === '海南省'){
                            item.geometry.coordinates = [item.geometry.coordinates[0]];
                            return item;
                        } else {
                            return item;
                        }
                    });
                temp = temp.filter(item=>item.properties.name);
                data.features = temp;   
            } 
            echarts.registerMap('selfMap', data);
            let option = {
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}'
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
                    map:'selfMap',
                    zoom:1,
                    layoutCenter:['50%','50%'],
                    layoutSize:'100%',
                    itemStyle:{
                        borderColor: '#1b4568',
                        borderWidth: 0.5,
                        areaColor:'#3a8fc6',
                        opacity:1,
                    }
                },
                series: [
                    {
                        name: '',
                        type: 'map',
                        map: 'selfMap', // 自定义扩展图表类型
                        label: {
                            show: false,
                            color:'#fff'
                        },
                        zoom:1,
                        layoutCenter:['50%','50%'],
                        layoutSize:'100%',
                        itemStyle:{
                            borderColor: '#1b4568',
                            borderWidth: 0.5,
                            areaColor:'#3a8fc6',
                        },
                        emphasis:{
                            itemStyle:{
                                areaColor:'#3bd4ff',
                            },
                            label:{
                                show:false
                            }
                        },
                        data:data.features.map(item=>{
                            if ( item.properties.name === currentProvince.name ){
                                item.properties.selected = true;
                            }
                            return item.properties;
                        }),
                    },
                    {
                        type:'effectScatter',
                        name:'公司',
                        coordinateSystem:'geo',
                        zlevel:1,
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        showEffectOn: 'render',
                        symbol:'circle',
                        symbolSize:8,
                        itemStyle:{
                            color:'#92daee',
                            // shadowBlur:10,
                            // shadowColor:'#7ee9fb',
                        },
                        data:companys.map((item)=>({ name:item.company_name, value:[item.lng, item.lat]}))
                    }
                ]
            };
            myChart.setOption(option, true);
        })
    }
    
    const handleClick = (params)=>{
        // console.log(params);
        if ( !proviceRef.current ) return;
        if ( proviceRef.current.name === params.data.name ) return;
        if ( params.componentType === 'series' && params.componentSubType === 'map'){
            dispatch({ type:'agentMonitor/setCurrentProvince', payload:{ data:{ code:params.data.adcode, name:params.data.name }}})
            dispatch({ type:'agentMonitor/setCurrentCity', payload:{ data:{}}});
        }
    }
    // 监听geo坐标系的拖动缩放
    const handleGeoRoam = (params)=>{
        let option = myChart.getOption();  
        if ( params.zoom ) {
            option.geo[0].zoom = option.series[0].zoom;
            option.geo[0].center = option.series[0].center;
        } else {
            option.geo[0].center = option.series[0].center;
        } 
        myChart.setOption(option, true);
    }

    useEffect(()=>{
        let dom = containerRef.current;
        myChart = echarts.init(dom);
        // 初次加载
        fetchData();
        myChart.on('click', handleClick);
        myChart.on('georoam', handleGeoRoam);
        function handleResize(){
            myChart.resize();
        }
        window.addEventListener('resize', handleResize);
        return ()=>{
            myChart.off('click');
            myChart.dispose();
            window.removeEventListener('resize', handleResize);
        }
    },[]);
    // 监听省份变化
    useEffect(()=>{
        let prevOption = myChart.getOption();
        if ( prevOption && Object.keys(prevOption).length ){
            prevOption.series[0].data = prevOption.series[0].data.map((item)=>{
                item.selected = false;
                if ( item.name === currentProvince.name ) {
                    item.selected = true;
                } 
                return item;
            });
            myChart.setOption(prevOption);
        }
    },[currentProvince])
    return (
        <div 
            ref={containerRef} 
            style={{ position:'relative', height:'100%', width:'100%'}}
        >
        </div>
    
    )
}

export default SmallMapChart;