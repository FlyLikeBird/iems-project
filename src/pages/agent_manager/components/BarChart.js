import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button, DatePicker } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import echarts from 'echarts';
import html2canvas from 'html2canvas';
import moment from 'moment';
let timer = null;
let timer2 = null;
let barWidth = 16;

function BarChart({ xData, yData }) {
    const containerRef = useRef();
    const chartSet = [
        {
            type:'bar',
            barWidth,
            name:'本年',
            itemStyle:{
                color:{
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: '#16d6ed' // 0% 处的颜色
                    }, {
                        offset: 1, color: '#0c99ab' // 100% 处的颜色
                    }],
                }
            },
            data:yData
        },
        {
            type:'pictorialBar',
            data:yData,
            z:2,
            symbol:'circle',
            symbolOffset:[0,'50%'],
            symbolSize:[barWidth, barWidth/2],
            itemStyle:{
                color:'#0c99ab'
            }
        },
        {
            type:'pictorialBar',
            data:yData,
            z:3,
            symbol:'circle',
            symbolPosition:'end',
            symbolOffset:[0,'-50%'],
            symbolSize:[barWidth, barWidth/2],
            itemStyle:{
                color:'#169ab1'
            }
        }
    ];

    useEffect(()=>{
        let dom = containerRef.current;
        if ( dom && dom.offsetHeight ){
            let myChart = echarts.init(dom);
            let option = {
                tooltip:{
                    trigger:'axis',
                    formatter:(params)=>{
                        return params[0].value;
                    }
                },
                grid:{
                    top:40,
                    bottom:10,
                    left:10,
                    right:10,
                    containLabel:true
                },
                legend:{
                    left:'right',
                    data:['本年'],
                    textStyle:{
                        color:'#fff'
                    },
                    icon:'circle',
                    itemWidth:10,
                    itemHeight:10,
                    selectedMode:false
                },
                yAxis: {
                    show: true,
                    name:'告警数(次)',
                    nameTextStyle:{
                        color:'#fff'
                    },
                    type:'value',
                    axisLine:{ show:false },
                    axisLabel:{
                        color:'#7e97ac'
                    },
                    splitLine:{
                        show:true,
                        lineStyle:{
                            color:'#0e2e46'
                        }
                    }
                },
                xAxis:{
                    show:true,
                    // name:'单位(次)',
                    type:'category',
                    splitLine:{ show:false },
                    axisLine:{
                        lineStyle:{
                            color:'#3286a6'
                        }
                    },
                    axisLabel:{
                        color:'#7e97ac'
                    },
                    axisTick:{ show:false },
                    data:xData
                },
                series:chartSet
            };
            myChart.setOption(option);
            
            function handleResize(){
                if ( myChart ){
                    myChart.resize();
                }
            }
            window.addEventListener('resize',handleResize);
            return ()=>{
                clearTimeout(timer);
                cancelAnimationFrame(timer2);
                window.removeEventListener('resize', handleResize);
                myChart = null;
                option = null;
            }
        }
    },[]);

    return (   
        <div ref={containerRef} style={{ height:'100%'}}>

        </div>
          
    );
}


function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data ) {
        return false;
    } else {
        return true;
    }
}

export default  BarChart;
