import React, { useRef, useEffect, useMemo } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Card, Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';


function TotalPieChart({ data, theme }) { 
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let seriesData = [];
    seriesData.push({
        name:'电气安全',
        value:data.ele || 0,
        itemStyle:{ color:'#198efb'}
    });
    seriesData.push({
        name:'指标越限',
        value:data.quotaLimit || 0,
        itemStyle:{ color:'#29ccf4'}
    });
    seriesData.push({
        name:'通讯异常',
        value:data.link || 0,
        itemStyle:{ color:'#58e29f'}
    });
    return (   
            
                <ReactEcharts
                    notMerge={true}
                    style={{ width:'100%', height:'100%'}}
                    option={{
                        legend:{
                            data:['电气安全','指标越限','通讯异常'],
                            left: '60%',
                            top:'middle',
                            orient:'vertical',
                            itemWidth:8,
                            itemHeight:8,
                            icon:'circle',
                            formatter:(name)=>{
                                // let temp = findData(name, seriesData);
                                let value = name === '电气安全' ? data.ele : name === '指标越限' ? data.quotaLimit : data.link;
                                value = value || 0;
                                return `{value|${value}}{title|次}\xa0\xa0\xa0\xa0{value|${ data.total ? (value/data.total*100).toFixed(1) : 0.0}%}\n{title|${name}}`
                            },
                            textStyle:{
                                rich: {
                                    title: {
                                        fontSize: 12,
                                        lineHeight: 12,

                                        color: textColor
                                    },
                                    value: {
                                        fontSize: 14,
                                        fontWeight:'bold',
                                        lineHeight: 20,
                                        color: textColor
                                    }
                                }
                            }
                        },
                        tooltip:{
                            trigger:'item'
                        },
                        
                        series:{
                            label:{
                                show:true,
                                position:'center',
                                formatter:(params)=>{
                                    return `{b|总告警数}\n{a|${data.total}次}`
                                },
                                rich:{
                                    'a':{
                                        color:textColor,
                                        fontSize:22,
                                        padding:[0,4,0,0]                                
                                    },
                                    'b':{
                                        color:'#8a8a8a',
                                        fontSize:12,
                                        padding:[6,0,6,0]
                                    }
                                }
                            },
                            itemStyle:{
                                borderWidth:4,
                                borderColor: theme === 'dark' ? '#191a2f' : '#fff',
                            },
                            labelLine:{
                                show:false
                            },
                            type:'pie',
                            radius:['54%','66%'],
                            center:['30%','50%'],
                            data:seriesData
                        }
                    }}
                />
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(TotalPieChart, areEqual);
