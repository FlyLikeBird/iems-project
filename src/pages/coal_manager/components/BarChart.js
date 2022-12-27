import React, { useRef } from 'react';
import { Radio } from 'antd';
import ReactEcharts from 'echarts-for-react';
import { findMaxAndMin } from '@/pages/utils/array';
import style from '@/pages/IndexPage.css';
import html2canvas  from 'html2canvas';
import XLSX from 'xlsx';
import { PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import { downloadExcel } from '@/pages/utils/array';

function BarChart({ data, theme }){
    let echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let seriesData = [];
    seriesData.push({
        type:'bar',
        barWidth:10,
        itemStyle:{
            color: {
                type: 'linear',
                x: 0,                 // 左上角x
                y: 0,                 // 左上角y
                x2: 0,                // 右下角x
                y2: 1,                // 右下角y
                colorStops: [{
                    offset: 0, color:'#7544fe' // 0% 处的颜色
                }, {
                    offset: 1, color: '#0b9afe' // 100% 处的颜色
                }],
            },
            barBorderRadius:6
        },
        data:data.map(i=>(+i.energy).toFixed(4))
    })
    return (
        <div style={{ height:'100%', position:'relative' }}>
            <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-button']} value='data' onChange={e=>{
                let value = e.target.value;
                let fileTitle = '碳排放排序';
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
                    var aoa = [], thead = ['序号', '属性', '单位', '碳排放值'];
                    aoa.push(thead);
                    data.forEach((item,index)=>{
                        let temp = [];
                        temp.push(index+1);
                        temp.push(item.attr_name);
                        temp.push('t');
                        temp.push(item.energy);
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
                    title:{
                        text:'碳排放排序',
                        top:10,
                        left:10,
                        textStyle:{
                            color: theme === 'dark' ? '#fff' : '#000',
                            fontSize:14
                        }
                    },
                    legend:{
                        left:100,
                        top:10,
                        data:seriesData.map(i=>i.name),
                        textStyle:{
                            color:textColor
                        }
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
                        data:data.map(i=>i.attr_name)
                    },
                    yAxis:{
                        type:'value',
                        name:`( t )`,
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
export default React.memo(BarChart, areEqual);