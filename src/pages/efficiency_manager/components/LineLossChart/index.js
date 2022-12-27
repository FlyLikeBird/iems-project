import React, { useState } from 'react';
import ReactEcharts from 'echarts-for-react';

function LineLossChart({ data, theme }) {
    const seriesData = [];
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    if ( data && data.date ) {
        seriesData.push({
            type:'bar',
            name:'当前线损',
            data:data.lose,
            barGap:'0',
            barWidth:20,
            itemStyle:{
                color:'#5187f5'
            },
            yAxisIndex:0
        });
        // seriesData.push({
        //     type:'bar',
        //     name:'同比线损',
        //     data:data.referLose,
        //     itemStyle:{
        //         color:'#93f363',
        //     },
        //     yAxisIndex:0
        // });
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
        // seriesData.push({
        //     type:'line',
        //     name:'同比线损率',
        //     symbol:'none',
        //     smooth:true,
        //     data:data.referLoseRate,
        //     yAxisIndex:1,
        //     itemStyle:{
        //         color:'#93f363',
        //     }
        // });
    }
    
    return (  
            <div style={{ width:'100%', height:'100%'}}>
                <ReactEcharts
                    notMerge={true}
                    style={{width:'100%', height:'100%'}}
                    option={{
                        tooltip:{
                            trigger:'axis'
                        },
                        legend:{
                            top:20,
                            data:['当前线损', '当前线损率'],
                            textStyle:{ color:textColor }
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
                            data: data && data.date ? data.date : [],
                            silent: false,
                            splitLine: {
                                show: false
                            },
                            axisTick:{ show:false },
                            axisLabel:{
                                show:true,
                                color:textColor,
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
                                    align:'left',
                                    color:textColor
                                    // fontSize:20,
                                    // fontWeigth:'bolder'
                                },
                                type:'value',
                                splitArea: {
                                    show: false
                                },
                                axisTick:{ show:false },
                                axisLabel:{ color:textColor },
                                splitLine:{
                                    show:true,
                                    lineStyle:{
                                        color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                                    }
                                }  
                            },
                            {
                                name: '线损率(%)',
                                nameTextStyle:{
                                    align:'right',
                                    color:textColor
                                    // fontSize:20,
                                    // fontWeigth:'bolder'
                                },
                                type:'value',
                                axisTick:{ show:false },
                                axisLabel:{ color:textColor },
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
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(LineLossChart, areEqual);
