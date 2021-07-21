import React, { useState } from 'react';
import { connect } from 'dva';
import { Button, Input, Popconfirm, Form, message } from 'antd';
import style from '../IndexPage.css';
import IncomingTable from './components/IncomingTable';

function IncomingLineManager({ dispatch, incoming }){
    const [editing, setEditing] = useState(false);
    const [name, setName]= useState('');
    const [value, setValue] = useState('');
    const { incomingList } = incoming;
    
    return (
            <div className={style['page-container']}>
                <div className={style['card-container']}>
                    <div style={{ padding:'1rem' }}>
                        {
                            editing
                            ?
                            <div className={style['button-container']}>
                                <Input
                                    style={{ marginRight:'10px' }}  
                                    placeholder='请输入进线名称'
                                    onChange={e=>setName(e.target.value)}
                                    />
                                <Input
                                    style={{ marginRight:'10px' }}  
                                    placeholder='请输入变压器容量'
                                    onChange={e=>setValue(e.target.value)}
                                />
                                <Button type="primary" onClick={()=>{
                                    if ( !name ){
                                        message.info('进线名称不能为空');
                                        return;
                                    }
                                    if ( !value ){
                                        message.info('变压器容量不能为空');
                                        return;
                                    }
                                    if ( typeof (+value) === 'number' && +value !== +value ) {
                                        message.info('请输入合理的数值');
                                        return ;
                                    }
                                    new Promise((resolve, reject)=>{
                                        dispatch({type:'incoming/addIncoming', payload:{ name, value, resolve, reject }});

                                    })
                                    .then(()=>{
                                        setEditing(false);
                                        setName('');
                                        setValue('');
                                    })
                                    .catch(msg=>{
                                        message.info(msg);
                                    })

                                }}>确定</Button>
                                <Button onClick={()=>setEditing(false)}>取消</Button>
                            </div>
                            :
                            <Button type='primary' onClick={()=>setEditing(true)}>添加进线</Button>
                        }                  
                    </div>
                    <IncomingTable data={incomingList} onDispatch={action=>dispatch(action)} />
                </div>               
            </div>
    )
}

export default connect(({ incoming })=>({ incoming }))(IncomingLineManager);