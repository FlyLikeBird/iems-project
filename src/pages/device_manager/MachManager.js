import React, { Component, useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Table, Button, Modal, Card, Select, Popconfirm, Form, Input, Drawer, Spin, message } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined, RadarChartOutlined, CloseOutlined } from '@ant-design/icons';
import style from './DeviceManager.css';
import EditTable from '../../../components/EditTable';
import DeviceForm from './components/DeviceForm';

const { Option } = Select;

const MachManager = ({dispatch, device, user}) => {
    let { currentCompany, companyList } = user;
    let { list, selectedRowKeys, pageNum, total, visible, isLoading } = device;
    const pageSize = 15;
    const columns = [
       { width:160, ellipsis:true, title:'设备名称', dataIndex:'meter_name', key:'meter_name', fixed:'left' },
       { width:100, ellipsis:true, title:'设备类型', dataIndex:'type', key:'type' },
       { width:120, ellipsis:true, title:'设备识别码', dataIndex:'register_code', key:'register_code' },
       { width:160, ellipsis:true, title:'设备型号', dataIndex:'model_name', key:'model_name' },
       { ellipsis:true, title:'区域', dataIndex:'region', key:'region' },
       { ellipsis:true, title:'支路', dataIndex:'branch', key:'branch' },
       { width:120, ellipsis:true, title:'维护人员', dataIndex:'repair_user_name', key:'repair_user_name' },
       { width:120, ellipsis:true, title:'所属网关', dataIndex:'gateway', key:'gateway' },
       { width:120, ellipsis:true, title:'创建时间', dataIndex:'create_time', key:'create_time' },
       { 
            title:'操作',
            width:120,
            key:'action',
            fixed:'right',
            render:(text, record)=>(
                <span>
                    <a onClick={()=>dispatch({type:'device/fetchEditForm', payload:record})}>编辑</a>
                </span>
            )
       }
    ];
    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys) =>dispatch({type:'device/select', payload:selectedRowKeys})
    };
    return (
            <div className={style['container']}>
                <div className={style['operation-container']}>
                    <div className={style['button-container']}>
                        <Button type="primary" onClick={()=>{
                            dispatch({ type:'device/select', payload:[]});
                            dispatch({type:'device/fetchAddForm'})
                        }}>添加设备</Button>
                        <Popconfirm title="确定要删除设备吗?" okText="确定" cancelText="取消" onConfirm={()=>{
                            if ( !selectedRowKeys.length ){
                                message.info('请至少选择一个设备');
                            } else {
                                dispatch({type:'device/delete'});
                            }
                        }}><Button type="primary" >删除设备</Button></Popconfirm>
                    </div>
                </div>
                <div className={style['content-container']}>
                    <EditTable
                        columns={columns}
                        dataSource={list}
                        bordered={true}
                        rowKey="mach_id"
                        rowSelection={rowSelection}
                        loading={isLoading}
                        locale={{emptyText:'还没有添加设备'}}
                        pagination={{current:pageNum, pageSize, total, showSizeChanger:false }}
                        onChange={(pagination)=>dispatch({type:'device/fetch', payload:{pageNum:pagination.current}})}
                    />
                </div>
                <Modal
                    footer={null} 
                    visible={visible} 
                    bodyStyle={{padding:'40px'}}
                    destroyOnClose={true}
                    closable={false}
                    onCancel={()=>dispatch({type:'device/toggleVisible', payload:{visible:false, forEdit:false}})}
                >
                    <DeviceForm />
                </Modal>
            </div>
        
    )
}

MachManager.propTypes = {
};

export default connect(({user, device})=>({device, user}))(MachManager);
