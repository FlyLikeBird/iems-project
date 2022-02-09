import React from 'react';
import ReactEcharts from 'echarts-for-react';

function LineChart({ xData, yData, title, hidden, multi, isPhaseU }){
    let seriesData = [];
    if ( multi ){
        seriesData.push({
            type:'line',
            name: isPhaseU ? 'A相' : 'AB线电压',
            data: (isPhaseU ? yData.U1 : yData.U12).map(item=> item && item !== null ? Math.floor(item) : null),
            symbol:'none',
            smooth:true,
            itemStyle:{
                color:'#f5a609'
            }
        });
        seriesData.push({
            type:'line',
            name: isPhaseU ? 'B相' : 'BC线电压',
            data: (isPhaseU ? yData.U2 : yData.U23).map(item=> item && item !== null ? Math.floor(item) : null),
            symbol:'none',
            smooth:true,
            itemStyle:{
                color:'#1fc48d'
            }
        });
        seriesData.push({
            type:'line',
            name: isPhaseU ? 'C相' : 'CA线电压',
            data: (isPhaseU ? yData.U3 : yData.U31).map(item=> item && item !== null ? Math.floor(item) : null),
            symbol:'none',
            smooth:true,
            itemStyle:{
                color:'#f53f2e'
            }
        });
    } else {
        seriesData.push({
            type:'line',
            data:yData,
            symbol:'none',
            smooth:true,
            itemStyle:{
                color: hidden ? '#f5f5f5':'#3a7adf'
            },
            areaStyle:{
                color:{
                    type:'linear',
                    x:0,
                    y:0,
                    x2:0,
                    y2:1,
                    colorStops: [{
                        offset: 0, color: hidden ? 'transparent' : 'rgba(91, 150, 243, 0.2)' // 0% 处的颜色
                    }, {
                        offset: 0.8, color: 'transparent' // 100% 处的颜色
                    }],
                }
            }    
        });
    }
    return (
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%'}}
            option={{
                tooltip:{
                    show: hidden ? false : true,
                    trigger:'axis'
                },
                legend:{
                    show: multi ? true : false,
                    data: multi ? seriesData.map(i=>i.name) : [],
                    top:30,
                    left:'right'
                },
                grid:{
                    left:20,
                    right:20,
                    top:60,
                    bottom:20,
                    containLabel:true
                },
                xAxis:{
                    type:'category',
                    axisTick:{ show:false },
                    axisLine:{
                        lineStyle:{
                            color:'#e8e8e8'
                        }
                    },
                    axisLabel:{
                        color:'#676767'
                    },
                    data:xData
                },
                yAxis:{
                    type:'value',
                    axisLine:{ show:false },
                    axisTick:{ show:false },
                    splitLine:{
                        lineStyle:{
                            color:'#e8e8e8'
                        }
                    },
                    name:title,
                    nameTextStyle:{
                        color:'#676767',
                        fontSize:14,
                        align:'left',
                        fontWeight:'bold'
                    },
                    
                },
                series:seriesData
            }}
        />
    )
}

export default LineChart;