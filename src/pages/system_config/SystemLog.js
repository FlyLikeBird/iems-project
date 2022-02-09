import React, { Component, useState, useEffect } from 'react';
import { connect } from 'dva';
import { Tabs, Table } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined, RadarChartOutlined, CloseOutlined } from '@ant-design/icons';
import style from '../IndexPage.css';
const { TabPane } = Tabs;

const SystemLog = ({dispatch, log, user}) => {
    const { logData, isLoading } = log;
    const { companyList, userInfo, pagesize } = user;
    const [logType, toggleLogType] = useState('login');
    const [pageNum, setPageNum] = useState(1);
    const columns = [
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return `${ ( pageNum - 1) * pagesize + index + 1}`;
            }
        },
        {
            title:'日志类型',
            dataIndex:'log_type',
            render:(text)=>(
                <span>{ text == '1' ? '操作日志' : '登录日志'}</span>
            )
        },
        {
            title:'登录用户',
            dataIndex:'action_user'
        },
        {
            title:'登录IP',
            dataIndex:'ip',
        },
        // {
        //     title:'所属公司',
        //     dataIndex:'company_id',
        //     render:(text)=>{
        //         let filterCompany = companyList.filter(i=>i.company_id == text)[0];
        //         return <div>{ filterCompany ? filterCompany.company_name : '' }</div>
        //     }
        // },
        {
            title:'操作行为',
            dataIndex:'action_desc'
        },
        {
            title:'登录时间',
            dataIndex:'action_time'
        }
    ];
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'log/reset'})
        }
    },[]);
    useEffect(()=>{
        setPageNum(1);
    },[pagesize])
    return (
        <div className={style['page-container']}>
            <div className={style['card-container']}>
                <Tabs activeKey={logType} className={style['custom-tabs']} onChange={activeKey=>{
                    toggleLogType(activeKey);                 
                    dispatch({type:'log/fetchLog', payload:{ logType:activeKey, page:1 }});
                    setPageNum(1);
                }}>
                    <TabPane key='login' tab='登录日志'>
                        <Table
                            columns={columns}
                            dataSource={logData.logs || []}
                            className={style['self-table-container']}
                            rowKey="log_id"
                            loading={isLoading}
                            bordered={true}
                            pagination={{current:pageNum, total:+logData.count, pageSize:pagesize, showSizeChanger:false }}
                            onChange={(pagination)=>{
                                dispatch({type:'log/fetchLog', payload:{page:pagination.current, logType}});
                                setPageNum(pagination.current);
                                
                            }}
                        />
                    </TabPane>
                    <TabPane key='action' tab='操作日志'>
                        <Table
                            columns={columns}
                            dataSource={logData.logs || []}
                            rowKey="log_id"
                            className={style['self-table-container']}
                            loading={isLoading}
                            bordered={true}
                            pagination={{current:pageNum, total:+logData.count, pageSize:pagesize, showSizeChanger:false }}
                            onChange={(pagination)=>{
                                dispatch({type:'log/fetchLog', payload:{page:pagination.current, logType}});
                                setPageNum(pagination.current);
                            }}
                        />
                    </TabPane>
                </Tabs>
            </div>
        </div>
    )
    
}

SystemLog.propTypes = {
};

export default connect(({ log, user })=>({ log, user }))(SystemLog);
