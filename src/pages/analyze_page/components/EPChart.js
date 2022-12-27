import React, { useState, useRef } from 'react';
import { Radio, Card, Button, message  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import ecStat from 'echarts-stat';
import dataTool from 'echarts/extension/dataTool';
import html2canvas  from 'html2canvas';
import XLSX from 'xlsx';
import { downloadExcel } from '@/pages/utils/array';
import style from '@/pages/IndexPage.css';

function EPChart({ data, theme }) {
    const { date, product, energy, lineInfo, ratio } = data;
    let echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let seriesData = [], scatterData = [], categoryData = [];
    // 计算EP图的方程式
    if ( product && product.length ) {
        product.forEach((item,index)=>{
            scatterData.push([item ? Math.round(+item) : 0, energy[index] ? Math.round(+energy[index]) : 0]);
        });
        // 产值排序
        scatterData.sort((a,b)=>{
            return a[0] < b[0] ? -1 : 1;
        });    
        var myRegression = ecStat.regression('linear', scatterData);
        // 如果不存在X=0这个散点则给回归曲线补上当x=0时与坐标轴相交的点
        let temp = [...myRegression.points.map(i=>([i[0], Math.round(i[1])]))];
        // 回归方程的点去重
        let xValueArr = temp.map(i=>i[0]);
        let lineData = [];
        temp.forEach(item=>{
            if ( !lineData.map(i=>i[0]).includes(item[0])) {
                lineData.push(item);
            }
        })
        if ( !xValueArr.includes(0)) {
            lineData.unshift([0, lineInfo.constant]);
        }
        // console.log(scatterData);
        // console.log(myRegression.points);
        // console.log(lineData);
        // console.log(myRegression);
        seriesData.push({
            type:'scatter',
            name:'能耗值',
            itemStyle:{ color:'#21ddff'},
            symbolSize:14,
            data:scatterData,
        });
        // console.log(scatterData);
        // console.log(lineData);
        seriesData.push({
            type:'line',
            name:'回归方程',
            itemStyle:{ color:'#6d40f3' },
            symbol:'none',
            data:lineData,
            tooltip:{ show:lineData.map(i=>i[0]).filter(i=>i).length ? true: false },
            z:5,
            markLine:{
                symbol:'none',
                label:{ show:false },
                lineStyle:{
                    color:'#1545fd',
                    width:2,
                    type:'solid'
                },
                data:[[
                    { name:'text', coord:[lineData[0][0], 0]},
                    { coord:[lineData[0][0], lineData[0][1]]}
                ]]
            }
        })
    }
    
    return (    
        <div style={{ height:'100%', position:'relative' }}>
            <div style={{ position:'absolute', left:'50%', top:'6px', transform:'translateX(-50%)', color:'#fff', zIndex:'2' }}>
                <span>Y=</span>
                <span style={{ fontSize:'1.4rem' }}>{ lineInfo ? (+lineInfo.slope).toFixed(2) : 0 }</span>
                <span>X { lineInfo && lineInfo.constant < 0  ? '' : '+' }</span>
                <span style={{ fontSize:'1.4rem', marginRight:'1rem' }}>{ lineInfo ? Math.round(lineInfo.constant) : 0 }</span>
                <span>R²=</span>
                <span style={{ fontSize:'1.4rem' }}>{ lineInfo ? (+lineInfo.R2).toFixed(2) : 0 }</span>
            </div>
            <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-button']} value='data' onChange={e=>{
                let value = e.target.value;
                let fileTitle = `E-P图趋势`;
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
                if ( value === 'excel' ) {
                    if ( product && product.length ) {
                        var aoa = [], thead = ['日期','产量(台)', '能耗(kwh)', '产品电单耗(kwh/台)'];
                        aoa.push(thead);
                        date.forEach((item, index)=>{
                            let temp = [];
                            temp.push(item);
                            temp.push(product[index] || 0);
                            temp.push(energy[index] || 0);
                            temp.push(ratio[index] || 0);
                            aoa.push(temp);
                        })
                        var sheet = XLSX.utils.aoa_to_sheet(aoa);
                        sheet['!cols'] = thead.map(i=>({ wch:16 }));
                        downloadExcel(sheet, fileTitle + '.xlsx' );
                    } else {
                        message.info('数据源为空');
                    }
                    
                }
            }}>
                <Radio.Button value='download'><PictureOutlined /></Radio.Button>
                <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button>
            </Radio.Group>
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%'}}
                option={{
                    title:{
                        text:'E-P图',
                        left:40,
                        top:6,
                        textStyle:{
                            color:textColor,
                            fontSize:14
                        }
                    },
                    tooltip:{
                        trigger:'axis'
                    },
                    grid:{
                        left:40,
                        right:60,
                        top:80,
                        bottom:50,
                        containLabel:true
                    },
                    // dataZoom: [
                    //     {
                    //         show:true,
                    //         bottom:10,
                    //         handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    //         handleSize: '80%',
                    //         handleStyle: {
                    //             color: '#fff',
                    //             shadowBlur: 3,
                    //             shadowColor: 'rgba(0, 0, 0, 0.6)',
                    //             shadowOffsetX: 2,
                    //             shadowOffsetY: 2
                    //         },
                    //         startValue: 0,
                    //         endValue: 20
                    //     }
                    // ],
                    xAxis:{
                        type:'value',
                        name:'(产值)',
                        nameTextStyle:{ color:textColor },
                        axisTick:{ show:false },
                        axisLine:{ show:false },
                        axisLabel:{ 
                            color:textColor,
                            formatter:value=>{
                                return value || 0;
                            }
                        },
                        splitLine:{ show:false }
                    },
                    yAxis:{
                        type:'value',
                        name:'(kwh)',
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


export default React.memo(EPChart, areEqual);
