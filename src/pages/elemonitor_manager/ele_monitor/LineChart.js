import React from 'react';
import ReactEcharts from 'echarts-for-react';
import { findMaxAndMin } from '@/pages/utils/array';

const richStyle = {
    'red':{
        // width:80,
        height:20,
        align:'center',
        borderWidth:1,
        color:'#fff',
        borderColor:'#1890ff',
        backgroundColor:'rgba(24,144,255,0.6)'
    },
    'blue':{
        // width:80,
        height:20,
        align:'center',
        borderWidth:1,
        color:'#fff',
        borderColor:'#ffa63f',
        backgroundColor:'rgba(255, 166, 63,0.6)'
    },
    'purple':{
        // width:80,
        height:20,
        color:'#fff',
        align:'center',
        borderWidth:1,
        borderColor:'#5eff5a',
        backgroundColor:'rgba(94,255,90, 0.6)'
    },
    'orange':{
        // width:80,
        height:20,
        color:'#fff',
        align:'center',
        borderWidth:1,
        borderColor:'#ff2d2e',
        backgroundColor:'rgba(255, 45, 46, 0.6)'
    }
}

function LineChart({ theme, xData, energy, energyA, energyB, energyC, info, startDate, timeType, optionType }){
    const seriesData = [];
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    seriesData.push({
        type:'line',
        name: optionType === '8' ? 'N相' : '总' + info.title,
        data:energy,
        itemStyle:{
            color:'#1890ff'
        },
        symbolSize:0,
        markPoint: {
            data: [
                {type: 'max', name: '', symbol:'circle', symbolSize:10 },
                {type: 'min', name: '', symbol:'circle', symbolSize:10 }
            ],
            label:{
                position:[-40,-30],
                formatter:(params)=>{
                    return `{red|${ params.data.type === 'max' ? '最大值' : '最小值'}:${params.data.value}}`;
                },
                rich:richStyle
            }
        }
    });
    seriesData.push({
        type:'line',
        name:'A相',
        data:energyA,
        itemStyle:{
            color:'#ffa63f'
        },
        symbolSize:0,
        markPoint: {
            data: [
                {type: 'max', name: '', symbolSize:10 },
                {type: 'min', name: '', symbolSize:10 }
            ],
            label:{
                position:[-40,-30],
                formatter:(params)=>{
                    return `{blue|${ params.data.type === 'max' ? '最大值' : '最小值'}:${params.data.value}}`;
                },
                rich:richStyle
            }
        },
    });
    seriesData.push({
        type:'line',
        name:'B相',
        data:energyB,
        itemStyle:{
            color:'#5eff5a'
        },
        symbolSize:0,
        markPoint: {
            data: [
                {type: 'max', name: '', symbolSize:10 },
                {type: 'min', name: '', symbolSize:10 }
            ],
            label:{
                position:[-40,-30],
                formatter:(params)=>{
                    return `{purple|${ params.data.type === 'max' ? '最大值' : '最小值'}:${params.data.value}}`;
                },
                rich:richStyle
            }
        },
    });
    seriesData.push({
        type:'line',
        name:'C相',
        data:energyC,
        itemStyle:{
            color:'#ff2d2e'
        },
        symbolSize:0,
        markPoint: {
            data: [
                {type: 'max', name: '', symbolSize:10 },
                {type: 'min', name: '', symbolSize:10 }
            ],
            label:{
                position:[-40,-30],
                formatter:(params)=>{
                    return `{orange|${ params.data.type === 'max' ? '最大值' : '最小值'}:${params.data.value}}`;
                },
                rich:richStyle
            }
        },
    });
    return (
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%' }}
            option={{
                legend:[
                    {
                        left:'center',
                        data:seriesData.map(i=>i.name),
                        textStyle:{
                            color:textColor
                        }
                    },
                    {
                        right:0,
                        top:'middle',
                        orient:'vertical',
                        data:seriesData.map(i=>i.name),
                        itemWidth:0,
                        itemHeight:0,
                        textStyle:{
                            color:'#fff',
                            rich: {                   
                                time: {
                                    width:60,
                                    height:30,
                                    fontSize: 12,
                                    lineHeight: 16,
                                    color: '#b7b7bf',
                                    align:'left'
                                },
                                num:{
                                    width:60,
                                    height:30,
                                    fontSize: 12,
                                    lineHeight: 16,
                                    color:textColor,
                                    align:'left',
                                    padding:[0,0,0,4]
                                },
                                value: {
                                    width:40,
                                    height:30,
                                    fontSize: 12,
                                    lineHeight: 16,
                                    color: '#b7b7bf',
                                    align:'left'
                                },
                                
                            }
                        },
                        formatter:name=>{
                            let temp = findMaxAndMin( name === '总' + info.title || name === 'N相' ? energy  : name === 'A相' ? energyA : name === 'B相' ? energyB : name === 'C相' ? energyC : '', optionType === '5' ? true : false );
                            let prefixTime = timeType === '1' ? '' : timeType === '2' ? startDate.format('MM') : timeType === '3' ? startDate.format('YYYY') :'';
                            let maxTime = prefixTime + '-' + xData[temp.max ? temp.max.index : ''];                        
                            let minTime = prefixTime + '-' + xData[temp.min ? temp.min.index : '']; 
                            return `
                                {value|${name}}{num|}{time|时间}\n
                                {value|最大值:}{num|${temp.max ? temp.max.value : ''}}{num|${maxTime}}\n
                                {value|最小值:}{num|${temp.min ? temp.min.value : ''}}{num|${minTime}}\n
                                {value|平均值:}{num|${temp.avg ? temp.avg : ''}}
                                `;
                        }
                    }
                ],
                tooltip:{
                    trigger:'axis'
                },
                grid:{
                    top:60,
                    bottom:20,
                    left:20,
                    right:180,
                    containLabel:true
                },
                xAxis:{
                    type:'category',
                    axisTick:{ show:false },
                    axisLine:{
                        lineStyle:{
                            color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                        }
                    },
                    axisLabel:{
                        color:textColor
                    },
                    data:xData
                },
                yAxis:{
                    type:'value',
                    name:`(单位:${info.unit})`,
                    nameTextStyle:{
                        color:textColor
                    },
                    splitLine:{
                        lineStyle:{
                            color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                        }
                    },
                    axisTick:{ show:false },
                    axisLine:{
                        show:false
                    },
                    axisLabel:{
                        color:textColor
                    },
                },
                series:seriesData
            }}
        />
    )
}
function areEqual(prevProps, nextProps){
    if ( prevProps.xData !== nextProps.xData || prevProps.theme !== nextProps.theme  ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(LineChart, areEqual);