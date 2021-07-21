import React from 'react';
import ReactEcharts from 'echarts-for-react';

function DemandGauge({ data }){
    return (
        <ReactEcharts
            notMerge={true}
            style={{ width:'100%', height:'100%'}}
            option={{
                series:[
                    {
                        type:'gauge',
                        name:'当前需量',
                        center:['50%','50%'],
                        min:0,
                        max:data.month_max_demand ? data.month_max_demand : 100,
                        radius:'80%',
                        startAngle:210,
                        endAngle:-30,
                        axisLine:{
                            lineStyle:{
                                width:30,
                                color:[
                                    [ data.month_max_demand ? data.now_demand/data.month_max_demand : 0,'#1890ff'],
                                    [1,'#a5e0fe']
                                ]
                            }
                        },
                        axisTick:{ show:false },
                        axisLabel:{ 
                            show:true,
                            distance:-60,
                            formatter:(value)=>{
                                if ( !data.month_max_demand ) {
                                    return '';
                                }
                                if ( value === 0 || value === data.month_max_demand ) {
                                    return Math.floor(value);
                                } else {
                                    return '';
                                }
                            }
                        },
                        splitLine:{ show:false },
                        detail:{
                            offsetCenter:[0,40],
                            fontSize:20,
                            fontWeight:'bold',
                            color:'#1890ff'
                        },
                        data:[
                            { value:Math.floor(data.now_demand), name:''}
                        ]
                    }
                ]
            }}
        />
    )
}

export default DemandGauge;