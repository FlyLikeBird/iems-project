import React, { useState } from 'react';
import { Row, Col, Table, Button, Card, Tree, Select, Skeleton } from 'antd';
import EditTable from '../../../../../components/EditTable';

function LineLossTable({ data, forMach }){
    let dateColumns = []; 
    let columns;
    if ( forMach ){
        columns = [
            {
                title:'时间',
                dataIndex:'date'
            },
            {
                title:'总有功电量',
                dataIndex:'useEnergy'
            },
            {
                title:'总无功电量',
                dataIndex:'uselessEnergy'
            },
            {
                title:'实际功率因素',
                dataIndex:'factor'
            },
            {
                title:'功率因素考核值',
                dataIndex:'factorRef'
            },
            {
                title:'(  基本电费',
                dataIndex:'baseCost'
            },
            {
                title:'+',
                dataIndex:'plus',
                render:(value)=>{return ''}
            },
            {
                title:'电度电费  )',
                dataIndex:'eleCost'
            },
            {
                title:'*',
                dataIndex:'multiply',
                render:(value)=>{return ''}
            },
            {
                title:'力调系数',
                dataIndex:'ratio'
            },
            {
                title:'=',
                dataIndex:'equal',
                render:(value)=>{return ''}
            },
            {
                title:'力调电费',
                dataIndex:'adjustcost'
            }
        ];
    } else {
        columns = [
            {
                title:'时间',
                dataIndex:'date'
            },
            {
                title:'干线名称',
                dataIndex:'name'
            },
            {
                title:'输入(kwh)',
                dataIndex:'in_energy',
                render:(value)=>(<span style={{ color:'#1890ff'}}>{ value ? value : 0 }</span>)
            },
            {
                title:'输出(kwh)',
                dataIndex:'out_energy',
                render:(value)=>(<span style={{ color:'#1890ff'}}>{ value ? value : 0 }</span>)
            },
            {
                title:'损耗(kwh)',
                dataIndex:'lose_energy',
                render:(value)=>(<span style={{ color:'#1890ff'}}>{ value ? value : 0 }</span>)
            },
            {
                title:'损耗率(%)',
                dataIndex:'lose_rate',
                render:(value)=>(<span style={{ color:'#1890ff'}}>{ value ? value : 0 }</span>)

            }
        ];
    }
    return (
        <EditTable
            columns={columns}
            dataSource={data}
            rowKey={(text,record)=>text.date}
            className='table-container'
            bordered={true}
            
        />
    )
};

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(LineLossTable, areEqual);