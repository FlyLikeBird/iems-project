import React, { useState } from 'react';
import { Row, Col, Table, Button, Card, Tree, Select, Skeleton } from 'antd';
import EditTable from '@/pages/components/EditTable';

function getDateColumns(arr, timeType){
    return arr.map((item, index)=>{
        let obj = {};
        let key = `${(+index)+1}${ timeType === '1' ? '月' : '日'}`;
        obj.title = key;
        obj.dataIndex = key;
        obj.width = 100;
        obj.render = (value)=>{
           return value ? <span style={{ color:'#1890ff'}}>{ value }</span> : <span style={{ color:'#1890ff' }}>0</span>;
        }
        return obj;
    })
}

function expandArr(arr, timeType){
    let obj = {};
    arr.map((item,index)=>{
        obj[`${(+index)+1}${ timeType === '1' ? '月':'日'}`] = item;
    });
    return obj;
}

let diffObj = {};

function EfficiencyTable({ data, timeType, currentAttr }){
    let dataSource = [];
    let dateColumns = getDateColumns(data.energy, timeType);
    let energyObj = expandArr(data.energy, timeType);
    let quotaObj = expandArr(data.quota, timeType);
    Object.keys(energyObj).map((key,index)=>{
        let value = ( (energyObj[key] ? energyObj[key] : 0 ) - ( quotaObj[key] ? quotaObj[key] : 0 )).toFixed(1);
        return diffObj[key] = value;
    })   
    dataSource.push({
        type:'实际能耗',
        ...energyObj
    });
    dataSource.push({
        type:'定额值',
        ...quotaObj
    });
    console.log(dataSource);
    dataSource.push({
        type:'差额',
        ...diffObj
    });
    const columns = [
        {
            title:`${currentAttr.title}能耗总量`,
            fixed:'left',
            width:100,
            dataIndex:'type'
        },
        ...dateColumns
    ];
    return (
        <EditTable
            columns={columns}
            dataSource={dataSource}
            rowKey={(text,record)=>text.attr_name}
            className='table-container'
            bordered={true}
            title={()=>{
                return (
                    <span>能耗定额考核(kwh)</span>
                )
            }} 
            maxWidth={ ( dateColumns.length * 100 ) + 100 }
            scroll={{ x:1000}}
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

export default React.memo(EfficiencyTable, areEqual);