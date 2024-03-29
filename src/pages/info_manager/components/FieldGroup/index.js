import React, { Component, useState, useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Table, Button, Modal, Card, Select, Popconfirm, Tree, Spin, message, Input } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined, RadarChartOutlined, CloseOutlined } from '@ant-design/icons';
import CalcVirtualNode from './CalcVirtualNode';
import style from './FieldGroup.css'
const { Option } = Select;

function FieldGroup( { fields, fieldDevice, dispatch}) {
        const [value, setValue] = useState('');
        const [virtualNode, setVirtualNode] = useState(false);
        const [editing, setEditing] = useState(false);
        const [saveName, setSaveName] = useState('');
        const inputRef = useRef();
        let { allFields, energyInfo, expandedKeys, treeLoading } = fields;
        let { isRootAttr, selectedField, selectedAttr, deviceList, allDevice, forAddStatus, selectedRowKeys, isLoading, calcRuleList  } = fieldDevice;
        let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][selectedField.field_name] : [];
        const columns = forAddStatus 
        ?
        [
            {
                title:'注册码',
                dataIndex:'register_code'
            },
            {
                title:'设备名称',
                dataIndex:'meter_name',
                key:'meter_name'
            },
            {
                title:'已关联属性',
                dataIndex:'attr_name',
                key:'attr_name'
            },
        ]
        :
        [
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
        const rowSelection = {
            selectedRowKeys,
            onChange: selectedKeys => dispatch({type:'fieldDevice/select', payload:selectedKeys})
        };
        useEffect(()=>{
            if ( inputRef.current ){
                inputRef.current.focus();
            }
        },[editing])
        return (
            <div className={style['container']}>
                <Card
                    className={style['attr-container']}
                    title={
                        <div className={style['button-container']}>
                            <div><Button type="primary" disabled={isRootAttr} onClick={()=>dispatch({type:'fieldDevice/toggleAttrModal', payload:{ visible:true, forSub:false, editAttr : false}})}>添加同级</Button></div>
                            <div><Button type="primary" onClick={()=>dispatch({type:'fieldDevice/toggleAttrModal', payload:{ visible:true, forSub:true, editAttr:false }})}>添加下级</Button></div>
                            <div><Button type="primary" onClick={()=>dispatch({type:'fieldDevice/toggleAttrModal', payload: { visible:true, forSub:false, editAttr:true }})}>编辑属性</Button></div>
                            <Popconfirm title="确定要删除吗?" okText="确定" cancelText="取消" onConfirm={()=>dispatch({type:'fieldDevice/deleteAttr'})}><div><Button type="primary" disabled={isRootAttr}>删除属性</Button></div></Popconfirm>
                        </div>
                    }
                >
                    {
                        treeLoading
                        ?
                        <Spin />
                        :
                        <Tree
                            expandedKeys={expandedKeys}
                            defaultExpandAll={true}
                            onExpand={temp=>{
                                dispatch({ type:'fields/setExpandedKeys', payload:temp });
                            }}
                            selectedKeys={[selectedAttr.key]}
                            treeData={fieldAttrs}
                            onSelect={(selectedKeys, {node})=>{
                                dispatch({type:'fieldDevice/toggleAttr', payload:node});
                                dispatch({type:'fieldDevice/fetchAttrDevice'});
                                dispatch({ type:'fieldDevice/fetchCalcRule'});
                            }}
                        />
                    }
                </Card>
                <Card className={style['device-container']}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <div>
                            <Button type="primary" disabled={forAddStatus ? true : false} onClick={()=>{                           
                                dispatch({type:'fieldDevice/fetchAll'});
                            }}>添加设备</Button>
                            <Button type="primary" style={{marginLeft:'6px'}} disabled={ forAddStatus ? true : selectedRowKeys && selectedRowKeys.length ? false : true } onClick={()=>{
                                if ( selectedRowKeys.length ) {
                                    new Promise((resolve, reject)=>{
                                        dispatch({type:'fieldDevice/deleteDevice', payload:{ resolve, reject }})
                                    })
                                    .then(()=>{
                                    
                                    })
                                    .catch(msg=>message.info(msg))
                                } else {
                                    message.info('请至少选中一个设备')
                                }
                            }}>删除关联设备</Button>
                            {
                                forAddStatus 
                                ?
                                <Input style={{ width:'160px', marginLeft:'20px' }} placeholder='请输入设备名' value={value} onChange={e=>setValue(e.target.value)} />
                                :
                                null
                            }
                            {
                                forAddStatus
                                ?
                                <Button type='primary' onClick={()=>{
                                    if(value){
                                        dispatch({ type:'fieldDevice/fetchAll', payload:{ meter_name:value }})
                                    } else {
                                        message.info('请输入要查询的设备名');
                                    }
                                }}>查询</Button>
                                :
                                null
                            }
                            <Button style={{ margin:'0 20px'}} type='primary' onClick={()=>setVirtualNode(true)} >虚拟节点运算</Button>
                        </div>
                        {
                            editing 
                            ?
                            <div>
                                <Input ref={inputRef} style={{ width:'180px', marginRight:'1rem' }} value={saveName} onChange={e=>setSaveName(e.target.value)} placeholder='请输入备份名称' />
                                <Button type='primary' style={{ marginRight:'0.5rem' }} onClick={()=>{
                                    if ( saveName ){
                                        new Promise((resolve, reject)=>{
                                            dispatch({ type:'fieldDevice/saveFieldAsync', payload:{ resolve, reject, image_name:saveName } })
                                        })
                                        .then(()=>{
                                            message.success('维度备份成功');
                                            setEditing(false);
                                        })
                                        .catch(msg=>message.error(msg))
                                    } else {
                                        message.error('请输入备份名称')
                                    }
                                }}>确定</Button>
                                <Button onClick={()=>setEditing(false)}>取消</Button>
                            </div>
                            :
                            <Button type='primary' onClick={()=>setEditing(true)}>保存当前设置</Button>
                        }
                        
                    </div>
                    {
                        isLoading 
                        ?
                        <Spin className={style['spin']} />
                        :
                        <Table 
                            columns={columns} 
                            className={style['table-container']}
                            dataSource={ forAddStatus ? allDevice : deviceList} 
                            bordered={true} 
                            locale={{emptyText: forAddStatus ? '没有可关联的设备' : '还没有关联任何设备'}}
                            rowKey={ forAddStatus ? 'mach_id' : 'detail_id' }
                            rowSelection={rowSelection} 
                            title={()=>{
                                return (
                                    <div>

                                        <div className={style['title-container']}>
                                            <span>{ forAddStatus ? '未关联设备' : '已关联设备'}</span>
                                        </div>
                                    </div>
                                )
                            }} 
                            footer={ forAddStatus ? ()=>{
                                return (
                                    <div>                                   
                                        <Button type="primary" onClick={()=>{
                                            if ( !selectedRowKeys.length ) {
                                                message.info('请选择要关联的设备')
                                            } else {
                                                new Promise((resolve, reject)=>{
                                                    dispatch({type:'fieldDevice/addDevice', payload:{ resolve, reject }})   
                                                })
                                                .then(()=>{
                                                    dispatch({ type:'fieldDevice/toggleStatus', payload:false });
                                                })
                                                .catch(msg=>{
                                                    message.info(msg);
                                                })
                                            }
                                            setValue('');
                                        }}>关联设备</Button>
                                        <Button type="primary" style={{marginLeft:'6px'}} onClick={()=>{
                                            dispatch({type:'fieldDevice/toggleStatus', payload:false});
                                            setValue('');
                                        }}>取消</Button>                                                        
                                    </div>

                                )
                            }: null } 
                        /> 
                    }
                                     
                </Card>
                <Modal
                    width='1400px'
                    visible={virtualNode}
                    onCancel={()=>setVirtualNode(false)}
                    footer={null}
                    closable={false}
                    destroyOnClose={true}
                >
                    <CalcVirtualNode 
                        fieldAttrs={fieldAttrs}
                        selectedAttr={selectedAttr}
                        calcRuleList={calcRuleList}
                        dispatch={dispatch}
                        onClose={()=>setVirtualNode(false)}
                    />
                </Modal>

            </div>
        )
}

FieldGroup.propTypes = {
    
};

export default connect(({fields, fieldDevice}) => ({fields, fieldDevice}))(FieldGroup);
