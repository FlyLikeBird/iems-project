import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Tree, Select, Skeleton, Spin, message } from 'antd';
import style from '@/pages/IndexPage.css';
import moment from 'moment';
import { downloadExcel } from '@/pages/utils/array';
import XLSX from 'xlsx';

function MeterReportTable({ dispatch, data, pageSize, currentPage, total, energyInfo, companyName, isLoading, timeType, currentField, currentAttr, startTime, endTime, theme }){
    const [exportList, setExportList] = useState([]);
    let title;
    if ( timeType === '1'){
        title = startTime.format('YYYY-MM-DD');
    } else {
        title = startTime.format('YYYY-MM-DD') + '至' + endTime.format('YYYY-MM-DD');
    } 
    const columns = [
       
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return `${ ( currentPage - 1) * pageSize + index + 1}`;
            }
        },
        {
            title:'属性',
            key:'attr_name',
            width:'140px',
            fixed:'left',
            dataIndex:'attr_name',
            ellipsis: true,
        },
        {
            title:'能源类型',
            width:'80px',
            key:'energy_type',
            dataIndex:'energy_type'
        },
        {
            title:'能源单位',
            width:'80px',
            key:'unit',
            dataIndex:'unit'
        },
        // {
        //     title:'倍率',
        //     width:'80px',
        //     key:'ratio',
        //     dataIndex:'ratio'
        // },
        {
            title:'表计名称',
            dataIndex:'meter',
            render: (value)=>{
                const renderNode = (
                    <div>
                        {
                            value && value.length 
                            ?
                            value.map((item,index)=>(
                                <div style={{ borderBottom: index === value.length - 1 ? 'none' : `1px solid ${theme==='dark' ? '#272b5c' : '#f0f0f0'}`}} key={index}>
                                    <span>{ item.meter_name }</span>
                                </div>
                            ))
                            :
                            null
                        }
                    </div>
                )
                let obj = {
                    children:renderNode,
                    props:{ className : 'multi-table-cell' }
                }
                return obj;
            }
        },
        {
            title:'期初表码',
            dataIndex:'meter',
            render: (value)=>{
                const renderNode = (
                    <div>
                        {
                            value && value.length 
                            ?
                            value.map((item,index)=>(
                                <div style={{ borderBottom: index === value.length - 1 ? 'none' : `1px solid ${theme==='dark' ? '#272b5c' : '#f0f0f0'}` }} key={index}>
                                    <span style={{color:'#1890ff'}}>{ item.min_code }</span>
                                </div>
                            ))
                            :
                            null
                        }
                    </div>
                )
                let obj = {
                    children:renderNode,
                    props:{ className : 'multi-table-cell' }
                }
                return obj;
            }
        },
        {
            title:'期末表码',
            dataIndex:'meter',
            render: (value)=>{
                const renderNode = (
                    <div>
                        {
                            value && value.length 
                            ?
                            value.map((item,index)=>(
                                <div style={{ borderBottom: index === value.length - 1 ? 'none' : `1px solid ${theme==='dark' ? '#272b5c' : '#f0f0f0'}` }} key={index}>
                                    <span style={{color:'#1890ff'}}>{ item.max_code }</span>
                                </div>
                            ))
                            :
                            null
                        }
                    </div>
                )
                let obj = {
                    children:renderNode,
                    props:{ className : 'multi-table-cell' }
                }
                return obj;
            }
        },
        {
            title:'用量',
            dataIndex:'meter',
            render: (value)=>{
                const renderNode = (
                    <div>
                        {
                            value && value.length 
                            ?
                            value.map((item,index)=>(
                                <div style={{ borderBottom: index === value.length - 1 ? 'none' : `1px solid ${theme==='dark' ? '#272b5c' : '#f0f0f0'}` }} key={index}>
                                    <span style={{color:'#1890ff'}}>{ item.energy }</span>
                                </div>
                            ))
                            :
                            null
                        }
                    </div>
                )
                let obj = {
                    children:renderNode,
                    props:{ className : 'multi-table-cell' }
                }
                return obj;
            }
        }
    ];
    return (
        
        <Table
            columns={columns}
            dataSource={data}
            rowKey='attr_name'
            className={style['self-table-container']}
            bordered={true}
            title={()=>{
                return (
                    <div style={{ display:'flex', justifyContent:'space-between'}}>
                        <div>{ `${companyName}抄表记录(${ title ? title : ''})`}</div>
                        <div>
                        {
                            timeType === '1' 
                            ?
                            <Button type='primary' size='small' onClick={()=>{
                                new Promise((resolve, reject)=>{
                                    dispatch({ type:'meterReport/fetchMeterDetail', payload:{ resolve, reject }})
                                })
                                .then((data)=>{
                                    if ( data.length ){
                                        let fileTitle = title + '抄表记录明细';
                                        let thead = [], aoa = [];
                                        thead.push('表计名称', '注册码', '表码值', '记录时间');
                                        aoa.push(thead);
                                        data.forEach(item=>{
                                            let temp = [];
                                            temp.push(item.meter_name);
                                            temp.push(item.register_code);
                                            temp.push(item.energyValue);
                                            temp.push(item.record_date);
                                            aoa.push(temp);
                                        })
                                        var sheet = XLSX.utils.aoa_to_sheet(aoa);
                                        sheet['!cols'] = thead.map((item, index)=>({ wch:20 }));
                                        downloadExcel(sheet, fileTitle + '.xlsx' );
                                        // let timeList = [];
                                        // let prevItem = {}, mergesArr = [];
                                        // for ( let i=0; i<data.length; i++){
                                        //     if ( i === 0 || prevItem.register_code === data[i].register_code ) {
                                        //         timeList.push(data[i].record_date);
                                        //     } else {
                                        //         prevItem = {};
                                        //         break;                                            
                                        //     }
                                        //     prevItem = data[i];
                                        // }
                                        // timeList.forEach(time=>{
                                        //     thead.push(time);
                                        // });
                                        // aoa.push(thead);
                                        // let valueArr = []
                                        // let prevIndex = -1;
                                        // data.forEach((item, index)=>{
                                        //     if ( prevItem.register_code !== item.register_code ){
                                        //         ++prevIndex;
                                        //         let obj = { meter_name:item.meter_name, register_code:item.register_code, energyArr:[item.energyValue] };
                                        //         valueArr.push(obj);                                                                                              
                                        //     } else {
                                        //         valueArr[prevIndex].energyArr.push(item.energyValue);
                                        //     }
                                        //     prevItem = item;
                                        // });
                                        // valueArr.forEach(item=>{
                                        //     let temp = [];
                                        //     temp.push(energyInfo.type_name);
                                        //     temp.push(energyInfo.unit);
                                        //     temp.push(item.meter_name);
                                        //     temp.push(item.register_code);
                                        //     temp.push(...item.energyArr);
                                        //     aoa.push(temp);
                                        // })
                                        // // console.log(aoa);
                                        // var sheet = XLSX.utils.aoa_to_sheet(aoa);
                                        // sheet['!cols'] = thead.map((item, index)=>( index < 2 ? { wch:10 } : { wch:24 }));
                                        // downloadExcel(sheet, fileTitle + '.xlsx' );
                                    } else {
                                        message.info('数据源为空');
                                    }
                                })
                            }}>导出抄表明细</Button>
                            :
                            null
                        }
                        
                        <Button size="small" type="primary" style={{ marginLeft:'1rem' }} onClick={()=>{
                            let fileTitle = title + '抄表记录';
                            if ( isLoading ){
                                message.info('正在加载数据，请稍后');
                                return ;
                            } else {
                                if ( !data.length ){
                                    message.info('数据源为空');
                                } else {
                                    new Promise((resolve, reject)=>{
                                        dispatch({ type:'meterReport/exportMeterReport', payload:{ resolve, reject }})
                                    })
                                    .then((data)=>{
                                        let thead = [], colsStyle = [];
                                        let aoa = [];
                                        columns.forEach(item=>{
                                            thead.push(item.title);
                                            colsStyle.push({ wch:16 });
                                        })
                                        aoa.push(thead);
                                        data.forEach((item,index)=>{
                                            if ( item.meter && item.meter.length ){                                         
                                                item.meter.forEach((sub,j)=>{
                                                    let temp = [];
                                                    if ( j === 0 ){
                                                        temp.push(index+1);
                                                        temp.push(item.attr_name);
                                                        temp.push(item.energy_type);
                                                        temp.push(item.unit);                                               
                                                    } else {
                                                        temp.push(null);
                                                        temp.push(null);
                                                        temp.push(null);
                                                        temp.push(null);                                               
                                                    }
                                                    temp.push(sub.meter_name);
                                                    temp.push(sub.min_code);
                                                    temp.push(sub.max_code);
                                                    temp.push(sub.energy);
                                                    temp.rowNum = item.meter.length;
                                                    aoa.push(temp);
                                                })
                                            }
                                        });
                                        var sheet = XLSX.utils.aoa_to_sheet(aoa);                                    
                                        sheet['!cols'] = colsStyle;
                                        downloadExcel(sheet, fileTitle + '.xlsx' );
                                    })
                                    .catch(msg=>message.error(msg))
                                    
                                }
                               
                            }
                        }}>导出报表</Button>
                        </div>
                    </div>
                )
            }} 
            onChange={(pagination)=>{
                dispatch({ type:'meterReport/fetchMeterReport', payload:{ currentPage:pagination.current }});
            }}
            pagination={{ 
                total, 
                current:currentPage,
                pageSize,
                showSizeChanger:false                
            }}
        />
    )
};

export default React.memo(MeterReportTable);