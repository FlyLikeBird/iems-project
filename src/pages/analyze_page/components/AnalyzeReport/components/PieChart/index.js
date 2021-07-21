import React, { useState, useRef } from 'react';
import { Radio, Card, Button,  } from 'antd';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';

function PieChart({ data, forMeter }) {
    const seriesData = [];
    let pieData = [] ; 
    if ( forMeter ) {
        pieData.push({ value:data.baseCost, name:'基', itemStyle:{ color:'#ffc000'}});
        if ( data.tip.cost ){
            pieData.push({ value:data.tip.cost, name:'尖', itemStyle:{ color:'#00ff00'}});
        }
        if ( data.top.cost ){
            pieData.push({ value:data.top.cost, name:'峰', itemStyle:{ color:'#61d6ff'}});
        }
        if ( data.middle.cost){
            pieData.push({ value:data.middle.cost, name:'平', itemStyle:{ color:'#376bc8'}})
        }
        if ( data.bottom.cost ){
            pieData.push({ value:data.bottom.cost, name:'谷', itemStyle:{ color:'#a5a5a5'}})
        }
    } else {
       
        pieData = [
            { value:data.baseCost, name:'基本电费', itemStyle:{ color:'#00ff00'} },
            { value:data.meterCost, name:'计量电费', itemStyle:{ color:'#61d6ff'} }
        ];
    }
    seriesData.push({
        type:'pie',
        name:'电费分析',
        radius:['50%', '70%'],
        center:['30%','50%'],
        // avoidLabelOverlap: false,
        // roseType: 'radius',
        label:{
            show:true,
            position:'inside',
            fontSize:14,
            color:'#000',
            formatter:(params)=>{
                let value = +params.data.value;
                return value || '';
            }
        },
        labelLine: {
            show:false
        }, 
        itemStyle: {
            borderWidth: 3,
            borderColor: '#f7f7f7',
            color: '#c23531',
            shadowBlur: 200,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
        },
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx) {
            return Math.random() * 200;
        },
        data:pieData
    });
    console.log(data);
    
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
                    data:pieData.map(i=>i.name),
                    right:'10%',
                    top:'middle',
                    orient:'vertical',
                    textStyle:{
                        color:'#000'
                    }
                },
                title:{
                    text: forMeter ? '电费分解' : data.totalCost,
                    left:'30%',
                    top:"50%",
                    textStyle:{
                        color:"#09c1fd",
                        fontSize:20,
                        align:"center"
                    }
                },
                graphic:{
                    type:'text',
                    left:'30%',
                    top:'40%',
                    style:{
                        text: forMeter ? '' : `3月电费`,
                        textAlign:'center',
                        fill:'#fff',
                        fontSize:12
                    }
                },
                series:seriesData
            }}
        /> 
           
    );
}

export default PieChart;
