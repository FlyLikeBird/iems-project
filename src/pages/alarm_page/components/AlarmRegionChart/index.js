import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Radio } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, FileExcelOutlined, FileImageOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import style from '../../../IndexPage.css';
import XLSX from 'xlsx';
import { IconFont } from '@/pages/components/IconFont';

function AlarmRegionChart({ data, warningColors, theme, forReport  }) {
    let seriesData = [];
    const echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const eleWarning = [], limitWarning = [], connectWarning = [];
    data = data.sort((a,b)=>{
        let temp1 = +a.ele_safe + (+a.out_limit) + (+a.link);
        let temp2 = +b.ele_safe + (+b.out_limit) + (+b.link);
        return temp2 - temp1;
    });
    // console.log(data);
    data.forEach(item=>{
        eleWarning.push(+(item.ele_safe));
        limitWarning.push(+(item.out_limit));
        connectWarning.push(+(item.link));
    });

    seriesData.push({
        type:'bar',
        name:'电气警报',
        stack:'alarm',
        barMaxWidth:10,
        barGap:0,
        itemStyle:{
            color:warningColors['ele']
        },
        data:eleWarning
    });
    seriesData.push({
        type:'bar',
        name:'越限警报',
        stack:'alarm',
        barMaxWidth:10,
        itemStyle:{
            color:warningColors['limit']
        },
        data:limitWarning
    });
    seriesData.push({
        type:'bar',
        name:'通讯警报',
        stack:'alarm',
        barMaxWidth:10,
        itemStyle:{
            color:warningColors['link']
        },
        data:connectWarning
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
                    let fileTitle = '报警责任分解';
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
                        var aoa = [], thead = ['属性','电气警报', '越限警报', '通讯警报'];
                        aoa.push(thead);
                        data.forEach(i=>{
                            let temp = [];
                            temp.push(i.region_name);
                            temp.push(i.ele_safe);
                            temp.push(i.out_limit);
                            temp.push(i.link);
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
                style={{ width:'100%', height:'100%'}}
                option={{
                    tooltip: { trigger:'axis'},
                    title:{
                        text:'报警责任分解',
                        left:'center',
                        top:6,
                        textStyle:{
                            color:textColor
                        }
                    }, 
                    legend: {
                        left:'center',
                        top:36,
                        data:['电气警报', '越限警报', '通讯警报'],
                        textStyle:{
                            color:textColor
                        }
                    },
                    dataZoom:[
                        {
                            show:true,
                            yAxisIndex:0,
                            startValue:0,
                            endValue:10
                        }
                    ],
                    grid:{
                        top:60,
                        left:10,
                        right:40,
                        bottom:20,
                        containLabel:true
                    },
                    yAxis: {
                        show: true,
                        type:'category',
                        data:data.map(i=>i.region_name),
                        axisTick:{ show:false },
                        inverse:true,
                        interval:0,
                        axisLabel:{
                            color:textColor,
                            formatter:(value)=>{
                                return value.length >= 13 ? value.substring(0, 10) + '...' : value;
                            }
                            // formatter:(value)=>{
                            //     var newParamsName = "";
                            //     var paramsNameNumber = value.length;
                            //     var provideNumber = 7;  //一行显示几个字
                            //     var rowNumber = Math.ceil(paramsNameNumber / provideNumber);
                            //     if (paramsNameNumber > provideNumber) {
                            //         for (var p = 0; p < rowNumber; p++) {
                            //             var tempStr = "";
                            //             var start = p * provideNumber;
                            //             var end = start + provideNumber;
                            //             if (p == rowNumber - 1) {
                            //                 tempStr = value.substring(start, paramsNameNumber);
                            //             } else {
                            //                 tempStr = value.substring(start, end) + "\n";
                            //             }
                            //             newParamsName += tempStr;
                            //         }

                            //     } else {
                            //         newParamsName = value;
                            //     }
                            //     return newParamsName
                            // }
                        }
                    },
                    xAxis:{
                        show:true,
                        name:'/次',
                        type:'value',
                        position:'top',
                        minInterval:1,
                        axisTick:{ show:false },
                        splitLine:{ show:false },
                        axisLabel:{
                            color:textColor
                        },
                        nameTextStyle:{
                            color:textColor,
                            verticalAlign:'bottom'
                        }
                    },
                    series:seriesData
                }}
            /> 
        </div>
            
    );
}


function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme  ) {
        return false;
    } else {
        return true;
    }
}

export default  React.memo(AlarmRegionChart, areEqual);
