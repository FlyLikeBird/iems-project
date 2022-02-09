import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio, Card, Button,  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, FileImageOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';
import XLSX from 'xlsx';
import { downloadExcel } from '@/pages/utils/array';
import style from '@/pages/IndexPage.css';
import { IconFont } from '@/pages/components/IconFont';

function LineChart({ data, dispatch, energyList, energyInfo }) {
    const echartsRef = useRef();
    let seriesData = [];
    let temp = data[energyInfo.type_code] ? data[energyInfo.type_code].slice(0, data[energyInfo.type_code].length - 1) : [];
    let minValue = temp.concat().sort((a,b)=>a-b)[0];
    let minIndex = 0;
    temp.forEach((item,index)=>{
        if ( item === minValue ) {
            minIndex = index;
        }
    });
    seriesData.push({
        data: data[energyInfo.type_code],
        name:'负荷功率',
        type: 'line',
        symbol:'none',
        smooth:true,
        lineStyle:{
            color:'transparent'
        },
        areaStyle: {
            color:{
                type:'linear',
                x:0,
                y:0,
                x2:0,
                y2:1,
                colorStops: [{
                    offset: 0, color: '#3eb4d3' // 0% 处的颜色
                }, {
                    offset: 1, color: '#644dcb' // 100% 处的颜色
                }],
            }
        },
        markPoint:{
            data:[
                { type:'max', name:'最大值'},
                { value:minValue, xAxis:minIndex, yAxis:minValue, name:'最小值'}
            ]
        }
    });
    return (   
        <div style={{ height:'100%'}}>
            <Radio.Group size='small' style={{ top:'-14px' }} className={style['float-button-group']} value={energyInfo.type_id} onChange={e=>{
                let value = e.target.value;
                let fileTitle = '监控中心-今日负荷';
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
                    var aoa = [], thead = ['能源类型','单位'];             
                    data.date.forEach(i=>{
                        thead.push(i);
                    });
                    aoa.push(thead);
                    seriesData.forEach(i=>{
                        let temp = [];
                        temp.push(energyInfo.type_name);
                        temp.push('kw');
                        temp.push(...i.data);
                        aoa.push(temp);
                    });
                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                    downloadExcel(sheet, fileTitle + '.xlsx' );
                    return;
                }
                let temp = energyList.filter(i=>i.type_id === e.target.value )[0];
                dispatch({ type:'monitor/toggleEnergy', payload:temp });
            }}>
                {
                    energyList.map((item,index)=>(
                        <Radio.Button key={item.type_code} value={item.type_id}>{ item.type_name }</Radio.Button>
                    ))
                }
                <Radio.Button key='download' value='download'><PictureOutlined /></Radio.Button>
                <Radio.Button key='excel' value='excel'><FileExcelOutlined /></Radio.Button>
            </Radio.Group>
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%'}}
                option={{
                    tooltip:{
                        trigger:'axis'
                    },
                    grid:{
                        left:20,
                        right:20,
                        bottom:20,
                        containLabel:true
                    },
                    xAxis:{
                        type:'category',
                        data: data.date,
                        axisLabel:{
                            color:'#fff'
                        },
                        axisTick:{
                            show:false
                        }
                    },
                    yAxis:{
                        type:'value',
                        splitLine:{
                            show:true,
                            lineStyle:{
                                color:'#131f29'
                            }
                        },
                        axisLabel:{
                            color:'#fff'
                        },
                        axisLine:{
                            show:false
                        }
                    },                  
                    series:seriesData
                }}
        /> 
        </div> 
        
           
    );
}

export default LineChart;
