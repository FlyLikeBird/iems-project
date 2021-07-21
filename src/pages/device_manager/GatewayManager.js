import React, { Component, useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Table, Button, Modal, Card, Select, Popconfirm, Form, Input, Drawer, Spin, message } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined, RadarChartOutlined, CloseOutlined } from '@ant-design/icons';
import style from './DeviceManager.css';
import EditTable from '../../../components/EditTable';
import DeviceForm from './components/DeviceForm';

const { Option } = Select;
const netModeType = {
    '1':'4G',
    '2':'WIFI'
};

const GagewayManager = ({dispatch, gateway, user}) => {
    let { currentCompany, companyList } = user;
    let { list, selectedRowKeys, pageNum, total, visible, isLoading } = gateway;
    const pageSize = 10;
    const columns = [
       { width:160, ellipsis:true, title:'网关名称', dataIndex:'meter_name', key:'meter_name', fixed:'left' },
       { ellipsis:true, title:'网关识别码', dataIndex:'register_code', key:'register_code' },
       { ellipsis:true, title:'网关型号', dataIndex:'model_name', key:'model_name' },
       { ellipsis:true, title:'网关类型', dataIndex:'type', key:'type' },
       { 
           ellipsis:true,
           title:'上云方式',
           dataIndex:'net_mode',
           render:(netMode)=>{
                if ( netMode && netMode.length ){
                    return netMode.map(i=>netModeType[i]).join('/');
                } else {
                    return ''
                }
           }
       },
       { width:120, ellipsis:true, title:'创建时间', dataIndex:'create_time', key:'create_time' },
       { 
            title:'操作',
            key:'action',
            fixed:'right',
            render:(text, record)=>(
                <span>
                    <a onClick={()=>dispatch({type:'gateway/fetchEditForm', payload:record})}>编辑</a>
                </span>
            )
       }
    ];
    const rowSelection = {
        selectedRowKeys,
        onChange: (selectedRowKeys) =>dispatch({type:'gateway/select', payload:selectedRowKeys})
    };
    return (
            <div className={style['container']}>
                <div className={style['operation-container']}>
                    <div className={style['button-container']}>
                        <Button type="primary" onClick={()=>{
                            dispatch({ type:'gateway/select', payload:[]});
                            dispatch({type:'gateway/fetchAddForm'})
                        }}>添加网关</Button>
                        <Popconfirm title="确定要删除网关吗?" okText="确定" cancelText="取消" onConfirm={()=>{
                            if ( !selectedRowKeys.length ){
                                
                                message.info('请至少选择一个网关');
                            } else {
                                dispatch({type:'gateway/delete'});
                            }
                        }}><Button type="primary" >删除网关</Button></Popconfirm>
                    </div>
                </div>
                <div className={style['content-container']}>
                    <EditTable
                        columns={columns}
                        dataSource={list}
                        rowKey="mach_id"
                        bordered={true}
                        showSizeChanger={false}
                        rowSelection={rowSelection}
                        loading={isLoading}
                        locale={{emptyText:'还没有添加网关'}}
                        pagination={{current:pageNum, pageSize, total, showSizeChanger:false }}
                        onChange={(pagination)=>dispatch({type:'gateway/fetch', payload:{pageNum:pagination.current}})}
                    />
                </div>
                <Modal
                    footer={null} 
                    visible={visible} 
                    bodyStyle={{padding:'40px 24px 24px 24px'}}
                    destroyOnClose={true}
                    onCancel={()=>dispatch({type:'gateway/toggleVisible', payload:{visible:false, forEdit:false}})}
                >
                    <DeviceForm forGateway={true} />
                </Modal>
            </div>
        
    )
}

GagewayManager.propTypes = {
};

export default connect(({user, gateway})=>({gateway, user}))(GagewayManager);
