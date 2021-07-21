import React, { useState, useRef, useEffect } from 'react';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { Radio } from 'antd';
import { FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import { downloadExcel } from '@/pages/utils/array';
import style from '../../../IndexPage.css';
import XLSX from 'xlsx';
import { IconFont } from '@/pages/components/IconFont';
const colors = ['#57e29f','#65cae3','#198efb','#f1ac5b'];

function AnalyzLineChart({ data, theme, forModal, forReport }) {
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const echartsRef = useRef();
    const seriesData = [];
    seriesData.push({
        type:'line',
        name:'需量',
        symbol:'none',
        smooth:true,
        data:data.demand
    });
    return (  
        <div style={{ height:'100%'}}>
            {
                forReport 
                ?
                null
                :
                <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-button']} value='data' onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = `需量管理-需量分析`;
                    if ( value === 'download' && echartsRef.current ){
                        html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor: forModal ? '#fff' : theme === 'dark' ? '#191932' : '#fff' })
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
                        data.date.forEach(i=>{
                            thead.push(i);
                        });
                        aoa.push(thead);
                        seriesData.forEach(i=>{
                            let temp = [];
                            temp.push(i.name);
                            temp.push('kw');
                            temp.push(...i.data);
                            aoa.push(temp);
                        })

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
                style={{width:'100%', height:'100%'}}
                option={{
                    color:colors,
                    tooltip:{
                        trigger:'axis'
                    },
                    legend:{
                        top:10,
                        data:['需量','月申报需量','温度'],
                        textStyle:{ color:textColor }
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
                            },
                            textStyle:{ color:textColor }
                        }
                    ],
                    grid:{
                        left:40,
                        right:60,
                        top:60,
                        bottom:60,
                        containLabel:true
                    },
                   
                    xAxis: {
                        type:'category',
                        name: '分钟',
                        nameTextStyle:{
                            color:textColor
                        },
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
                                let temp = value.split(' ');
                                return temp[1] + '\n' + temp[0];
                            }
                        },
                        axisLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        },
                        splitArea: {
                            show: false
                        }
                    },
                    // 日当前需量和月申报需量差值过大，采用log模式
                    yAxis:{
                        name: '用户需量(KW)',
                        nameTextStyle:{
                            color:textColor,
                            fontSize:14,
                            fontWeigth:'bold'
                        },
                        type:'value',
                        splitArea: {
                            show: false
                        },
                        axisLabel:{ color:textColor },
                        axisLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        },
                        splitLine:{
                            show:true,
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        } 
                    },
                    series: seriesData 
                }}
            />
        </div>
                
    );
}

export default AnalyzLineChart;