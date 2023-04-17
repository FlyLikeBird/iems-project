import React, { useState } from 'react';
import { routerRedux } from 'dva/router';
import ReactEcharts from 'echarts-for-react';
const colors = ['#65cae3','#57e29f','#198efb','#f1ac5b'];

function sumRatio(data){
    let types = Object.keys(data.ratio);
    let result = [];
    for( let i=0,len=data.date.length;i<len;i++){
        let sum = 0;
        types.forEach((type,index)=>{
            sum += data.ratio[type][i] ;
        });
        result.push(sum);
    }
    return result;
}

function OutputChart({ data, energyMaps, theme }) {
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let bgColor = theme === 'dark' ? '#05050f' : '#f1f1f1';
    let seriesData = [];
    Object.keys(data).filter(key=>energyMaps[key]).map(key=>{
        seriesData.push({
           value:data[key],
           text:energyMaps[key].type_name 
        })
    })
    
    return (  
                <ReactEcharts
                    notMerge={true}
                    style={{width:'100%', height:'100%'}}
                    option={{
                        tooltip:{
                            trigger:'axis'
                        }, 
                        title:{
                            text:'能效指标分解',
                            left:'center',
                            top:10,
                            textStyle:{
                                color:textColor
                            }
                        },
                        grid:{
                            top:50,
                            bottom:40,
                            left:60,
                            right:60
                        },                  
                        xAxis: {
                            type:'category',
                            data: seriesData.map(i=>i.text),
                            silent: false,
                            show:true,
                            splitLine: {
                                show: false
                            },
                            splitArea: {
                                show: false
                            },
                            axisLabel:{ color:textColor },
                            axisLine:{ show:false },
                            axisTick:{ show:false }
                        },   
                        yAxis:{
                            type:'value',
                            show:false,
                            splitArea: {
                                show: false
                            },
                            splitLine:{
                                show:true,
                                lineStyle:{
                                    color:'#e2e2e2'
                                }
                            }     
                        },                       
                        series:[{
                            type:'bar',
                            name:'万元产值比',
                            barWidth:30,
                            showBackground: true,
                            backgroundStyle: {
                                color: bgColor
                            },
                            data:seriesData.map(i=>i.value),
                            itemStyle:{
                                color:'#1890ff'
                            },
                            label:{
                                show:true,
                                color: theme === 'dark' ? '#fff' : '#000',
                                textStyle:{ fontSize:14 },
                                position:'inside',
                                formatter:(params)=>{
                                    if ( params.value === 0 ){
                                        return '';
                                    } else {
                                        return params.value;
                                    }
                                }
                            }
                        }]
                    }}
                />
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(OutputChart, areEqual);
