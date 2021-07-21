import React, { useState } from 'react';
import ReactEcharts from 'echarts-for-react';
import { Radio } from 'antd';
import { BarChartOutlined, LineChartOutlined } from '@ant-design/icons';

const machMap = {
    '1':{
        name:'电表',
        color:'#1fc48d'
    },
    '2':{
        name:'水表',
        color:'#f5a70d'
    },
    '3':{
        name:'气表',
        color:'#f53f2e'
    },
    '4':{
        name:'传感器',
        color:'#3f8fff'
    }
};

function findData(name, data){
    let result = {};
    if ( name && data && data.length ){
        for(var i=0;i<data.length;i++){
            if ( data[i].name === name ) {
                result = { value:data[i].value, ratio:data[i].ratio };
            }
        }
    }
    return result;
}

function PieChart({ data, timeType, theme }){
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let seriesData = [];
    let total = 0;
    Object.keys(data).forEach(key=>{
        total += +data[key];
        seriesData.push({
            name:machMap[key].name,
            value:data[key],
            itemStyle:{
                color:machMap[key].color
            }
        })
    });
    return (
          
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%' }}
            option={{
                tooltip: { trigger:'axis'},
                title:{
                    text:'设备类型异常占比',
                    left:20,
                    top:20,
                    textStyle:{
                        color:textColor, fontWeight:'bold', fontSize:16
                    }
                },   
                legend: {
                    show:true,
                    left:'60%',
                    top:'center',
                    orient:'vertical',
                    data:seriesData.map(i=>i.name),
                    icon:'circle',
                    formatter:(name)=>{
                        let temp = findData(name, seriesData);
                        let ratio = total ? (temp.value / total * 100).toFixed(1) : 0.0;
                        return `{title|${name}}\n{value|${ratio}%  ${temp.value}}{title|次}`
                    },
                    textStyle:{
                        rich: {
                            title: {
                                fontSize: 12,
                                lineHeight: 20,
                                color: '#9a9a9a'
                            },
                            value: {
                                fontSize: 16,
                                fontWeight:'bold',
                                lineHeight: 20,
                                color:textColor
                            }
                        }
                    }
                },
                
                series:{
                    type:'pie',
                    center:['34%','50%'],
                    radius:['44%','54%'],
                    itemStyle:{
                        borderColor: theme === 'dark' ? '#191a2f' : '#fff',
                        borderWidth:4,
                       
                    },
                    labelLine:{
                        show:false
                    },
                    label:{
                        show:true,
                        position:'center',
                        formatter:(params)=>{
                            return `{b|${timeType === '1' ? '本日' : timeType === '2' ? '本月' : '本年'}通讯告警}\n{a|${total}次}`
                        },
                        rich:{
                            'a':{
                                color:textColor,
                                fontSize:18,
                                padding:[0,4,0,0]                                
                            },
                            'b':{
                                color:'#9a9a9a',
                                fontSize:12,
                                padding:[6,0,6,0]
                            }
                        }
                    },
                    data:seriesData
                }
            }}
        /> 
    )
}
function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(PieChart, areEqual);