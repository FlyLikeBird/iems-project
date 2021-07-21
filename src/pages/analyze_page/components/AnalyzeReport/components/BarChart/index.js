import React, { useState, useRef } from 'react';
import { Radio, Card, Button,  } from 'antd';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';

function sumArr(arr){
    let sum = 0;
    return arr.reduce((sum,cur)=>{
        sum+=+cur;
        return sum;
    },0)
}

function BarChart({ data}) {
    console.log(data);
    const seriesData = [];
    if ( sumArr(data.tipArr) ){
        seriesData.push({
            type:'bar',
            name:'尖',
            stack:'ele',
            barWidth:10,
            data:data.tipArr,
            itemStyle:{
                color:'#00ff00'
            }
        });
    }
    if ( sumArr(data.topArr) ){
        seriesData.push({
            type:'bar',
            name:'峰',
            stack:'ele',
            barWidth:10,
            data:data.topArr,
            itemStyle:{
                color:'#61d6ff'
            }
        });
    }
    if ( sumArr(data.middleArr) ){
        seriesData.push({
            type:'bar',
            name:'平',
            stack:'ele',
            barWidth:10,
            data:data.middleArr,
            itemStyle:{
                color:'#376bc8'
            }
        });
    }
    if ( sumArr(data.bottomArr) ){
        seriesData.push({
            type:'bar',
            name:'谷',
            stack:'ele',
            barWidth:10,
            data:data.bottomArr,
            itemStyle:{
                color:'#a5a5a5'
            }
        });
    }
    console.log(seriesData);
    return ( 
        
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'300px'}}
            option={{   
                
                legend:{
                    data:seriesData.map(i=>i.name),
                    left:'center',
                    top:'10px',
                },
                grid:{
                    top:'40px',
                    right:'40px',
                    left:'20px',
                    bottom:'20px',
                    containLabel:true
                },
                xAxis: {
                    show:true,
                    name:'日',
                    type:'category',
                    data:data.date,
                    axisTick: { show:false },
                    axisLabel:{
                        formatter:(params)=>{
                            let labelStr = params.split('-');
                            return labelStr[2];
                        }
                    }
                },
                yAxis:{
                    show:true,
                    type:'value',
                    splitLine:{ 
                        show:true,
                        lineStyle:{
                            color:'#e0e0e0'
                        }
                    },
                    axisLine:{ show:false },
                    axisTick:{ show:false }
                },
                
                series:seriesData
            }}
        /> 
           
    );
}

export default BarChart;
