import React, { useRef, useEffect, useMemo } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Card, Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';

const alarmStatedColors = {
    'undeal':'#198efb',
    'dealed':'#e6e6e6',
    'keep':'#96c8f6'
};

function AlarmPieChart({ data, totalInfo, warningColors, forReport }) {   
    const echartsRef = useRef();
    let seriesData = [];
    let title = '告警事件处理进度';
    console.log(totalInfo);
    const basicOption = {
        label:{
            show:true,
            position:'inside',
            fontSize:14,
            formatter:(params)=>{
                // console.log(params);
                let value = +params.data.value;
                return value || '';
            }
        },
        itemStyle:{
            borderWidth: 3,
            borderColor: '#fff',
        },
        emphasis: {
            label:{
                fontSize:20
            },
            itemStyle:{
                borderWidth: 0,
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.2)'
            }
        },
        labelLine:{
            show:false
        }
    };
    const tooltipOption = {
        formatter:'{b} : {c} ({d}%)'
    };
    return (   
        <div style={{ height:'100%'}}>
            {/* 总告警数分解 */}
            <div style={{ display:'inline-block', width:'50%', height:'50%' }}>
                <ReactEcharts
                    notMerge={true}
                    ref={echartsRef}
                    style={{ width:'100%', height:'100%'}}
                    option={{
                        legend:{
                            data:['电气安全','指标越限','通讯'],
                            left: forReport ? 'center' : 'right',
                            top: forReport ? 10 : 'middle',
                            orient: forReport ? 'horizontal' : 'vertical',
                            itemWidth: forReport ? 10 : 25,
                            itemHeight: forReport ? 10 : 14,
                            textStyle:{
                                fontSize: forReport ? 10 : 12
                            }
                        },
                        tooltip:tooltipOption,
                        title:{
                            text:totalInfo[0].count,
                            left:"center",
                            top:"50%",
                            textStyle:{
                                color:"rgba(0,0,0,0.8)",
                                fontSize:24,
                                align:"center"
                            }
                        },
                        graphic:{
                            type:'text',
                            left:'center',
                            top:'40%',
                            style:{
                                text:`总告警数`,
                                textAlign:'center',
                                fill:'#000',
                                fontSize:12
                            }
                        },
                        series:{
                            ...basicOption,
                            type:'pie',
                            radius:['50%','70%'],
                            center:['50%','50%'],
                            data:[
                                { name:'电气安全', value:totalInfo[1].count, itemStyle:{ color:warningColors[totalInfo[1].type]} },
                                { name:'指标越限', value:totalInfo[2].count, itemStyle:{ color:warningColors[totalInfo[2].type]} },
                                { name:'通讯', value:totalInfo[3].count, itemStyle:{ color:warningColors[totalInfo[3].type]}  }
                            ]   
                        }
                    }}
                />
            </div>
            {/* 电气安全分解 */}
            <div style={{ display:'inline-block', width:'50%', height:'50%' }}>
                <ReactEcharts
                    notMerge={true}
                    ref={echartsRef}
                    style={{ width:'100%', height:'100%'}}
                    option={{
                        legend:{
                            data:['待处理','挂起','已处理'],
                            left: forReport ? 'center' : 'right',
                            top: forReport ? 10 : 'middle',
                            orient: forReport ? 'horizontal' : 'vertical',
                            itemWidth: forReport ? 10 : 25,
                            itemHeight: forReport ? 10 : 14,
                            textStyle:{
                                fontSize: forReport ? 10 : 12
                            }
                        },
                        tooltip:tooltipOption,
                        title:{
                            text:totalInfo[1].count,
                            left:"center",
                            top:"50%",
                            textStyle:{
                                color:"rgba(0,0,0,0.8)",
                                fontSize:24,
                                align:"center"
                            }
                        },
                        graphic:{
                            type:'text',
                            left:'center',
                            top:'40%',
                            style:{
                                text:`电气安全`,
                                textAlign:'center',
                                fill:'#000',
                                fontSize:12
                            }
                        },
                        series:{
                            ...basicOption,
                            type:'pie',
                            radius:['50%','70%'],
                            center:['50%','50%'],
                            data:[
                                { name:'待处理', value:data[0].children[0].value, itemStyle:{ color:alarmStatedColors['undeal']} },
                                { name:'挂起', value:data[0].children[1].value, itemStyle:{ color:alarmStatedColors['keep']} },
                                { name:'已处理', value:data[0].children[2].value, itemStyle:{ color:alarmStatedColors['dealed']} }
                            ]   
                        }
                    }}
                />
            </div>
            {/* 指标越限告警分解 */}
            <div style={{ display:'inline-block', width:'50%', height:'50%' }}>
                <ReactEcharts
                    notMerge={true}
                    ref={echartsRef}
                    style={{ width:'100%', height:'100%'}}
                    option={{
                        legend:{
                            data:['待处理','挂起','已处理'],
                            left: forReport ? 'center' : 'right',
                            top: forReport ? 10 : 'middle',
                            orient: forReport ? 'horizontal' : 'vertical',
                            itemWidth: forReport ? 10 : 25,
                            itemHeight: forReport ? 10 : 14,
                            textStyle:{
                                fontSize: forReport ? 10 : 12
                            }
                        },
                        tooltip:tooltipOption,
                        title:{
                            text:totalInfo[2].count,
                            left:"center",
                            top:"50%",
                            textStyle:{
                                color:"rgba(0,0,0,0.8)",
                                fontSize:24,
                                align:"center"
                            }
                        },
                        graphic:{
                            type:'text',
                            left:'center',
                            top:'40%',
                            style:{
                                text:`指标越限`,
                                textAlign:'center',
                                fill:'#000',
                                fontSize:12
                            }
                        },
                        series:{
                            ...basicOption,
                            type:'pie',
                            radius:['50%','70%'],
                            center:['50%','50%'],
                            data:[
                                { name:'待处理', value:data[1].children[0].value, itemStyle:{ color:alarmStatedColors['undeal']} },
                                { name:'挂起', value:data[1].children[1].value, itemStyle:{ color:alarmStatedColors['keep']}  },
                                { name:'已处理', value:data[1].children[2].value, itemStyle:{ color:alarmStatedColors['dealed']} }
                            ]   
                        }
                    }}
                />
            </div>
            {/* 通讯告警分解 */}
            <div style={{ display:'inline-block', width:'50%', height:'50%' }}>
                <ReactEcharts
                    notMerge={true}
                    ref={echartsRef}
                    style={{ width:'100%', height:'100%'}}
                    option={{
                        legend:{
                            data:['待处理','挂起','已处理'],
                            left: forReport ? 'center' : 'right',
                            top: forReport ? 10 : 'middle',
                            orient: forReport ? 'horizontal' : 'vertical',
                            itemWidth: forReport ? 10 : 25,
                            itemHeight: forReport ? 10 : 14,
                            textStyle:{
                                fontSize: forReport ? 10 : 12
                            }
                        },
                        tooltip:tooltipOption,
                        title:{
                            text:totalInfo[3].count,
                            left:"center",
                            top:"50%",
                            textStyle:{
                                color:"rgba(0,0,0,0.8)",
                                fontSize:24,
                                align:"center"
                            }
                        },
                        graphic:{
                            type:'text',
                            left:'center',
                            top:'40%',
                            style:{
                                text:`通讯`,
                                textAlign:'center',
                                fill:'#000',
                                fontSize:12
                            }
                        },
                        series:{
                            ...basicOption,
                            type:'pie',
                            radius:['50%','70%'],
                            center:['50%','50%'],
                            data:[
                                { name:'待处理', value:data[2].children[0].value, itemStyle:{ color:alarmStatedColors['undeal']} },
                                { name:'挂起', value:data[2].children[1].value, itemStyle:{ color:alarmStatedColors['keep']}  },
                                { name:'已处理', value:data[2].children[2].value, itemStyle:{ color:alarmStatedColors['dealed']} }
                            ]   
                        }
                    }}
                />
            </div>
        </div>   
            
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(AlarmPieChart, areEqual);
