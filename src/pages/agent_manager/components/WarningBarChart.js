import React from 'react';
import ReactEcharts from 'echarts-for-react';
const statusType = {
    '1':{ text:'未处理', color:'#ffa733'},
    '2':{ text:'跟进中', color:'#fac926'},
    '3':{ text:'已处理', color:'#18e6fe'},
    '4':{ text:'挂起', color:'#28b6ff'}
};
const typeMap = {
    'ele':'电气安全',
    'over':'指标越限',
    'link':'通讯异常',
    'hes':'HES人员安全',
    'fire':'消防安全'
};
function WarningBarChart({ data }){
    let dealed = {
        type:'bar',
        stack:'warning',
        name:'dealed',
        barWidth:10,
        data:[]
    };
    let undealed = {
        type:'bar',
        stack:'warning',
        name:'undealed',
        barWidth:10,
        data:[]
    };
    let halfdealed = {
        type:'bar',
        stack:'warning',
        name:'halfdealed',
        barWidth:10,
        data:[]
    };
    let finished = {
        type:'bar',
        stack:'warning',
        name:'finished',
        barWidth:10,
        data:[]
    };
    let category = [];
    Object.keys(data).forEach(key=>{
        category.push(typeMap[key]);
        Object.keys(data[key]).forEach(type=>{
            if ( type=== '1'){    
                undealed.name = statusType[type].text;
                undealed.itemStyle = { color:statusType[type].color };
                undealed.data.push(data[key][type]);
            } else if ( type === '2'){
                halfdealed.name = statusType[type].text;
                halfdealed.itemStyle = { color:statusType[type].color };
                halfdealed.data.push(data[key][type]);
            } else if ( type === '3'){
                dealed.name = statusType[type].text;
                dealed.itemStyle = { color:statusType[type].color };
                dealed.data.push(data[key][type])
            } else {
                finished.name = statusType[type].text;
                finished.itemStyle = { color:statusType[type].color };
                finished.data.push(data[key][type])
            }
        })
    });
    // console.log(undealed);
    // console.log(dealed);
    return (
        <ReactEcharts 
            notMerge={true}
            style={{ width:'100%', height:'100%'}}
            option={{
                tooltip:{
                    trigger:'axis'
                },
                legend:{
                    left:'center',
                    top:0,
                    data:['未处理','跟进中', '已处理', '挂起'],
                    icon:'circle',
                    itemWidth:8,
                    itemHeight:8,
                    textStyle:{
                        color:'#7e97ac',
                        fontSize:10
                    }
                },
                grid:{
                    top:10,
                    bottom:10,
                    left:10,
                    right:10,
                    containLabel:true
                },
                xAxis:{
                    type:'value',
                    axisTick:{
                        show:false
                    },
                    splitLine:{
                        show:false
                    },
                    axisLine:{
                        lineStyle:{
                            color:'#3286a6'
                        }
                    },
                },
                yAxis:{
                    type:'category',
                    data:category,
                    axisTick:{
                        show:false
                    },
                    axisLine:{
                        lineStyle:{
                            color:'#3286a6'
                        }
                    },
                    axisLabel:{
                        color:'#7e97ac'
                    }
                },
                series:[dealed, undealed, halfdealed, finished]
            }}
        />
    )
}

export default WarningBarChart;