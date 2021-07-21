import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button,  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';

function SaveSpacePieChart({ data, forReport }) {
    const seriesData = [];
    seriesData.push({
        type:'pie',
        name:'节俭空间',
        radius:['50%', '65%'],
        center:['50%','50%'],
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
            borderColor:'transparent',
            borderWidth:3,
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
                value: data.baseCost, 
                name: '基本电费', 
                itemStyle:{
                    color:'#1768e3'
                }
            },
            { 
                value:data.eleCost, 
                name:'电度电费', 
                itemStyle:{
                    color:'#09c1fd',
                }
            },
            { 
                value:data.adjustCost, 
                name:'力调电费', 
                itemStyle:{
                    color:'#66ff66',
                }
            }
        ]
    });
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
                    data:['基本电费','电度电费','力调电费'],
                    // right:20,
                    top:20,
                    // orient:'vertical',
                    textStyle:{
                        color: forReport ? 'rgb(50, 50, 56)' : '#fff'
                    }
                },
                title:{
                    text:data.baseCost + data.eleCost + data.adjustCost + '元',
                    left:"center",
                    top:"46%",
                    textStyle:{
                        color: forReport ? 'rgb(50, 50, 56)' : '#fff',
                        fontSize:20,
                        align:"center"
                    }
                },
                // graphic:{
                //     type:'text',
                //     left:'center',
                //     top:'40%',
                //     style:{
                //         text:`总告警数`,
                //         textAlign:'center',
                //         fill:'#fff',
                //         fontSize:12
                //     }
                // },
                series:seriesData
            }}
        /> 
           
    );
}

export default SaveSpacePieChart;
