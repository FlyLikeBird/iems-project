import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Row, Col, Table, Button, Card, Modal, Select, Spin, Switch, message, Popconfirm, Form, Skeleton, Input, Tag } from 'antd';
import { FireOutlined, DownloadOutlined, DoubleLeftOutlined, DoubleRightOutlined, PlusOutlined } from '@ant-design/icons'
import BillingForm from '../BillingForm';
import style from '@/pages/IndexPage.css';

const { Option } = Select;

const allTimeType = {
    1:'峰时段',
    2:'平时段',
    3:'谷时段',
    4:'尖时段'
};

function EleBilling({ dispatch, user, billing }){
    let { companyList, currentCompany, theme } = user;
    let { list, visible, is_actived, rateInfo } = billing;
    let [editingCost, toggleEditing] = useState(false);
    let [ form ] = Form.useForm();
    let borderColor = theme === 'dark' ? '#303463' : '#f0f0f0';
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'billing/reset'});
        }
    },[]);
    const columns = [
        {
            title: '季度',
            dataIndex: 'quarter_name'
        },
        {
            title: '月份',
            dataIndex: 'month',
            render:(value, row)=>{
                return <div>{`${row.begin_month}月-${row.end_month}月`}</div>
            }
        },
        {
            title: '时段',
            dataIndex: 'tel',
            render: (value, row, index) => {
                const renderNode = (
                    <div>
                        {
                            row.timeList.map((time,index)=>(
                                 <div className={style['item']} key={index}>{`${allTimeType[time.time_type]}: ${time.begin_time}点 - ${time.end_time}点`}</div>
                            ))
                        }
                    </div>
                )
                let obj = {
                    children:renderNode,
                    props:{ className : 'multi-table-cell' }
                }
                return obj;
            },
        },
        {
            title: '费率(元/kwh)',
            dataIndex: 'fee_rate',
            render: (value, row)=>{
                const renderNode = (
                    <div>
                        {
                            row.timeList.map((time,index)=>(
                                 <div className={style['item']} key={index}><span style={{color:'#1890ff'}}>{`${time.fee_rate}元`}</span></div>
                            ))
                        }
                    </div>
                )
                let obj = {
                    children:renderNode,
                    props:{ className : 'multi-table-cell' }
                }
                return obj;
            }
        },
        {
            title:'操作',
            dataIndex:'action',
            render:(value, row)=>{
                return (
                    <div>
                        <a onClick={()=>dispatch({type:'billing/toggleVisible', payload:{ visible:true, forEdit:true, prevItem:row}})}>编辑</a>
                        <Popconfirm title="确定删除此条计费规则吗?" onText="确定" cancelText="取消" onConfirm={()=>dispatch({type:'billing/delete', payload:row.quarter_id })}><a style={{margin:'0 10px'}}>删除</a></Popconfirm>
                    </div>
                )
            }
        }
    ]; 
    return (
        Object.keys(rateInfo).length 
        ?
            <div className={style['card-container']}>
                <div style={{ padding:'1rem', display:'flex' }}>
                    <div>
                        {/* <Button type="primary"  size="small" shape="round" style={{height:'22px',lineHeight:'20px', fontSize:'12px'}} onClick={() => dispatch({type:'billing/toggleVisible', payload:{visible:true}})}>添加计费规则</Button> */}
                        <span>目前状态:</span>
                        <Switch style={{marginLeft:'6px'}} checked={is_actived} checkedChildren="激活中" unCheckedChildren="激活计费" onChange={checked=>{
                            // new Promise((resolve, reject)=>{
                            //     dispatch({type:'billing/active', payload:{ resolve, reject }});
                            // })
                            // .then(()=>{
                            //     dispatch({type:'billing/toggleActive'})
                            // })
                            // .catch(msg=>{
                            //     message.error(msg);
                            // })
                        }} />
                    </div>
                    <div>
                        <span style={{ marginLeft:'20px', paddingRight:'20px', borderRight:`1px solid ${borderColor}` }}>
                            <span>计费类型:</span>
                            <Tag color='blue' style={{ marginLeft:'4px' }}>按{ +rateInfo.calc_type === 1 ? '需量' : '容量'}计费</Tag>
                        </span>
                    </div>
                    <div>
                        <span style={{ marginLeft:'20px', paddingRight:'20px', borderRight:`1px solid ${borderColor}` }}>
                            <span>变压器容量(kva):</span>
                            <span style={{color:'#1890ff', fontSize:'1.2rem', fontWeight:'bold', marginLeft:'4px' }}>{ Math.round(rateInfo.total_kva) }</span>                            
                        </span>
                    </div>
                    <div>
                        <span style={{ marginLeft:'20px', paddingRight:'20px', borderRight:`1px solid ${borderColor}` }}>
                            <span>容量基本电费单价(元/kva):</span>
                            <span style={{color:'#1890ff', fontSize:'1.2rem', fontWeight:'bold', marginLeft:'4px'  }}>{ Math.round(rateInfo.kva_price) }</span>                            
                        </span>
                    </div>
                    <div>
                        <span style={{ marginLeft:'20px', paddingRight:'20px' }}>
                            <span>需量基本电费单价(元/kw):</span>
                            <span style={{color:'#1890ff', fontSize:'1.2rem', fontWeight:'bold', marginLeft:'4px' }}>{ Math.round(rateInfo.demand_price) }</span>                            
                        </span>
                    </div>
                        {/* <Button type="primary" shape="round" size="small" onClick={()=>{
                            setFormVisile(true);
                        }}>设置计费信息</Button> */}
                    {/* <div className={style['input-container']}>
                        <Form 
                            layout="inline"
                            form={form}
                            onFinish={values=>{
                                values.rate_id = rateInfo.rate_id;
                                dispatch({type:'billing/editRate', payload:{ values }});
                                toggleEditing(false);
                            }}
                        >
                            <Form.Item label="变压器容量(KVA)" name="total_kva" >
                                { editingCost ? <Input size="small" style={{width:'100px'}}/> : <span style={{color:'#1890ff', fontSize:'1.4rem', fontWeight:'bold' }}>{ rateInfo.total_kva }</span>}
                            </Form.Item>
                            <Form.Item label="容量基本电费单价(元/KVA)" name="kva_price" >
                                { editingCost ? <Input size="small" style={{width:'100px'}}/> : <span style={{color:'#1890ff', fontSize:'1.4rem', fontWeight:'bold'  }}>{ rateInfo.kva_price }</span>}
                            </Form.Item>
                            <Form.Item label="需量基本电费单价(元/KW)" name="demand_price" >
                                { editingCost ? <Input size="small" style={{width:'100px'}}/> : <span style={{color:'#1890ff', fontSize:'1.4rem', fontWeight:'bold' }}>{ rateInfo.demand_price }</span>}
                            </Form.Item>
                            <Form.Item>

                                {
                                    editingCost
                                    ?
                                    <div>
                                        <Button type="primary" size="small" shape="round" htmlType="submit">确定</Button>
                                        <Button shape="round" size="small" onClick={()=>toggleEditing(false)} style={{marginLeft:'6px'}}>取消</Button>
                                    </div>
                                    :
                                    <Button type="primary" shape="round" size="small" onClick={()=>{
                                        form.setFieldsValue({
                                            total_kva:rateInfo.total_kva,
                                            kva_price:rateInfo.kva_price,
                                            demand_price:rateInfo.demand_price
                                        });
                                        toggleEditing(true);
                                    }}>设置计费</Button>
                                }
                            </Form.Item>
                        </Form>
                    </div>    */}
                </div>
                <Table
                    className={style['self-table-container']}
                    columns={columns}
                    dataSource={list}
                    bordered={true}
                    pagination={false}
                    rowKey="quarter_id"
                />
                <Modal
                    visible={visible}
                    footer={null}
                    width="50%"
                    destroyOnClose={true}
                    bodyStyle={{ padding:'40px'}}
                    closable={false}
                    onCancel={()=>dispatch({type:'billing/toggleVisible', payload:{ visible:false }})}
                >
                    <BillingForm />
                </Modal>
            </div>
        :
        <Skeleton active className={style['skeleton']} /> 
    )
};

EleBilling.propTypes = {
};

export default connect( ({ user, billing }) => ({ user, billing }))(EleBilling);