import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button, DatePicker, message } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import echarts from 'echarts';
import html2canvas from 'html2canvas';
import moment from 'moment';
import style from '../AgentMonitor.css';
const statusType = {
    '1':'未处理',
    '2':'跟进中',
    '3':'已处理',
    '4':'挂起'
};

const warningType = {
    '1':'电气安全',
    '2':'指标越限',
    '3':'通讯异常',
    '4':'HES人员安全',
    '5':'消防安全'
};
const tabs = [
    { title:'电气安全', key:'1'},
    { title:'指标越限', key:'2'},
    { title:'通讯异常', key:'3'}
];

function findData(name, data, total){
    let result = {};
    if ( name && data && data.length ){
        for(var i=0;i<data.length;i++){
            if ( data[i].name === name ) {
                result = { value:data[i].value, ratio: total ? (data[i].value / total * 100).toFixed(1) : 0.0 };
            }
        }
    }
    return result;
}

function PieChart({ data, dispatch, hasToggle }) {
    const containerRef = useRef();
    const [current, setCurrent] = useState('1');
    const myChart = useRef();
    let total = 0;
    let seriesData = Object.keys(data).map(key=>{
        total += +data[key];
        return {
            name: hasToggle ? statusType[key] : warningType[key],
            value:data[key],
            itemStyle:{
                color:key === '1' ? '#27b6ff' : key === '2' ? '#17e6ff' : key === '3' ? '#ffa633' : key === '4' ? '#f9c824' : '#0ba3af'
            },
        }
    });
    useEffect(()=>{
        let dom = containerRef.current;
        myChart.current = echarts.init(dom);   
        function handleResize(){
            if ( myChart.current ) myChart.current.resize();
        }
        window.addEventListener('resize',handleResize);
        return ()=>{
            window.removeEventListener('resize', handleResize);
        }
    },[]);
    useEffect(()=>{
        if ( myChart.current ){
            let option = {
                tooltip:{ trigger:'item' },
                // legend:[
                //     {
                //         data:seriesData.slice(0,2),
                //         icon:'circle',
                //         x:'50%',
                //         y:'20%',
                //         formatter:name=>{
                //             let temp = findData(name, seriesData, total);
                //             return `{title|${name}}\n{value|${temp.ratio}%  ${temp.value}}{title|次}`
                //         },
                //         textStyle:{
                //             rich: {
                //                 title: {
                //                     fontSize: 12,
                //                     lineHeight: 12,
                //                     color: '#fff'
                //                 },
                //                 value: {
                //                     fontSize: 14,
                //                     fontWeight:'bold',
                //                     lineHeight: 14,
                //                     color: '#fff'
                //                 }
                //             }
                //         }
                //     },
                //     {
                //         data:seriesData.slice(0,2),
                //         icon:'circle',
                //         x:'50%',
                //         y:'40%',
                //         formatter:name=>{
                //             let temp = findData(name, seriesData, total);
                //             return `{title|${name}}\n{value|${temp.ratio}%  ${temp.value}}{title|次}`
                //         },
                //         textStyle:{
                //             rich: {
                //                 title: {
                //                     fontSize: 12,
                //                     lineHeight: 12,
                //                     color: '#fff'
                //                 },
                //                 value: {
                //                     fontSize: 14,
                //                     fontWeight:'bold',
                //                     lineHeight: 14,
                //                     color: '#fff'
                //                 }
                //             }
                //         }
                //     },
                // ],
                legend: {
                    show:true,
                    left:'40%',
                    
                    top:'center',
                    orient:'vertical',
                    data:seriesData.map(i=>i.name),
                    icon:'circle',
                    itemWidth:10,
                    itemHeight:10,
                    formatter:(name)=>{
                        let temp = findData(name, seriesData, total);
                        return `{title|${name}}\n{value|${temp.ratio}%  ${temp.value}}{title|次}`
                    },
                    textStyle:{
                        rich: {
                            title: {
                                fontSize: 12,
                                lineHeight: 12,
                                color: '#fff'
                            },
                            value: {
                                fontSize: 14,
                                fontWeight:'bold',
                                lineHeight: 14,
                                color: '#fff'
                            }
                        }
                    }
                },
                series:[{
                    type:'pie',
                    label:{
                        show:false,
                        
                    },
                    labelLine:{
                        show:false
                    },
                    radius:['46%','66%'],
                    center:['20%','50%'],
                    data:seriesData
                }],
                
                // label:{
                //     show:false,
                //     formatter:(params)=>{               
                //         return params.data.name + '\n' + ( total === 0 ? '0.0%' : (params.value / total * 100 ).toFixed(1) + '%' )
                //     }
                // }
            };
            myChart.current.setOption(option);
        }
    },[data])
    function handleToggle(item){
        if ( item.key !== current ){
            new Promise((resolve, reject)=>{
                dispatch({ type:'agentMonitor/fetchWarningStatus', payload:{ cateCode:item.key, resolve, reject }})
            })
            .then(()=>{
                setCurrent(item.key);
            })
            .catch((msg)=>{
                message.error(msg);
            })
        }
    }
    return (   
        <div style={{ height:'100%', position:'relative'}}>
            {
                hasToggle
                ?
                <div className={style['table-tabs']}>
                    {
                        tabs.map((item,index)=>(
                            <div key={index} className={item.key === current ? `${style['tabs-item']} ${style['selected']}` : style['tabs-item']} onClick={()=>handleToggle(item)}>{ item.title }</div>
                        ))
                    }                 
                </div>
                :
                null
            }
            <div ref={containerRef} style={{ height:'100%'}}>
            
            </div>
        </div>
    );
}


function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data ) {
        return false;
    } else {
        return true;
    }
}

export default  PieChart;
