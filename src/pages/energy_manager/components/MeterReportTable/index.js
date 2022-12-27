import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Tree, Select, Skeleton, Spin, message } from 'antd';
import style from '@/pages/IndexPage.css';
import moment from 'moment';
import { downloadExcel } from '@/pages/utils/array';
import XLSX from 'xlsx';

function MeterReportTable({ dispatch, data, pagesize, energyInfo, companyName, isLoading, timeType, currentField, currentAttr, startTime, endTime, theme }){
    let title;
    const [currentPage, setCurrentPage] = useState(1);
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
                return `${ ( currentPage - 1) * pagesize + index + 1}`;
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
                            value.map((item,index)=>(
                                <div style={{ borderBottom: index === value.length - 1 ? 'none' : `1px solid ${theme==='dark' ? '#191932' : '#f0f0f0'}`}} key={index}>
                                    <span>{ item.meter_name }</span>
                                </div>
                            ))
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
                            value.map((item,index)=>(
                                <div style={{ borderBottom: index === value.length - 1 ? 'none' : `1px solid ${theme==='dark' ? '#191932' : '#f0f0f0'}` }} key={index}>
                                    <span style={{color:'#1890ff'}}>{ item.min_code }</span>
                                </div>
                            ))
                        }
                    </div>
                )
                let obj = {
                    children:renderNode,
                    props:{ className : style['multi-table-cell'] }
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
                            value.map((item,index)=>(
                                <div style={{ borderBottom: index === value.length - 1 ? 'none' : `1px solid ${theme==='dark' ? '#191932' : '#f0f0f0'}` }} key={index}>
                                    <span style={{color:'#1890ff'}}>{ item.max_code }</span>
                                </div>
                            ))
                        }
                    </div>
                )
                let obj = {
                    children:renderNode,
                    props:{ className : style['multi-table-cell'] }
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
                            value.map((item,index)=>(
                                <div style={{ borderBottom: index === value.length - 1 ? 'none' : `1px solid ${theme==='dark' ? '#191932' : '#f0f0f0'}` }} key={index}>
                                    <span style={{color:'#1890ff'}}>{ item.energy }</span>
                                </div>
                            ))
                        }
                    </div>
                )
                let obj = {
                    children:renderNode,
                    props:{ className : style['multi-table-cell'] }
                }
                return obj;
            }
        }
    ];
    useEffect(()=>{
        setCurrentPage(1);
    },[data, pagesize])
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
                        <Button size="small" type="primary" onClick={()=>{
                            if ( isLoading ){
                                message.info('正在加载数据，请稍后');
                                return ;
                            } else {
                                if ( !data.length ){
                                    message.info('数据源为空');
                                } else {
                                    let fileTitle = title + '抄表记录';
                                    let thead = [], colsStyle = [];
                                    let aoa = [];
                                    columns.forEach(item=>{
                                        thead.push(item.title);
                                        colsStyle.push({ wch:16 });
                                    })
                                    aoa.push(thead);
                                    data.forEach((item,index)=>{
                                        let lock = false;
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
                                }
                               
                            }
                        }}>导出报表</Button>
                    </div>
                )
            }} 
            onChange={(pagination)=>{
                setCurrentPage(pagination.current);
            }}
            pagination={{ 
                total:data ? data.length : 0, 
                current:currentPage,
                pageSize:pagesize,
                showSizeChanger:false                
            }}
        />
    )
};

MeterReportTable.propTypes = {
};

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.pagesize !== nextProps.pagesize || prevProps.theme !== nextProps.theme ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(MeterReportTable, areEqual);