import React, { useState, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { Radio } from 'antd';
import { PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import { downloadExcel } from '@/pages/utils/array';
import style from '../../../IndexPage.css';
import XLSX from 'xlsx';
// import { IconFont } from '@/pages/components/IconFont';
const colors = ['#57e29f','#65cae3','#198efb','#f1ac5b'];

function DemandLineChart({ data, theme, forReport }) {
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const echartsRef = useRef();
    const seriesData = [];
    seriesData.push({
        type:'line',
        name:'当前需量',
        symbol:'none',
        areaStyle:{
            opacity:0.3
        },
        data:data.view.today
    });
    seriesData.push({
        type:'line',
        name:'参考需量',
        symbol:'none',
        areaStyle:{
            opacity:0.3
        },
        data:data.view.refer
    });
    // seriesData.push({
    //     type:'line',
    //     name:'月申报需量',
    //     data:data.view.date.map(i=>data.info.demand_declare),
    //     itemStyle:{
    //         opacity:1
    //     },
    //     markPoint:{
    //         symbol:'rect',
    //         symbolSize:[100,20],
    //         data:[ { value:'申报需量: '+data.info.demand_declare, xAxis:data.view.date.length-1, yAxis:data.info.demand_declare} ],
    //     }
    // });
    seriesData.push({
        type:'line',
        name:'盈亏平衡',
        symbol:'none',
        animation:true,
        animationDuration:5,
        animationDelay:5,
        data:data.view.date.map(i=>data.view.refer_demand),
        itemStyle:{
            opacity:1
        },
        markPoint:{
            symbol:'rect',
            symbolSize:[100,20],
            data:[ { value:'盈亏平衡: '+data.view.refer_demand, xAxis:data.view.date.length-1, yAxis:data.view.refer_demand} ],
        }
    });
    
    return (  
        <div style={{ height:'100%'}}>
            {
                forReport 
                ?
                null
                :
                <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-radio']} value='data' onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = `需量管理-实时需量`;
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
                        var aoa = [], thead = ['对比项','单位'];
                        data.view.date.forEach(i=>{
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
                    <Radio.Button key='download' value='download'><PictureOutlined /></Radio.Button>
                    <Radio.Button key='excel' value='excel'><FileExcelOutlined /></Radio.Button>
                </Radio.Group>
            }
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%' }}
                option={{
                    color:colors,
                    tooltip:{
                        trigger:'axis'
                    },
                    legend:{
                        data:['当前需量','参考需量','盈亏平衡'],
                        top:20,
                        textStyle:{ color:textColor }
                    },
                    grid:{
                        top:60,
                        left:40,
                        right:60,
                        bottom:40,
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
                            textStyle:{ color:textColor }
                        }
                    ],
                    xAxis: {
                        type:'category',
                        name: '分钟',
                        nameTextStyle:{ color:textColor },
                        data: data.view.date,
                        silent: false,
                        splitLine: {
                            show: false
                        },
                        axisTick:{ show:false },
                        axisLabel:{
                            color:textColor,
                            show:true,

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
                        axisTick:{ show:false },
                        axisLabel:{ color:textColor },
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

export default DemandLineChart;
