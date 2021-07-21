import React, { useState, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import { Radio } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import style from '../../../IndexPage.css';
import XLSX from 'xlsx';
import { IconFont } from '@/pages/components/IconFont';

let pattern = /\s/g;
function RankBarChart({ data, typeCode, theme }){   
    const echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000'; 
    return (
        <div style={{ height:'100%' }}>
            <Radio.Group size='small' buttonStyle="solid" className={style['float-button-group'] + ' ' + style['custom-button']} value='data' onChange={e=>{
                let value = e.target.value;
                let fileTitle = '通讯异常设备掉线排名';
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
                    var aoa = [], thead = ['设备属性','掉线次数'];                             
                    aoa.push(thead);
                    data.attrArr.forEach((attr,index)=>{
                        let temp = [];
                        temp.push(attr);
                        temp.push(data.valueArr[index]);
                        aoa.push(temp);
                    });
                   
                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                    downloadExcel(sheet, fileTitle + '.xlsx' );
                    return ;
                }
            }}>
                <Radio.Button value='download'><IconFont style={{ fontSize:'1.4rem' }} type='icontupian'/></Radio.Button>
                <Radio.Button value='excel'><IconFont style={{ fontSize:'1.2rem' }} type='iconexcel1' /></Radio.Button>
            </Radio.Group>
            <ReactEcharts
                ref={echartsRef}
                notMerge={true}
                style={{ width:'100%', height:'100%' }}
                option={{
                    tooltip: { trigger:'axis'},
                    title:{
                        text: typeCode === 'link' ? '设备掉线排名' : '越限告警排名',
                        left:20,
                        top:20,
                        textStyle:{
                            color:textColor, fontWeight:'bold', fontSize:16 
                        }
                    },
                    grid:{
                        top:70,
                        bottom:50,
                        left:40,
                        right:60,
                        containLabel:true
                    },    
                    legend: {
                        show:false
                    },
                    dataZoom:[
                        {
                            show:true,
                            xAxisIndex:0,
                            startValue:0,
                            endValue:12,
                            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                            handleSize: '80%',
                            handleStyle: {
                                color: '#fff',
                                shadowBlur: 3,
                                shadowColor: 'rgba(0, 0, 0, 0.6)',
                                shadowOffsetX: 2,
                                shadowOffsetY: 2
                            },
                        }
                    ],
                    xAxis: {
                        show: true,
                        type:'category',
                        data:data.attrArr,
                        axisLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        },
                        interval:0,
                        axisLabel:{
                            color:textColor,
                            formatter:value=>{
                                let str;
                                if ( value.length > 10 ) {
                                    str = value.substring(0, 8) + '...';
                                } else {
                                    str = value;
                                }
                                str = str.replace(pattern,'');
                                return str;
                            }
                        },
                        axisTick:{ show:false }
                    },
                    yAxis:{
                        show:true,
                        type:'value',
                        name:'次',
                        nameGap:5,
                        nameTextStyle:{
                            color:textColor,
                            fontSize:12
                        },
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
                    series:{
                        type:'bar',
                        data:data.valueArr,
                        barWidth:20,
                        itemStyle:{
                            color:'#f5a60a'
                        }
                    }
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
export default React.memo(RankBarChart, areEqual);