import React, { useState, useRef } from 'react';
import { routerRedux } from 'dva/router';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { Radio } from 'antd';
import { PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import { downloadExcel } from '@/pages/utils/array';
import style from '@/pages/IndexPage.css';
import XLSX from 'xlsx';
// import { IconFont } from '@/pages/components/IconFont';
const colors = ['#57e29f','#65cae3','#198efb','#f1ac5b'];

function hasSetQuota(arr){
    return arr.filter(i=>i>0).length ? true : false;
}

function EfficiencyQuotaChart({ data, timeType, currentAttr, onLink, theme, forReport }) {
    const echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    const seriesData = [];
    if ( hasSetQuota(data.quota)) {
        // 已设置定额，显示实际能耗和定额的差值
        let temp = data.energy.map((item,index)=>{
            if ( item >= data.quota[index] ) {
                let obj = {};
                obj.value = item;
                obj.itemStyle = { color:'#e83320'};
                return obj;
            } else {
                return item;
            }
        });
        seriesData.push({
            type:'bar',
            name:'实际能耗',
            data:temp,
            barMaxWidth:14,
            itemStyle:{
                color:'#1890ff'
            }
        });

    } else {
        // 只显示能耗值和定额线，不做差值比较
        seriesData.push({
            type:'bar',
            name:'实际能耗',
            data:data.energy,
            barMaxWidth:14,
            itemStyle:{
                color:'#1890ff'
            }
        });
    };
    seriesData.push({
        type:'line',
        name:'定额值',
        step:'middle',
        data:data.quota,
        itemStyle:{
            color:'#e83320'
        },
        
        markPoint:{
            symbol:'rect',
            symbolSize:[60,20],
            data:[ { value:'定额值', xAxis:data.quota.length-1, yAxis:data.quota[data.quota.length-1]} ],
        }
    });
    const onEvents = {
        'click':(params)=>{
            if(params.componentType === 'markPoint' && params.type === 'click'){
                onLink(routerRedux.push('/energy/info_manage_menu/quota_manage'));
            }
        }
    };
    return (  
        <div style={{ height:'100%'}}>
            {
                forReport 
                ?
                null
                :        
                <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-radio']} value='data' onChange={e=>{
                    let value = e.target.value;
                    let fileTitle = `能源效率-能耗定额`;
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
                        var aoa = [], thead = ['对比项','时间周期','单位'];
                        data.date.forEach(i=>{
                            thead.push(i);
                        });
                        aoa.push(thead);
                        let timeUnit = timeType === '1' ? '月' : '日';
                        seriesData.forEach(i=>{
                            let temp = [];
                            temp.push(i.name);
                            temp.push(timeUnit);
                            temp.push('kwh');
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
                style={{width:'100%', height:'100%'}}
                onEvents={onEvents}
                option={{
                    color:colors,
                    tooltip:{
                        trigger:'axis'
                    },
                    title:{
                        text:`${currentAttr.title}能耗总量概况(kwh)`,
                        textStyle:{
                            color:textColor,
                            fontSize:14
                        },
                        padding:0,
                        top:20,
                        left:60,
                    },
                   
                    grid:{
                        top:60,
                        bottom:40,
                        left:20,
                        right:40,
                        containLabel:true
                    },
                    legend:{
                        left:'center',
                        top:20,
                        textStyle:{ color:textColor },
                        data:['实际能耗','定额值']
                    },
                    
                    xAxis: {
                        type:'category',
                        name: timeType === '1' ? '月' : '日',
                        nameTextStyle:{ color:textColor },
                        data: data.date,
                        silent: false,
                        splitLine: {
                            show: false
                        },
                        axisLabel:{ color:textColor },
                        axisLine:{ show:false },
                        axisTick:{ show:false },
                        splitArea: {
                            show: false
                        }
                    },            
                    yAxis:{                           
                        type:'value',
                        splitArea: {
                            show: false
                        },
                        axisTick:{ show:false },
                        axisLine:{ show:false },
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

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(EfficiencyQuotaChart, areEqual);
