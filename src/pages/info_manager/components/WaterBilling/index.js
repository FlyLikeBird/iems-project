import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Button, Input, message, Tag } from 'antd';
import style from '@/pages/IndexPage.css';

function WaterBilling({ energyInfo, feeRate, dispatch }){
    const [value, setValue] = useState('');
    const [editing, toggleEditing] = useState(false);
    const inputRef = useRef();
    useEffect(()=>{
        setValue( feeRate && feeRate[energyInfo.type_code] ? feeRate[energyInfo.type_code].price : 0 );
    },[feeRate]);
    useEffect(()=>{
        if ( editing ){
            inputRef.current.focus();
        }
    },[editing])
    return (
        <div className={style['card-container']} style={{ padding:'2rem 1rem' }}>           
                <div>
                    <span>{ '当前' + energyInfo.type_name + '费率 : ' }</span>
                    {
                        editing
                        ?
                        <Input ref={inputRef} style={{ width:'240px', margin:'0 10px 0 4px' }} value={value} onChange={e=>setValue(e.target.value)}/>
                        :
                        <span style={{color:'#1890ff', fontSize:'1.2rem', fontWeight:'bold', marginLeft:'4px' }}>{ feeRate && feeRate[energyInfo.type_code] ? feeRate[energyInfo.type_code].price : '-- --'}</span>
                    }
                    <span style={{ margin:'0 0.5rem'}}>{ '元' + '/' + energyInfo.unit }</span>
                </div>
                {
                    editing 
                    ?
                    <div style={{ padding:'1rem 0'}}>
                        <Button type='primary' onClick={()=>{
                            if ( value && value >= 0 ) {
                                new Promise((resolve, reject)=>{
                                    dispatch({ type:'billing/setFeeRate', payload:{ type:energyInfo.type_code, resolve, reject, water_rate:value }});
                                })
                                .then(()=>{
                                    message.info('设置' + energyInfo.type_name + '费率成功');
                                    toggleEditing(false);
                                })
                                .catch(msg=>message.info(msg))
                            } else {
                                message.info('请输入合适的' + energyInfo.type_name + '费率' );
                            }
                        }}>确定</Button>
                        <Button style={{ marginLeft:'6px' }} onClick={()=>toggleEditing(false)}>取消</Button>
                    </div>
                    :
                    <div style={{ padding:'1rem 0'}}><Button type='primary' onClick={()=>{
                        toggleEditing(true);
                    }}>设置</Button></div>
                }
                    
        </div>                        
    )
}

export default React.memo(WaterBilling);