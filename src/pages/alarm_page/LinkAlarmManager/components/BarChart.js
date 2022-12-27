import React, { useState, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import { Radio } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import style from '../../../IndexPage.css';
import XLSX from 'xlsx';
import { IconFont } from '@/pages/components/IconFont';

const machMap = {
    '0':{
        name:'漏保空开',
        color:'#3f8fff'
    },
    '1':{
        name:'电表',
        color:'#1fc48d'
    },
    '2':{
        name:'水表',
        color:'#f7bc48'
    },
    '3':{
        name:'气表',
        color:'#f53f2e'
    },
    '4':{
        name:'传感器',
        color:'#62a3ff'
    }
};

function BarChart({ data, cateCode, timeType, theme }){
    const echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let seriesData = [];
    const [chartType, toggleChartType] = useState('bar');
    if ( chartType === 'bar'){
        seriesData = Object.keys(data.energyTypeArr).map(key=>{
            let obj = {
                type:'bar',
                stack:'ele',
                name:machMap[key].name,
                barWidth:10,
                data:data.energyTypeArr[key],
                itemStyle:{
                    color:machMap[key].color
                }
            };
            return obj;
            
        })
    } else {

        seriesData = Object.keys(data.energyTypeArr).map(key=>{
            let obj = {
                type:'line',
                name:machMap[key].name,
                symbol:'none',
                data:data.energyTypeArr[key],
                itemStyle:{
                    color:machMap[key].color
                }
            };
            return obj;  
        })
    }
    return (
        <div style={{ position:'relative', width:'100%', height:'100%' }}>
            <div className={style['float-button-group']}>
                <Radio.Group size='small' buttonStyle="solid" className={style['custom-radio']} value={chartType} onChange={e=>{
                    toggleChartType(e.target.value);
                }}>
                    <Radio.Button value='bar'><BarChartOutlined /></Radio.Button>
                    <Radio.Button value='line'><LineChartOutlined /></Radio.Button>
                </Radio.Group>
                <Radio.Group style={{ marginLeft:'20px' }} size='small' buttonStyle="solid" className={style['custom-button']} value='data' onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = '通讯异常趋势';
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
                        var aoa = [], thead = ['设备类型','单位'];
                        data.date.forEach(i=>{
                            thead.push(i);
                        })                              
                        aoa.push(thead);
                        seriesData.forEach(i=>{
                            let temp = [];
                            temp.push(i.name);
                            temp.push('次');
                            temp.push(...i.data);
                            aoa.push(temp);
                        });
                        var sheet = XLSX.utils.aoa_to_sheet(aoa);
                        sheet['!cols'] = thead.map(i=>({ wch:16 }));
                        downloadExcel(sheet, fileTitle + '.xlsx' );
                        return ;
                    }
                }}>
                    <Radio.Button value='download'><PictureOutlined /></Radio.Button>
                    <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button>
                </Radio.Group>
            </div> 
            
            <ReactEcharts
                ref={echartsRef}
                notMerge={true}
                style={{ width:'100%', height:'100%'}}
                option={{
                    tooltip: { trigger:'axis'},
                    title:{
                        text:'通讯异常趋势图',
                        left:40,
                        top:20,
                        textStyle:{
                            color:textColor, fontWeight:'bold', fontSize:16
                        }
                    },
                    grid:{
                        top:80,
                        bottom:30,
                        left:40,
                        right:60,
                        containLabel:true
                    },    
                    legend: {
                        left:'center',
                        type:'scroll',
                        top:20,
                        data:seriesData.map(i=>i.name),
                        textStyle:{ color:textColor }
                    },
                    xAxis: {
                        show: true,
                        name: timeType === '1' ? '小时' : timeType === '2' || timeType === '10' ? '日' : timeType === '3' ?  '月' : '年',
                        nameTextStyle:{ color:textColor },
                        type:'category',
                        data:data.date,
                        axisLine:{
                            lineStyle:{
                                color:'#f0f0f0'
                            }
                        },
                        interval:0,
                        axisLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        },
                        axisLabel:{
                            color:textColor,
                            formatter:(value)=>{
                                let strArr = value.split('-');
                                let result = '';
                                if ( timeType === '1'){
                                    result = value.split(' ')[1];
                                } else if ( timeType === '2' || timeType === '10' ) {
                                    result = strArr[2];
                                } else {
                                    result = value;
                                }
                               
                                return result;
                            }
                        },
                        axisTick:{ show:false }
                    },
                    yAxis:{
                        show:true,
                        type:'value',
                        minInterval:1,
                        axisLine:{
                            show:false,
                        },
                        axisLabel:{ color:textColor },
                        axisTick:{ show:false },
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
    )
}
function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(BarChart,areEqual);