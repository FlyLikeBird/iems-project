import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button, DatePicker } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import style from '@/pages/IndexPage.css';
import XLSX from 'xlsx';

function AlarmCountChart({ data, title, timeType, forProject, theme }) {
    const echartsRef = useRef();
    const textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let seriesData = [];
    seriesData.push({
        type:'bar',
        name:'电气安全',
        stack:'alarm',
        data:data.safe,
        barMaxWidth:10,
        itemStyle:{
            color:'#ffb863'
        }
    });
    seriesData.push({
        type:'bar',
        name:'指标越限',
        stack:'alarm',
        data:data.limit,
        barMaxWidth:10,
        itemStyle:{
            color:'#af2aff'
        }
    });
    seriesData.push({
        type:'bar',
        name:'通讯异常',
        stack:'alarm',
        data:data.link,
        barMaxWidth:10,
        itemStyle:{
            color:'#6dcffb'
        }
    });
    
    return (   
        <div style={{ height:'100%', position:'relative'}}>
            
                <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-radio']} onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = forProject ? '项目告警排名' : '告警趋势';
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
                        var aoa = [], thead = ['对比项'];
                        // let date = new Date();
                        // let datePrefix = timeType === 'month' ? date.getFullYear() : date.getFullYear() + '-' +  ( date.getMonth() + 1 );                
                        if ( forProject ){
                            data.company.forEach(i=>{
                                thead.push(i);
                            })
                        } else {
                            data.date.forEach(i=>{
                                thead.push(i);
                            });
                        }
                        
                        aoa.push(thead);
                        seriesData.forEach(i=>{
                            let temp = [];
                            temp.push(i.name);
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
          
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%' }}
                option={{
                    tooltip: { trigger:'axis'},
                    title:{
                        text:title,
                        left:10,
                        top:10,
                        textStyle:{ fontSize:14, color:'#fff' }
                    },
                    grid:{
                        top:70,
                        bottom:20,
                        left:40,
                        right:40,
                        containLabel:true
                    },    
                    legend: {
                        left:120,
                        top:10,
                        itemWidth:10,
                        itemHeight:10,
                        textStyle:{ color:textColor },
                        data:['电气安全', '指标越限', '通讯异常']
                    },
                    xAxis: {
                        show: true,
                        name: forProject ? '' : timeType === '1' ? '时' : timeType === '2' ? '日' : '月',
                        nameTextStyle:{ color:textColor },
                        axisLabel:{
                            color:textColor,
                            formatter:forProject ?
                                (value,index)=>{
                                    let str = value;
                                    if ( value.length > 10 ) {
                                        str = value.substring(0, 10);
                                    } else {
                                        str = value;
                                    }
                                    
                                    return str.split('').join('\n');
                                }
                                :
                                '{value}'
                        },
                        axisTick:{ show:false },
                        type:'category',
                        data: forProject ? data.company : data.date,
                    },
                    yAxis:{
                        show:true,
                        
                        name:'(次)',
                        nameTextStyle:{ color:textColor },
                        axisLabel:{ color:textColor },
                        axisTick:{ show:false },
                        type:'value',
                        minInterval:1,
                        axisLine:{ show:false },
                        splitLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
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
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme  ) {
        return false;
    } else {
        return true;
    }
}

export default  React.memo(AlarmCountChart, areEqual);
