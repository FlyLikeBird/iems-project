import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Card, Button, DatePicker } from 'antd';
import { PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import Loading from '@/pages/components/Loading';
import style from '@/pages/IndexPage.css';
import XLSX from 'xlsx';
import { IconFont } from '@/pages/components/IconFont';

let linearColor = {
    color: {
        type: 'linear',
        x: 0,                 // 左上角x
        y: 0,                 // 左上角y
        x2: 0,                // 右下角x
        y2: 1,                // 右下角y
        colorStops: [{
            offset: 0, color:'#7446fe' // 0% 处的颜色
        }, {
            offset: 1, color: '#0b9dff' // 100% 处的颜色
        }],
    },
    barBorderRadius:6
}
function WaterBarChart({ data, timeType, energyInfo, theme }) {
    const echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let seriesData = [];
    seriesData.push({
        type:'bar',
        barWidth:10,
        name:energyInfo.type_name + '成本',
        data:data.value,
        itemStyle:linearColor
    })
    seriesData.push({
        type:'line',
        symbol:'none',
        name:'环比',
        itemStyle : { color:'#6fcc17' },
        data: data.lastValue,
    });
   
    const option = {
        title: {
            text:`${energyInfo.type_name}成本趋势图`,
            left: 'center',
            top:4,
            textStyle:{ color:textColor }
        },
        legend:{
            top:4,
            right:160,
            data:[energyInfo.type_name + '成本','环比'],
            textStyle:{ color:textColor }
        },
        tooltip: {
            trigger: 'axis',
            // formatter: '{a}:{b}: {c}',
        },
        grid: {
            top: 70,
            left: 20,
            right: 40,
            bottom:20,
            containLabel: true
        },
       
        xAxis: {
            type:'category',
            name: timeType === '1' ? '月' : timeType === '2' ? '日' : timeType === '3' ? '时' : '',
            nameTextStyle:{ color:textColor },
            data: data.date,
            silent: false,
            splitLine: {
                show: false
            },
            axisTick:{ show:false },
            axisLine:{ show:false },
            splitArea: {
                show: false
            },
            axisLabel:{
                show:true,
                color:textColor,
                formatter:(value)=>{
                    let temp = value.split(' ');
                    if ( temp && temp.length > 1){
                        return temp[1] + '\n' + temp[0];
                    } else {
                        return temp[0];
                    }
                }
            }
        },
        yAxis: {
            name: '(单位:元)',
            nameTextStyle:{ color:textColor },
            type:'value',
            splitArea: {
                show: false
            },
            axisLine:{ show:false },
            axisTick:{ show:false },
            axisLabel:{ color:textColor },
            splitLine:{
                show:true,
                lineStyle:{
                    color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                }
            }
        },
        series: seriesData 
    };
    
    return (
        <div style={{ height:'100%', position:'relative' }}>
                 
                <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-button']} onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = energyInfo.type_name + '成本趋势图';
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
                        var aoa = [], thead = ['对比项', '单位'];
                        data.date.forEach(i=>{
                            thead.push(i);
                        });
                        aoa.push(thead);
                        seriesData.forEach(i=>{
                            let temp = [];
                            temp.push(i.name);
                            temp.push('元');
                            temp.push(...i.data);
                            aoa.push(temp);
                        });
                        var sheet = XLSX.utils.aoa_to_sheet(aoa);
                        sheet['!cols'] = thead.map(i=>({ wch:16 }));
                        downloadExcel(sheet, fileTitle + '.xlsx' );
                    }
                }}>
                    <Radio.Button key='download' value='download'><PictureOutlined /></Radio.Button>
                    <Radio.Button key='excel' value='excel'><FileExcelOutlined /></Radio.Button>
                </Radio.Group>
            
            <ReactEcharts ref={echartsRef} notMerge={true} style={{ width:'100%', height:'100%'}} option={option} />
        </div>    
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(WaterBarChart, areEqual);
