import React, { useState, useRef } from 'react';
import { routerRedux } from 'dva/router';
import { Radio, Card, Button, DatePicker } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import style from '../../../IndexPage.css';
import XLSX from 'xlsx';
import { IconFont } from '@/pages/components/IconFont';

const colors = ['#65cae3','#57e29f','#198efb','#f1ac5b'];

function sumRatio(data){
    let types = Object.keys(data.ratio);
    let result = [];
    for( let i=0,len=data.date.length;i<len;i++){
        let sum = 0;
        types.forEach((type,index)=>{
            sum += data.ratio[type][i] ;
        });
        result.push(sum);
    }
    return result;
}

function RatioChart({ data, theme, forReport }) {
    const echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let seriesData = [];
    let legendData = [];
    Object.keys(data.cost).forEach(key=>{
        let type = key === 'ele' ? '电费' :
                    key === 'water' ? '水费' :
                    key === 'gas' ? '气费' : 
                    key === 'hot' ? '燃费' : '';
        legendData.push( { key, type });
    });
    legendData.forEach(item=>{
        seriesData.push({
            type:'bar',
            barMaxWidth:14,
            name:item.type,
            stack:'bar',
            data:data.cost[item.key]
        });
    });
    // 添加能源产值比折线图
    seriesData.push({
        type:'line',
        symbol:'none',
        name:'能耗产值比',
        smooth:true,
        yAxisIndex:1,
        data:sumRatio(data),
        itemStyle:{
            color:'#1890ff'
        }
    });
    return (  
        <div style={{ height:'100%'}}>
            {
                forReport 
                ?
                null
                :         
                <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-button']} onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = '能源成本产值比';
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

                        data.date.forEach(i=>thead.push(i));
                        aoa.push(thead);
                        seriesData.forEach(i=>{
                            let temp = [];
                            temp.push(i.name);
                            temp.push(i.name === '能耗产值比' ? '元/万元' : '元');
                            temp.push(...i.data);
                            aoa.push(temp);
                        });
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
                    title:{
                        text:`能源成本产值比`,
                        left:'center',
                        top:10,
                        textStyle:{ color:textColor }
                    },
                    legend:{
                        top:40,
                        left:'center',
                        data:legendData.map(i=>i.type).concat('能耗产值比'),
                        textStyle:{ color:textColor }
                    },  
                    
                    grid:{
                        top:70,
                        bottom:20,
                        left:40,
                        right:80,
                        containLabel:true
                    },                  
                    xAxis: {
                        type:'category',
                        data: data.date,
                        silent: false,
                        splitLine: {
                            show: false
                        },
                        axisTick:{ show:false },
                        axisLabel:{ color:textColor },
                        splitArea: {
                            show: false
                        }
                    },   
                    yAxis:[
                        {
                            type:'value',
                            name:'成本(元)',
                            nameTextStyle:{ color:textColor },
                            splitArea: {
                                show: false
                            },
                            axisLabel:{ color:textColor },
                            axisTick:{ show:false },
                            splitLine:{
                                show:true,
                                lineStyle:{
                                    color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                                }
                            }     
                        },
                        {
                            type:'value',
                            name:'能耗产值比(元/万元)',
                            nameTextStyle:{ color:textColor },
                            splitArea: {
                                show: false
                            },
                            axisLabel:{ color:textColor },
                            axisTick:{ show:false },
                            splitLine:{
                                show:false,
                               
                            },
                            // axisLabel:{
                            //     formatter:'{value}%'
                            // }  
                        }
                    ],                         
                    series: seriesData 
                }}
            />
        </div>
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.energyInfo !== nextProps.energyInfo || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(RatioChart, areEqual);
