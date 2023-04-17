import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Row, Col, Table, Button, Card, Modal, Select, Spin, Switch, message, Popconfirm, Form, Skeleton, Input, Tag } from 'antd';
import { FireOutlined, DownloadOutlined, DoubleLeftOutlined, DoubleRightOutlined, PlusOutlined } from '@ant-design/icons'
import RateForm from './RateForm';
import QuarterForm from './QuarterForm';
import BaseInfoForm from './BaseInfoForm';
import style from '@/pages/IndexPage.css';

const { Option } = Select;

const allTimeType = {
    1:'峰时段',
    2:'平时段',
    3:'谷时段',
    4:'尖时段'
};

function EleBilling({ rateList, rateInfo, tplList, dispatch, theme }){
    let [rateFormInfo, setRateFormInfo] = useState({ visible:false, current:null, forEdit:false });
    let [quarterFormInfo, setQuarterFormInfo] = useState({ visible:false, currentRate:null, currentQuarter:null });
    let [currentRate, setCurrentRate] = useState({});
    let [currentTpl, setCurrentTpl] = useState({});
    let [visible, setVisible] = useState(false);
   
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
                                 <div className={style['item']} key={index}>{`${allTimeType[time.time_type]}: ${time.begin_time}时 - ${time.end_time}时`}</div>
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
            render:(row)=>{
                return (
                    <div>
                        <a onClick={()=>setQuarterFormInfo({ visible:true, currentRate:{ rate_id:row.rate_id }, currentQuarter:row })}>编辑</a>
                        <Popconfirm title="确定删除此条计费规则吗?" onText="确定" cancelText="取消" onConfirm={()=>{
                            new Promise((resolve, reject)=>{
                                dispatch({ type:'billing/delQuarterAsync', payload:{ quarter_id:row.quarter_id, resolve, reject }})
                            })
                            .then(()=>message.success('删除计费规则成功'))
                            .catch(msg=>message.error(msg))
                        }}><a style={{margin:'0 10px'}}>删除</a></Popconfirm>
                    </div>
                )
            }
        }
    ]; 
    return (
        Object.keys(rateInfo).length 
        ?
        <div style={{ height:'100%', position:'relative' }}>
            <div style={{ display:'flex', alignItems:'center', margin:'1rem 2rem', color:theme === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.85)' }}>
                <Button type='primary' style={{ marginRight:'0.5rem' }} onClick={()=>setRateFormInfo({ visible:true, current:null, forEdit:false })}>添加方案</Button>
                {/* <Button type='primary' style={{ marginRight:'1rem' }} onClick={()=>setVisible(true)}>设置计费</Button> */}
                {/* <span>目前状态:</span>
                <Switch style={{marginLeft:'6px'}} checked={is_actived} checkedChildren="激活中" unCheckedChildren="激活计费" onChange={checked=>{
                    new Promise((resolve, reject)=>{
                        dispatch({type:'billing/active', payload:{ resolve, reject }});
                    })
                    .then(()=>{
                        dispatch({type:'billing/toggleActive'})
                    })
                    .catch(msg=>{
                        message.error(msg);
                    })
                }} /> */}
                <span>计费类型:</span>
                <Tag color='blue' style={{ margin:'0 6px 0 4px' }}>按{ +rateInfo.calc_type === 1 ? '需量' : '容量'}计费</Tag>
                <span>变压器容量(kva):</span>
                <span style={{color:'#1890ff', fontSize:'1.2rem', fontWeight:'bold', marginLeft:'4px', marginRight:'1rem' }}>{ Math.round(rateInfo.total_kva) }</span>
                <span>容量基本电费单价(元/kva):</span>
                <span style={{color:'#1890ff', fontSize:'1.2rem', fontWeight:'bold', marginLeft:'4px', marginRight:'1rem'  }}>{ Math.round(rateInfo.kva_price) }</span>
                <span>需量基本电费单价(元/kw):</span>
                <span style={{color:'#1890ff', fontSize:'1.2rem', fontWeight:'bold', marginLeft:'4px', marginRight:'1rem' }}>{ Math.round(rateInfo.demand_price) }</span>
            </div>
            <div>
                {
                    rateList.length 
                    ?
                    rateList.map((item,i)=>(
                        <div key={i} className={style['card-container']} style={{ margin:'1rem 2rem', background:theme === 'dark' ? '#22264b' : '#f0f0f0' }}>
                            <div className={style['card-title']} style={{ color: theme === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.85)'}}>
                                {
                                    item.front_type === 1 
                                    ?
                                    <div><span>{ item.rate_name }</span></div>
                                    :
                                    <div>
                                        <span style={{ marginRight:'1rem' }}>{ item.rate_name }</span>
                                        <span style={{ marginRight:'1rem' }}>城市: { item.front_city_name || '--' }</span>
                                        <span style={{ marginRight:'1rem' }}>温度阈值: { item.front_type === 2 ? '>= ' : item.front_type === 3 ? '<=' : '' } { item.front_value }</span>
                                        {/* <span style={{ marginRight:'1rem' }}>优先级 { item.order_by }</span> */}
                                    </div>
                                }                       
                                <div>
                                    {/* <span style={{ color:'#1890ff', marginRight:'0.5rem', cursor:'pointer' }} onClick={()=>{
                                        dispatch({ type:'billing/getTplAsync', payload:{ rate_id:item.rate_id }});
                                        setCurrentRate(item);
                                    }}>获取计费模板</span> */}
                                    <span style={{ color:'#1890ff', marginRight:'0.5rem', cursor:'pointer' }} onClick={()=>{
                                        // dispatch({ type:'billing/applyTplAsync', payload:{ rate_id:item.rate_id, tpl_id:7 }});
                                        setCurrentRate(item);
                                        dispatch({ type:'billing/getTplAsync', payload:{ rate_id:item.rate_id }});
                                    }}>获取模板</span>

                                    <span style={{ color:'#1890ff', marginRight:'0.5rem', cursor:'pointer' }} onClick={()=>setQuarterFormInfo({ visible:true, currentRate:item, currentQuarter:null })}>添加规则</span>
                                    <span style={{ color:'#1890ff', marginRight:'0.5rem', cursor:'pointer' }} onClick={()=>setRateFormInfo({ visible:true, current:item, forEdit:true })}>编辑</span>
                                    <Popconfirm title="确定删除此方案吗?" onText="确定" cancelText="取消" onConfirm={()=>{
                                        new Promise((resolve, reject)=>{
                                            dispatch({ type:'billing/delRateAsync', payload:{ rate_id:item.rate_id, resolve, reject }})
                                        })
                                        .then(()=>message.success(`删除${item.rate_name}成功`))
                                        .catch(msg=>message.error(msg))
                                    }}><span style={{ color:'#1890ff', marginRight:'0.5rem', cursor:'pointer' }}>删除</span></Popconfirm>
                                    
                                </div>
                            </div>
                            <div className={style['card-content']}>
                                <Table
                                    className={style['self-table-container']}
                                    style={{ padding:'0' }}
                                    columns={columns}
                                    dataSource={item.quarterList.map(i=>({ ...i, rate_id:item.rate_id}))}
                                    pagination={false}
                                    locale={{
                                        emptyText:<div style={{ margin:'1rem 2rem', fontSize:'0.8rem' }}>还没有添加计费规则</div>
                                    }}
                                    rowKey="quarter_id"
                                /> 
                            </div>
                        </div>
                    ))
                    :
                    null
                }
            </div>
            <Modal
                visible={rateFormInfo.visible}
                footer={null}
                width="40%"
                destroyOnClose={true}
                bodyStyle={{ padding:'40px'}}
                onCancel={()=>setRateFormInfo({ visible:false, current:null, forEdit:false })}
                >
                <RateForm
                    dispatch={dispatch}
                    info={rateFormInfo}                    
                    onClose={()=>setRateFormInfo({ visible:false, current:null, forEdit:false })}
                />
            </Modal>
            <Modal
                visible={quarterFormInfo.visible}
                footer={null}
                width="50%"
                destroyOnClose={true}
                bodyStyle={{ padding:'40px'}}
                closable={false}
                onCancel={()=>setQuarterFormInfo({ visible:false, currentRate:null, currentQuarter:null })}
            >
                <QuarterForm 
                    info={quarterFormInfo} 
                    dispatch={dispatch} 
                    onClose={()=>setQuarterFormInfo({ visible:false, currentRate:null, currentQuarter:null })} 
                />    
            </Modal>
            <Modal
                visible={visible}
                footer={null}
                width="40%"
                destroyOnClose={true}
                bodyStyle={{ padding:'40px'}}
                closable={false}
                onCancel={()=>setVisible(false)}
            >
                <BaseInfoForm dispatch={dispatch} info={rateInfo} onClose={()=>setVisible(false)}/>   
            </Modal>
            <Modal
                visible={currentRate.rate_id ? true : false }
                width="40%"
                destroyOnClose={true}
                bodyStyle={{ padding:'40px'}}
                onCancel={()=>setCurrentRate({})}
                cancelText='取消'
                okText='应用模板'
                onOk={()=>{
                    if ( currentTpl.tpl_id ){
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'billing/applyTplAsync', payload:{ rate_id:currentRate.rate_id, tpl_id:currentTpl.tpl_id, resolve, reject }})
                        })
                        .then(()=>{
                            message.success(`应用${currentTpl.tpl_name}成功`);
                            setCurrentRate({});
                        })
                        .catch(msg=>message.error(msg));
                    } else {
                        message.info('请选择要应用的模板');
                    }
                }}
            >
                <Select style={{ width:'320px' }} value={currentTpl.tpl_id} onChange={value=>{
                    let temp = tplList.filter(i=>i.tpl_id === value )[0];
                    setCurrentTpl(temp);
                }}>
                    {
                        tplList.map((item,i)=>(
                            <Option key={item.tpl_id} value={item.tpl_id}>{ item.tpl_name } </Option>
                        ))
                    }
                </Select>
            </Modal>
        </div>                
        :
        <Skeleton active className={style['skeleton']} /> 
    )
};


export default React.memo(EleBilling);

