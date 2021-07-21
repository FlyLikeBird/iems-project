import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button, DatePicker } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import echarts from 'echarts';
import html2canvas from 'html2canvas';
import moment from 'moment';
let timerList = [];

// xData 今日  x2Data 昨日
function LineChart({ xData, yData, y2Data, dateRange }) {
    const containerRef = useRef();
    const seriesData = [];
    seriesData.push({
        data: yData,
        type:'line',
        name: dateRange === 'month' ? '本月' : '今日',
        symbol:'none',
        smooth:true,
        lineStyle:{ color:'#28b6ff'},
        itemStyle:{ color:'#28b6ff'},
        markPoint:{
            data:[{ 
                type:'max', 
                name:'最大值', 
                symbol:'circle',
                symbolSize:8,
                itemStyle:{
                    color:'#28b6ff',
                    borderWidth:6,
                    borderColor:'rgba(40, 182, 255, 0.4)',
                    shadowColor:'rgba(0,0,0, 0.5)',
                    shadowBlur:10
                },
                label:{
                    formatter:''
                }
            }]
        }
    });
    if ( y2Data ){
        seriesData.push({
            data: y2Data,
            type:'line',
            name:dateRange === 'month' ? '上月' : '昨日',
            symbol:'none',
            smooth:true,
            lineStyle:{ color:'#0e4860'},  
            itemStyle:{ color:'#0e4860'}   
        })
    }
    useEffect(()=>{
        let dom = containerRef.current;
        if ( dom && dom.offsetHeight ){
            let myChart = echarts.init(dom);
            let option = {
                tooltip:{ trigger:'axis' },
                // title:{
                //     text:forWarning ? '告警数(次)' : '标煤(tce)',
                //     textStyle:{
                //         fontSize:12,
                //         color:'#fff'
                //     },
                //     right:10,
                //     top:0
                // },
                grid:{
                    top:6,
                    bottom:20,
                    left:10,
                    right:10,
                    containLabel:true
                },
                legend:{
                    data: dateRange === 'month' ? ['本月','上月'] : ['今日','昨日'],
                    left:'right',
                    textStyle:{
                        color:'#fff'
                    },
                    itemWidth:10,
                    itemHeight:10,
                    icon:'circle'
                },
                yAxis: {
                    show: true,
                    // name: forWarning ? '告警数(次)' : '标煤(tce)',
                    // nameTextStyle:{
                    //     color:'#fff'
                    // },
                    type:'value',
                    axisLine:{ show:false },
                    axisLabel:{
                        color:'#7e97ac'
                    },
                    minInterval:1,
                    splitLine:{
                        show:true,
                        lineStyle:{
                            color:'rgba(40,182,255,0.1)'
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
                    data: xData
                },
                series:seriesData
            };
            myChart.setOption(option);
            // let timer = setTimeout(()=>{
            //         let prevOption = myChart.getOption();
            //         prevOption.series[0].lineStyle = {
            //                         color:'#329cbd',
            //                         shadowColor: 'rgba(0,0,0,0.4)',
            //                         shadowBlur: 2,
            //                         shadowOffsetX:4,
            //                         shadowOffsetY: 10
            //                     };
            //         myChart.setOption(prevOption);                
            // },1000);
            // timerList.push(timer);
            function handleResize(){
                if ( myChart ){
                    myChart.resize();
                }
            }
            window.addEventListener('resize',handleResize);
            return ()=>{
                if ( timerList && timerList.length ){
                    timerList.forEach(i=>window.clearTimeout(i));
                }
                timerList = [];
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

export default  LineChart;
