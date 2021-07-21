import React, { useContext, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Table, Input, Button, Popconfirm, Form } from 'antd';
import echarts from 'echarts';
import 'echarts-gl';
import { getGeoJson } from '../../../services/userService';
import style from '../AgentMonitor.css';

const mapData = {};
let timer = null;
let defaultCode = '100000_full';
let myChart;
let chinaCenter = [104.299012, 28.480215];


function MapChart({ headHeight }){
    const containerRef = useRef(null);
    const [navBar, setNavBar] = useState([{ name:'全国', code:defaultCode }]);
    
    async function fetchData(obj = { code:defaultCode, name:'全国' }){
        let data ;
        if ( !mapData[obj.name] ) {
            let responseData = await getGeoJson({ code:obj.code });
            data = responseData.data;
            mapData[obj.name] = data;
        } else {
            data = mapData[obj.name];
        }
        echarts.registerMap('selfMap', data);
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
                map:'selfMap',
                center:chinaCenter,
                roam:true,
                zoom:1,
                itemStyle:{
                    borderColor: 'rgba(147, 235, 248, 0)',
                    borderWidth: 0.5,
                    areaColor:'#215495',
                    opacity:1,
                    // shadowBlur:0,
                    // shadowColor:'#215459',
                    // shadowOffsetX:0,
                    // shadowOffsetY:10
                }
            },
            series: [
                {
                    name: '',
                    type: 'map',
                    map: 'selfMap', // 自定义扩展图表类型
                    center:chinaCenter,
                    // viewControl:{
                    //     distance:100,//地图视角 控制初始大小
                    //     // rotateSensitivity:0,//禁止旋转
                    //     // zoomSensitivity:0,//禁止缩放
                    // },
                    label: {
                        show: false,
                        color:'#fff'
                    },
                    zoom:1,
                    itemStyle: {
                        areaColor:{
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0,
                                color: '#073684' // 0% 处的颜色
                            }, {
                                offset: 1,
                                color: '#061E3D' // 100% 处的颜色
                            }],
                        },
                        borderWidth: 1,//分界线wdith    
                        borderColor: "#215495",//分界线颜色,
                        
                    },
                    data:data.features.map(item=>{
                        return item.properties;
                    }),
                    roam:true
                }
            ]
        };
        return option;
    }
    // 监听单击事件，切换到某个省份
    const handleClick = (params)=>{
        console.log(params);
        if ( !params.data || params.data.level === 'city' ) return;
        fetchData({ name:params.data.name, code:params.data.adcode + '_full' })
        .then(option=>{
            myChart.setOption(option, true);
            setNavBar(nav=>{
                let temp = [...nav, { name:params.data.name, code:params.data.adcode }]
                return temp;
            });
        })
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
        console.log(option.series[0].zoom);
        myChart.setOption(option, true);
    }
    
    // 将geo坐标系的省份范围转化成像素区域
    function convertRange(provice){
        if ( !provice || provice.type !== 'Feature' ) return;
        let minX, maxX, minY, maxY, pixelRange;  // x指经度，y指纬度
        let containerWidth = containerRef.current.clientWidth;
        let containerHeight = containerRef.current.clientHeight;
        provice.geometry.coordinates.forEach((coordinate)=>{
            coordinate[0].forEach((point)=>{
                let x = point[0], y = point[1];
                if( !minX && !minY ) {
                    maxX = minX = x;
                    maxY = minY = y;
                } else {
                    // 获取最大/最小经度
                    if ( x >= maxX ) {
                        maxX = x;
                    } else if ( x < minX ) {
                        minX = x;
                    }
                    // 获取最大/最小纬度
                    if ( y >= maxY ) {
                        maxY = y;
                    } else if ( y < minY ) {
                        minY = y;
                    }
                }
            })
        });
        let leftBottom = myChart.convertToPixel('geo', [minX, minY]);
        let rightTop = myChart.convertToPixel('geo', [maxX, maxY]);
        // let center = myChart.convertToPixel('geo', provice.properties.center);
        // 省份区域宽高
        let regionWidth = rightTop[0] - leftBottom[0];
        let regionHeight = leftBottom[1] - rightTop[1];
        let center = [leftBottom[0]+regionWidth/2, rightTop[1] + regionHeight/2];
        return {
            regionWidth,
            regionHeight,
            center,
            leftBottom,
            rightTop,
        }
    }

    function startMotion(prevProvice, nextProvice){
        return new Promise((resolve, reject)=>{     
            scaleMotion(prevProvice, false)
            .then(()=>{
                // 定位至指定区域
                return moveMotion(prevProvice, nextProvice);
            })
            .then(()=>{
                return delay(500);
            })
            .then(()=>{      
                // 将全国地位切换为省份地图   
                return changeMapType(nextProvice);
            })
            .then((params)=>{
                // console.log(params);
                // console.log(myChart.getOption());
                // console.log(nextProvice);
                return scaleMotion(nextProvice, true);
            })
            .then(()=>{
                console.log(myChart.getOption());
            })
            .catch(err=>{
                console.log(err);
            })
        })
    }
    async function changeMapType(provice){
        let proviceMap;
        if ( !mapData[provice.properties.name]) {
            let { data } = await getGeoJson({ code:provice.properties.adcode + '_full' });
            proviceMap = mapData[provice.properties.name] = data;
        } else {
            proviceMap = mapData[provice.properties.name];
        }
        let prevOption = myChart.getOption();
        echarts.registerMap('selfMap',proviceMap);
        prevOption.geo[0].center = provice.properties.center;
        prevOption.geo[0].zoom = 0.05;
        prevOption.series[0].center = provice.properties.center;
        prevOption.series[0].zoom = 0.05;
        myChart.setOption(prevOption);
        // return params;
    }
    // 位移动画
    function moveMotion(prevProvice, nextProvice){
        return new Promise((resolve, reject)=>{
            let prevCenter = prevProvice ? prevProvice.properties.center : chinaCenter;
            let nextCenter = nextProvice.properties.center;
            // 以维度值判断高低点，校正斜率方向
            let highPoint, lowPoint;
            if ( prevCenter[1] < nextCenter[1] ) {
                highPoint = nextCenter;
                lowPoint = prevCenter;
            } else {
                highPoint = prevCenter;
                lowPoint = nextCenter;
            }
            let prevOption = myChart.getOption();
            let k = ( highPoint[1] - lowPoint[1] ) / ( highPoint[0] - lowPoint[0]);
            let [pointX, pointY] = prevCenter;
            let direction = prevCenter[0] < nextCenter[0] ? 'right' : 'left';
            let timer = window.requestAnimationFrame(function renderMotion(){
                if ( direction === 'right'){
                    if ( pointX < nextCenter[0] ) {
                        pointX += 0.4;
                        pointY = prevCenter[1] + k*(pointX - prevCenter[0]);
                        prevOption.geo[0].center = [pointX, pointY];
                        prevOption.series[0].center = [pointX,pointY];
                        myChart.setOption(prevOption);
                        window.requestAnimationFrame(renderMotion);
                    } else {                   
                        window.cancelAnimationFrame(timer);
                        resolve();
                    }
                } else {
                    if ( pointX > nextCenter[0] ) {
                        pointX -= 0.4;
                        pointY = prevCenter[1] + k*(pointX - prevCenter[0]);
                        prevOption.geo[0].center = [pointX, pointY];
                        prevOption.series[0].center = [pointX,pointY];
                        myChart.setOption(prevOption);
                        window.requestAnimationFrame(renderMotion);
                    } else {
                        window.cancelAnimationFrame(timer);
                        resolve();
                    }
                }
            });
        })
    }
    // 缩放动画
    function scaleMotion( provice, increase ){
        if ( !provice ) return Promise.resolve();
        let prevOption = myChart.getOption();
        let temp = increase ? 0.05 : 1;
        let max = increase ? 1 : 10;
       
        return new Promise((resolve, reject)=>{
            let timer = window.requestAnimationFrame(function renderMotion(){
                if ( increase ){
                    // 放大
                    if ( temp < max ) {
                        
                        temp += 0.02;
                        prevOption.geo[0].zoom = temp;
                        prevOption.series[0].zoom = temp;
                        myChart.setOption(prevOption);
                        window.requestAnimationFrame(renderMotion);
                    } else {
                        window.cancelAnimationFrame(timer);
                        resolve();
                    }
                } else {
                    // 缩小
                    // if ( temp > 1 ) {
                    //     temp -= 0.1;
                    //     prevOption.geo[0].zoom = temp;
                    //     prevOption.series[0].zoom = temp;
                    //     myChart.setOption(prevOption);
                    //     window.requestAnimationFrame(renderMotion);
                    // } else {
                    //     window.cancelAnimationFrame(timer);
                    //     resolve();
                    // }
                }
            })
        })
    }

    useEffect(()=>{
        if(headHeight){
            let dom = document.getElementById('map');
            dom.style.width = containerRef.current.clientWidth + 'px';
            dom.style.height = containerRef.current.clientHeight + 'px';
            myChart = echarts.init(dom);
            // 初次加载
            fetchData()
            .then(option=>{
                myChart.setOption(option, true);                             
                setTimeout(()=>{
                    let hlj = mapData['全国'].features.filter(i=>i.properties.name === '黑龙江省' )[0];
                    let yunNan = mapData['全国'].features.filter(i=>i.properties.name === '云南省' )[0];
                    let shanXi = mapData['全国'].features.filter(i=>i.properties.name === '山西省' )[0];
                    let guangDong = mapData['全国'].features.filter(i=>i.properties.name === '广东省' )[0];
                    let huBei = mapData['全国'].features.filter(i=>i.properties.name === '湖北省' )[0];
                    let qingHai = mapData['全国'].features.filter(i=>i.properties.name === '青海省' )[0];
                    let neiMeng = mapData['全国'].features.filter(i=>i.properties.name === '内蒙古自治区' )[0];

                    startMotion(null, yunNan)
                    .then(()=>{
                        // setTimeout(()=>{
                        //     startMotion(guangDong, yunNan)
                            

                        // },2000)
                    })
                    
                  
                },2000);
                
            })   
            
            myChart.on('click',handleClick);
            myChart.on('georoam',handleGeoRoam);
            return ()=>{
                myChart.off('click');
                myChart.dispose();
            }
        }
        
    },[headHeight]);
    return (
        <div ref={containerRef} style={{ position:'relative', height:'100%', width:'100%'}}>
            <div className={style['map-nav-bar']}>
               {
                   navBar.map((item,index)=>(
                       <span key={index} onClick={()=>{
                        fetchData({ code:item.code, name:item.name })
                        .then(option=>{
                            myChart.setOption(option, true);
                            let temp;
                            if ( index === 0 ) {
                                temp = [{ name:'全国', code:defaultCode }]
                            } else {
                                temp = navBar.slice(0, index + 1);
                            }
                            setNavBar(temp);
                        })  
                       }}>
                           <span>{ item.name }</span>
                           {
                               navBar.length === 1 || index === navBar.length - 1
                               ?
                               null
                               :
                               <span style={{ margin:'0 6px'}}> - </span>
                           }
                       </span>
                   ))
               }
            </div>
            <div id='map'></div>
        </div>
    
    )
}

function delay(ms){
    return new Promise((resolve, reject)=>{
        setTimeout(resolve,ms)
    })
}

export default MapChart;