import React, { useState } from 'react';
import ReactEcharts from 'echarts-for-react';

function LineLossChart({ data }) {
    const seriesData = [];
    console.log(data);
    seriesData.push({
        type:'bar',
        name:'当前线损',
        data:data.lose,
        barGap:'0',
        itemStyle:{
            color:'#5187f5'
        },
        yAxisIndex:0
    });
    seriesData.push({
        type:'bar',
        name:'上月同期线损',
        data:data.referLose,
        itemStyle:{
            color:'#93f363',
        },
        yAxisIndex:0
    });
    seriesData.push({
        type:'line',
        name:'当前线损率',
        symbol:'none',
        smooth:true,
        data:data.loseRate,
        yAxisIndex:1,
        itemStyle:{
            color:'#5187f5'
        }
    });
    seriesData.push({
        type:'line',
        name:'上月同期线损率',
        symbol:'none',
        smooth:true,
        data:data.referLoseRate,
        yAxisIndex:1,
        itemStyle:{
            color:'#93f363',
        }
    });
    return (  
            <div style={{ width:'100%', height:'300px'}}>
                <ReactEcharts
                    notMerge={true}
                    style={{width:'100%', height:'100%'}}
                    option={{
                        tooltip:{
                            trigger:'axis'
                        },
                        legend:{
                            top:20,
                            data:['当前线损','上月同期线损','当前线损率','上月同期线损率']
                        },
                        grid:{
                            left:40,
                            right:40,
                            top:60,
                            bottom:60,
                            containLabel:true
                        },
                        dataZoom: [
                            {
                                show:true,
                                bottom:20
                            }
                        ],
                        xAxis: {
                            type:'category',
                            data: data.date,
                            silent: false,
                            splitLine: {
                                show: false
                            },
                            axisTick:{ show:false },
                            axisLabel:{
                                show:true,
                                formatter:(value)=>{
                                    let strArr = value.split('-');
                                    return strArr[1] + '-' + strArr[2] + '\n' + strArr[0];
                                }
                            },
                            splitArea: {
                                show: false
                            }
                        },
                        yAxis:[
                            {
                                name: '线损值(kwh)',
                                nameTextStyle:{
                                    align:'left'
                                    // fontSize:20,
                                    // fontWeigth:'bolder'
                                },
                                type:'value',
                                splitArea: {
                                    show: false
                                },
                                splitLine:{
                                    show:true,
                                    lineStyle:{
                                        color:'#f7f7f7'
                                    }
                                }  
                            },
                            {
                                name: '线损率(%)',
                                nameTextStyle:{
                                    align:'right'
                                    // fontSize:20,
                                    // fontWeigth:'bolder'
                                },
                                type:'value',
                                splitArea: {
                                    show: false
                                },
                                splitLine:{
                                    show:false
                                }  
                            }
                        ],
                        series: seriesData 
                    }}
                />
            </div>
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(LineLossChart, areEqual);
