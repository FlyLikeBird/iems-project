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
let defaultCode = '100000';
let myChart;
let regionsMap;
let warningInfo = null;
// let chinaCenter = [104.299012, 28.480215];
function MapChart({ currentProvince, currentCity, companys, userId, autoMode, agentMsg, dispatch }){
    const containerRef = useRef(null);
    const tooltipRef = useRef();
    const [currentInfo, setCurrentInfo] = useState({});
    async function fetchData(obj){
        let params = !Object.keys(obj).length ? { code:defaultCode, name:'全国'} : obj;;
        if ( myChart && myChart.clear ){
            // 清空上一次绘制的地图
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
            echarts.registerMap('selfMap2', data);
            let option = {
                tooltip: {
                    trigger: 'item',
                    triggerOn:'mousemove',
                    hideDelay:1000,
                    padding:0,
                    backgroundColor:'rgba(0, 0, 0, 0.65)',
                    position:(point, params, dom, rect, size)=>{
                        let centerX = 0, centerY = 0;
                        if ( containerRef.current ){
                            centerX = containerRef.current.offsetWidth / 2;
                            centerY= containerRef.current.offsetHeight /2 ;
                        }
                        // return { left:centerX - size.contentSize[0] / 2, top:centerY - size.contentSize[1] / 2};
                        return { left:point[0] + 20, top: dom.offsetHeight >= 460 ? centerY - size.contentSize[1] / 2 : point[1] };
                    },
                    enterable:true,
                    formatter:params=>{
                        let list = [];
                        area = params.data.name;
                        let title = '';
                        if ( currentProvince.name ){
                            if ( currentCity.name ){
                                title = currentProvince.name + '-' + currentCity.name + '-' + area;
                                list = companys.filter(i=>i.area === area );
                            } else {
                                title = currentProvince.name + '-' + area;
                                list = companys.filter(i=>i.city === area );
                            }
                        } else {
                            // 全国
                            title = area;
                            list = companys.filter(i=>i.province === area );
                        }
                        let temp = `<div style="padding:0 10px;font-weight:bold;margin:8px 0;">${title}</div>`;
                        temp += `<div class='my-tooltip-content'>`;
                        list.forEach(item=>{
                            temp += `<div class='my-tooltip-item'>
                                <div onclick='handleTooltipClick(${userId},${item.company_id})'>${item.company_name}</div>
                            </div>`
                        });
                        temp += `</div>`;
                        return '<div class="my-tooltip-container">' + temp + '</div>';
                        
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
                    show:false,
                    aspectScale: 0.75,
                    regionHeight:1,
                    viewControl:{
                        alpha:30,
                        beta:0,
                        animationDurationUpdate:1000
                    },
                },
                series:[
                    {
                        type:'map3D',
                        map:'selfMap2',
                        shading:'color',
                        regionHeight:1,
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
                            animationDurationUpdate:1000
                        },
                        emphasis:{
                            label:{ show:false }      
                        }
                    }
                ]
            };
            timer1 = setTimeout(()=>{
                let prevOption = myChart.getOption();
                prevOption.series[0].viewControl = { ...prevOption.series[0].viewControl, alpha:30, beta:0 };
                myChart.setOption(prevOption);
            },800);
            // 筛选出当前层级下的公司列表
            let points = currentProvince && currentProvince.name 
            ?
            currentCity && currentCity.name
            ?
            companys.filter(item=>item.city === currentCity.name).map(item=>({ name:item.company_name, value:[+item.lng, +item.lat, 2], selected:false, province:item.province, city:item.city }))
            :
            companys.filter(item=>item.province === currentProvince.name ).map((item)=>({ name:item.company_name, value:[+item.lng, +item.lat, 2], selected:false, province:item.province, city:item.city }))
            :
            companys.map((item, index)=>({ name:item.company_name, value:[+item.lng, +item.lat, 2], selected:false, province:item.province, city:item.city }));
            if ( points.length ){
                points.push({ name:'', selected:false, value:[points[0].value[0], points[0].value[1], 1]});
                points.push({ name:'', selected:false, value:[points[0].value[0], points[0].value[1], 10]});
                timer2 = setTimeout(()=>{
                    // 判断告警信息框和地图层级之间的关系来确认是否需要渲染
                    let isShow = false;
                    if ( warningInfo ){
                        if ( currentProvince && currentProvince.name ){
                            if ( currentCity && currentCity.name ){
                                if ( warningInfo.city === currentCity.name ) {
                                    isShow = true;
                                } 
                            } else {
                                if ( warningInfo.province === currentProvince.name ){
                                    isShow = true;
                                }
                            }
                        } else {
                            isShow = true;
                        }
                    }
                    if ( isShow ){
                        let pos = myChart.convertToPixel('geo', [+warningInfo.lng, +warningInfo.lat]);
                        if ( !pos ) return;
                        tooltipRef.current.style.display = 'block';
                        tooltipRef.current.style.left = pos[0] + 'px';
                        setCurrentInfo(warningInfo);
                        // 减去tooltip自身的高度
                        tooltipRef.current.style.top = Math.floor(pos[1] * Math.sin(Math.PI/4)) - 20 + 'px';                    
                        points.push({ name:warningInfo.company_name, selected:true, itemStyle:{ color:'red' }, value:[+warningInfo.lng, +warningInfo.lat, 2]});
                    }
                    let prevOption = myChart.getOption();
                    let scatterChart = {
                        type:'scatter3D',
                        name:'scatter3D',
                        coordinateSystem:'geo3D',
                        zlevel:100,
                        // ******* 三维散点图的高度是由最小值和最大值的区间决定的，通过设定最小值和最大值来调整到想要的宽度;  ********
                        symbol:'pin',
                        symbolSize:(value, params)=>{       
                            // console.log(params);        
                            return value[2] === 1 || value[2] === 10 ? 0 : params.data.selected ? 40 : 24;
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
                            show:false
                        },
                        emphasis:{
                            label:{ show:false }
                        },
                        tooltip:{ show:false },
                        data: points
                    };
                    prevOption.series.push(scatterChart);
                    myChart.setOption(prevOption);
                },1600)
            }
            myChart.setOption(option);
        })
    }
    // 如有告警信息自动生成tooltip
    function createTooltip(agentMsg){    
        if ( tooltipRef.current ){
            let pos = myChart.convertToPixel('geo', [+agentMsg.lng, +agentMsg.lat]);
            if ( !pos ) return;
            // let y = Math.floor(pos[1] * Math.sin(Math.PI/3)) ;
            // window.alert(current.company_name+pos[0]+ '/' + pos[1] + '/' + y);
            tooltipRef.current.style.display = 'block';
            tooltipRef.current.style.left = pos[0] + 'px';
            // 减去tooltip自身的高度
            tooltipRef.current.style.top = Math.floor(pos[1] * Math.sin(Math.PI/4)) - 20 + 'px';
            let prevOption = myChart.getOption();
            let warningIndex = 0;
            if ( prevOption.series && prevOption.series[1] ) {
                let temp = prevOption.series[1].data.map((item, index) =>{
                    if ( item.name === agentMsg.company_name) {
                        warningIndex = index;
                        item.selected = true;
                        item.itemStyle = {
                            color:'red'
                        };
                        return item;
                    } else {
                        item.selected = false;
                        item.itemStyle = {
                            color:'#ffa733'
                        }
                        return item;
                    }
                });
                // 确保告警的定位点在Z轴最外层
                let warningItem = temp.splice(warningIndex, 1)[0] || null;
                temp.push(warningItem);
                prevOption.series[1].data = temp;
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
            myChart = null; 
            regionsMap = null;
            warningInfo = null;
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
        if ( myChart && agentMsg && agentMsg.company_name  ) {
            clearTimeout(warningTimer);
            warningInfo = agentMsg;
            warningTimer = setTimeout(()=>{
                createTooltip(agentMsg);
            },2000)
        } else {
            // 告警清空，关闭信息框
            warningInfo = null;
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

function areEqual(prevProps, nextProps){
    if ( prevProps.currentProvince !== nextProps.currentProvince || prevProps.currentCity !== nextProps.currentCity || prevProps.agentMsg !== nextProps.agentMsg ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(MapChart, areEqual);