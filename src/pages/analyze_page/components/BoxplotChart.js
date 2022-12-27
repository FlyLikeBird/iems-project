import React, { useState, useRef } from 'react';
import { Radio, Card, Button  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import dataTool from 'echarts/extension/dataTool';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import style from '@/pages/IndexPage.css';
import XLSX from 'xlsx';

function hasOutliers(arr, index){
    if ( arr.includes(index)) {
        return true;
    } else {
        return false;
    }
}

function BoxplotChart({ data, theme, onVisible, onDispatch, startDate }) {
    let echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let seriesData = [], categoryData = [];
    if ( data && data.length ) {
        var formatData = dataTool.prepareBoxplotData([
            ...data.map(i=>{
                categoryData.push(i.attr_name);
                return i.data;
            })
        ]);
        // console.log(formatData);
        let outliers = formatData.outliers.map(arr=>arr[0]);
        seriesData.push({           
            type: 'boxplot',
            data:formatData.boxData.map((arr, index)=>({ value:arr, attrId:data[index].attr_id, itemStyle:{ borderWidth:2, borderColor:'#04a1fe' } })),
            tooltip: {
                formatter: function (param) {
                    return [
                        param.name + ' : ',
                        'max: ' + (+param.data.value[5]).toFixed(1),
                        'Q3: ' + (+param.data.value[4]).toFixed(1),
                        'median: ' + (+param.data.value[3]).toFixed(1),
                        'Q1: ' + (+param.data.value[2]).toFixed(1),
                        'min: ' + (+param.data.value[1]).toFixed(1)
                    ].join('<br/>');
                }
            }
        });
        seriesData.push({       
            name: '离散点',
            type: 'scatter',
            data: formatData.outliers          
        })
    };
    const onEvents = {
        'click':(params)=>{
            if ( params.componentType === 'series' && params.componentSubType === 'boxplot') {
                let attr_id = params.data.attrId;
                onVisible(true);
                new Promise((resolve, reject)=>{
                    onDispatch({ type:'modelManager/setDate', payload:startDate });
                    onDispatch({ type:'modelManager/fetchMachList', payload:{ attr_id, resolve, reject }});
                })
                .then(()=>{
                    onDispatch({ type:'modelManager/fetchMachEff'});
                })
            }
        }
    };
    return (    
        <div style={{ height:'100%'}}>
            <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-button']} value='data' onChange={e=>{
                let value = e.target.value;
                let fileTitle = `分析中心-对比分析`;
                if ( value === 'download' && echartsRef.current ){
                    html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor:theme === 'dark' ? '#191932' : '#fff' })
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
                // if ( value === 'excel' ) {
                //     var aoa = [], thead = ['对比项','单位'];
                //     data.date.forEach(i=>{
                //         thead.push(i);
                //     });
                //     aoa.push(thead);
                //     seriesData.forEach(i=>{
                //         let temp = [];
                //         temp.push(i.name);
                //         temp.push('kw');
                //         temp.push(...i.data);
                //         aoa.push(temp);
                //     })
                                              
                //     var sheet = XLSX.utils.aoa_to_sheet(aoa);
                //     sheet['!cols'] = thead.map(i=>({ wch:16 }));
                //     downloadExcel(sheet, fileTitle + '.xlsx' );
                // }
            }}>
                <Radio.Button value='download'><PictureOutlined /></Radio.Button>
                {/* <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button> */}
            </Radio.Group>
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                onEvents={onEvents}
                style={{ width:'100%', height:'100%'}}
                option={{
                    title:{
                        text:'设备电流对比分析',
                        left:'center',
                        top:6,
                        textStyle:{
                            color:textColor,
                            fontSize:14
                        }
                    },
                    tooltip:{
                        trigger:'item'
                    },
                    grid:{
                        left:40,
                        right:20,
                        top:60,
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
                            endValue: 20
                        }
                    ],
                    xAxis:{
                        type:'category',
                        data:data.map(i=>i.attr_name),
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
                        name:'(A)',
                        nameTextStyle:{ color:textColor },
                        axisTick:{ show:false },
                        axisLine:{ show:false },
                        axisLabel:{ color:textColor },
                        splitLine:{
                            show:true,
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        },
                        splitArea:{
                            show:true,
                            areaStyle:{
                                color: theme === 'dark' ? ['rgba(255, 255, 255, 0.05)', 'transparent'] : ['#f9f9f9', 'transparent' ]
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
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ){
        return false;
    } else {
        return true;
    }
}


export default React.memo(BoxplotChart, areEqual);
