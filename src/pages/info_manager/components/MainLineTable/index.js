import React, { useState } from 'react';
import { Popconfirm, Form, Input, Select, Tag } from 'antd';
import EditTable from '../../../../../components/EditTable';
import style from '../../BillingManager.css';

const { Option } = Select;

function MainLineTable({ data, machList, onDispatch }){
    const [editingKey, setEditingKey] = useState('');
    const [form] = Form.useForm();
    const EditableCell = ({ editing, dataIndex, inputType, children, ...restProps })=>{
        return (
            <td {...restProps}>
                {
                    editing && inputType === 'input'
                    ?
                    <Form.Item style={{ margin:0}} name={dataIndex}><Input /></Form.Item>
                    :
                    editing && inputType === 'select'
                    ?
                    <Form.Item style={{ margin:0}} name={dataIndex}>
                        <Select>
                            {
                                machList.map((mach)=>(
                                    <Option key={mach.mach_id}>{ mach.meter_name }</Option>
                                ))
                            }
                        </Select>
                    </Form.Item>
                    :
                    <span>{ children }</span>
                }
            </td>
        )
    };
    const columns = [
        {
            title:'干线id',
            dataIndex:'main_id',
            width:120
        },
        {
            title:'干线名称',
            dataIndex:'main_name',
            editable:true,
            width:160
        },
        {
            title:'输入设备',
            dataIndex:'inMachs',
            render:ids=>{
                return (
                    <div>
                        {
                            ids.map(item=>(
                                <Tag>{ machList.filter(i=>i.mach_id === item )[0].meter_name }</Tag>
                            ))
                        }
                    </div>
                )
            },
            editable:true,
        },
        {
            title:'输出设备',
            dataIndex:'outMachs',
            render:ids=>{
                return (
                    <div>
                        {
                            ids.map(item=>(
                                <Tag>{ machList.filter(i=>i.mach_id === item )[0].meter_name }</Tag>
                            ))
                        }
                    </div>
                )
            },
            editable:true,
        },
        {
            title:'操作',
            width:140,
            render:(row)=>{
                let editable = row.main_id === editingKey ? true : false;
                return (
                    editable
                    ?
                    <div>
                        <a onClick={()=>{
                            form.validateFields()
                            .then(values=>{
                                values.main_id = editingKey;
                                values.in_mach = values.in_mach_name;
                                values.out_mach = values.out_mach_name;
                                onDispatch({type:'incoming/editMain', payload:values });
                                setEditingKey('');
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

                            setEditingKey(row.main_id);
                        }}>编辑</a>
                        <Popconfirm title="确定删除此条干线吗?" onText="确定" cancelText="取消" onConfirm={()=>onDispatch({type:'incoming/deleteMain', payload:row.main_id })}><a style={{margin:'0 10px'}}>删除</a></Popconfirm>
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
                    inputType:col.dataIndex === 'in_mach_name' || col.dataIndex === 'out_mach_name' ? 'select' : 'input',
                    title:col.title,
                    editing:record.main_id === editingKey
                }
            }
        }
    });
    // console.log(mergedColumns);
    return (
        <Form form={form}>
            <EditTable
                components={{
                    body:{
                        cell:EditableCell
                    }
                }}
                className={style['table-container']}
                columns={mergedColumns}
                dataSource={data}
                bordered={true}
                rowKey="main_id"
            />
        </Form>
        
    )
}

export default MainLineTable;