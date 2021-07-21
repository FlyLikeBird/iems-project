import React from 'react';
import ReactEcharts from 'echarts-for-react';

function WarningBarChart({ data }){
    let seriesData = [];
    seriesData.push({
        type:'line',
        name:'电力安全',
        itemStyle:{
            color:'#23b7f6' 
        },
        smooth:true,
        symbol:'none',
        areaStyle:{
            color:'#23b7f6',
            opacity:0.2
        },
        data:data.ele
    });
    seriesData.push({
        type:'line',
        name:'环境安全',
        itemStyle:{
            color:'#ff8481' 
        },
        smooth:true,
        symbol:'none',
        areaStyle:{
            color:'#ff8481',
            opacity:0.2
        },
        data:data.emv

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
                    },
                    axisLabel:{
                        formatter:(value)=>{
                            let strArr = value.split('-');
                            return strArr[1] + '-' + strArr[2];
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
                    name:'(单位:次)',
                    nameTextStyle:{
                        color:'#999b9d'
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

export default React.memo(WarningBarChart, areEqual);