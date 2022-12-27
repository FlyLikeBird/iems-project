import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import style from '../../IndexPage.css';
import XLSX from 'xlsx';
import ReactEcharts from 'echarts-for-react';

function BalanceBarChart({ yData, xData, title, timeType, theme }) {
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const echartsRef = useRef();
    const [chartType, toggleChartType] = useState('bar');
    // 计算Y轴区间
    let max = 100;
    if ( yData.length ){
        let temp = +yData[0];
        yData.forEach(item=>{
            if ( +item > +temp ){
                temp = item;
            }
        });
        max = temp;
    }
    let seriesData = [];
    if ( chartType === 'bar'){
        seriesData.push({
            type:'bar',
            name:'',
            barWidth:14,
            data:yData,
            barMaxWidth:14,
            itemStyle:{
                color: {
                    type: 'linear',
                    x: 0,                 // 左上角x
                    y: 0,                 // 左上角y
                    x2: 0,                // 右下角x
                    y2: 1,                // 右下角y
                    colorStops: [{
                        offset: 0, color:'#ffa812' // 0% 处的颜色
                    }, {
                        offset: 1, color: '#ffcc20' // 100% 处的颜色
                    }],
                },
                barBorderRadius:6
            }
        });
    } else if ( chartType === 'line'){
        seriesData.push({
            type:'line',
            name:'',
            data:yData,
            itemStyle:{
                color: {
                    type: 'linear',
                    x: 0,                 // 左上角x
                    y: 0,                 // 左上角y
                    x2: 0,                // 右下角x
                    y2: 1,                // 右下角y
                    colorStops: [{
                        offset: 0, color:'#ffa812' // 0% 处的颜色
                    }, {
                        offset: 1, color: '#ffcc20' // 100% 处的颜色
                    }],
                },
                barBorderRadius:6

            }
        });
    }
    return (   
        <div style={{ height:'100%', position:'relative'}}>
            <Radio.Group size='small' buttonStyle="solid" className={style['float-button-group'] + ' ' + style['custom-radio']} value={chartType} onChange={e=>{
                let value = e.target.value;
                let fileTitle = title ;
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
                    var aoa = [], thead = ['对比项','单位'];
                    xData.forEach(i=>{
                        thead.push(i);
                    })
                    aoa.push(thead);
                    aoa.push([title, '%', ...yData]);
                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                    downloadExcel(sheet, fileTitle + '.xlsx' );
                    return ;
                }
                toggleChartType(e.target.value);
            }}>
                <Radio.Button value='bar'><BarChartOutlined /></Radio.Button>
                <Radio.Button value='line'><LineChartOutlined /></Radio.Button>
                <Radio.Button value='download'><PictureOutlined /></Radio.Button>
                <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button>
            </Radio.Group>
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%' }}
                option={{
                    tooltip: { 
                        show:true, 
                        trigger:'axis',
                        formatter:(params)=>{
                            return `${params[0].marker}${params[0].axisValue}<br/>${params[0].data || '-- --'}%`
                        }
                    },
                    title:{
                        text:title,
                        left:'center',
                        top:10,
                        textStyle:{
                            fontSize:14,
                            color:textColor
                        }
                    },
                    grid:{
                        top:60,
                        bottom:20,
                        left:20,
                        right:40,
                        containLabel:true
                    },    
                    xAxis: {
                        show: true,
                        name: timeType === '1' ? '时' : timeType === '2' || timeType === '10' ?  '日' : timeType === '3' ? '月' : '年',
                        nameTextStyle:{ color:textColor },
                        type:'category',
                        data:xData,
                        axisLine:{ show:false },
                        axisTick:{ show:false },
                        axisLabel:{
                            color:textColor
                        }
                    },
                    yAxis:{
                        show:true,
                        type:'value',
                        min:0,
                        max:max + 4,
                        splitNumber:10,
                        splitLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        },
                        axisLine:{ show:false },
                        axisTick:{ show:false },
                        axisLabel:{
                            color:textColor,
                            formatter:(value)=>{
                                return value % 1 === 0 ? value + '.0%' : value + '%';
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
    if ( prevProps.xData !== nextProps.xData  || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default  React.memo(BalanceBarChart, areEqual);
