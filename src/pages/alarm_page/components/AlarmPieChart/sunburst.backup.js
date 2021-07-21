import React, { useRef, useEffect, useMemo } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Card, Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DownloadOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';

// function checkArrIsEmpty(arr){
//     let sum = 0;
//     arr.forEach(item=>{
//         item.key = item.name === '安全告警' ? 'ele' : item.name === '越限告警' ? 'limit' : 'link';
//         sum += item.children.reduce((sum,cur)=>sum+=+cur.value, 0);
//     });
//     return sum === 0 ? true : false ;
// }

// function getSeriesData(arr, isEmpty, warningColors){
//     return arr.map(item=>{
//         let color = warningColors[item.key];
//         item.itemStyle = {
//             color
//         }
//         item.children = item.children.map(item=>{
//             item.itemStyle = {
//                 color
//             };
//             item.value = isEmpty ? 1 : +item.value;
//             item.name = `${item.name}: ${item.value}`;
//             return item;
//         });
//         return item;
//     })
// }

function AlarmPieChart({ data, warningColors }) {   
    const echartsRef = useRef();
    let seriesData;
    let title = '告警事件处理进度';
    console.log(data);
    let isEmpty = checkArrIsEmpty(data);
    // 如果数据为空时
    if ( isEmpty ) {
        seriesData = getSeriesData(data, true, warningColors);
    } else {
        seriesData = getSeriesData(data, false, warningColors);
    };
    console.log(seriesData);
    return (   
        
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{ width:'100%', height:'100%'}}
                option={{
                    // silent:true,
                    series:{
                        type: 'sunburst',
                        highlightPolicy: 'ancestor',
                        radius: [0, '40%'],
                        sort: null,
                        toolbox: {
                            show: true,
                            feature: {
                                restore: {show: true},
                                saveAsImage: {show: true}
                            }
                        },
                        label:{
                            fontSize:16,
                           
                        },
                       
                        levels: [{}, {
                            r0: '15%',
                            r: '40%',
                            itemStyle: {
                                borderWidth: 2
                            },
                            label: {
                                rotate: 'tangential'
                            }
                        }, {
                            r0: '45%',
                            r: '75%',
                            label: {
                                rotate: 'tangential',
                            },
                            
                        }],
                        data:seriesData
                    }
                }}
            />
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(AlarmPieChart, areEqual);
