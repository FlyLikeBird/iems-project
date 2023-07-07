import React, { useRef } from 'react';
import { Radio } from 'antd';
import { PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import XLSX from 'xlsx';
import style from '@/pages/IndexPage.css';

function LineChart({ info, tabList, data, theme, type }){
    const echartsRef = useRef();
    const seriesData = [];
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    seriesData.push({
        type:'line',
        name:info.tab,
        smooth:true,
        showSymbol:false,
        data: data[info.key] || [],
        itemStyle:{  
            color:{
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [{
                    offset: 0, color: '#3b3efe' // 0% 处的颜色
                }, {
                    offset: 1, color: '#9d2dfe' // 100% 处的颜色
                }],
                global: false // 缺省为 false
            }          
        },
        areaStyle:{
            color:{
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                    offset: 0, color: 'rgba(47, 57, 220, 0.25)' // 0% 处的颜色
                }, {
                    offset: 1, color: 'transparent' // 100% 处的颜色
                }],
                global: false // 缺省为 false
            } 
        },
        markPoint: {
            data: [
                {type: 'max', name:'最大值' },
                {type: 'min', name:'最小值' }
            ],
            // label:{
            //     position:[-40,-30],
            //     formatter:(params)=>{
            //         return `{${params.name === series1 ? 'blue' : 'purple'}|${ params.data.type === 'max' ? '最大值' : '最小值'}:${Math.round(params.data.value)}}`;
            //     },
            //     rich:richStyle
            // }
        },
    });
    
    return (
        <div style={{ position:'relative', height:'100%' }}>
            <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-radio']} onChange={e=>{
                let value = e.target.value;
                let fileTitle = type === 'frozen' ? '制冷能效' : '氮气能效';
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
                    var aoa = [], thead = ['指标', '单位'];

                    data.date.forEach(i=>{
                        thead.push(i);
                    });
                    aoa.push(thead);
                    tabList.forEach(item=>{
                        let temp = [];
                        temp.push(item.tab);
                        temp.push(item.unit);
                        temp.push(...data[item.key]);
                        aoa.push(temp);
                    })
                    
                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                    downloadExcel(sheet, fileTitle + '.xlsx' );
                    return ;
                }
                toggleChartType(value);
            }}>
                <Radio.Button value='download'><PictureOutlined /></Radio.Button>
                <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button> 
            </Radio.Group>
        <ReactEcharts
            ref={echartsRef}
            notMerge={true}
            style={{ width:'100%', height:'100%' }}
            option={{
                grid:{
                    top:60,
                    bottom:20,
                    left:40,
                    right:40,
                    containLabel:true
                },
                legend:[
                    {
                        left:'center',
                        top:20,
                        data:seriesData.map(i=>i.name),
                        textStyle:{
                            color:textColor
                        }
                    }                  
                ],
                tooltip:{
                    trigger:'axis'
                },
                xAxis:{
                    type:'category',
                    axisTick:{ show:false },
                    axisLine:{
                        lineStyle:{
                            color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                        }
                    },
                    axisLabel:{
                        color:textColor
                    },
                    data:data.date || []
                },
                yAxis:{
                    type:'value',
                    name:info.unit,
                    nameTextStyle:{
                        color:textColor
                    },
                    axisTick:{ show:false },
                    splitLine:{
                        lineStyle:{
                            color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                        }
                    },
                    axisLine:{
                        show:false
                    },
                    axisLabel:{
                        color:textColor
                    },
                },
                series:seriesData
            }}
        />
        </div>

    )
}

export default LineChart;