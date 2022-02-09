import React, { useEffect, useState, useRef } from 'react';
import ReactEcharts from 'echarts-for-react';
import { Radio } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined, PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import html2canvas  from 'html2canvas';
import { downloadExcel } from '@/pages/utils/array';
import style from '../../../IndexPage.css';
import XLSX from 'xlsx';
import { IconFont } from '@/pages/components/IconFont';

let timer = null;

const typeMap = {
    TC:'温度',
    IR:'剩余电流',
    ele_exceed:'电流',
    vol_exceed:'电压',
    power_factor:'功率因素'
};

const timeMap = {
    '5':1,
    '4':5,
    '3':15,
    '2':30,
    '1':60
}

function RealTimeChart({ data, dispatch, dayTimeType, typeCode, theme }){
    const echartsRef = useRef();
    let seriesData = [];
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    if ( typeCode === 'IR'){
        seriesData.push({
            type:'line',
            name:'剩余电流',
            symbol:'none',
            data:data.energy,
            itemStyle:{ color:'#3f8fff'},
            markPoint:{
                data:[
                    { symbol:'circle', symbolSize:14, itemStyle:{ color:'#3f8fff'}, xAxis:data.energy.length ? data.energy.length - 1 : 0, yAxis:data.energy[data.energy.length ? data.energy.length-1 : 0]},
                    { symbol:'circle', symbolSize:6, itemStyle:{ color:'#fff' }, xAxis:data.energy.length ? data.energy.length - 1 : 0, yAxis:data.energy[data.energy.length ? data.energy.length-1 : 0]}
                ]
            },
        })
    } else {
        let isVol = typeCode === 'vol_exceed' ? true : false;
        let energyA = isVol ? data.energyAB || [] : data.energyA;
        let energyB = isVol ? data.energyBC || [] : data.energyB;
        let energyC = isVol ? data.energyCA || []: data.energyC;
        
        seriesData.push({
            type:'line',
            name: isVol ? 'AB线' : 'A相' + typeMap[typeCode],
            symbol:'none',
            data: energyA,
            itemStyle:{ color:'#3f8fff'},
            markPoint:{
                data:[
                    { symbol:'circle', symbolSize:14, itemStyle:{ color:'#3f8fff'}, xAxis:energyA.length ? energyA.length - 1 : 0, yAxis:energyA[energyA.length ? energyA.length-1 : 0]},
                    { symbol:'circle', symbolSize:6, itemStyle:{ color:'#fff' }, xAxis:energyA.length ? energyA.length - 1 : 0, yAxis:energyA[energyA.length ? energyA.length-1 : 0]}
                ]
            },
        });
        seriesData.push({
            type:'line',
            name: isVol ? 'BC线' : 'B相' + typeMap[typeCode],
            symbol:'none',
            data:energyB,
            itemStyle:{ color:'#f5a60a'},
            markPoint:{
                data:[
                    { symbol:'circle', symbolSize:14, itemStyle:{ color:'#f5a60a'}, xAxis:energyB.length ? energyB.length - 1 : 0, yAxis:energyB[energyB.length ? energyB.length-1 : 0]},
                    { symbol:'circle', symbolSize:6, itemStyle:{ color:'#fff' }, xAxis:energyB.length ? energyB.length - 1 : 0, yAxis:energyB[energyB.length ? energyB.length-1 : 0]}
                ]
            },
        });
        seriesData.push({
            type:'line',
            name: isVol ? 'CA线' : 'C相' + typeMap[typeCode],
            symbol:'none',
            data:energyC,
            itemStyle:{ color:'#1fc48d'},
            markPoint:{
                data:[
                    { symbol:'circle', symbolSize:14, itemStyle:{ color:'#1fc48d'}, xAxis:energyC.length ? energyC.length - 1 : 0, yAxis:energyC[energyC.length ? energyC.length-1 : 0]},
                    { symbol:'circle', symbolSize:6, itemStyle:{ color:'#fff' }, xAxis:energyC.length ? energyC.length - 1 : 0, yAxis:energyC[energyC.length ? energyC.length-1 : 0]}
                ]
            },
        });  
    };
    if ( data.warning_min ){
        let index = data.date.length ? data.date.length - 1 : 0;
        let temp = data.date.map(i=>+data.warning_min);
        seriesData.push({
            type:'line',
            data:temp,
            name:'最小值基准线',
            symbol:'none',
            itemStyle:{ color:'#f53f2e'},
            lineStyle:{
                type:'dashed'
            },
            markPoint:{
                data:[
                    { symbol:'rect', symbolSize:[80,20], xAxis:index, yAxis:temp[index], value:'最小值基准线' }
                ]
            }
        })
    }
    if ( data.warning_max ){
        let index = data.date.length ? data.date.length - 1 : 0;
        let temp = data.date.map(i=>+data.warning_max);
        seriesData.push({
            type:'line',
            data:temp,
            symbol:'none',
            name:'最大值基准线',
            itemStyle:{ color:'#f53f2e'},
            lineStyle:{
                type:'dashed'
            },
            markPoint:{
                data:[
                    { symbol:'rect', symbolSize:[80,20], xAxis:index, yAxis:temp[index], value:'最大值基准线' }
                ]
            }
        })
    }
    let option = {
        tooltip: { trigger:'axis'},
        title:{
            text:'今日实时趋势',
            left:40,
            top:20,
            textStyle:{
                color:textColor, 
                fontWeight:'bold', 
                fontSize:16
            }
        },
        grid:{
            top:100,
            bottom:40,
            left:40,
            right:60,
            containLabel:true
        },    
        legend: {
            left:'center',
            top:20,
            data:seriesData.map(i=>i.name),
            textStyle:{
                color:textColor
            }
        },
        xAxis: {
            show: true,
            // name: timeType === '1' ? '小时' : timeType === '2' ? '日' : '月',
            // nameTextStyle:{ color:'#404040'},
            type:'category',
            data:data.date,
            axisLine:{
                lineStyle:{
                    color:'#f0f0f0'
                }
            },
            interval:0,
            axisLabel:{
                color:textColor,
                formatter:(value)=>{
                    let strArr = value.split(' ');
                    let result = strArr[1];
                    return result;
                }
            },
            axisTick:{ show:false }
        },
        yAxis:{
            show:true,
            type:'value',
            axisLine:{
                show:false,
            },
            axisLabel:{ color:textColor },
            axisTick:{ show:false },
            splitLine:{
                lineStyle:{
                    color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                }
            }
        },
        series:seriesData
    };
    if ( dayTimeType === '4'){
        option['dataZoom'] = [
            {
                show:true,
                xAxisIndex:0,
                startValue:data.date.length ? data.date.length - 50: 0,
                endValue: data.date.length ? data.date.length - 1 : 0,
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                },
            }
        ]
    }
    useEffect(()=>{
        // 组件销毁时关闭定时器
        return ()=>{
            clearInterval(timer);
            timer = null;
        }
    },[]);
    useEffect(()=>{
        clearInterval(timer);
        timer = setInterval(()=>{
            dispatch({ type:'eleAlarm/fetchRealTimeAlarm', payload:{ nofresh:true }});
        },timeMap[dayTimeType] * 60 * 1000)
    },[data]);
    return (
       
        <div style={{ position:'relative', width:'100%', height:'100%' }}>
            <Radio.Group size='small' buttonStyle='solid' className={style['float-button-group'] + ' ' + style['custom-radio']}  style={{ right:'unset', left:'40px', top:'50px' }} value={typeCode} onChange={e=>{
                dispatch({ type:'eleAlarm/toggleTypeCode', payload:{ typeCode:e.target.value }});
                dispatch({ type:'eleAlarm/fetchRealTimeAlarm'});
            }}>
                <Radio.Button value='ele_exceed'>电流</Radio.Button>
                <Radio.Button value='vol_exceed'>电压</Radio.Button>
                <Radio.Button value='TC'>温度</Radio.Button>
                <Radio.Button value='IR'>剩余电流</Radio.Button>
                <Radio.Button value='power_factor'>功率因素</Radio.Button>
            </Radio.Group>
            <div className={style['float-button-group']}>
                <Radio.Group size='small' buttonStyle="solid" className={style['custom-radio']} value={dayTimeType} onChange={e=>{
                    
                }}>
                    {/* <Radio.Button value='4'>5分钟</Radio.Button> */}
                    <Radio.Button value='3'>15分钟</Radio.Button>
                    <Radio.Button value='2'>30分钟</Radio.Button>
                    <Radio.Button value='1'>1小时</Radio.Button>
                </Radio.Group>
                <Radio.Group style={{ marginLeft:'20px' }} size='small' buttonStyle="solid" className={style['custom-button']} value='data' onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = `今日${typeMap[typeCode]}告警实时趋势`;
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
                        var aoa = [], thead = ['告警类型','对比项'];
                        data.date.forEach(i=>{
                            thead.push(i);
                        })                

                        aoa.push(thead);
                        seriesData.forEach(i=>{
                            let temp = [];
                            temp.push(typeMap[typeCode]);
                            temp.push(i.name);
                            temp.push(...i.data);
                            aoa.push(temp);
                        });
                        var sheet = XLSX.utils.aoa_to_sheet(aoa);
                        sheet['!cols'] = thead.map(i=>({ wch:16 }));
                        downloadExcel(sheet, fileTitle + '.xlsx' );
                        return ;
                    }
                    dispatch({ type:'eleAlarm/toggleDayTimeType', payload:{ dayTimeType:e.target.value }});
                    dispatch({ type:'eleAlarm/fetchRealTimeAlarm'});
                }}>
                    <Radio.Button value='download'><PictureOutlined /></Radio.Button>
                    <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button>
                </Radio.Group>
            </div>
                  
            <ReactEcharts
                ref={echartsRef}
                notMerge={true}
                style={{ width:'100%', height:'100%' }}
                option={option}
            /> 
            
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(RealTimeChart, areEqual);