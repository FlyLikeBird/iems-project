import React, { useState, useRef } from 'react';
import { Radio, Card, Button, DatePicker } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';

const colors = ['#62a4e2','#57e29f','#65cae3','#2c3b4d','#facf3a'];
function getAllAlarmTypes(arr){
    let types = [];
    arr.forEach(category=>{
        category.type.forEach(item=>{
            if ( !types.includes(item.type_name)) {
                types.push(item.type_name);
            }
        })
    });
    return types;
}

function getSeriesData(arr, allTypes){
    let data = [];
    if (!arr.length) return data;
    allTypes.forEach(type=>{
        let obj = {};
        obj.type = 'bar';
        obj.name = type;
        obj.stack = '总量';
        obj.barWidth = 10;
        obj.barCategoryGap = '100%';
        let category = arr.map((item)=>{
            let temp = item.type.filter(i=>i.type_name === type)[0];
            return temp ? temp.count : 0;
        });
        obj.data = category;
        data.push(obj);
    });
    return data;
}

function AlarmDetailChart({ data, warningColors }) {
    const echartsRef = useRef();
    let allAlarmTypes = getAllAlarmTypes(data);
    let seriesData = getSeriesData(data, allAlarmTypes);
   
    return (   
        
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%'  }}
                option={{
                    tooltip: { trigger:'axis'},
                    grid:{
                        top:40,
                        bottom:20,
                        left:20,
                        right:50,
                        containLabel:true
                    },    
                    legend: {
                        top:20,
                        type:'scroll',
                        data:allAlarmTypes
                    },
                    color:colors,
                    dataZoom:[
                        {
                            show:true,
                            yAxisIndex:0,
                            startValue:0,
                            endValue:10
                        }
                    ],
                    yAxis: {
                        show: true,
                        type:'category',
                        inverse:true,
                        interval:0,
                        data:data.map(i=>i.mach_name),
                        axisLabel:{
                            formatter:(value)=>{
                                return value.length >= 13 ? value.substring(0, 10) + '...' : value;
                            }
                        }
                        // axisLabel:{
                        //     formatter:(value)=>{
                        //         var newParamsName = "";
                        //         var paramsNameNumber = value.length;
                        //         var provideNumber = 5;  //一行显示几个字
                        //         var rowNumber = Math.ceil(paramsNameNumber / provideNumber);
                        //         if (paramsNameNumber > provideNumber) {
                        //             for (var p = 0; p < rowNumber; p++) {
                        //                 var tempStr = "";
                        //                 var start = p * provideNumber;
                        //                 var end = start + provideNumber;
                        //                 if (p == rowNumber - 1) {
                        //                     tempStr = value.substring(start, paramsNameNumber);
                        //                 } else {
                        //                     tempStr = value.substring(start, end) + "\n";
                        //                 }
                        //                 newParamsName += tempStr;
                        //             }

                        //         } else {
                        //             newParamsName = value;
                        //         }
                        //         return newParamsName
                        //     }
                        // }
                    },
                    xAxis:{
                        show:true,
                        type:'value',
                        splitLine:{
                            lineStyle : { color:'#f7f7f7' }
                        },
                        minInterval:1,
                        name:'/次',
                        nameTextStyle:{
                            verticalAlign:'bottom'
                        },
                        position:'top'
                    },
                    series:seriesData
                }}
            /> 
    );
}


function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ) {
        return false;
    } else {
        return true;
    }
}

export default  React.memo(AlarmDetailChart, areEqual);
