import React, { useState, useRef } from 'react';
import { Radio, Card, Button, message  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import ecStat from 'echarts-stat';
import dataTool from 'echarts/extension/dataTool';
import html2canvas  from 'html2canvas';
import XLSX from 'xlsx';
import { downloadExcel } from '@/pages/utils/array';
import style from '@/pages/IndexPage.css';

function TrendLineChart({ data, timeType, theme }) {
    const { date, value } = data;
    let echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let seriesData = [], eEnergy = [], totalEnergy = [], ratio = [];
    if ( value && value.length ) {
        value.forEach(item=>{
            eEnergy.push(item.eEnergy);
            totalEnergy.push(item.totalEnergy);
            ratio.push(item.eEnergyPercent);
        })
    }
    seriesData.push({
        type:'line',
        name:'E总能耗',
        data:totalEnergy,
        smooth:true,
        symbol:'none',
        itemStyle:{ color:'#7042fb' },
        lineStyle:{
            width:2,
        },
        areaStyle:{
            color: {
                type: 'linear',
                x: 0,                 // 左上角x
                y: 0,                 // 左上角y
                x2: 0,                // 右下角x
                y2: 1,                // 右下角y
                colorStops: [{
                    offset: 0, color:'rgba(112, 66, 251, 0.85)' // 0% 处的颜色
                }, {
                    offset: 1, color: 'transparent' // 100% 处的颜色
                }],
            },
            opacity:0.3
        },
    });
    seriesData.push({
        type:'line',
        name:'e基础能耗',
        data:eEnergy,
        smooth:true,
        symbol:'none',
        itemStyle:{ color:'#22e0ff' },
        lineStyle:{
            width:2,
        },
        areaStyle:{
            color: {
                type: 'linear',
                x: 0,                 // 左上角x
                y: 0,                 // 左上角y
                x2: 0,                // 右下角x
                y2: 1,                // 右下角y
                colorStops: [{
                    offset: 0, color:'rgba(34, 224, 255, 0.85)' // 0% 处的颜色
                }, {
                    offset: 1, color: 'transparent' // 100% 处的颜色
                }],
            },
            opacity:0.3
        },
    });
    seriesData.push({
        type:'line',
        yAxisIndex:1,
        name:'e/E',
        data:ratio,
        symbol:'none',
        smooth:true,
        itemStyle:{ color:'#ffb863'},
        lineStyle:{
            width:2,
            type:'dashed'
        }
    })
    
    return (    
        <div style={{ height:'100%', position:'relative' }}>
            <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-button']} value='data' onChange={e=>{
                let value = e.target.value;
                let fileTitle = `E-P图趋势`;
                if ( value === 'download' && echartsRef.current ){
                    html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor:theme === 'dark' ? '#191932' : '#fff' })
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
                    if ( eEnergy && eEnergy.length ) {
                        var aoa = [], thead = ['日期', 'E总能耗', 'e基础能耗', 'e/E'];
                        aoa.push(thead);
                        date.forEach((item, index)=>{
                            let temp = [];
                            temp.push(item);
                            temp.push(totalEnergy[index] || 0);
                            temp.push(eEnergy[index] || 0);
                            temp.push(ratio[index] || 0);
                            aoa.push(temp);
                        })
                        var sheet = XLSX.utils.aoa_to_sheet(aoa);
                        sheet['!cols'] = thead.map(i=>({ wch:16 }));
                        downloadExcel(sheet, fileTitle + '.xlsx' );
                    } else {
                        message.info('数据源为空');
                    }                 
                }
            }}>
                <Radio.Button value='download'><PictureOutlined /></Radio.Button>
                <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button>
            </Radio.Group>
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%'}}
                option={{
                    title:{
                        text:'E-P趋势',
                        left:40,
                        top:10,
                        textStyle:{
                            color:textColor,
                            fontSize:14
                        }
                    },
                    tooltip:{
                        trigger:'axis'
                    },
                    legend:{
                        data:seriesData.map(i=>i.name),
                        textStyle:{ color:textColor },
                        top:10,
                    },
                    grid:{
                        left:40,
                        right:80,
                        top:80,
                        bottom:50,
                        containLabel:true
                    },
                    xAxis:{
                        type:'category',
                        name:timeType === '3' ? '月' : '年',
                        nameGap:30,
                        data:date || [],
                        nameTextStyle:{ color:textColor },
                        axisTick:{ show:false },
                        axisLine:{ show:false },
                        axisLabel:{ 
                            color:textColor
                        },
                        splitLine:{ show:false }
                    },
                    yAxis:[
                        {
                            type:'value',
                            name:'(kwh)',
                            nameTextStyle:{ color:textColor },
                            axisTick:{ show:false },
                            axisLine:{ show:false },
                            axisLabel:{ color:textColor },
                            splitLine:{
                                show:true,
                                lineStyle:{
                                    color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                                }
                            },
                        },
                        {
                            type:'value',
                            name:'(e/E)',
                            min:0,
                            max:100,
                            nameTextStyle:{ color:textColor },
                            splitLine:{ show:false },
                            axisTick:{ show:false },
                            axisLine:{ show:false },
                            axisLabel:{ color:textColor, formatter:'{value}%' },
                        }
                    ],
                    series:seriesData
                }}
            /> 
        </div>
            
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ){
        return false;
    } else {
        return true;
    }
}


export default React.memo(TrendLineChart, areEqual);
