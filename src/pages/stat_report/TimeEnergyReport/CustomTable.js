import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Tree, Select, Skeleton, Spin, message } from 'antd';
import style from '../../IndexPage.css';
import { downloadExcel } from '@/pages/utils/array';
import XLSX from 'xlsx';

function EnergyTable({ dispatch, data, energyInfo, timeType, startDate, endDate, dataType, companyName, pagesize, isLoading }){
    const [currentPage, setCurrentPage] = useState(1);
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
            width:'180px',
            fixed:'left',
            dataIndex:'attr_name',
            ellipsis: true,
        },
        {
            title:'单位',
            width:'80px',
            key:'unit',
            render:(row)=>{
                return <span>{ dataType === '1' ? '元' : energyInfo.unit }</span>;
            }
        },
        {
            title: dataType === '1' ? '费用汇总' : '能耗汇总',
            key:'total',
            width:'100px',
            dataIndex:'total',
            render:(text)=>(<span style={{color:'#1890ff'}}>{ (+text).toFixed(1) } </span>)
        },
        {
            title:'尖',
            key:'tip',
            width:'100px',
            dataIndex:'tip',
            render:(text)=>(<span style={{color:'#1890ff'}}>{ text ? (+text).toFixed(1) : '--' } </span>)

        },
        {
            title:'峰',
            key:'top',
            width:'100px',
            dataIndex:'top',
            render:(text)=>(<span style={{color:'#1890ff'}}>{ text ? (+text).toFixed(1) : '--' } </span>)
        },
        {
            title:'平',
            key:'middle',
            width:'100px',
            dataIndex:'middle',
            render:(text)=>(<span style={{color:'#1890ff'}}>{ text ? (+text).toFixed(1) : '--' } </span>)
        },
        {
            title:'谷',
            key:'bottom',
            width:'100px',
            dataIndex:'bottom',
            render:(text)=>(<span style={{color:'#1890ff'}}>{ text ? (+text).toFixed(1) : '--' } </span>)
        }
    ];
    useEffect(()=>{
        setCurrentPage(1);
    },[data, pagesize])
    return (
        isLoading
        ?
        <Skeleton active className={style['skeleton']} />
        :
        <Table
            columns={columns}
            dataSource={data}
            rowKey={(text,record)=>text.attr_name}
            className={style['self-table-container']}
            bordered={true}
            title={()=>{
                return (
                    <div style={{ display:'flex', justifyContent:'space-between'}}>
                        <div>{ `${companyName}复合计费${ dataType === '1' ? '成本' : '能耗' }报表`}</div>
                        <Button size="small" type="primary" onClick={()=>{
                            if ( isLoading ){
                                message.info('正在加载数据，请稍后');
                                return ;
                            } else {
                                if ( !data.length ){
                                    message.info('数据源为空');
                                } else {
                                    let dateStr =  
                                        timeType === '1' 
                                        ?
                                        `${startDate.format('YYYY-MM-DD')}`
                                        :
                                        `${startDate.format('YYYY-MM-DD')}-${endDate.format('YYYY-MM-DD')}`;
                                    
                                    // console.log(dateStr);
                                    let fileTitle = dateStr + `复合计费`;
                                    let aoa = [];
                                    let thead = [];
                                    let colsStyle = [];
                                    columns.forEach(col=>{
                                        thead.push(col.title);
                                        colsStyle.push({ wch:16 });
                                    });
                                    aoa.push(thead);
                                    data.forEach((item,index)=>{
                                        let temp = [];
                                        temp.push(index + 1);
                                        columns.forEach((col,j)=>{
                                            if ( col.dataIndex ){
                                                temp.push(item[col.dataIndex] || '-- --');
                                            } else if ( col.key === 'unit') {
                                                temp.push(dataType === '1' ? '元' : energyInfo.unit )
                                            }
                                        })
                                        aoa.push(temp);
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

EnergyTable.propTypes = {
};

export default EnergyTable;