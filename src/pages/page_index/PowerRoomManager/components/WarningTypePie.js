import React from 'react';
import ReactEcharts from 'echarts-for-react';

const data = [
    { name:'未处理', value:20, itemStyle:{ color:'#f7ad1c'} },
    { name:'跟进中', value:30, itemStyle:{ color:'#6fabff'} },
    { name:'已处理', value:40, itemStyle:{ color:'#2cce98'}},
    { name:'挂起', value:50, itemStyle:{ color:'#e54834'} }
];

function WarningTypePie({ data }){
    let seriesData = [], sum = 0;
    Object.keys(data).forEach(key=>{
        sum+=data[key];
        seriesData.push({ name:key, value:data[key] });
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
                color:['#3667f4','#6acc99','#fb8b87','#fdaa7e','#fec652','#7f68f9','#b278fc'],
                title:{
                    text:`${sum}条`,
                    left:'24%',
                    top:'50%',
                    textStyle:{
                        color:"#616161",
                        fontSize:16,
                        align:"center"
                    }
                },
                graphic:{
                    type:'text',
                    left:'23%',
                    top:'42%',
                    style:{
                        text:`总告警数`,
                        textAlign:'center',
                        fill:'#616161',
                        fontSize:14,
                        
                    }
                },
                series:[
                    {
                        type:'pie',
                        center:['30%','50%'],
                        radius:['70%', '84%'],
                        avoidLabelOverlap:false,  
                        labelLine:{
                            show:false,
                            // length:-20,
                            // length2:0,
                        },
                        label:{ show:false },
                        data:seriesData
                    }
                ]
                
            }}
        /> 
    )
}

export default WarningTypePie;