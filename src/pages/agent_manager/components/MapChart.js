import React, { useContext, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Table, Input, Button, Popconfirm, Form } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import echarts from 'echarts';
import 'echarts-gl';
import style from '../AgentMonitor.css';
import returnImg from '../../../../public/agent/return.png';
import labelBg from '../../../../public/agent/label-bg.png';
import pointBg from '../../../../public/agent/point.png';
import texture from '../../../../public/texture.jpg';
import tooltipBg from '../../../../public/agent/new-warning.png';
let timer1 = null;
let timer2 = null;
let warningTimer = null;
let area = null;
let currentCompany = null;
let defaultCode = '100000';
let myChart;
let regionsMap;
// let chinaCenter = [104.299012, 28.480215];
function MapChart({ currentProvince, currentCity, companys, autoMode, agentMsg, dispatch }){
    const containerRef = useRef(null);
    const tooltipRef = useRef();
    const currentCityRef = useRef(currentCity);
    const [currentInfo, setCurrentInfo] = useState({});
    useEffect(()=>{
        currentCityRef.current = currentCity;
    },[currentCity]);
    async function fetchData(obj){
        let params = !Object.keys(obj).length ? { code:defaultCode, name:'全国'} : obj;;
        if ( myChart && myChart.clear ){
            myChart.clear();
        }
        if ( tooltipRef.current ){
            tooltipRef.current.style.display = 'none';
        }
        clearTimeout(warningTimer);
        clearTimeout(timer1);
        clearTimeout(timer2);
        import('../../../../public/maps/'+ params.code + '.json')
        .then((data)=>{
            // console.log(data);
            regionsMap = data.features;
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
            // if ( obj.name === '海南省') {
            //     console.log(data);
            //     let temp = data.features.map((item)=>{
            //         item.geometry.coordinates = [item.geometry.coordinates[0]];
            //         return item;
            //     });
            //     console.log(temp);
            //     data.features = temp;
            // }
            echarts.registerMap('selfMap2', data);
            let option = {
                tooltip: {
                    trigger: 'item',
                    // alwaysShowContent:true,
                    triggerOn:'mousemove',
                    position:(point, params, dom, rect, size)=>{
                        let centerX = 0, centerY = 0;
                        if ( containerRef.current ){
                            centerX = containerRef.current.offsetWidth / 2;
                            centerY= containerRef.current.offsetHeight /2 ;
                        }
                        // console.log(size);
                        return { left:centerX - size.contentSize[0] / 2, top:centerY - size.contentSize[1] / 2};
                    },
                    enterable:true,
                    formatter:params=>{
                        let level;
                        if ( currentCityRef.current && currentCityRef.current.name ){
                            // 市地图
                        } else {
                            
                            // 全国地图
                            level = params.data.province;
                            let list = companys.filter(i=>i.province === level);
                            // console.log(companys);
                            // console.log(level);
                            // console.log(list);
                            let temp = `<div>${level}:</div>`;
                            list.forEach(item=>{
                                temp += `<div class='my-tooltip-item'>
                                    <span>${item.company_name}</span>
                                    <span class='my-tooltip-button' onclick='handleTooltipClick(${item.company_id})'>进入项目</span>
                                </div>`

                            });
                            // console.log(list);
                            return '<div class="my-tooltip-container">' + temp + '</div>';
                        }
                    }
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
                    map:'selfMap2',
                    show:false,
                    aspectScale: 0.75,
                    layoutCenter:['50%','50%'],
                    layoutSize:'110%',
                },
                geo3D:{
                    map:'selfMap2',
                    aspectScale: 0.75,
                    shading:'color',
                    // environment:'../../../../public/agent-bg.png',
                    regionHeight:1,
                    // postEffect:{
                    //     enable:true,
                    //     SSAO: {
                    //         radius: 1,
                    //         intensity: 1,
                    //         enable: true
                    //     },
                    //     depthOfField: {
                    //         enable: false,
                    //         focalRange: 10,
                    //         blurRadius: 10,
                    //         fstop: 1
                    //     }
                    // },
                    // layoutCenter:['50%','50%'],
                    // layoutSize:'96%',
                    itemStyle:{
                        borderColor:'#9ceffd',
                        borderWidth:1,
                        shadowColor:'#0c4d74',
                        shadowOffsetX:4,
                        shadowOffsetY:8,
                    },
                    light:{
                        main:{
                            color:'#136695',
                            intensity:1.2,
                            shadow:true,
                            alpha:120,
                            beta:40
                        },
                        ambient: {
                            color:'#fff',
                            intensity: 0.2
                        }
                        
                    },
                    colorMaterial:{
                        detailTexture:texture
                    },
                    viewControl:{
                        alpha:5,
                        beta:0,
                        animationDurationUpdate:2000
                    },
                    emphasis:{
                        label:{
                            show:true,
                            formatter:(params)=>{
                                area = params.name;
                                return params.name;
                            }
                        },                        
                    }
                }
            };
            timer1 = setTimeout(()=>{
                let prevOption = myChart.getOption();
                prevOption.geo3D[0].viewControl = { ...prevOption.geo3D[0].viewControl, alpha:30, beta:0 };
                myChart.setOption(prevOption);
            },600);
            // timer2 = setTimeout(()=>{
                let points = currentProvince && currentProvince.name 
                ?
                currentCityRef.current && currentCityRef.current.name
                ?
                companys.filter(item=>item.city === currentCityRef.current.name).map(item=>({ name:item.company_name, value:[+item.lng, +item.lat, 2], selected:false, province:item.province, city:item.city }))
                :
                companys.filter(item=>item.province === currentProvince.name ).map((item)=>({ name:item.company_name, value:[+item.lng, +item.lat, 2], selected:false, province:item.province, city:item.city }))
                :
                companys.map((item, index)=>({ name:item.company_name, value:[+item.lng, +item.lat, 2], selected:false, province:item.province, city:item.city }));
                if ( points.length ){
                    points.push({ name:'', selected:false, value:[points[0].value.lng, points[0].value.lat, 1]});
                    points.push({ name:'', selected:false, value:[points[0].value.lng, points[0].value.lat, 10]});
                
                    let scatterChart = {
                        type:'scatter3D',
                        name:'scatter3D',
                        coordinateSystem:'geo3D',
                        // ******* 三维散点图的高度是由最小值和最大值的区间决定的，通过设定最小值和最大值来调整到想要的宽度;  ********
                        symbol:'pin',
                        symbolSize:(value, params)=>{       
                            // console.log(params);        
                            return value[2] === 1 || value[2] === 10 ? 0 : params.data.selected ? 50 : 24;
                        },
                        // symbolSize:20,
                        // symbolSize:[20,30],
                        itemStyle:{
                            // color:'#92daee',
                            color:'#ffa733',
                            borderWidth:0.5,
                            borderColor:'#fff'
                        },
                        animationDurationUpdate:1000,
                        // blendMode:'lighter',
                        label:{
                            show:false,
                            // position:'top',
                            // distance:20,
                            // formatter:(params)=>{
                            //     return `{a|${params.data.name}}`;
                            // },
                            // rich:{
                            //     a:{
                            //         backgroundColor:'rgba(0, 0, 0, 0.5)',
                            //         padding:4,
                            //         borderColor:'#59bef0',
                            //         borderWidth:1,
                            //         color:'#fff'
                            //     }
                            // }
                        },
                        // 筛选出当前省份
                        data: points
                    };
                    option.series = [scatterChart];
                }
                // console.log(agentMsg);
                myChart.setOption(option);
                warningTimer = setTimeout(()=>{
                    createTooltip(agentMsg);
                },2500)

            // },2000)
           
        })
    }
    // 如有告警信息自动生成tooltip
    function createTooltip(agentMsg){
        let current = companys.filter(i=>i.company_name === agentMsg.company_name)[0];
        if ( current && tooltipRef.current ){
            let pos = myChart.convertToPixel('geo', [+current.lng, +current.lat]);
            if ( !pos ) return;
            // let y = Math.floor(pos[1] * Math.sin(Math.PI/3)) ;
            // window.alert(current.company_name+pos[0]+ '/' + pos[1] + '/' + y);
            tooltipRef.current.style.display = 'block';
            tooltipRef.current.style.left = pos[0] + 'px';
            // 减去tooltip自身的高度
            tooltipRef.current.style.top = Math.floor(pos[1] * Math.sin(Math.PI/4)) - 20 + 'px';
            let prevOption = myChart.getOption();
            if ( prevOption.series && prevOption.series[0] ) {
                let temp = prevOption.series[0].data.map(item=>{
                    if ( item.name === current.company_name) {
                        item.selected = true;
                        item.itemStyle = {
                            color:'red'
                        }
                        return item;
                    } else {
                        item.itemStyle = {
                            color:'#ffa733'
                        }
                        item.selected = false;
                        return item;
                    }
                })
                prevOption.series[0].data = temp;
                myChart.setOption(prevOption);
                setCurrentInfo(agentMsg);
            } 
        }
    }
    // 监听单击事件，切换到某个省份
    const handleClick = (params)=>{
        // console.log(params);
        if ( !area || area === '东沙群岛') return;
        let result = regionsMap.filter(i=>i.properties.name === area )[0];
        if ( !result ) return;
        // 判断鼠标是否点击在有效区域
        let canvas = containerRef.current ? containerRef.current.childNodes[0] : null;
        if ( canvas.style.cursor === 'pointer') {
            let { adcode, name, level } = result.properties;
            if ( level === 'province') {
                dispatch({ type:'agentMonitor/setCurrentProvince', payload:{ data:{ code:adcode, name }}});
            } else if ( level === 'city'){
                dispatch({ type:'agentMonitor/setCurrentCity', payload:{ data:{ code:adcode, name }}});
            }
        }
    }    
  
    // 监听geo坐标系的拖动缩放
    const handleGeoRoam = (params)=>{
        if ( autoMode ) return;
        let option = myChart.getOption();  
        if ( params.zoom ) {
            option.geo[0].zoom = option.series[0].zoom;
            option.geo[0].center = option.series[0].center;
        } else {
            option.geo[0].center = option.series[0].center;
        } 
        myChart.setOption(option, true);
    }
     // 注册echarts实例
     useEffect(()=>{
        let dom = containerRef.current;
        myChart = echarts.init(dom);
        myChart.getZr().on('click', handleClick);      
        // myChart.on('georoam',handleGeoRoam);
        function handleResize(){
            myChart.resize();
        }
        window.addEventListener('resize', handleResize);
        
        return ()=>{
            // 卸载时注销事件，重置状态
            myChart.off('click');
            myChart.off('georoam');
            myChart = null; 
            regionsMap = null;
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(warningTimer);
            timer1 = null;
            timer2 = null;
            warningTimer = null;
            area = null;
            window.removeEventListener('resize', handleResize);
        }
    },[]);
    
    // 监听provice变化,请求相应的省份地图数据
    useEffect(()=>{
        fetchData(currentProvince);
    },[currentProvince]);
    // 监听city变化,请求相应的省份地图数据
    useEffect(()=>{
        if ( currentCity && currentCity.name ){
            fetchData(currentCity);
        }
    },[currentCity]);
    // 监听socket告警消息
    useEffect(()=>{
        if ( myChart && Object.keys(agentMsg).length ) {
            clearTimeout(warningTimer);
            warningTimer = setTimeout(()=>{
                createTooltip(agentMsg);
            },2000)
        }
    },[agentMsg])
    return (
        <div style={{ position:'relative', height:'100%', width:'100%'}}>
            <div 
            ref={containerRef} 
            style={{ height:'100%', width:'100%', zIndex:'1' }}
            // onMouseOver={handleMouseOver}
            // onMouseOut={handleMouseOut}
            ></div>
            <div ref={tooltipRef} className={style['warning-tooltip']}>
                <div className={style['warning-title']}>
                    { currentInfo.company_name }
                </div>
                <div className={style['warning-content']} style={{ backgroundImage:`url(${tooltipBg})` }}>
                    <div>{ currentInfo.type_name }</div>
                    <div className={style['data']}>{ currentInfo.warning_info + ' / ' + currentInfo.warning_value }</div>
                    <div>{ currentInfo.region_name || '' + '-' + currentInfo.mach_name }</div>
                </div>
                <div style={{ position:'absolute', right:'4px', top:'4px' }} onClick={(e)=>{
                    e.stopPropagation();
                    if ( tooltipRef.current ){
                        tooltipRef.current.style.display = 'none';
                    }
                }}><CloseOutlined /></div>
            </div>
            <div style={{ 
                position:'absolute', 
                left:'24%', 
                top:'14%',
                zIndex:'2', 
                color:'#fff',
                border:'6px solid transparent',
                borderImage:`url(${labelBg}) 6 repeat`,
                backgroundColor:'#0d3d70'
            }}>
                <span style={{ padding:'0 6px'}}>
                    <span>当前:</span> 
                    <span style={{ marginLeft:'6px' }}>{  currentProvince.name ? `${currentProvince.name}${currentCity.name ? '-' + currentCity.name : ''}` : '全国' }</span>
                </span>
            </div>
            {
                currentProvince && currentProvince.name 
                ?
                <div style={{ position:'absolute', left:'70%', bottom:'10%', color:'#fff', zIndex:'2', cursor:'pointer' }} onClick={()=>{
                    // if ( autoMode ) return;
                    let cityLevel = currentCity && currentCity.name ? true : false;
                    if( cityLevel ){
                        dispatch({ type:'agentMonitor/setCurrentProvince', payload:{ data:{ name:currentProvince.name, code:currentProvince.code }}});
                        dispatch({ type:'agentMonitor/setCurrentCity', payload:{ data:{}}});
                        return;
                    } else {
                        dispatch({ type:'agentMonitor/setCurrentProvince', payload:{ data:{}}});
                        dispatch({ type:'agentMonitor/setCurrentCity', payload:{ data:{}}});
                        
                    }  
                }}>
                    <div style={{ width:'120px' }}><img src={returnImg} style={{ width:'100%' }} /></div>
                    <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', whiteSpace:'nowrap' }}>
                        { currentCity && currentCity.name ? `返回${currentProvince.name}` : '返回全国'}
                    </div>
                </div>
                :
                null
            }
        </div>
    )
}


export default MapChart;