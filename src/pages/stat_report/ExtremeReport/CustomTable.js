import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Tree, Select, Skeleton, Spin, message } from 'antd';
import style from '../../IndexPage.css';
import { downloadExcel } from '@/pages/utils/array';
import XLSX from 'xlsx';

let power = [
    { title:'有功功率(W)', type:'P' },
    { title:'无功功率(var)', type:'Q'},
    { title:'视在功率(VA)', type:'S' }
];
let vol = [
    { title:'UA(V)', type:'U1' },
    { title:'UB(V)', type:'U2'},
    { title:'UC(V)', type:'U3'}
];
let ele = [
    { title:'IA(A)', type:'I1'},
    { title:'IB(A)', type:'I2'},
    { title:'IC(A)', type:'I3'},
];
let pf = [
    { title:'PFA(cosΦ)', type:'PF1' },
    { title:'PFA(cosΦ)', type:'PF2' },
    { title:'PFA(cosΦ)', type:'PF3' },
];
let category = [];

function EnergyTable({ dispatch, data, timeType, pagesize, companyName, eleType, startDate, endDate, isLoading }){
    let dateColumns = [];
    const [currentPage, setCurrentPage] = useState(1);
    if ( data && data.length ){
        if ( data[0].view ){
        Object.keys(data[0].view).forEach(key=>{
            category = 
                eleType === '1' 
                ?
                power.map(item=>{
                    let obj = {};
                    obj.title = item.title;
                    obj.type = item.type;
                    obj.children = [
                        { title:'最大值', dataIndex:['view',key,item.type,'max'], width:'100px', type:'max' },
                        { title:'最小值', dataIndex:['view',key,item.type,'min'], width:'100px', type:'min' },
                        { title:'平均值', dataIndex:['view',key,item.type,'avg'], width:'100px', type:'avg' }
                    ]
                    return obj;
                })
                :
                eleType === '2' 
                ?
                vol.map(item=>{
                    let obj = {};
                    obj.title = item.title;
                    obj.type = item.type;
                    obj.children = [
                        { title:'最大值', dataIndex:['view',key,item.type,'max'], width:'100px', type:'max' },
                        { title:'最小值', dataIndex:['view',key,item.type,'min'], width:'100px', type:'min' },
                        { title:'平均值', dataIndex:['view',key,item.type,'avg'], width:'100px', type:'avg' }
                    ]
                    return obj;
                })
                :
                eleType === '3' 
                ?
                ele.map(item=>{
                    let obj = {};
                    obj.title = item.title;
                    obj.type = item.type;
                    obj.children = [
                        { title:'最大值', dataIndex:['view',key,item.type,'max'], width:'100px', type:'max' },
                        { title:'最小值', dataIndex:['view',key,item.type,'min'], width:'100px', type:'min' },
                        { title:'平均值', dataIndex:['view',key,item.type,'avg'], width:'100px', type:'avg' }
                    ]
                    return obj;
                })
                :
                eleType === '4' 
                ?
                pf.map(item=>{
                    let obj = {};
                    obj.title = item.title;
                    obj.type = item.type;
                    obj.children = [
                        { title:'最大值', dataIndex:['view',key,item.type,'max'], width:'100px', type:'max' },
                        { title:'最小值', dataIndex:['view',key,item.type,'min'], width:'100px', type:'min' },
                        { title:'平均值', dataIndex:['view',key,item.type,'avg'], width:'100px', type:'avg' }
                    ]
                    return obj;
                })
                :
                [];
            dateColumns.push({
                title:key,
                index:key,
                children:category
            })
        });
        }
        // 重新排序
        dateColumns.sort((a,b)=>{
            let timeA = new Date(a.index).getTime();
            let timeB = new Date(b.index).getTime();
            return timeA - timeB;
        });
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
            dataIndex:'attr_name',
            fixed:'left'
        },
        ...dateColumns
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
                        <div>{ `${companyName}极值报表`}</div>
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
                                    `${startDate.format('YYYY-MM-DD')}极值报表`
                                    :
                                    `${startDate.format('YYYY-MM-DD')}至${endDate.format('YYYY-MM-DD')}极值报表`
                                    var aoa = [], thead1 = [], thead2 = [], thead3 = [];
                                    // 构建表格的合并表头数据结构
                                    columns.forEach((col,index)=>{
                                        if ( col.children && col.children.length ){
                                            thead1.push(col.title);
                                            let outIndex = 0;
                                            category.forEach(item=>{
                                                let innerIndex = 0;
                                                thead2.push(item.title);
                                                if ( item.children && item.children.length ){
                                                    item.children.forEach((sub)=>{
                                                        thead3.push(sub.title);
                                                        if ( outIndex !== 0 ) {
                                                            thead1.push(null);
                                                        }
                                                        if ( innerIndex !== 0 ) {
                                                            thead2.push(null);
                                                        }
                                                        ++outIndex;
                                                        ++innerIndex;
                                                    })
                                                }
                                            })
                                        } else {
                                            thead1.push(col.title);
                                            thead2.push(null);
                                            thead3.push(null);
                                        }
                                    });
                                
                                    aoa.push(thead1);
                                    aoa.push(thead2);
                                    aoa.push(thead3);
                                    // 构建表格的表体数据结构
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
                                                if ( item.children && item.children.length ){
                                                    item.children.forEach(sub=>{
                                                        temp.push(attr.view[key][item.type][sub.type]);
                                                    })
                                                }
                                            })
                                        });
                                        aoa.push(temp);
                                    })
                                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                                    // 合并表格表头的格式
                                    let merges = [];
                                    // 合并第一行表头
                                    thead1.forEach((item,index)=>{
                                        if ( item && item.includes('-')) {
                                            merges.push({
                                                s:{ r:0, c:index },
                                                e:{ r:0, c:index + 8 }
                                            })
                                        }
                                    });
                                    // 合并第二行表头
                                    thead2.forEach((item,index)=>{
                                        if ( item ) {
                                            merges.push({
                                                s:{ r:1, c:index },
                                                e:{ r:1, c:index + 2 }
                                            })
                                        }
                                    });
                                    // 合并第一二列
                                    merges.push({
                                        s:{ r:0, c:0 },
                                        e:{ r:2, c:0 }
                                    });
                                    merges.push({
                                        s:{ r:0, c:1 },
                                        e:{ r:2, c:1 }
                                    });
                                    sheet['!cols'] = thead3.map(i=>({ wch:16 }));
                                    sheet['!merges'] = merges;
                                    downloadExcel(sheet, fileTitle + '.xlsx');
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