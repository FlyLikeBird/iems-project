import React from 'react';
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts';

function GaugeChart({ value, maxValue, unit}){
    // let maxValue = 1600;
    return (
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%'}}
            option={{
                polar:{
                    radius:'70%'
                },
                angleAxis:{
                    axisLine:{ show:false },
                    axisLabel:{ show:false },
                    splitLine:{ show:false },
                    axisTick:{ show:false },
                    min:0,
                    max:maxValue,
                    startAngle:225
                },
                radiusAxis:{
                    type:'category',
                    axisLine:{ show:false },
                    axisLabel:{ show:false },
                    splitLine:{ show:false },
                    axisTick:{ show:false },
                    data:['a','b','c']
                },
                series:[
                    {
                        type:'bar',
                        data:[,,value*270/360],
                        coordinateSystem:'polar',
                        barWidth:10,
                        roundCap:true,
                        color:'#fff',
                        barGap:'-100%',
                        z:10
                    },
                    {
                        type:'bar',
                        data:[,,maxValue*270/360],
                        // data:[,,945],
                        coordinateSystem:'polar',
                        
                        barWidth:10,
                        roundCap:true,
                        color:'#db7a7f',
                        barGap:'-100%',
                        itemStyle:{
                            color:new echarts.graphic.LinearGradient(
                                0, 0, 0, 1, [{
                                        offset: 0.6,
                                        color: '#b0b8de',
                                    },
                                    {
                                        offset: 1,
                                        color: '#ef4f44',
                                    }
                                ]
                            ),
                            shadowBlur:6,
                            shadowColor:'rgba(41, 83, 144, 0.1)'
                        },
                        animationDuration:2000
                    },
                    {
                        type:'gauge',
                        radius:'90%',
                        max:maxValue,
                        data:[{ value }],
                        detail:{
                            show:true,
                            fontSize:20,
                            color:'#fff',
                            formatter:(value)=>{
                                return [
                                    `{a|${value}}`,
                                    `{b|${unit}}`
                                ].join('\n')
                            },
                            rich:{
                                a:{
                                    color:'#fff',
                                    fontSize:20,
                                    fontWeight:'bold'
                                },
                                b:{
                                    fontSize:14,
                                    color:'#b8d5ff'
                                }
                            },
                            offsetCenter:[0,'60%']
                        },
                        axisLine:{ show:false },
                        splitLine:{ show:false },
                        axisTick:{ show:false },
                        axisLabel:{ 
                            show:true,
                            fontSize:10,
                            distance:-28,
                            color:'#b4d4ff',
                            formatter:value=>Math.floor(value)
                        },
                        pointer:{
                            show:true,
                            length:50
                        },
                        itemStyle:{
                            color:'#fff'
                        }
                    }
                ]
            }}
        />
    )
}

export default GaugeChart;