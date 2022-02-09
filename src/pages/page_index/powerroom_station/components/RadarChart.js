import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';

const indicatorTypes = {
    'voltage':'电压偏差',
    'PFavg':'功率因素',
    'power':'负载率',
    'thd':'谐波',
    'balance':'三相不平衡',
    'freq':'频率偏差'
};

function RadarChart({ data }) {
    let seriesData = [], indicator = [];
    Object.keys(data).forEach(key=>{
        indicator.push({ name:indicatorTypes[key], max:100 });
        seriesData.push(Math.round(data[key]));
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
                    name: {
                        textStyle: {
                            color: '#999b9d'
                        }
                    },
                    radius:'75%',
                    splitNumber:6,
                    splitArea: {
                        areaStyle: {
                            color: ['rgba(12, 64, 86, 0.2)','rgba(12, 64, 86, 0.4)']
                        }
                    },
                    splitLine:{
                        lineStyle:{
                            width:0.5,
                            color:'#999b9d'
                        }
                    },
                    axisLine:{
                        show:false,
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
                                width:2,
                                color:'#09c1fd'
                            },
                            areaStyle:{
                                opacity:0.5,
                                color:'#09c1fd'
                            }
                        }

                    ]
                }
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

export default React.memo(RadarChart, areEqual);
