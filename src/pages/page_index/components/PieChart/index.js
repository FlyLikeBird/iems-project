import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button,  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';

function PieChart({ data }) {
    const seriesData = [];
    seriesData.push({
        type:'pie',
        name:'异常处理',
        radius:['50%', '70%'],
        center:['50%','56%'],
        // avoidLabelOverlap: false,
        // roseType: 'radius',
        label:{
            show:true,
            position:'inside',
            fontSize:14,
            formatter:(params)=>{
                let value = +params.data.value;
                return value || '';
            }
        },
        itemStyle:{
            borderWidth: 3,
            borderColor: '#fff',
        },
        labelLine: {
            show:false
        },
            
        itemStyle: {
            color: '#c23531',
            shadowBlur: 200,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
        },
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx) {
            return Math.random() * 200;
        },
        data: [
            { 
                value: data.dealed, 
                name: '已处理', 
                itemStyle:{
                    color:'#1f596f'
                }
            },
            { 
                value:data.undealed, 
                name:'未处理', 
                itemStyle:{
                    color:'#09c1fd',
                }
            }
        ]
    });
    // console.log(data);
    return ( 
        
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%'}}
            option={{   
                tooltip:{
                    trigger:'item',
                    formatter:'{a}<br/>{b} :{c} ({d}%)'
                },
                legend:{
                    data:['未处理','已处理'],
                    left:'center',
                    top:10,
                    // orient:'vertical',
                    textStyle:{
                        color:'#fff'
                    }
                },
                title:{
                    text:data.totalWarning,
                    left:"center",
                    top:"60%",
                    textStyle:{
                        color:"#09c1fd",
                        fontSize:20,
                        align:"center"
                    }
                },
                graphic:{
                    type:'text',
                    left:'center',
                    top:'50%',
                    style:{
                        text:`总告警数`,
                        textAlign:'center',
                        fill:'#fff',
                        fontSize:12
                    }
                },
                series:seriesData
            }}
        /> 
           
    );
}

export default PieChart;
