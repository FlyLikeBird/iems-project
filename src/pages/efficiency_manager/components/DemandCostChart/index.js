import React, { useState } from 'react';
import ReactEcharts from 'echarts-for-react';
const colors = ['#57e29f','#65cae3','#198efb','#f1ac5b'];

function DemandCostChart({ data, showMode }) {
    const seriesData = [];
    seriesData.push({
        type:'line',
        name:'峰值',
        data: showMode === 'cost' ? data.heightCost : data.heightEnergy
    });
    seriesData.push({
        type:'line',
        name:'平值',
        data: showMode === 'cost' ? data.middleCost : data.middleEnergy
    });
    seriesData.push({
        type:'line',
        name:'谷值',
        data: showMode === 'cost' ? data.bottomCost : data.bottomEnergy
    });
    seriesData.push({
        type:'line',
        name:'最大需量',
        data:data.demand,
        yAxisIndex:1
    });
    
    return (  
                <ReactEcharts
                    notMerge={true}
                    style={{width:'100%', height:'100%'}}
                    option={{
                        color:colors,
                        tooltip:{
                            trigger:'axis'
                        },
                        legend:{
                            data:['峰值','平值','谷值','最大需量']
                        },
                        toolbox: {
                            show: true,
                            feature: {
                                restore: {},
                                saveAsImage: {}
                            }
                        },
                        dataZoom: [
                            {
                                show:true,
                                type:'slider', 
                                bottom:20                          
                            }
                        ],
                        grid:{
                            bottom:100
                        },
                        xAxis: {
                            type:'category',
                            name: '分钟',
                            data: data.date,
                            silent: false,
                            splitLine: {
                                show: false
                            },
                            axisLabel:{
                                show:true,
                                padding:4,
                                formatter:(value)=>{
                                    let temp = value.split(' ');
                                    if ( temp && temp.length > 1){
                                        return temp[1] + '\n' + temp[0];
                                    } else {
                                        return temp[0];
                                    }
                                }
                            },
                            splitArea: {
                                show: false
                            }
                        },
                        // 日当前需量和月申报需量差值过大，采用log模式
                        yAxis:[
                            {
                                name:  showMode === 'cost' ? '电费(元)' : '能耗(kwh)',
                                nameTextStyle:{
                                    fontSize:20,
                                    fontWeigth:'bolder'
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
                                name:'最大需量(KW)',
                                nameTextStyle:{
                                    fontSize:20,
                                    fontWeigth:'bolder'
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
                            }
                        ],
                        series: seriesData 
                    }}
                />
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.showMode !== nextProps.showMode ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(DemandCostChart, areEqual);
