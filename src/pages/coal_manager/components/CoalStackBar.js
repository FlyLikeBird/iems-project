import React, { useRef } from 'react';
import { Radio } from 'antd';
import ReactEcharts from 'echarts-for-react';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import style from '@/pages/IndexPage.css';
import html2canvas  from 'html2canvas';
import XLSX from 'xlsx';
import { PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import { downloadExcel } from '@/pages/utils/array';

function CoalStackBar({ dispatch, timeType, data, startDate, theme }){
    let echartsRef = useRef();
    const seriesData = [];
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let text = timeType === '1'  ? '当日' : timeType === '2' ? '当月' : timeType === '3' ? '当年' : '';
    let temp = data.carbon.map(i=>i === null ? 0 : i);
    seriesData.push({
        type:'bar',
        name:text + '碳排放',
        stack:'coal',
        data:temp.map((item,index)=>{
            if ( item > data.quota[index] ) {
                return { value:item, itemStyle:{
                    color:{
                        type: 'linear',
                        x: 0,                 // 左上角x
                        y: 0,                 // 左上角y
                        x2: 0,                // 右下角x
                        y2: 1,                // 右下角y
                        colorStops: [{
                            offset: 0, color:'#fe2d2e' // 0% 处的颜色
                        }, {
                            offset: 1, color: '#ff6869' // 40% 处的颜色
                        }],
                    }
                }};
            } else {
                return item;
            }
        }),
        barWidth:10,
        itemStyle:{
            color: {
                type: 'linear',
                x: 0,                 // 左上角x
                y: 0,                 // 左上角y
                x2: 0,                // 右下角x
                y2: 1,                // 右下角y
                colorStops: [{
                    offset: 0, color:'#7544fd' // 0% 处的颜色
                }, {
                    offset: 1, color: '#099cfe' // 40% 处的颜色
                }],
            },
            barBorderRadius:6
        },
        symbolSize:0,
    });
    // seriesData.push({
    //     type:'bar',
    //     name:text + '指标余量',
    //     stack:'coal',
    //     barWidth:10,
    //     data:data.quota.map((item,index)=>{
    //         let carbon = temp[index].itemStyle ? temp[index].value : temp[index]; 
    //         if ( carbon <= item ) {
    //             return Math.abs(item - carbon);
    //         } else {
    //             return { value:null, realData:Math.round(item - carbon) };
    //             // return item;
    //         }
    //     }),
    //     itemStyle:{
    //         color: {
    //             type: 'linear',
    //             x: 0,                 // 左上角x
    //             y: 0,                 // 左上角y
    //             x2: 0,                // 右下角x
    //             y2: 1,                // 右下角y
    //             colorStops: [{
    //                 offset: 0, color:'#7befec' // 0% 处的颜色
    //             }, {
    //                 offset: 1, color: '#65b8fe' // 100% 处的颜色
    //             }],
    //         },
    //         barBorderRadius:6
    //     },
    // });
    seriesData.push({
        type:'line',
        name:text + '定额',
        symbol:'none',
        itemStyle:{
            color:'#36d633'
        },
        lineStyle:{
            type:'dashed',
            color:'#36d633'
        },
        data:data.quota.map(i=>i === null ? 0 : i),
    });
    // console.log(seriesData);
    return (
        <div style={{ height:'100%', position:'relative' }}>
            
            <div style={{ position:'absolute', left:'320px', top:'6px', zIndex:'2' }}>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({ type:'carbon/fetchCarbonIndex'});
                }} />
            </div>
            <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-button']} value='data' onChange={e=>{
                let value = e.target.value;
                let fileTitle = '碳指标趋势';
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
                    seriesData.forEach(item=>{
                        let temp = [];
                        temp.push(item.name);
                        temp.push('t');
                        item.data.forEach(i=>{
                            if ( i.itemStyle ) {
                                temp.push(i.value);
                            } else if ( i.realData && (Object.getPrototypeOf(i.realData) === Number.prototype)){
                                temp.push(i.realData)
                            } else {
                                temp.push(i);
                            }
                        })
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
                        top:80,
                        bottom:20,
                        left:20,
                        right:20,
                        containLabel:true
                    },
                    title:{
                        text:'碳指标趋势',
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
                        trigger:'axis',
                        formatter:(params)=>{
                            // console.log(params);
                            let categoryName = params[0].name;
                            let index = params[0].dataIndex;
                            let html = '';
                            html += categoryName;
                            params.forEach((item)=>{
                                let marker = `<span style=\"display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${item.seriesIndex === 0 ? '#ed39fd' : item.seriesIndex === 1 ? '#7befec' : '#36d633' };\"></span>`;
                                html += (`<br/>${marker + item.seriesName}: ${ item.seriesName === text + '碳排放' || item.seriesName === text + '定额' ? item.data && item.data.value ? item.data.value : item.data : (data.quota[index] - temp[index]).toFixed(2)  }`);
                            })
                            return html;
                        }
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
                        name:`(单位:吨)`,
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
export default React.memo(CoalStackBar, areEqual);