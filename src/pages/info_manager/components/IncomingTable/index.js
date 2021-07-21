import React, { useState } from 'react';
import { Popconfirm, Form, Input, Table, message } from 'antd';
import style from '../../../IndexPage.css';

function IncomingTable({ data, onDispatch }){
    const [editingKey, setEditingKey] = useState('');
    const [form] = Form.useForm();
    const EditableCell = ({ editing, dataIndex, children, ...restProps })=>{
        return (
            <td {...restProps}>
                {
                    editing 
                    ?
                    <Form.Item style={{ margin:0}} name={dataIndex} rules={[{ required:true, message:'该选项不能为空'}]}><Input /></Form.Item>
                    :
                    <span>{ children }</span>
                }
            </td>
        )
    };
    const columns = [
        // {
        //     title:'进线id',
        //     dataIndex:'in_id',
        //     width:'200px'
        // },
        {
            title:'进线名称',
            dataIndex:'name',
            editable:true,
            width:'400px'
        },
        {
            title:'变压器容量(kva)',
            dataIndex:'total_kva',
            editable:true,
            width:'400px',
            render:(value)=>{
                return <span> { (+value).toFixed(0) }</span>
            }
        },
        {
            title:'操作',
            render:(row)=>{
                let editable = row.in_id === editingKey ? true : false;
                return (
                    editable
                    ?
                    <div>
                        <a onClick={()=>{
                            form.validateFields()
                            .then(values=>{
                                values.in_id = editingKey;
                                new Promise((resolve, reject)=>{
                                    onDispatch({type:'incoming/editIncoming', payload:{ ...values, resolve, reject}} );
                                })
                                .then(()=>{
                                    setEditingKey('');
                                })
                                .catch(msg=>{
                                    message.info(msg);
                                })
                            })
                            .catch(error=>{
                                console.log(error);
                            })
                        }}>确定</a>
                        <a style={{ margin:'0 10px'}} onClick={()=>setEditingKey('')}>取消</a>
                    </div>
                    :
                    <div>
                        <a onClick={()=>{
                            form.setFieldsValue({
                                ...row
                            });
                            setEditingKey(row.in_id);
                        }}>编辑</a>
                        <Popconfirm title="确定删除此条进线吗?" onText="确定" cancelText="取消" onConfirm={()=>onDispatch({type:'incoming/deleteIncoming', payload:{ in_id:row.in_id} })}><a style={{margin:'0 10px'}}>删除</a></Popconfirm>
                    </div>
                )
            }
        }
    ];
    const mergedColumns = columns.map(col=>{
        if ( !col.editable){
            return col;
        }
        return {
            ...col,
            onCell:record=>{
                return {
                    dataIndex:col.dataIndex,
                    title:col.title,
                    editing:record.in_id === editingKey
                }
            }
        }
    });
    // console.log(mergedColumns);
    return (
        <Form form={form}>
            <Table
                components={{
                    body:{
                        cell:EditableCell
                    }
                }}
                className={style['self-table-container']}
                columns={mergedColumns}
                dataSource={data}
                bordered={true}
                pagination={false}
                rowKey="in_id"
            />
        </Form>
        
    )
}

export default IncomingTable;