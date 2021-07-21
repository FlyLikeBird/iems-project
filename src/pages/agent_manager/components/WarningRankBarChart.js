import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button, DatePicker, message } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import echarts from 'echarts';
import style from '../AgentMonitor.css';

let timer = null;
let timer2 = null;
let myChart = null;
let barWidth = 16;
let tabs = [
    { title:'本月', key:'1'},
    { title:'本年', key:'2'}
];
let pattern = /\s/g;

function WarningRankBarChart({ data, dispatch }) {
    const [current, setCurrent] = useState('1');
    const containerRef = useRef();
    function createChartSet(data){
        data = data.map(item=>{
            item.unfinish = Math.random() * 10 + 10;
            item.finish = Math.random() * 20 + 10;
            return item;
        });
        let categoryData = [];
        let unFinishData = [];
        let finishData = []; 
        data.forEach(item=>{
            categoryData.push(item.company_name);
            unFinishData.push(+item.unfinish);
            finishData.push(+item.finish);
        });
        let chartSet = [
            {
                type:'bar',
                barWidth,
                name:'已完成',
                stack:'1',
                itemStyle:{
                    color:{
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: '#16d6ed' // 0% 处的颜色
                        }, {
                            offset: 1, color: '#0c99ab' // 100% 处的颜色
                        }],
                    }
                },
                data:finishData
            },
            {
                type:'bar',
                barWidth,
                name:'未完成',
                stack:'1',
                itemStyle:{
                    color:'rgba(16,191,212,0.4)',
                },
                data:unFinishData
            },
            {
                type:'pictorialBar',
                data:finishData,
                z:2,
                symbol:'circle',
                symbolOffset:[0,'50%'],
                symbolSize:[barWidth, barWidth/2],
                itemStyle:{
                    color:'#0c99ab'
                }
            },
            {
                type:'pictorialBar',
                data:finishData,
                z:3,
                symbol:'circle',
                symbolPosition:'end',
                symbolOffset:[0,'-50%'],
                symbolSize:[barWidth, barWidth/2],
                itemStyle:{
                    color:'#169ab1'
                }
            },
            {
                type:'pictorialBar',
                data:finishData.map((item,index)=>item+unFinishData[index]),
                z:4,
                symbolPosition:'end',
                symbol:'circle',
                symbolOffset:[0,'-50%'],
                symbolSize:[barWidth, barWidth/2],
                itemStyle:{
                    color:'#09465c'
                }
            }
        ];
        return { chartSet, categoryData };
    }
    
    useEffect(()=>{
        let dom = containerRef.current;
        if ( dom && dom.offsetHeight ){
            myChart = echarts.init(dom);
            let option = {
                tooltip:{
                    trigger:'axis',
                    formatter:(params)=>{
                        return `<span>${params[0].name}</span>`
                            +'<br/>'
                            +`<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#10bbcf;"></span>已完成:${Math.round(params[0].value)}`
                            +'<br/>'
                            +`<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:rgba(16,191,212,0.4);"></span>未完成:${Math.round(params[1].value)}`
                    }
                },
                grid:{
                    top:40,
                    bottom:10,
                    left:10,
                    right:10,
                    containLabel:true
                },
                color:['red','green'],
                // dataZoom:[
                //     {
                //         show:true,
                //         type:'slider',
                //         xAxisIndex:0,
                //         startValue:0,
                //         endValue: 10
                //     }
                // ],
                legend:{
                    left:'left',
                    data:['已完成','未完成'],
                    textStyle:{
                        color:'#fff'
                    },
                    icon:'rect',
                    itemWidth:10,
                    itemHeight:10,
                    selectedMode:false
                },
                yAxis: {
                    show: true,
                    // name:'告警数(次)',
                    // nameTextStyle:{
                    //     color:'#fff'
                    // },
                    type:'value',
                    axisLine:{ show:false },
                    axisLabel:{
                        color:'#7e97ac'
                    },
                    splitLine:{
                        show:true,
                        lineStyle:{
                            color:'#0e2e46'
                        }
                    }
                },
                xAxis:{
                    show:true,
                    // name:'单位(次)',
                    type:'category',
                    splitLine:{ show:false },
                    axisLine:{
                        lineStyle:{
                            color:'#3286a6'
                        }
                    },
                    axisLabel:{
                        // fontSize: forReport ? 10 : 12,
                        formatter:value=>{
                            let str;
                            if ( value.length > 4 ) {
                                str = value.substring(0, 5);
                            } else {
                                str = value;
                            }
                            str = str.replace(pattern,'');
                            return str.split('').join('\n');
                        }
                    },
                    // axisLabel:{
                    //     color:'#7e97ac',
                    //     interval:0,
                    //     // rotate:30,
                    //     formatter:(value)=>{
                    //         var newParamsName = "";
                    //         var provideNumber = 5;  //一行显示几个字
                    //         newParamsName = value.substring(0, provideNumber) + '...'
                    //         return value.length > 6 ? newParamsName : value;
                    //     }
                    // },
                    axisTick:{ show:false },
                    data:[]
                },
                series:[]
            };
            myChart.setOption(option);
            
            function handleResize(){
                if ( myChart ){
                    myChart.resize();
                }
            }
            window.addEventListener('resize',handleResize);
            return ()=>{
                window.removeEventListener('resize', handleResize);
                myChart = null;
                option = null;
            }
        }
    },[]);
  
    useEffect(()=>{
        new Promise((resolve, reject)=>{
            dispatch({ type:'agentMonitor/fetchWarningRank', payload:{ timeType:current, resolve, reject }} );
        })
        .then((data)=>{
            let { chartSet, categoryData } = createChartSet(data);
            let prevOption = myChart.getOption();
            prevOption.xAxis[0].data = categoryData;
            prevOption.series = chartSet;
            myChart.setOption(prevOption);
        })
        .catch(msg=>message.error(msg))
    },[current]);
    return (   
        <div style={{ height:'100%', position:'relative'}}>
            <div style={{ position:'absolute', textAlign:'center', zIndex:'10', top:'10px', right:'0' }}>
                <div className={style['table-tabs']}>
                    {
                        tabs.map((item,index)=>(
                            <div key={index} className={item.key === current ? `${style['tabs-item']} ${style['selected']}` : style['tabs-item']} onClick={()=>setCurrent(item.key)}>{ item.title }</div>
                        ))
                    }                 
                </div>
            </div>
            <div ref={containerRef} style={{ height:'100%'}}></div>
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

export default  WarningRankBarChart;
