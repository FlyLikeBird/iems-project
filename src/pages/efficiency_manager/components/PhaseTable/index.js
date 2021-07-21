import React, { useState } from 'react';
import { Row, Col, Table, Button, Card, Tree, Select, Skeleton } from 'antd';
import EditTable from '../../../../../components/EditTable';

function PhaseTable({ data, optionText, optionUnit }){
    let isFourPhase = optionText === '四象限无功电能' ? true : false;
    let isLineVoltage = optionText === '线电压' ? true : false;
    let restColumns = isFourPhase ?
                [
                    {
                        title:'第一象限',
                        dataIndex:'energy1'
                    },
                    {
                        title:'第二象限',
                        dataIndex:'energy2'
                    },
                    {
                        title:'第三象限',
                        dataIndex:'energy3'
                    },
                    {
                        title:'第四象限',
                        dataIndex:'energy4'
                    }
                ]
                :
                isLineVoltage
                ?
                [
                    {
                        title:`总${optionText}`,
                        dataIndex:'energy'
                    },
                    {
                        title:'AB线',
                        dataIndex:'energyAB'
                    },
                    {
                        title:'BC线',
                        dataIndex:'energyBC'
                    },
                    {
                        title:'CA线',
                        dataIndex:'energyCA'
                    }
                ]
                :
                [    
                    {
                        title:`总${optionText}`,
                        dataIndex:'energy'
                    },             
                    {
                        title:'A相',
                        dataIndex:'energyA',
                        render:value=>value ? value : '-- --'
                    },
                    {
                        title:'B相',
                        dataIndex:'energyB',
                        render:value=>value ? value : '-- --'
                    },
                    {
                        title:'C相',
                        dataIndex:'energyC',
                        render:value=>value ? value : '-- --'
                    }
                ];
    let columns = [
        {
            title:'时间 | 参数',
            dataIndex:'date'
        },
        {
            title:`${optionText}(${optionUnit})`,
            children:[
                ...restColumns
            ]
        }
    ];
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

export default React.memo(PhaseTable, areEqual);