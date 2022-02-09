import React, { useRef, useEffect, useMemo } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Card, Button, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';

const alarmStatedColors = {
    'undeal':'#198efb',
    'dealed':'#e6e6e6',
    'keep':'#96c8f6'
};

const warningTypesMap = {
    '电压超标':
    ''
}

const machsMap = {
    'ele':'电表',
    'gateway':'网关',
    'water':'水表',
    'gas':'气表'
}
function WarningTypePieChart({ data, type, statusData, theme }) {   
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let seriesData = [];
    let title = type === 'ele' ? '电气安全告警' : type === 'limit' ? '指标越限告警' : '通讯异常告警';
    let total = 0;
    if ( data.length ){
        data.forEach((item)=>{
            total += +item.count;
            seriesData.push({
                name:item.type_name,
                value:item.count
            })
        })
    } else if ( type === 'link' && Object.keys(data).length ){
        Object.keys(data).forEach(key=>{
            total += +data[key];
            seriesData.push({
                name:machsMap[key],
                value:data[key]
            })
        })
    }
    console.log(statusData);
    return (   
                seriesData.length 
                ?  
                <div style={{ height:'100%' }}>

                <div style={{ position:'absolute', top:'6px', width:'100%', display:'flex', justifyContent:'space-around' }}>
                    {
                        statusData && statusData.children 
                        ?
                        statusData.children.map((item,index)=>(
                            <div key={index}>
                                <Tag color={ index === 0 ? '#f69f37' : index === 1 ? '#3f8fff' : '#1fc48d'}>{ item.value }</Tag>
                                <span>{ item.name }</span>
                            </div>
                        ))
                        :
                        null
                    }
                </div>
                <ReactEcharts
                    notMerge={true}
                    style={{ width:'100%', height:'100%'}}
                    option={{
                        legend:{
                            data:seriesData.map(i=>i.name),
                            left: '60%',
                            top:'middle',
                            orient:'vertical',
                            type:'scroll',
                            itemWidth:10,
                            itemHeight:10,
                            icon:'circle',
                            formatter:(name)=>{
                                // let temp = findData(name, seriesData);
                                let value;
                                if ( type === 'ele' || type === 'limit') {
                                    let temp = data.filter(i=>i.type_name === name)[0];
                                    value = temp ? temp.count : 0;
                                } else if ( type === 'link') {
                            
                                    Object.keys(data).forEach(key=>{
                                        if ( machsMap[key] === name ) {
                                            value = data[key]
                                        }
                                    })
                                }
                                return `${name}\xa0\xa0\xa0\xa0{value|${value}}{title|次}`
                            },
                            textStyle:{
                                color:textColor,
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
                        color:['#3f8fff','#f69f37','#1fc48d'],
                        series:{
                            label:{
                                show:true,
                                position:'center',
                                formatter:(params)=>{
                                    return `{b|${title}}\n{a|${total}}{b|次}`
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
                                borderWidth: 4,
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
                </div>
                :
                <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)'}}>暂时没有{ title } </div>
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(WarningTypePieChart, areEqual);
