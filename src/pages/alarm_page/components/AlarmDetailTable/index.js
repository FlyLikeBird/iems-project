import React, { useState } from 'react';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Tree, Tag, Select, Skeleton, Tooltip } from 'antd';
import style from '../../../IndexPage.css';
let id = 0;
let warningType = {
    '1':'安全类',
    '2':'指标类',
    '3':'通讯类'
};

function AlarmDetailTable({ data, forReport }){
    let dateColumns = [];
    let title ;
    // console.log(data);
    const columns = [
        // {
        //     title:'序号',
        //     key:'id',
        //     width:50,
        //     render:(row)=>{
        //         return id++;
        //     }
        // },
        {
            title:'报警时间',
            dataIndex:'last_warning_time',
            ellipsis:true,
            width:80,
            render:(value)=>{
                let dateStr = value.split('-');
                return dateStr[1] + '-' + dateStr[2];
            }
        },
        {
            title:'报警分类',
            width:70,
            dataIndex:'cate_code',
            render:(value)=>{
                return <Tag color="red" style={{ fontSize:'0.8rem' }}>{ warningType[value] }</Tag>
            },
            ellipsis:true,
            width:80,
        },
        {
            title:'问题标识',
            dataIndex:'type_name',
            ellipsis:true,
            width:80,
        },
        {
            title:'设备名称',
            dataIndex:'mach_name',
            ellipsis:true,
            width:120,
            render:(value)=>(
                <Tooltip placement='topLeft' title={value}>
                    { value }
                </Tooltip>
            )
        }
    ];
    
    return (
        <Table
            columns={columns}
            dataSource={data}
            bordered={true}
            rowKey='mach_name'
            // size='small'
            className={ forReport ? style['base-container'] : style['self-table-container'] + ' ' + style['small']}
            style={{ padding:'0' }}
            bordered={true}
            pagination={false}
        />
    )
};

export default AlarmDetailTable;