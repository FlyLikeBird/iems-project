import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Tree, Select, Skeleton, Spin, message } from 'antd';
import style from '../../IndexPage.css';
import { downloadExcel } from '@/pages/utils/array';
import XLSX from 'xlsx';

function EnergyTable({ dispatch, data, pagesize, companyName, timeType, startDate, endDate, isLoading }){
    const [currentPage, setCurrentPage] = useState(1);
    let columns = [
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
            width:'180px',
            ellipsis:true,
            dataIndex:'attr_name',
            fixed:'left'
        },
        {
            title:'本期用电量(kwh)',
            dataIndex:'energy'
        },
        {
            title:'上期用电量(kwh)',
            dataIndex:'sameEnergy'
        },
        {
            title:'增加量(kwh)',
            dataIndex:'differ'
        },
        {
            title:'环比(%)',
            dataIndex:'rate'
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
            title={()=>{
                return (
                    <div style={{ display:'flex', justifyContent:'space-between'}}>
                        <div>{ `${companyName}环比报表`}</div>
                        <Button size="small" type="primary" onClick={()=>{
                            if ( isLoading ){
                                message.info('正在加载数据，请稍后');
                                return ;
                            } else {
                                if ( !data.length ){
                                    message.info('数据源为空');
                                    return ;
                                } else {
                                    let fileTitle = 
                                        timeType === '1' 
                                        ?
                                        `${startDate.format('YYYY-MM-DD')}环比报表`
                                        :
                                        `${startDate.format('YYYY-MM-DD')}-${endDate.format('YYYY-MM-DD')}环比报表`
                                    var aoa = [];
                                    aoa.push(columns.map(i=>i.title));
                                    data.forEach((item,index)=>{
                                        aoa.push([`${index+1}`,item.attr_name, item.energy, item.sameEnergy, item.differ, item.rate]);
                                    })                            
                                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                                    sheet['!cols'] = columns.map(i=>({ wch:16 }));
                                    downloadExcel(sheet, fileTitle + '.xlsx' );
                                }
                            }
                        }}>导出报表</Button>
                    </div>
                )
            }} 
            bordered={true}
            scroll={ { x:1000 } }
            onChange={(pagination)=>{
                setCurrentPage(pagination.current);
            }}
            pagination={{ total:data ? data.length : 0, current:currentPage, pageSize:pagesize, showSizeChanger:false }}
        />
    )
};

EnergyTable.propTypes = {
};

export default EnergyTable;