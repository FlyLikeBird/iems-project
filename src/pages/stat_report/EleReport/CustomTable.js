import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Tree, Select, Skeleton, Spin, message } from 'antd';
import style from '../../IndexPage.css';
import { downloadExcel } from '@/pages/utils/array';
import XLSX from 'xlsx';
let category = [
    { title:'A相电压(v)', type:'U1' },
    { title:'B相电压(v)', type:'U2' },
    { title:'C相电压(v)', type:'U3' },
    { title:'平均相电压(v)', type:'Uavg' },
    { title:'AB线电压(v)', type:'U12' },
    { title:'BC线电压(v)', type:'U23' },
    { title:'CA线电压(v)', type:'U31' },
    { title:'平均线电压', type:'Ullavg' },
    { title:'A相电流(A)', type:'I1' },
    { title:'B相电流(A)', type:'I2' },
    { title:'C相电流(A)', type:'I3' },
];
function EnergyTable({ dispatch, data, timeType, pagesize, startDate, endDate, isLoading, companyName }){
    let dateColumns = [];
    const [currentPage, setCurrentPage] = useState(1);
    if ( data && data.length ){
        if ( data[0].view ){
            Object.keys(data[0].view).forEach(key=>{
                dateColumns.push({
                    title:key,
                    index:key,
                    children:category.map(item=>{
                        let obj = {};
                        obj['title'] = item.title;
                        obj['dataIndex'] = ['view',key,item.type];
                        obj['width'] = '110px';
                        return obj;
                    })
                })
            });
        }
        // 重新排序
        dateColumns.sort((a,b)=>{
            let timeA = new Date(a.index).getTime();
            let timeB = new Date(b.index).getTime();
            return timeA - timeB;
        })
    }
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
            fixed:'left',
            dataIndex:'attr_name'
        },
        ...dateColumns
    ];
    return (
      
        <Table
            columns={columns}
            dataSource={data}
            rowKey='attr_name'
            className={style['self-table-container']}
            bordered={true}
            scroll={ { x:1000 }}
            title={()=>{
                return (
                    <div style={{ display:'flex', justifyContent:'space-between'}}>
                        <div>{ `${companyName}电力报表`}</div>
                        <Button size="small" type="primary" onClick={()=>{
                            if ( isLoading ) {
                                message.info('正在加载数据，请稍后');
                                return;
                            } else {
                                if ( !data.length ){
                                    message.info('数据源为空');
                                    return ;
                                } else {
                                    let fileTitle = 
                                        timeType === '1' 
                                        ?
                                        `${startDate.format('YYYY-MM-DD')}电力报表`
                                        :
                                        `${startDate.format('YYYY-MM-DD')}至${endDate.format('YYYY-MM-DD')}电力报表`
                                    var aoa = [], thead1 = [], thead2 = [];
                                    columns.forEach((col,index)=>{
                                        if ( col.children && col.children.length ){
                                            thead1.push(col.title);
                                            category.forEach((type,index)=>{
                                                thead2.push(type.title);
                                                if ( index === 0 ) return;                                     
                                                thead1.push(null);
                                            })  
                                        } else {
                                            thead1.push(col.title);
                                            thead2.push(null);
                                        }
                                    });
                                    aoa.push(thead1);
                                    aoa.push(thead2);
                                  
                                    data.forEach((attr,index)=>{
                                        let temp = [];
                                        temp.push(index + 1);
                                        temp.push(attr.attr_name);
                                        Object.keys(attr.view).sort((a,b)=>{
                                            let timeA = new Date(a).getTime();
                                            let timeB = new Date(b).getTime();
                                            return timeA - timeB;
                                        }).forEach(key=>{
                                            category.forEach(item=>{
                                                temp.push(attr.view[key][item.type]);
                                            })
                                        });
                                        aoa.push(temp);
                                    })
                                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                                    // 合并表格表头的格式
                                    let merges = [];
                                    thead1.forEach((item,index)=>{
                                        if ( item && item.includes('-')) {
                                            merges.push({
                                                s:{ r:0, c:index},
                                                e:{ r:0, c:index + category.length - 1}
                                            })
                                        }
                                    });
                                    merges.push({
                                        s:{ r:0, c:0 },
                                        e:{ r:1, c:0 }
                                    });
                                    merges.push({
                                        s:{ r:0, c:1 },
                                        e:{ r:1, c:1 }
                                    });
                                    sheet['!cols'] = thead2.map(i=>({ wch:16 }));
                                    sheet['!merges'] = merges;
                                    downloadExcel(sheet, fileTitle + '.xlsx');
                                }
                            }
                        }}>导出报表</Button>
                    </div>
                )
            }} 
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