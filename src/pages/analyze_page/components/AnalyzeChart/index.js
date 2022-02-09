import React, { useState, useRef } from 'react';
import { Radio, Card, Button,  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import XLSX from 'xlsx';
import style from '@/pages/IndexPage.css';

const runTimeType = {
    'off':{
        text:'关机',
        color:'#ccc'
    },
    'empty':{
        text:'空载',
        color:'#f8e71c'
    },
    'normal':{
        text:'开机',
        color:'#b8e986'
    },
    'over':{
        text:'重载',
        color:'#f5a724'
    }
}

const feeTimeType = {
    '1':{
        text:'峰',
        color:'#57e29f'
    },
    '2':{
        text:'平',
        color:'#ffc84b'
    },
    '3':{
        text:'谷',
        color:'#65cae3'
    },
    '4':{
        text:'尖',
        color:'#ccc'
    }
};

function AnalyzeChart({ data, theme }) {
    const seriesData = [];
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const echartsRef = useRef();
    let option={};
    
    seriesData.push({
        type:'line',
        symbol:'none',
        data:data.view.power,
        itemStyle:{
            color:'#1890ff'
        },
        xAxisIndex:1,
        yAxisIndex:1,        
    });
    // 运行状态
    data.view.power.forEach(power=>{
        // 未设置额定功率算开机时间
        let timeType = power == null
                    ?
                    'null'
                    : 
                    power <= +data.off_power 
                    ?
                    'off'
                    :
                    +data.off_power < power && power <= +data.empty_power 
                    ?
                    'empty'
                    :
                    +data.empty_power < power && power < +data.over_power
                    ?
                    'normal'
                    :
                    data.over_power && power >= +data.over_power 
                    ?
                    'over'
                    :
                    'normal';
        seriesData.push({
            type:'bar',
            xAxisIndex:0,
            yAxisIndex:0,
            name:runTimeType[timeType] ? runTimeType[timeType].text : '',
            data:[1],
            barWidth:10,
            stack:'timeType',
            itemStyle:{
                color:runTimeType[timeType] ? runTimeType[timeType].color : '#fff'
                        
            }
        });
    });
    // 计费时段
    data.view.time.forEach(time=>{
        seriesData.push({
            type:'bar',
            xAxisIndex:2,
            yAxisIndex:2,
            name:feeTimeType[time] ? feeTimeType[time].text : '',
            data:[1],
            barWidth:10,
            stack:'feeTimeType',
            itemStyle:{
                color:feeTimeType[time] ? feeTimeType[time].color : '#ccc'
            }
        })
    });
    
    option = {
        tooltip:{
            show:true,
            trigger:'axis',
            formatter:'电流:{c}A',
            
        },  
        legend:{
            top:6,
            textStyle:{ color:textColor },
            data:Object.keys(runTimeType).map(key=>runTimeType[key].text).concat(Object.keys(feeTimeType).map(key=>{
                return { name:feeTimeType[key].text, icon:'circle' }
            }))
        },
        grid:[
            {
                left:80,
                right:40,
                top:10,
                bottom:'80%',
            },
            {
                left:80,
                right:40,
                bottom:'14%',
                top:'20%',
            },{
                left:80,
                right:40,
                top:'86%',
                bottom:'0'
            }
        ],
        // dataZoom:{ 
        //     // type:'inside',                     
        //     show:true,
        //     bottom:20,
        //     handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        //     handleSize: '80%',
        //     handleStyle: {
        //         color: '#fff',
        //         shadowBlur: 3,
        //         shadowColor: 'rgba(0, 0, 0, 0.6)',
        //         shadowOffsetX: 2,
        //         shadowOffsetY: 2
        //     },
        // },   
        xAxis:[
            {
                type:'value',
                gridIndex:0,
                min:0,
                max:48,
                axisLabel:{ show:false },
                axisTick:{ show:false },
                axisLine:{ show:false },
                splitLine:{ show:false }
            },
            {
                type:'category',
                data:data.view.date,
                // boundaryGap:false,
                // alignWithLabel:true,
                axisLine:{ show:false },
                axisLabel:{
                    color:textColor,
                    formatter:(value)=>{
                        let dateStr = value.split(' ');
                        if ( dateStr && dateStr.length > 1){
                            return dateStr[1];
                        } else {
                            return value; 

                        }
                    }
                },
                axisTick:{
                    show:false
                },
                gridIndex:1,
                splitLine:{
                    show:true,
                    interval:0,
                    lineStyle:{
                        color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                    }
                }
            },
            {
                type:'value',
                gridIndex:2,
                min:0,
                max:48,
                axisLabel:{ show:false },
                axisTick:{ show:false },
                axisLine:{ show:false },
                splitLine:{ show:false }
            },
        ],
        yAxis:[
            { 
                type:'category',
                gridIndex:0,
                axisLine:{ show:false },
                splitLine:{ show:false }

            },
            {
                type:'value',
                gridIndex:1,
                name:'(单位:A)',
                nameTextStyle:{
                    color:textColor
                },
                axisLine:{ show:false },
                axisTick:{ show:false },
                axisLabel:{
                    color:textColor
                },
                splitLine:{
                    show:true,
                    interval:0,
                    lineStyle:{
                        color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                    }
                } 
            },
            {
                type:'category',
                gridIndex:2,
                axisLine:{ show:false },
                axisTick:{ show:false },
               
            }
        ],
       
        series:seriesData
    };
    
    return (    
        <div style={{ height:'100%'}}>
            <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-button']} onChange={e=>{
                let value = e.target.value;
                let fileTitle = '分析中心-空载率';
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
                    var aoa = [], thead = ['运行状态'];
                    thead.push(...data.view.date);
                    aoa.push(thead);
                    Object.keys(data.view).forEach(key=>{
                        let temp = [];
                        if ( key === 'power') {
                            temp.push('开机');
                            temp.push(...data.view.power);
                            aoa.push(temp);
                        } else if ( key === 'off') {
                            temp.push('关机');
                            temp.push(...data.view.off);
                            aoa.push(temp);
                        } else if ( key === 'empty') {
                            temp.push('空载');
                            temp.push(...data.view.empty);
                            aoa.push(temp);
                        } else if ( key === 'over') {
                            temp.push('重载');
                            temp.push(...data.view.over);
                            aoa.push(temp);
                        }
                    })                    
                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                    downloadExcel(sheet, fileTitle + '.xlsx' );
                }
            }}>
                <Radio.Button value='download'><PictureOutlined /></Radio.Button>
                <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button>
            </Radio.Group>
            <ReactEcharts
                ref={echartsRef}
                notMerge={true}
                style={{ width:'100%', height:'100%'}}
                option={option}
            />
        </div>
             

    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.them !== nextProps.theme ){
        return false;
    } else {
        return true;
    }
}


export default React.memo(AnalyzeChart, areEqual);
