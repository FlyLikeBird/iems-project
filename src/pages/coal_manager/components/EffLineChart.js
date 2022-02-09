import React, { useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import { Radio } from 'antd';
import { PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import { findMaxAndMin, downloadExcel } from '@/pages/utils/array';
import style from '@/pages/IndexPage.css';
import html2canvas  from 'html2canvas';
import XLSX from 'xlsx';

function EffLineChart({ data, info, startDate, timeType, theme }){
    const seriesData = [];
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let echartsRef = useRef();
    seriesData.push({
        type:'line',
        name:info.tab,
        data:data.value,
        itemStyle:{
            color:'#0d9bfe'
        },
        symbolSize:0,
    });
   
    return (
        <div style={{ height:'100%', position:'relative' }}>
            <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-button']} value='data' onChange={e=>{
                let value = e.target.value;
                let fileTitle = `能效竞争力-${info.tab}`;
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
                    var aoa = [], thead = ['对比项', '单位'];
                    let dateArr = startDate.format('YYYY-MM-DD').split('-');
                    let prefix = timeType === '1' ? `${dateArr[0]}-${dateArr[1]}-${dateArr[2]} ` : timeType === '2' ? `${dateArr[0]}-${dateArr[1]}-` : `${dateArr[0]}-`;
                    data.date.forEach(i=>{
                        thead.push(prefix + i);
                    });
                    aoa.push(thead);
                    seriesData.forEach(i=>{
                        let temp = [];
                        temp.push(i.name);
                        temp.push(info.unit);
                        temp.push(...i.data);
                        aoa.push(temp);
                    });
                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                    downloadExcel(sheet, fileTitle + '.xlsx' );
                    return ;
                }
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
                        left:20,
                        right:20,
                        containLabel:true
                    },
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
                        data:data.date
                    },
                    yAxis:{
                        type:'value',
                        name:`( 单位 : ${info.unit} )`,
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
function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme  ) {
        return false;
    } else {
        return true;
    }
}
export default EffLineChart;