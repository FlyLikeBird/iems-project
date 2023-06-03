import React, { useState, useEffect } from 'react';
import { Table, Button, Drawer, Popconfirm, message } from 'antd';
import { HistoryOutlined, FileTextOutlined, DeleteOutlined } from '@ant-design/icons';
import SavedFieldGroup from './SavedFieldGroup';

function SavedFieldContainer({ dispatch, info }){
    const [list, setList] = useState([]);
    const [visible, setVisible] = useState(false);
    const [currentField, setCurrentField] = useState({});
    const [fieldAttrs, setFieldAttrs] = useState([]);

    useEffect(()=>{
        new Promise(( resolve, reject)=>{
            dispatch({ type:'fieldDevice/fetchSavedField', payload:{ resolve, reject, field_id:info.field_id }})
        })
        .then((data)=>{
            setList(data);
        })
        .catch(msg=>message.error(msg))
    },[]) 
    let columns = [
        { title:'维度名称', dataIndex:'field_name'},
        { title:'备份名称', dataIndex:'image_name'},
        { title:'保存时间', dataIndex:'image_date' },
        {
            title:'操作',
            render:row=>(
                <>
                    <Popconfirm
                        title="此操作会覆盖当前维度信息，请确认" 
                        okText="确定" 
                        cancelText="取消" 
                        onConfirm={()=>{
                            new Promise((resolve, reject)=>{
                                dispatch({ type:'fieldDevice/restoreFieldAsync', payload:{ resolve, reject, image_id:row.id }})
                            })
                            .then(()=>{
                                message.success('恢复维度成功')
                            })
                            .catch(msg=>message.error(msg));
                        }}>                  
                        <Button type='primary' style={{ marginRight:'1rem' }} icon={<HistoryOutlined />}>恢复设置</Button>
                    </Popconfirm>
                    <Button type='primary' style={{ marginRight:'1rem' }} icon={<FileTextOutlined />} onClick={()=>{
                        setVisible(true);
                        setCurrentField(row);
                        new Promise((resolve, reject)=>{
                            // 请求备份维度的属性树
                            dispatch({ type:'fieldDevice/fetchSavedFieldAttrs', payload:{ resolve, reject, image_id:row.id } })
                        })
                        .then((data)=>{
                            let temp = data.list && data.list.length ? data.list : [];
                            setFieldAttrs(temp);
                          
                        })                        
                           
                    }}>查看</Button>
                    <Popconfirm 
                        title="确定删除此备份吗?" 
                        okText="确定" 
                        cancelText="取消" 
                        onConfirm={()=>{
                            new Promise((resolve, reject)=>{
                                dispatch({ type:'fieldDevice/delSavedFieldAsync', payload:{ resolve, reject, image_id:row.id }})
                            })
                            .then(()=>{
                                message.success('删除维度备份成功');
                                new Promise(( resolve, reject)=>{
                                    dispatch({ type:'fieldDevice/fetchSavedField', payload:{ resolve, reject, field_id:info.field_id }})
                                })
                                .then((data)=>{
                                    setList(data);
                                })
                                .catch(msg=>message.error(msg))
                            })
                            .catch(msg=>message.error(msg));
                        }}>
                        <Button type='primary' danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>

                    
                </>
            )
        }
    ]
    return (
        <div>
            <Table
                columns={columns}
                dataSource={list}
                pagination={false}
                locale={{ emptyText:'还没有任何备份' }}

            />
            <div style={{ margin:'1rem 0' }}>维度设置保存数量上限为3条</div>
            <Drawer
                visible={visible}
                title={currentField.iamge_name}
                placement="right"
                width="80%"
                onClose={()=>setVisible(false)}
                
            >
                <SavedFieldGroup fieldAttrs={fieldAttrs} currentField={currentField} onDispatch={action=>dispatch(action)} />
            </Drawer>
        </div>
        
    )
}

export default SavedFieldContainer;