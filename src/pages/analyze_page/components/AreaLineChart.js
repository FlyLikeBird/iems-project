import React, { useState, useRef } from 'react';
import { Radio, Card, Button  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import { downloadExcel } from '@/pages/utils/array';
import style from '@/pages/IndexPage.css';
import XLSX from 'xlsx';

function AreaLine({ data, theme, forModal }) {
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const echartsRef = useRef();
    const seriesData = [
        { type:'line', symbol:'none', itemStyle:{ color:'#ccc' }, areaStyle: { opacity:0.6 }, data:data.tipArr.map(i=>i || null), name:'尖' },
        { type:'line', symbol:'none', itemStyle:{ color:'#57e29f' }, areaStyle: { opacity:0.6 }, data:data.topArr.map(i=>i || null), name:'峰' },
        { type:'line', symbol:'none', itemStyle:{ color:'#ffc84b' }, areaStyle: { opacity:0.6 }, data:data.middleArr.map(i=>i || null), name:'平' },
        { type:'line', symbol:'none', itemStyle:{ color:'#65cae3' }, areaStyle: { opacity:0.6 }, data:data.bottomArr.map(i=>i || null), name:'谷' },
        { type:'line', symbol:'none', itemStyle:{ color:'#c23531' }, lineStyle:{type:'dashed'}, data:data.referArr, name:'参考线' }
    ] 
    return (    
        <div style={{ height:'100%'}}>
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
                <Radio.Button value='download'><FileImageOutlined /></Radio.Button>
                <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button>
            </Radio.Group>
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%'}}
                option={{
                    legend:{
                        left:'center',
                        data:['尖','峰','平','谷','参考线'],
                        textStyle:{ color:textColor }
                    },
                    tooltip:{
                        trigger:'axis',
                        formatter:(params)=>{
                            let categoryName = params[0].name;
                            let html = '';
                            html += categoryName;
                            params.forEach((item,index)=>{
                                if ( !item.data || item.data.newAdd ) return;
                                html += (`<br/>${item.marker + item.seriesName}: ${item.data}`);
                            })
                            return html;
                        }
                    },
                    grid:{
                        left:40,
                        right:20,
                        top:40,
                        bottom:50,
                        containLabel:true
                    },
                    dataZoom: [
                        {
                            show:true,
                            bottom:10,
                            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                            handleSize: '80%',
                            handleStyle: {
                                color: '#fff',
                                shadowBlur: 3,
                                shadowColor: 'rgba(0, 0, 0, 0.6)',
                                shadowOffsetX: 2,
                                shadowOffsetY: 2
                            },
                            startValue: 0,
                            endValue: data.date.length > 48 ? 48 : data.date.length  
                        }
                    ],
                    xAxis:{
                        type:'category',
                        data:data.date,
                        axisTick:{ show:false },
                        axisLine:{ show:false },
                        axisLabel:{ color:textColor }
                        // axisLabel:{
                        //     formatter:value=>{
                        //         let strArr = value.split(' ');
                        //         return strArr[1] || ''
                        //     }
                        // }
                    },
                    yAxis:{
                        type:'value',
                        name:'(单位:kw)',
                        nameTextStyle:{ color:textColor },
                        axisTick:{ show:false },
                        axisLine:{ show:false },
                        axisLabel:{ color:textColor },
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
    if ( prevProps.data !== nextProps.data ){
        return false;
    } else {
        return true;
    }
}


export default React.memo(AreaLine, areEqual);
