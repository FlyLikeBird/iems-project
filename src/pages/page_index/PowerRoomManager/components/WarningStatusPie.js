import React from 'react';
import ReactEcharts from 'echarts-for-react';

const statusMap = {
    '1':{
        text:'未处理',
        color:'#f5a60a'
    },
    '2':{
        text:'处理中',
        color:'#3f8fff'
    },
    '3':{
        text:'已处理',
        color:'#2acd96'
    },
    '4':{
        text:'挂起',
        color:'#e44a36'
    }
};

function WarningStatusPie({ data }){
    let seriesData = [];
    Object.keys(data).forEach(key=>{
        seriesData.push({ 
            name:statusMap[key].text, 
            value:data[key],
            itemStyle:{
                color:statusMap[key].color
            }
        });
    })
    return (
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%'}}
            option={{  
                tooltip:{
                    trigger:'item'
                },  
                legend: {
                    icon:'circle',
                    orient:'vertical',
                    top:'middle',
                    right:'20%',
                    itemWidth: 10,
                    itemHeight: 10,
                    textStyle:{
                        fontSize:12
                    },
                    data:seriesData.map(i=>i.name)
                }, 
                
                series:[
                    {
                        type:'pie',
                        center:['30%','50%'],
                        radius:['60%', '74%'],
                        avoidLabelOverlap:false,  
                        labelLine:{
                            show:false,
                            length:0,
                            length2:0
                        },
                        label:{
                            show:true,
                            formatter:(params)=>{
                                if ( params.data.value){
                                    return `{a|${params.data.value}}`
                                } else {
                                    return '';
                                }
                            },
                            rich:{
                                a:{
                                    fontSize:12,
                                    fontWeight:'normal',
                                    padding:[4, 10],
                                    borderRadius:10,
                                    borderWidth:0,
                                    backgroundColor:'#ebfff8',
                                }
                            },
                        },
                        data:seriesData
                    }
                ]
                
            }}
        /> 
    )
}

export default WarningStatusPie;