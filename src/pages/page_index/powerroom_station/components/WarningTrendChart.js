import React from 'react';
import ReactEcharts from 'echarts-for-react';
const richStyle = {
    'blue':{
        // width:80,
        padding:[0,10,0,10],
        height:20,
        align:'center',
        borderWidth:1,
        color:'#fff',
        borderColor:'#ff8481',
        backgroundColor:'rgba(255,132,129,0.4)'
    },
    'purple':{
        // width:80,
        padding:[0,10,0,10],
        height:20,
        color:'#fff',
        align:'center',
        borderWidth:1,
        borderColor:'#23b7f6',
        backgroundColor:'rgba(35,183,246,0.4)'
    }
}

function WarningTrendChart({ data }){
    let seriesData = [];
    seriesData.push({
        type:'line',
        name:'今日能耗',
        itemStyle:{
            color:'#ff8481'
        },
        symbolSize:0,
        smooth:true,
        areaStyle:{
            color:'#ff8481',
            opacity:0.2
        },
        data:data.energy,
        z:3,
        markPoint: {
            data: [
                {type: 'max', name: '', symbol:'circle', symbolSize:6 },
                {type: 'min', name: '', symbol:'circle', symbolSize:6 }
            ],
            label:{
                position:[-40,-30],
                formatter:(params)=>{
                    return `{blue|${ params.data.type === 'max' ? '最大值' : '最小值'}:${Math.round(params.data.value)}}`;
                },
                rich:richStyle
            }
        },
    });
    seriesData.push({
        type:'line',
        name:'昨日能耗',
        itemStyle:{
            color:'#23b7f6',
        },
        symbolSize:0,
        smooth:true,
        areaStyle:{
            color:'#23b7f6',
            opacity:0.2
        },
        data:data.sameEnergy,
        markPoint: {
            data: [
                {type: 'max', name: '', symbol:'circle', symbolSize:6 },
                {type: 'min', name: '', symbol:'circle', symbolSize:6 }
            ],
            label:{
                position:[-40,-30],
                formatter:(params)=>{
                    return `{purple|${ params.data.type === 'max' ? '最大值' : '最小值'}:${Math.round(params.data.value)}}`;
                },
                rich:richStyle
            }
        },
    })
    
    return (
        <ReactEcharts
            style={{ width:'100%', height:'100%' }}
            notMerge={true}
            option={{
                legend: {
                    show:true,
                    left:'center',
                    top:4,
                    textStyle:{
                        color:'#fff'
                    },
                    itemWidth:16,
                    itemHeight:6
                },
                tooltip:{
                    trigger:'axis'
                },
                grid:{
                    top:40,
                    left:10,
                    right:20,
                    bottom:10,
                    containLabel:true
                },
                xAxis:{
                    type:'category',
                    data:data.date,
                    axisTick:{
                        show:false
                    },
                    axisLine:{
                        lineStyle:{
                            color:'#999b9d'
                        }
                    }
                },
                yAxis:{
                    type:'value',
                    splitLine:{
                        show:true,
                        lineStyle:{
                            color:'#212a2d'
                        }
                    },
                    name:'(单位:kw)',
                    nameTextStyle:{
                        color:'#999b9d'
                    },
                    splitLine:{
                        show:false
                    },
                    axisTick:{
                        show:false
                    },
                    axisLine:{
                        show:false
                    },
                    axisLabel:{
                        color:'#999b9d'
                    }
                },
                series:seriesData
            
            }}
        />
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(WarningTrendChart, areEqual);