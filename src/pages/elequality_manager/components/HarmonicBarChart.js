import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import style from '../../IndexPage.css';
import XLSX from 'xlsx';
import ReactEcharts from 'echarts-for-react';

function HarmonicBarChart({ data, title, timeType, type, theme }) {
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const echartsRef = useRef();
    const [chartType, toggleChartType] = useState('bar');
    let max = 20;
    if ( data.phaseA.length ){
        let arr = data.phaseA.concat(data.phaseB).concat(data.phaseC).map(i=>+i);
        let temp = +data.phaseA[0];
        arr.forEach(item=>{
            if ( item > temp ){
                temp = item;
            }
        });
        max = temp;
    }
    let seriesData = [];
    seriesData.push({
        type: chartType === 'bar' ? 'bar' : 'line',
        name: type+'A',
        barWidth:10,
        barMaxWidth:10,
        itemStyle:{
            color:'#4accee'
        },
        data:data.phaseA
    });
    seriesData.push({
        type: chartType === 'bar' ? 'bar' : 'line',
        name: type + 'B',
        barWidth:10,
        barMaxWidth:10,
        itemStyle:{
            color:'#06c651'
        },
        data:data.phaseB
    });
    seriesData.push({
        type: chartType === 'bar' ? 'bar' : 'line',
        name:type + 'C',
        barWidth:10,
        barMaxWidth:10,
        itemStyle:{
            color:'#ffa913'
        },
        data:data.phaseC
    });
   
    return (   
        <div style={{ height:'100%', position:'relative'}}>
            <Radio.Group size='small' buttonStyle="solid" className={style['float-button-group'] + ' ' + style['custom-radio']} value={chartType} onChange={e=>{
                let value = e.target.value;
                let fileTitle = title ;
                if ( value === 'download' && echartsRef.current ){
                    html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor:'#191932' })
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
                    var aoa = [], thead = ['对比项','单位'];
                    data.category.forEach(i=>{
                        thead.push(i);
                    })
                    aoa.push(thead);
                    seriesData.forEach(i=>{
                        let temp = [];
                        temp.push(i.name);
                        temp.push('%');
                        temp.push(...i.data);
                        aoa.push(temp);
                    });
                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                    downloadExcel(sheet, fileTitle + '.xlsx' );
                    return ;
                }
                toggleChartType(e.target.value);
            }}>
                <Radio.Button value='bar'><BarChartOutlined /></Radio.Button>
                <Radio.Button value='line'><LineChartOutlined /></Radio.Button>
                <Radio.Button value='download'><FileImageOutlined /></Radio.Button>
                <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button>
            </Radio.Group>
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%' }}
                option={{
                    tooltip: { 
                        show:true, 
                        trigger:'axis',
                        formatter:(params)=>{
                            // console.log(params);
                            return `
                                ${params[0].axisValue}<br/>
                                ${params[0].marker}${params[0].seriesName}:${params[0].data || '-- --'}%<br/>
                                ${params[1].marker}${params[1].seriesName}:${params[1].data || '-- --'}%<br/>
                                ${params[2].marker}${params[2].seriesName}:${params[2].data || '-- --'}%
                            `
                        }
                    },
                    title:{
                        text:title,
                        left:'center',
                        top:6,
                        textStyle:{
                            color:textColor,
                            fontSize:14
                        }
                    },
                    legend:{
                        data:seriesData.map(i=>i.name),
                        top:24,
                        left:'center',
                        textStyle:{ color:textColor }
                    },
                    grid:{
                        top:60,
                        bottom:20,
                        left:20,
                        right:40,
                        containLabel:true
                    },    
                    xAxis: {
                        show: true,
                        name: timeType === '1' ? '时' : timeType === '2' ?  '日' : '月',
                        nameTextStyle:{ color:textColor },
                        axisLabel:{ color:textColor },
                        type:'category',
                        data:data.category,
                        axisLine:{ show:false },
                        axisTick:{ show:false }
                    },
                    yAxis:{
                        show:true,
                        type:'value',
                        min:0,
                        max:max + 4,
                        splitNumber:10,
                        splitLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        },
                        axisLine:{ show:false },
                        axisTick:{ show:false },
                        axisLabel:{
                            color:textColor,
                            formatter:(value)=>{
                                return value % 1 === 0 ? value + '.0%' : value + '%';
                            }
                        }
                    },
                    series:seriesData
                }}
            /> 
        </div> 
        
    );
}


function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default  React.memo(HarmonicBarChart, areEqual);
