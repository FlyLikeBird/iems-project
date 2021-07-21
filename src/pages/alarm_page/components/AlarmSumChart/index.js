import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button, DatePicker } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';
import moment from 'moment';

function AlarmSumChart({ data, warningColors }) {
    const echartsRef = useRef();
    let seriesData = [];
    seriesData.push({
        type:'bar',
        name:'电气警报',
        stack:'警报类型',
        data:data.ele,
        barMaxWidth:30,
        itemStyle:{
           
            color:warningColors['ele']
        }
    });
    seriesData.push({
        type:'bar',
        name:'越限警报',
        stack:'警报类型',
        data:data.limit,
        barMaxWidth:30,
        itemStyle:{
           
            color:warningColors['limit']
        }
    });
    seriesData.push({
        type:'bar',
        name:'通讯警报',
        stack:'警报类型',
        data:data.link,
        barMaxWidth:30,
        itemStyle:{
           
            color:warningColors['link']
        }
    });
    return (   
       
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%'}}
                option={{
                    tooltip: { trigger:'axis'},
                    grid:{
                        top:80,
                        bottom:20,
                        left:20,
                        right:40,
                        containLabel:true
                    },  
                    title:{
                        text:'告警趋势',
                        top:10,
                        left:'center'
                    },
                    toolbox: {
                        show: true,
                        feature: {
                            mark: {show: true},
                            dataView: {show: true, readOnly: false},
                            magicType: {show: true, type: ['line', 'bar']},
                            restore: {show: true},
                            saveAsImage: {show: true}
                        }
                    },
                    legend: {
                        left:'center',
                        top:40,
                        data:['电气警报', '越限警报', '通讯警报']
                    },
                    xAxis: {
                        show: true,
                        name: '日',
                        type:'category',
                        data:data.date,
                        axisLabel:{
                            show:true,
                            formatter:value=>{
                                let strArr = value.split('-');
                                return strArr[1] + '-' + strArr[2];
                            }
                        }
                    },
                    yAxis:{
                        show:true,
                        type:'value',
                        splitLine:{
                            lineStyle : { color:'#f7f7f7' }
                        }
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

export default  React.memo(AlarmSumChart, areEqual);
