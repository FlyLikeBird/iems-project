import React, { useState } from 'react';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Tree, Select, Skeleton } from 'antd';
import EditTable from '../../../../components/EditTable';

function sumArr(arr){
    return arr.reduce((sum,cur)=>{
        return sum += cur;
    },0);
}

function DemandCostTable({ data }){
    const totalEnergy = sumArr([...data.heightEnergy, ...data.middleEnergy, ...data.bottomEnergy]);
    const totalCost = sumArr([...data.heightCost, ...data.middleCost, ...data.bottomCost ]);
    const columns = [
        {
            title:'选择时间段成本报告',
            dataIndex:'period'
        },
        {
            title:'能耗(kwh)',
            dataIndex:'energy',
            render:(value, item)=>{
                if ( item.key === 'sum') {
                    return value.toFixed(2);
                } else {
                    return `${value.toFixed(2)} (${ totalEnergy === 0 ? 0 : Math.floor(value/totalEnergy*100)}%)`
                }
            }
        },
        {
            title:'成本(元)',
            dataIndex:'cost',
            render:(value, item)=>{
                if ( item.key === 'sum') {
                    return value.toFixed(2);
                } else {
                    return `${value.toFixed(2)} (${ totalCost === 0 ? 0 : Math.floor(value/totalCost*100)}%)`
                }
            }
        },
    ];
    const dataSource = [];
    dataSource.push({
        key:'high',
        period:'峰值时段',
        energy:sumArr(data.heightEnergy),
        cost:sumArr(data.heightCost)
    });
    dataSource.push({
        key:'middle',
        period:'平值时段',
        energy:sumArr(data.middleEnergy),
        cost:sumArr(data.middleCost)
    });
    dataSource.push({
        key:'bottom',
        period:'谷值时段',
        energy:sumArr(data.bottomEnergy),
        cost:sumArr(data.bottomCost)
    });
    dataSource.push({
        key:'sum',
        period:'合计',
        energy:totalEnergy,
        cost:totalCost
    });
    return (
        <EditTable
            style={{height:'50%', padding:'0 40px'}}
            columns={columns}
            dataSource={dataSource}
            className='table-container'
            bordered={true}
            pagination={false}
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

export default React.memo(DemandCostTable, areEqual);