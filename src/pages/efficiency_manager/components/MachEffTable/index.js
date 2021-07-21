import React, { useState } from 'react';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Tree, Select, Skeleton } from 'antd';
import EditTable from '../../../../../components/EditTable';

function getPowerLevel(power){
    let str = '';
    if ( power === 0 ) {
        str = '-- --';
    }
    if ( power < 40 || power > 100 ) {
        str = '中';
    } else if ( (power >= 40 && power < 60) || ( power > 80 && power < 100 )) {
        str = '良';
    } else if ( power >= 60 && power <=80 ) {
        str = '优';
    }
    return str;
}

const levelColors = {
    '优':'#6ec71e',
    '良':'#ffc80c',
    '中':'#fd6e4c'
};

function MachEffTable({ data }){
    
    const columns = [
        {
            title:'时间',
            dataIndex:'record_date'
        },
        {
            title:'视在功率(kw)',
            dataIndex:'viewPower',
            render:(value)=>{
                return (
                    <span style={{ color:'#1890ff'}}>{ (+value).toFixed(2)}</span>
                )
            }
        },
        {
            title:'负荷率(%)',
            dataIndex:'ratio',
            render:(value)=>{
                return (
                    <span style={{ color:'#1890ff'}}>{ value }</span>
                )
            }
        },
        {
            title:'负荷等级',
            key:'level',
            render:(row)=>{
                let level = getPowerLevel(+row.ratio);
                return (
                    <span style={{ color:levelColors[level]}}>{ level } </span>
                )
            }
        },
        {
            title:'有功功率(kw)',
            dataIndex:'usePower',
            render:(value)=>{
                return (
                    <span style={{ color:'#1890ff'}}>{ (+value).toFixed(2)}</span>
                )
            }
        },
        {
            title:'无功功率(kw)',
            dataIndex:'uselessPower',
            render:(value)=>{
                return (
                    <span style={{ color:'#1890ff'}}>{ (+value).toFixed(2)}</span>
                )
            }
        }
    ];
    const dataSource = [];
    
    return (
        <EditTable
            columns={columns}
            dataSource={data}
            className='table-container'
            bordered={true}
            closeScroll={true}
        />
    )
};

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(MachEffTable, areEqual);