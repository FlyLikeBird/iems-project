import React from 'react';
import ReactEcharts from 'echarts-for-react';

var color = {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 1,
    y2: 0,
    colorStops: [{
        offset: 0, color: '#4cf4dc' // 0% 处的颜色
    }, {
        offset: 1, color: '#4cb3f8' // 100% 处的颜色
    }],
};
var color2 = {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [{
        offset: 0, color: '#4cb3f8' // 0% 处的颜色
    },{
        offset:0.5, color:'#fdcf23'
    },{
        offset: 1, color: '#ff2f2e' // 100% 处的颜色
    }],
};
var colorSet = [
    [0.5, color],
    [1, color2]
];

function GaugeChart({ name, value, unit }){
    let seriesData = [];
    seriesData.push({   
        type: 'gauge',
        radius:'90%',
        data: [{value, name}],
        pointer:{
            width:2
        },
        startAngle:210,
        endAngle:-30,
        title:{ show:false },
        max:80,
        splitNumber:6,
        splitLine:{ show:false },
        axisTick:{ 
            show:true,
            lineStyle:{
                color:'rgba(10, 17, 26, 0.3)'
            }
        },
        itemStyle:{
            color:'#4dcaef'
        },
        axisLabel:{
            show:true,
            distance:-18,
            formatter:value=>{
                return `${Math.round(value)}`
            },
            color:'#fff'
        },
        axisLine:{
            lineStyle:{
                width:8,
                color:colorSet
            }
        },
        detail:{
            show:true,
            offsetCenter:['0', '56%'],
            formatter:value=>{
                return `{value|${value}}{unit|${unit}}\n{text|${name}}`;
            },
            rich:{
                value:{
                    color:'#4cf5dc',
                    fontSize:18,
                    lineHeight:24
                },
                unit:{
                    color:'#4cf5dc',
                    fontSize:14,
                },
                text:{
                    color:'#fff'
                }
            }
        }      
    })
    return (
        <ReactEcharts
            notMerge={true}
            style={{ height:'100%' }}
            option={{
                tooltip:{
                    formatter: '{b} : {c}%'
                },
                graphic:{
                    type:'circle',
                    left:'center',
                    top:'middle',
                    shape:{
                        r:8
                    },
                    style:{
                        fill:{
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 1,
                            y2: 0,
                            colorStops: [{
                                offset: 0, color: '#4cf4dc' // 0% 处的颜色
                            }, {
                                offset: 1, color: '#4cb3f8' // 100% 处的颜色
                            }]
                        }
                    }
                },
                series: seriesData
            }}
        />
    )
}

export default GaugeChart;