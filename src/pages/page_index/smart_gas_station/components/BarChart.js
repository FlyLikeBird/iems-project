import React from 'react';
import ReactEcharts from 'echarts-for-react';

function BarChart({ data }){
    let seriesData = [];
    seriesData.push({
        type:'bar',
        name:'耗电量',
        barWidth:10,
        itemStyle:{
            color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                    offset: 0, color: '#16f9fd' // 0% 处的颜色
                }, {
                    offset: 1, color: '#12a1fe' // 100% 处的颜色
                }],
            },
            barBorderRadius:6
        },
        data:data.value
    })
    return (
        <ReactEcharts
            notMerge={true}
            style={{ height:'100%' }}
            option={{
                tooltip:{
                    trigger:'axis'
                },
                grid:{
                    top:14,
                    bottom:6,
                    left:10,
                    right:20,
                    containLabel:true
                },
                xAxis: {
                    type: 'category',
                    axisTick:{ show:false },
                    axisLabel:{ color:'#fff' },
                    axisLine:{
                        show:true,
                        lineStyle:{
                            color:'rgba(18, 168, 254, 0.8)'
                        }
                    },
                    data:data.date
                },
                yAxis: {
                    type: 'value',
                    axisTick:{ show:false },
                    axisLabel:{ color:'#fff' },
                    axisLine:{ show:false },
                    splitLine:{
                        lineStyle:{
                            type:'dashed',
                            color:'rgba(255,255,255,0.2)'
                        }
                    }
                },

                series: seriesData
            }}
        />
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(BarChart, areEqual);