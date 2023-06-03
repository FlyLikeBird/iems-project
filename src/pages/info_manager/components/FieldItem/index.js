import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Table, Button, Modal, Card, Select, Popconfirm, Form, Input, Tooltip, message } from 'antd';
import { EditOutlined, SettingOutlined, CloseOutlined, BranchesOutlined, EnvironmentOutlined, ThunderboltOutlined, HomeOutlined, CompassOutlined, SaveOutlined  } from '@ant-design/icons';
import style from '../../../IndexPage.css';

const { Option } = Select;

const FieldItemIcons = {
    1:<BranchesOutlined />,
    2:<EnvironmentOutlined />,
    3:<ThunderboltOutlined />,
    4:<HomeOutlined />,
    5:<CompassOutlined />
}

function FieldItem({ dispatch, field, theme, onSelect }){
    let borderColor = theme === 'dark' ? '#303463' : '#f0f0f0';
    const inputRef = useRef();
    let [editing, toggleEditing] = useState(false);
    let [value, changeValue] = useState(field.field_name);
    const [visible, setVisible] = useState(false);
    const handleEdit = (field) => {
        let { field_id, field_type } = field;
        new Promise((resolve, reject)=>{
            dispatch({type:'fieldDevice/edit', payload:{ field_name:value, field_id, field_type, resolve, reject }});
        })
        .then(()=>{
            toggleEditing(false);
        })
        .catch(msg=>{
            message.info(msg);
        })
    };

    useEffect(()=>{
        if ( editing && inputRef.current ) {
            inputRef.current.focus();
        }
    },[editing])
    return ( 
        <div className={style['card-container-wrapper']} style={{ width:'auto', height:'auto' }}>
            <div className={style['card-container']} style={{ width:'300px', height:'180px', border:`1px solid ${borderColor}`, overflow:'hidden' }}>
                <div style={{ height:'120px', lineHeight:'120px', textAlign:'center' }}>
                {
                    editing
                    ?
                    <span><Input ref={inputRef} size="small" value={value} onChange={(e)=>changeValue(e.target.value)} onPressEnter={()=>handleEdit(field)} /></span>
                    :
                    <span className={style['data']}>{ FieldItemIcons[field.field_type]} { field.field_name}</span>
                }
                </div>
                <div style={{ height:'60px', lineHeight:'60px'}}>
                    {
                        editing
                        ?
                        <div style={{ display:'flex', height:'60px', alignItems:'center', backgroundColor:borderColor}}>
                            <Button style={{ flex:'1', margin:'0 1rem' }} size="small" type="primary" onClick={()=>handleEdit(field)}>确定</Button>
                            <Button style={{ flex:'1', margin:'0 1rem' }} size="small" onClick={()=>toggleEditing(false)}>取消</Button>
                        </div>
                        :
                        <div style={{ display:'flex', height:'60px', alignItems:'center', backgroundColor:borderColor}}>
                            <Tooltip title='设置属性'><SettingOutlined style={{ flex:'1' }} key="setting" onClick={()=>{
                                dispatch({type:'fieldDevice/toggleField', payload : { visible:true, field }});
                                new Promise((resolve, reject)=>{
                                    dispatch({ type:'fields/fetchFieldAttrs', passField:field, resolve, reject })
                                })
                                .then(()=>{
                                    dispatch({type:'fieldDevice/fetchAttrDevice'});
                                    dispatch({ type:'fieldDevice/fetchCalcRule'});
                                })
                            }}/></Tooltip>
                            <Tooltip title='编辑'><EditOutlined style={{ flex:'1' }} key="edit" onClick={ () => toggleEditing(true)}/></Tooltip>
                            <Tooltip title='查看备份'><SaveOutlined style={{ flex:'1' }} key='save' onClick={()=>onSelect(field)} /></Tooltip>
                            <Popconfirm key="del" title="确定要删除吗?" okText="确定" cancelText="取消" onConfirm={()=>{
                                new Promise((resolve, reject)=>{
                                    dispatch({type:'fieldDevice/delete', payload:{ field_id:field.field_id, resolve, reject }})
                                })
                                .then(()=>{

                                })
                                .catch(msg=>{
                                    message.info(msg);
                                })
                            }}><CloseOutlined style={{ flex:'1' }} key="delete" /></Popconfirm>
                        </div>
                    }
                </div>
            </div>
        </div>         
    )
    
}

FieldItem.propTypes = {
};

export default FieldItem;
