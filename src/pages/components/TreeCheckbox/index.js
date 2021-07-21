import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Spin } from 'antd';
import CheckboxItem from './CheckboxItem';
import style from './Checkbox.css';

const TreeCheckbox = ({dispatch, permission, user }) => {
    let { userMenu } = user;
    let { selectedMenu, isLoading } = permission; 
    return (
        <div>
            <div className={style.container}>
                {   
                    isLoading 
                    ?
                    <Spin />
                    :
                    userMenu && userMenu.length
                    ?
                    userMenu.map(item=>(
                        <CheckboxItem menu={item} key={item.menu_id} selectedMenu={selectedMenu} onAdd={( payload )=>{
                            dispatch({type:'permission/changePermission', payload });
                        }}/>
                    ))
                    :
                    '没有任何权限'
                }
            </div>
            <Button type="primary" onClick={()=>dispatch({type:'permission/set'})}>确定</Button>
            <Button style={{margin:'0 10px'}} onClick={()=>dispatch({type:'permission/toggleVisible', payload:{ visible:false, user_id:'' }})}>取消</Button>
        </div>
    )
}
    
export default connect(({permission, user}) => ({ permission, user }))(TreeCheckbox);