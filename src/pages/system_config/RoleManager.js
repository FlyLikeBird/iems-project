import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Drawer, Modal, Select, Button, Tree, message, Table  } from 'antd';
import style from '../IndexPage.css';

function formatTreeData(arr){
    if ( !arr || !arr.length ) return ;
    arr.forEach((item)=>{
        item.title = item.menu_name;
        item.key = item.menu_id;
        item.children = item.child;
        if(item.children && item.children.length){
            formatTreeData(item.children);
        }
    })
}

const { Option } = Select;

function RoleManager({ dispatch, user, userList }){
    const { companyList, currentCompany, userMenu } = user;
    const { roleList, currentRole, selectedKeys } = userList;
    const [visible, toggleVisible] = useState(false);
    formatTreeData(userMenu);
    let columns = [
        // {
        //     title:'ID',
        //     dataIndex:'role_id'
        // },
        {
            title:'角色类型',
            dataIndex:'role_name'
        },
        // {
        //     title:'创建时间',
        //     dataIndex:'create_time'
        // },
        {
            title:'操作',
            key:'action',
            render:(row)=>{
                return (
                    <div>
                        <a onClick={e=>{
                            dispatch({ type:'userList/fetchRolePermission', payload:{ currentRole:row }})
                            toggleVisible(true);
                        }}>权限设置</a>
                    </div>
                )
            }
        }
    ];
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'userList/resetRoleManager'})
        }
    },[])
    return (
        <div className={style['page-container']}>
            <div className={style['card-container']}>
                <Table
                    className={style['self-table-container']}
                    columns={columns}
                    dataSource={roleList}
                    rowKey="role_id"
                    bordered={true}
                    pagination={false}
                    // pagination={{current:+data.pageNum, total:+data.count}}
                    // onChange={(pagination)=>dispatch({type:'log/fetchLog', payload:{page:pagination.current, logType}})}
                />
                <Drawer
                    title="权限设置"
                    placement="right"
                    closable={false}
                    width="40%"
                    onClose={()=>toggleVisible(false)}
                    visible={ visible }
                    footer={(
                        <div style={{ padding:'10px' }}>
                            <Button type='primary' style={{ marginRight:'10px' }} onClick={()=>{
                                new Promise((resolve, reject)=>{
                                    dispatch({ type:'userList/editRolePermission', payload:{ currentRole, menu_data:selectedKeys, resolve, reject }})
                                })
                                .then(msg=>{
                                    message.info(msg);
                                    toggleVisible(false);
                                })
                                .catch(msg=>message.error(msg))
                            }}>确定</Button>
                            <Button onClick={()=>toggleVisible(false)}>取消</Button>
                        </div>
                    )}
                >   
                    <Tree
                        className={style['tree-container']}
                        checkable
                        checkStrictly
                        defaultExpandAll
                        treeData={userMenu}
                        checkedKeys={selectedKeys}
                        onCheck={( checkedKeys , { checkedNodes, node, checked })=>{
                            let temp = checkedKeys.checked;
                            if ( node.children ){
                                if ( checked ){
                                    temp = temp.concat(node.children.map(i=>i.key));
                                } else {
                                    node.children.map(i=>{
                                        let index = temp.indexOf(i.key);
                                        if ( index >= 0 ) temp.splice(index, 1);
                                    })
                                }
                            }
                            dispatch({ type:'userList/setPermission', payload:{ selectedKeys:temp }});
                        }}
                    />       
                </Drawer>
            </div>
            
        </div>
    )
}

export default connect(({ user, userList })=>({ user, userList }))(RoleManager);