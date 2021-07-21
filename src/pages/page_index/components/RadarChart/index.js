import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button,  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';

const indicatorTypes = {
    'ele':'电价竞争力',
    'population':'人当能效',
    'product_num':'产品单耗',
    'output_value':'万元产值比',
    'area':'面积能效'
};

function RadarChart({ data }) {
    let seriesData = [], indicator = [];
    Object.keys(data).forEach(key=>{
        indicator.push({ name:indicatorTypes[key], max:100 });
        seriesData.push(data[key]);
    });
    return (    
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%'}}
            option={{
                tooltip:{
                    trigger:'item'
                },
                radar: {
                    // shape: 'circle',
                    name: {
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    radius:'65%',
                    splitNumber:4,
                    splitArea: {
                        areaStyle: {
                            color: ['rgba(9, 193, 253, 0.2)']
                        }
                    },
                    splitLine:{
                        lineStyle:{
                            width:3,
                            color:'#09c1fd'
                        }
                    },
                    axisLine:{
                        lineStyle:{
                            color:'#09c1fd'
                        }
                    },
                    indicator
                },                    
                series:{
                    type: 'radar',
                    name:'综合能效',
                    symbol:'none',
                    label:{
                        distance:2
                    },
                    data: [
                        {
                            value: seriesData,
                            lineStyle:{
                                opacity:0
                            },
                            areaStyle:{
                                opacity:0.8,
                                color:'#09c1fd'
                            }
                        }

                    ]
                }
            }}
        /> 
           
    );
}

export default RadarChart;
