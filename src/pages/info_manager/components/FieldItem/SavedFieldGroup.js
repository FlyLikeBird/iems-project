import React, { Component, useState, useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Table, Button, Modal, Card, Select, Popconfirm, Tree, Spin, message, Input } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined, RadarChartOutlined, CloseOutlined } from '@ant-design/icons';
import style from '../FieldGroup/FieldGroup.css';
const { Option } = Select;

function FieldGroup( { fieldAttrs, currentField, onDispatch }) {
    const [currentAttr, setCurrentAttr] = useState({});
    const [bindMachs, setBindMachs] = useState([]);
    const [value, setValue] = useState('');
    useEffect(()=>{
        if ( fieldAttrs.length ) {
            setCurrentAttr(fieldAttrs[0]);
        }
    },[fieldAttrs])
    useEffect(()=>{
        if ( Object.keys(currentAttr).length ){
            new Promise((resolve, reject)=>{
                onDispatch({ type:'fieldDevice/fetchSavedFieldMachs', payload:{ resolve, reject, image_id:currentField.id, attr_id:currentAttr.key }})
            })
            .then((data)=>{
                setBindMachs(data);
            })
            .catch(msg=>message.error(msg))
        }
    },[currentField, currentAttr])
    const columns = [
            {
                title:'所属维度名称',
                dataIndex:'attr_name',
                key:'attr_name'
            },
            {
                title:'设备名称',
                dataIndex:'meter_name',
                key:'meter_name'
            },
            {
                title:'注册码',
                dataIndex:'register_code'
            }
        ];
    
        return (
            <div className={style['container']}>
                <Card
                    className={style['attr-container']}
                >    
                    {
                        fieldAttrs.length 
                        ?
                        <Tree
                            defaultExpandAll={true}
                            selectedKeys={[currentAttr.key]}
                            treeData={fieldAttrs}
                            onSelect={(selectedKeys, {node})=>{
                                setCurrentAttr(node);
                            }}
                        /> 
                        :
                        null
                    }             
                                    
                </Card>
                <Card className={style['device-container']}>
                    {/* <div>
                        <Input style={{ width:'160px' }} placeholder='请输入设备名' value={value} onChange={e=>setValue(e.target.value)} />
                        <Button type='primary' onClick={()=>{
                            if(value){
                                new Promise((resolve, reject)=>{
                                    onDispatch({ type:'fieldDevice/fetchSavedFieldMachs', payload:{ resolve, reject, image_id:currentField.id, attr_id:currentAttr.key, meter_name:value }})
                                })
                                .then((data)=>{
                                    setBindMachs(data);
                                })
                                .catch(msg=>message.error(msg))
                            } else {
                                message.info('请输入要查询的设备名');
                            }
                        }}>查询</Button>
                    </div> */}
                    
                    <Table 
                        columns={columns} 
                        className={style['table-container']}
                        style={{ marginTop:'0' }}
                        dataSource={bindMachs} 
                        bordered={true} 
                        locale={{ emptyText:'还没有关联任何设备' }}
                        rowKey='detail_id'
                        title={()=>(
                            <div className={style['title-container']}>
                                <span>已关联设备</span>
                            </div>
                        )}
                    />            
                </Card>
                
            </div>
        )
}

export default FieldGroup;
