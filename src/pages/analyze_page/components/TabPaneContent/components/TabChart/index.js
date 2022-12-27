import React, { useState, useRef } from 'react';
import { Radio, Card, Button,  } from 'antd';
import {  DownloadOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import XLSX from 'xlsx';
import style from '@/pages/IndexPage.css';
import { IconFont } from '@/pages/components/IconFont';

let pattern = /\s/g;
function TabChart({ data, toggleVisible, activeKey, onDispatch, theme, title, forReport }) {
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let seriesData = [];
    const echartsRef = useRef();
    if ( data.data && data.data.length ) {
        seriesData = data.data.map((value,index)=>{
            return { value, attr_id:data.field[index].attr_id, attr_name:data.field[index].attr_name };
        });
    }
    
    let option = {
        tooltip:{
            show:true,
            trigger:'axis'
        },
        xAxis: {
            type: 'category',
            axisTick:{ show:false },
            data: data.field ? data.field.map(i=>i.attr_name) : [],
            axisLabel:{
                color:textColor,
                fontSize: forReport ? 10 : 12,
                formatter:value=>{
                    let str = value;
                    if ( value.length > 10 ) {
                        str = value.substring(0, forReport ? 8 : 12);
                    } else {
                        str = value;
                    }
                    str = str.replace(pattern,'');
                    
                    return str.split('').join('\n');
                }
            }
        },
        grid:{
            top:40,
            bottom:40,
            left:40,
            right:40,
            containLabel:true
        },
        itemStyle:{
            color:'#ff7b7b',
        },
        yAxis: {
            type: 'value',
            name:'单位(元)',
            nameTextStyle:{ color:textColor },
            nameLocation:'end',
            axisLabel:{ color:textColor },
            axisLine:{ show:false },
            axisTick:{ show:false },
            splitLine:{
                show:true,
                lineStyle:{
                    color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                }
            }
        },
        series:[{
            // data:  [200000, 120, 200, 150, 80, 70, 110, 130],
            data:seriesData,
            type: 'bar',
            barMaxWidth:20,
            label:{
                formatter:'{b}'
            }
        }]
    };
    const onEvents = {
        'click':(params)=>{
            // console.log(params);
            if ( forReport ) return;
            if(params.componentType === 'series' && params.componentSubType === 'bar'){
                if ( activeKey === 'basecost') {
                    onDispatch({ type:'demand/fetchAnalyz', payload:params.data.attr_id });
                } else if ( activeKey === 'adjust') {
                    onDispatch({ type:'demand/fetchUseless', payload:params.data.attr_id });
                } else if ( activeKey === 'meter'){
                    onDispatch({ type:'analyze/fetchSaveSpaceTrend', payload:params.data.attr_id });
                }
                toggleVisible({ visible:true, value:params.data.value, attr_name:params.data.attr_name, attr_id:params.data.attr_id });
            }
        }
    };
    return (    
        <div style={{ height:'100%' }}> 
            {
                forReport 
                ?
                null 
                :
                <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-button']} value='data' onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = title ;
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
                        var aoa = [], thead = ['属性','单位','节省电费'];
                        aoa.push(thead);
                        seriesData.forEach(i=>{
                            let temp = [];
                            temp.push(i.attr_name);
                            temp.push('元');
                            temp.push(i.value);
                            aoa.push(temp);
                        })
                                                  
                        var sheet = XLSX.utils.aoa_to_sheet(aoa);
                        sheet['!cols'] = thead.map(i=>({ wch:16 }));
                        downloadExcel(sheet, fileTitle + '.xlsx' );
                    }
                }}>
                    <Radio.Button key='download' value='download'><PictureOutlined /></Radio.Button>
                    <Radio.Button key='excel' value='excel'><FileExcelOutlined /></Radio.Button>
                </Radio.Group>
            }                         
            <ReactEcharts
                ref={echartsRef}
                onEvents={onEvents}
                notMerge={true}
                style={{ width:'100%', height:'100%'}}
                option={option}
            />
        </div> 
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ){
        return false;
    } else {
        return true;
    }
}


export default React.memo(TabChart, areEqual);

// let value = e.target.value;
                // let fileTitle = title;
                // if ( value === 'download' && echartsRef.current ){
                //     html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor:'#191932' })
                //     .then(canvas=>{
                //         let MIME_TYPE = "image/png";
                //         let url = canvas.toDataURL(MIME_TYPE);
                //         let linkBtn = document.createElement('a');
                //         linkBtn.download = fileTitle ;          
                //         linkBtn.href = url;
                //         let event;
                //         if( window.MouseEvent) {
                //             event = new MouseEvent('click');
                //         } else {
                //             event = document.createEvent('MouseEvents');
                //             event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                //         }
                //         linkBtn.dispatchEvent(event);
                //     })
                //     return ;
                // }
                // if ( value === 'excel' ) {
                //     var aoa = [];
                //     aoa.push(['属性','单位',title]);
                //     seriesData.forEach((item,index)=>{
                //         aoa.push([item.attr_name, '元', item.value]);
                //     })                            
                //     var sheet = XLSX.utils.aoa_to_sheet(aoa);
                //     sheet['!cols'] = ['1','1','1'].map(i=>({ wch:16 }));
                //     downloadExcel(sheet, fileTitle + '.xlsx' );
                // }