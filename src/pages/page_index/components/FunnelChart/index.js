import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button,  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';

function FunnelChart({ data }) {
    const seriesData = [];
    seriesData.push({
        type:'funnel',
        name:'异常处理',
        width:'60%',
        left:'8%',
        gap:2,
        minSize:10,
        maxSize:'100%',
        labelLine:{
            show:true,
            lineStyle:{
                width:1,
                type:'solid',
                color:'#fff'
            }
        },                     
        label:{
            position:'right',
            color:'#fff',
            formatter:(params)=>{
                return `${params.name}: ${params.value}`;
            }
        },
        data: [
            { 
                value: data.totalWarning, 
                name: '今日总告警数', 
                itemStyle:{ 
                    color:'#0083c7',
                    borderColor:'transparent'
                }
            },
            { 
                value: data.dealed, 
                name: '已处理告警数', 
                itemStyle:{
                    color:'#4e99de',
                    borderColor:'transparent'
                }
            },
            { 
                value:data.undealed, 
                name:'未处理告警数', 
                itemStyle:{
                    color:'#53b8e2',
                    borderColor:'transparent'
                }
            }
        ]
    });
    console.log(seriesData);
    return (    
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%'}}
            option={{   
                tooltip:{
                    trigger:'item'
                },
                series:seriesData
            }}
        /> 
           
    );
}

export default FunnelChart;
