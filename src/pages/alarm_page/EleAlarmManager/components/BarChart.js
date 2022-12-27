import React, { useState, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import { Radio } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import style from '../../../IndexPage.css';
import XLSX from 'xlsx';
import { IconFont } from '@/pages/components/IconFont';

// const eleMap = {
//     '剩余电流':'#62a3ff',
//     '功率因素过低':'#01769c',
//     '温度越限':'#1fc48d',
//     '电压超标':'#0298c2',
//     '电流超标':'#f53f2e',
//     '相不平衡':'#f5a70d',
//     '缺相':'#002060'
// };

// const overMap = {
//     '产值比越限':'#'
//     '人效越限':
//     '坪效越限':
//     '电价越限':
//     '基本电费越限'
// }


function BarChart({ data, typeCode, timeType, theme }){
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let seriesData = [];
    const echartsRef = useRef();
    const [chartType, toggleChartType] = useState('bar');
    if ( chartType === 'bar'){
        seriesData = Object.keys(data.typeArr).map(key=>{
            let obj = {
                type:'bar',
                stack:'ele',
                name:key,
                barWidth:20,
                data:data.typeArr[key],
            };
            return obj;
            
        })
    } else {
        seriesData = Object.keys(data.typeArr).map(key=>{
            let obj = {
                type:'line',
                name:key,
                symbol:'none',
                data:data.typeArr[key],
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
                    let fileTitle = '电气安全告警次数';
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
                        var aoa = [], thead = ['告警类型'];
                        data.date.forEach(i=>{
                            thead.push(i);
                        })                
                        
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
                        return ;
                    }
                }}>
                    <Radio.Button value='download'><PictureOutlined /></Radio.Button>
                    <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button>
                </Radio.Group>
            </div>
            
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%' }}
                option={{
                    tooltip: { trigger:'axis'},
                    title:{
                        text:`{a|${ typeCode === 'ele' ? '电气安全' : typeCode === 'over' ? '指标安全' : '通讯安全'}}{b|总告警数:${data.totalCount}次}`,
                        left:40,
                        top:20,
                        textStyle:{
                            rich:{
                                a:{ color:textColor, fontWeight:'bold', fontSize:16 },
                                b:{ color:'#f55445', fontSize:16, padding:[0,0,0,20]}
                            }
                        }
                    },
                    grid:{
                        top:80,
                        bottom:20,
                        left:40,
                        right:60,
                        containLabel:true
                    },    
                    legend: {
                        type:'scroll',
                        left: seriesData.length <= 8 ? 'center' : 240,
                        right: seriesData.length <=8 ? 0 : 100,
                        top:20,
                        data:seriesData.map(i=>i.name),
                        textStyle:{
                            color:textColor
                        }
                    },
                    color:['#62a3ff','#1fc48d','#f5a70d','#f53f2e','#0298c2','#002060'],
                    xAxis: {
                        show: true,
                        name: timeType === '1' ? '时' : timeType === '2' || timeType === '10' ? '日' : timeType === '3' ? '月' : '年',
                        nameTextStyle:{ color:textColor},
                        type:'category',
                        data:data.date,
                        axisLine:{
                            show:false
                        },
                        interval:0,
                        axisLabel:{
                            color:textColor,
                            formatter:(value)=>{
                                let strArr = value.split('-');
                                let result = '';
                                if ( timeType === '1'){
                                    result = value.split(' ')[1];
                                } else if ( timeType === '2' || timeType === '10' ){
                                    result = strArr[2];
                                } else {
                                    result = value
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
export default React.memo(BarChart, areEqual);