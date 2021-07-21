import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button, DatePicker } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import style from '../../../IndexPage.css';
import XLSX from 'xlsx';
import { IconFont } from '@/pages/components/IconFont';

function AlarmCountChart({ data, warningColors, theme, forReport }) {
    const echartsRef = useRef();
    const textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const [timeType, toggleTimeType] = useState('day');
    let sourceData = timeType === 'day' ? data['day'] : data['month'];
    let seriesData = [];
   
    seriesData.push({
        type:'bar',
        name:'电气警报',
        stack:'警报类型',
        data:sourceData.eleArr,
        barMaxWidth:10,
        itemStyle:{
            color:warningColors['ele']
        }
    });
    seriesData.push({
        type:'bar',
        name:'越限警报',
        stack:'警报类型',
        data:sourceData.limit,
        barMaxWidth:10,
        itemStyle:{
            color:warningColors['limit']
        }
    });
    seriesData.push({
        type:'bar',
        name:'通讯警报',
        stack:'警报类型',
        data:sourceData.link,
        barMaxWidth:10,
        itemStyle:{
            color:warningColors['link']
        }
    });
    return (   
        <div style={{ height:'100%', position:'relative'}}>

            <Radio.Group style={{ right:'unset', left:'6px' }} className={style['float-button-group'] + ' ' + style['custom-radio']} value={timeType} onChange={(e)=>toggleTimeType(e.target.value)}>
                <Radio.Button key='month' value='month'>12M</Radio.Button>
                <Radio.Button key='day' value='day'>30D</Radio.Button>
            </Radio.Group>
            {
                forReport 
                ?
                null
                :
                <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-radio']} onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = '能源安全报警次数监控';
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
                        let date = new Date();
                        let datePrefix = timeType === 'month' ? date.getFullYear() : date.getFullYear() + '-' +  ( date.getMonth() + 1 );                
                        sourceData.date.forEach(i=>{
                            thead.push( datePrefix + '-' + i);
                        });
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
                    <Radio.Button key='download' value='download'><IconFont style={{ fontSize:'1.2rem'}} type='icontupian'/></Radio.Button>
                    <Radio.Button key='excel' value='excel'><IconFont style={{ fontSize:'1.2rem' }} type='iconexcel1' /></Radio.Button>
                </Radio.Group>
            }
            
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%' }}
                option={{
                    tooltip: { trigger:'axis'},
                    title:{
                        text:'能源安全报警次数监控',
                        left:'center',
                        top:6,
                        textStyle:{ color:textColor }
                    },
                    grid:{
                        top:70,
                        bottom:20,
                        left:40,
                        right:40,
                        containLabel:true
                    },    
                    legend: {
                        left:'center',
                        top:30,
                        textStyle:{ color:textColor },
                        data:['电气警报', '越限警报', '通讯警报']
                    },
                    xAxis: {
                        show: true,
                        name: timeType === 'day' ? '日' : '月',
                        nameTextStyle:{ color:textColor },
                        axisLabel:{ color:textColor },
                        axisTick:{ show:false },
                        type:'category',
                        data:sourceData.date,
                    },
                    yAxis:{
                        show:true,
                        name:'单位(次)',
                        nameTextStyle:{ color:textColor },
                        axisLabel:{ color:textColor },
                        axisTick:{ show:false },
                        type:'value',
                        minInterval:1,
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
