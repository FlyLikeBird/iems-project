import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Table, Button, Modal, Drawer, Popconfirm, Select, message, Tree, Spin, Tag } from 'antd';
import WorktimeForm from './components/WorktimeForm';
import style from '@/pages/IndexPage.css';

const { Option } = Select;

function WorktimeManager({dispatch, user, worktime }){
    const { authorized, companyList, currentCompany, pagesize } = user;
    const { list, isLoading } = worktime;
    const [info, setInfo] = useState({ visible:false, forEdit:false, current:null });
    const columns = [
        
        {
            title:'班次名称',
            dataIndex:'name',
        },
        
        {
            title:'开始时间',
            dataIndex:'begin',
            render:value=>{
                let rest = value % 24;
                return value > 24 ? `次日${ rest === 0 ? '24' : rest < 10 ? '0' + rest : rest }:00` : `${ value < 10 ? '0' + value : value}:00`
            }
        },
        {
            title:'结束时间',
            dataIndex:'end',
            render:value=>{
                let rest = value % 24;
                return value > 24 ? `次日${ rest === 0 ? '24' : rest < 10 ? '0' + rest : rest }:00` : `${ value < 10 ? '0' + value : value}:00`
            }
        },
        {
            title:'创建时间',
            dataIndex:'create_time'
        },
        {
            title:'排序值',
            dataIndex:'order_by',
        },
        {
            title:'操作',
            key:'action',     
            render:(text,record)=>(
                <div>
                    <a style={{ marginRight:'1rem' }} onClick={()=>setInfo({ visible:true, forEdit:true, current:record })}>编辑</a>
                    <Popconfirm title='确定删除此班次吗' okText='确定' cancelText='取消' onConfirm={()=>{
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'worktime/delWorktimeAsync', payload:{ id:record.id, resolve, reject }})
                        })
                        .then(()=>{
                            message.success('删除班次成功');
                        })
                        .catch(msg=>message.error(msg));
                    }}>
                        <a>删除</a>
                    </Popconfirm>
                </div>
            )       
        }
    ];
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'worktime/fetchWorktimeList'});
        }
    },[authorized])
    return (
            <div className={style['page-container']}>
                <div className={style['card-container']}>
                    <div style={{ padding:'20px 0 0 20px'}}>
                        <Button style={{ marginRight:'10px' }} type="primary" onClick={()=>setInfo({ visible:true, forEdit:false, current:null })}>添加班次</Button>
                        
                    </div> 
                    
                    <Table 
                        rowKey="id" 
                        columns={columns} 
                        dataSource={list} 
                        bordered={true}
                        className={style['self-table-container']}
                        locale={{
                            emptyText:<div style={{ margin:'1rem 2rem' }}>还没有设置班次信息</div>
                        }}
                        onChange={(pagination)=>{
                            dispatch({type:'userList/fetchUserList', payload:{ pageNum:pagination.current}});
                            setPageNum(pagination.current);
                        }}
                    />
                    <Modal
                        title={info.forEdit ? '更新班次' : '添加班次'}
                        visible={info.visible}
                        destroyOnClose={true}
                        onCancel={()=>setInfo({ visible:false })}
                        footer={null}
                    >
                        <WorktimeForm
                            info={info}
                            onDispatch={action=>dispatch(action)}
                            onClose={()=>setInfo({ visible:false })}
                        />
                    </Modal>
                        
                    
                </div>         
            </div>
    )
}

export default connect(({ user, worktime })=>({ user, worktime }))(WorktimeManager);
