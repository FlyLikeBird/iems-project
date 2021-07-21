import React, { useState, useRef, useEffect } from 'react';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { Radio } from 'antd';
import { FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import { downloadExcel } from '@/pages/utils/array';
import style from '@/pages/IndexPage.css';
import XLSX from 'xlsx';
const colors = ['#57e29f','#65cae3','#198efb','#f1ac5b'];
let splitNumber = 5;

function MachEffChart({ data, rated_power, timeType, currentAttr, theme }) {
    const echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let cate1 = timeType === '1' ? '今日' : timeType === '2' ? '本月' : '本年';
    let cate2 = timeType === '1' ? '昨日同期' : timeType === '2' ? '上月同期' :'去年同期';
    const seriesData = [];
    // data.power = data.power.map((item,index)=>{
    //     if ( index < 10 ){
    //         item = 1800 + Math.random()*100;
    //         return item;
    //     } else {
    //         return item;
    //     }
    // });
    seriesData.push({
        type:'line',
        name:cate1,
        symbol:'none',
        data:data.power,
        itemStyle:{
            color:'#09c1fd'
        },
        tooltip:{
            trigger:'axis'
        },
    });
    seriesData.push({
        type:'line',
        name:cate2,
        symbol:'none',
        data:data.yesterPower,
        itemStyle:{
            color:'#69d633'
        },
        tooltip:{
            trigger:'axis'
        },
    });
    let compareMode = +rated_power ? true : false;
    let option = {
        color:colors,
        legend:{
            top:20,
            textStyle:{ color:textColor },
            data:[cate1,cate2]
        },
        tooltip:{
            trigger:'axis'
        },
        grid:compareMode 
            ?
            [
                { top:60, bottom:60, left:40, right:'10%', containLabel:true },
                { top:60, bottom:60, left:'90%', right:0, containLabel:true }
            ]
            :
            {
                bottom:60,
                left:40,
                right:60,
                containLabel:true
            },
        
        dataZoom: [
            {
                show:true,
                bottom:20,
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            }
        ],
        xAxis: {
            type:'category',
            name: '小时',
            nameTextStyle:{ color:textColor },
            data: data.date,
            silent: false,
            splitLine: {
                show: false
            },
            axisTick:{ show:false },
            axisLabel:{
                show:true,
                color:textColor,
                formatter:(value)=>{
                    return value.split(' ')[1];
                }
            },
            splitArea: {
                show: false
            }
        },
        yAxis:{
            name: '视在功率(kw)',
            nameTextStyle:{ color:textColor },
            type:'value',
            splitArea: {
                show: false
            },
            axisLabel:{
                color:textColor
            },
            splitLine:{
                show:true,
                lineStyle:{
                    color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                }
            }        
        },
        series: seriesData 
    };
    useEffect(()=>{
        let chart = echartsRef.current.getEchartsInstance();
        if ( compareMode ){
            // 如果额定功率大于视在功率区间所有值,则取额定功率为最大值；
            // 否则以区间最大值为终点，判断额定功率在区间的位置，转换为像素坐标，以此为基准
            let powerMax = data.power.concat().sort((a,b)=>b-a)[0];
            let yesterPowerMax = data.yesterPower.concat().sort((a,b)=>b-a)[0];
            let yMaxValue = Math.ceil(powerMax < yesterPowerMax ? yesterPowerMax : powerMax);
            let gtRatedPower = false;
            let xAxis = [], yAxis = [];
            let ratedPowerYPos;
            if ( +rated_power >= yMaxValue ){
                yMaxValue = +rated_power;
            } else {
                gtRatedPower = true;
            }
            // 特殊模式
            if ( gtRatedPower ){
                // 异步是渲染后才能获取到准备的像素坐标
                setTimeout(()=>{
                    let pix = chart.convertToPixel({ xAxisIndex:0, yAxisIndex:0 }, [0, +rated_power]);
                    let topDis = pix[1];
                    let prevOption = chart.getOption();
                    prevOption.grid[1].top = topDis;
                    chart.setOption(prevOption);
                },500)
                
            }
            option.yAxis.min = 0;
            option.yAxis.max = yMaxValue;
            option.yAxis.gridIndex = 0;
            option.xAxis.gridIndex = 0;
            // 更新y轴
            yAxis.push(option.yAxis);
            yAxis.push({
                type:'value',
                gridIndex:1,
                min:0,
                max:yMaxValue,
                barMaxWidth:10,
                splitArea: {
                    show: false
                },
                splitNumber,
                axisLabel:{ show:false },
                axisLine:{
                    show:false,
                },
                axisTick:{
                    show:false
                },
                splitLine:{
                    show:false
                },
            });
            // 更新x轴
            xAxis.push(option.xAxis);
            xAxis.push({
                type:'category',
                gridIndex:1,
                data:['1'],
                axisTick:{ show:false },
                axisLine:{ show:false },
                axisLabel:{
                    color:'#fff'
                }
            });
            option.series[0].markLine = {
                data:[{ value:'额定功率', yAxis:+rated_power }]
            };
            option.yAxis = yAxis;
            option.xAxis = xAxis;
            let splitInterval =  Math.floor(yMaxValue*0.2);
            for(var i=0;i < splitNumber;i++){
                let obj = {
                    type:'bar',
                    data:[{ value:splitInterval, index:i*2 + 2}],
                    stack:'hello',
                    barWidth:20,
                    silent:true,
                    xAxisIndex:1,
                    yAxisIndex:1,
                    label:{
                        show:true,
                        position:'insideTop',
                        formatter:(params)=>{
                            return params.data.index * 10 + '%';
                        }
                    },
                    itemStyle :{
                        color:i === 0 || i === 1 ? '#fd6e4c' : i === 2 || i === 4 ? '#ffc80c' : i === 3 ? '#6ec71e' :'#fd6e4c'
    
                    },
                    tooltip:{
                        show:false
                    }
                };
                seriesData.push(obj);
            } 
            chart.setOption(option);

        }
      
    },[data]);
   
    return (  
        <div style={{ height:'100%'}}>
            <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-button']} onChange={e=>{
                let value = e.target.value;
                let fileTitle = '利用率';
                if ( value === 'download' && echartsRef.current ){
                    html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor: theme === 'dark' ? '#191932' : '#fff' })
                    .then(canvas=>{
                        let MIME_TYPE = "image/png";
                        let url = canvas.toDataURL(MIME_TYPE);
                        let linkBtn = document.createElement('a');
                        linkBtn.download = fileTitle ;          
                        linkBtn.href = url;
                        let event;
                        if( window.MouseEvent) {
                            event = new MouseEvent('click');
                        } else {
                            event = document.createEvent('MouseEvents');
                            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                        }
                        linkBtn.dispatchEvent(event);
                    })
                    return ;
                }
                if ( value === 'excel' ) {
                    var aoa = [], thead = ['对比项','属性'];
                    data.date.forEach(i=>{
                        thead.push(i);
                    });
                    aoa.push(thead);
                    aoa.push([cate1, currentAttr.title, ...data.power]);
                    aoa.push([cate2, currentAttr.title, ...data.yesterPower]);
                                              
                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                    downloadExcel(sheet, fileTitle + '.xlsx' );
                }
            }}>
                <Radio.Button value='download'><FileImageOutlined /></Radio.Button>
                <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button>
            </Radio.Group>
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{width:'100%', height:'100%'}}
                option={option}
            />
        </div>
                    
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(MachEffChart, areEqual);
