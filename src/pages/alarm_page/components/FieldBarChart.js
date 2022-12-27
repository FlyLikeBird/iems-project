import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button, DatePicker } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';
import moment from 'moment';

const typesMap = {
    '通讯异常':'#92d050',
    '电压超标':'#09c1fd'
}
function FieldBarChart({ data, type, theme }) {
    let textColor = theme === 'dark' ? '#22264b' : '#f0f0f0';
    return (   
        <div style={{ height:'100%', position:'relative'}}>
            <div style={{ fontWeight:'bold', textAlign:'left', borderBottom:`1px solid ${textColor}`, marginBottom:'10px' }}>{ type === 'branch' ? '支路告警排序' : type === 'region' ? '区域告警排序' : type === 'mach' ? '终端告警排序' : '' }</div>
            {
                data && data.length 
                ?
                data.map((item,index)=>(
                    <div key={index} style={{
                        borderBottom:index === data.length - 1 ? 'none' : `1px solid ${textColor}`,
                        marginBottom:'6px'
                    }}>
                        <div style={{ textAlign:'left', fontSize:'0.8rem' }}>{ item.attr_name }</div>
                        <ReactEcharts 
                            style={{ width:'100%', height:'30px'}}
                            notMerge={true}
                            option={{
                                yAxis:{
                                    type:'category',
                                    axisTick:{ show:false },
                                    axisLine:{ show:false },
                                    splitLine:{ show:false }
                                },
                                tooltip:{
                                },
                                grid:{
                                    top:0,
                                    bottom:4,
                                    left:0,
                                    right:10,
                                    containLabel:true
                                },
                                xAxis:{
                                    type:'value',
                                    min:0,
                                    max:data[0].total,
                                    axisLabel:{ show:false },
                                    axisLine:{ show:false },
                                    axisTick:{ show:false },
                                    splitLine:{ show:false }
                                },
                                // color:['#92d050','#09c1fd','#bfbfbf','#ffff18','#36637b'],
                                series:item.type.map((inner)=>{
                                    return {
                                        type:'bar',
                                        barWidth:10,
                                        stack:'alarm',                               
                                        name:inner.name,
                                        data:[inner.count],
                                        label:{
                                            show:true,
                                            position:'insideRight',
                                            fontSize:14,
                                            formatter:params=>{
                                                return `${item.total}次`
                                            }
                                        },
                                        itemStyle:{
                                            color: type === 'mach' ? '#f69f37' : typesMap[inner.name] || '#bfbfbf'
                                        }
                                    }
                                })
                            }}
                        />
                    </div>
                ))
                :
                null
            }
        </div> 
        
    );
}


function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme  ) {
        return false;
    } else {
        return true;
    }
}

export default  React.memo(FieldBarChart, areEqual);
