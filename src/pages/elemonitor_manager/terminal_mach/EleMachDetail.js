import React, { useState, useEffect, useRef } from 'react';
import { Modal, Spin, Switch, DatePicker } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import style from '../EleMonitor.css';
import IndexStyle from '@/pages/IndexPage.css';
import MachLineChart from './MachLineChart';
import moment from 'moment';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import PieChart from './PieChart';

const wrapperStyle = {
    width:'33.3%',
    height:'50%',
}
const contentStyle = {
    backgroundColor:'#3b5b85'
}
const infoStyle = {
    display:'inline-block',
    verticalAlign:'top',
    width:'33.3%',
    overflow:'hidden',
    textOverflow:'ellipsis',
    whiteSpace:'nowrap',
    fontSize:'0.8rem',
    color:'#fff'
}
function MachDetail({ dispatch, visible, currentMach, machLoading, data, theme }){
    const [referDate, setReferDate] = useState(moment(new Date()));
    const [modalVisible, setModalVisible] = useState(false);
    const inputRef = useRef();
    useEffect(()=>{
        dispatch({ type:'terminalMach/fetchMachDetail'});
    },[currentMach]);
    return (
        <div style={{ height:'100%'}}>
            <Modal 
                visible={modalVisible}
                onCancel={()=>setModalVisible(false)}
                okText='确定'
                cancelText='取消'
                onOk={()=>setModalVisible(false)}
            >
                <span>敏感操作请于管理员联系</span>
            </Modal>
            <div className={style['inline-container']}>
                <div className={style['inline-item-wrapper']} style={wrapperStyle}>
                    <div className={style['inline-item']} style={{ position:'relative' }}>
                        <div style={{ position:'absolute', right:'0', top:'0'}}>
                            <div style={{ display:'inline-flex', alignItems:'center' }}>
                                <div className={style['date-picker-button-left']} onClick={()=>{
                                    let temp = new Date(referDate.format('YYYY-MM-DD'));
                                    let result = moment(temp).subtract(1,'days');
                                    dispatch({ type:'terminalMach/fetchMachDetail', payload:{ referDate:result }});
                                    setReferDate(result);
                                }}><LeftOutlined /></div>
                                <DatePicker size='small' ref={inputRef} locale={zhCN} allowClear={false} value={referDate} onChange={value=>{
                                    dispatch({ type:'terminalMach/fetchMachDetail', payload:{ referDate:value }});
                                    setReferDate(value);
                                    if ( inputRef.current && inputRef.current.blur ) inputRef.current.blur();
                                }} />
                                <div className={style['date-picker-button-right']} onClick={()=>{
                                    let temp = new Date(referDate.format('YYYY-MM-DD'));
                                    let result = moment(temp).add(1,'days');
                                    dispatch({ type:'terminalMach/fetchMachDetail', payload:{ referDate:result }});
                                    setReferDate(result);
                                }}><RightOutlined /></div>
                            </div>
                        </div>
                        <div style={{ height:'70%', display:'flex', alignItems:'center' }}>
                            <div style={{ width:'40%' }}><img src={currentMach.img_path} style={{ width:'100%' }} /></div>
                            <div>
                                <div className={style['text-container']}>
                                    <span>编号:</span>
                                    <span className={style['text']}>{ currentMach.register_code || '-- --' }</span>
                                </div>
                                <div className={style['text-container']}>
                                    <span>支路:</span>
                                    <span className={style['text']}>{ currentMach.branch_name || '-- --' }</span>
                                </div>
                                <div className={style['text-container']}>
                                    <span>区域:</span>
                                    <span className={style['text']}>{ currentMach.region_name || '-- --' }</span>
                                </div>
                                <div className={style['text-container']}>
                                    <span>告警:</span>
                                    <span className={style['text']} style={{ color:'#ffa63f' }}>{ currentMach.rule_name || '-- --' }</span>
                                </div>
                                <div className={style['text-container']}>
                                    <span>合闸状态:</span>
                                    
                                    <span className={style['text']} style={{ color:'#ffa63f' }}>
                                        <span className={IndexStyle['tag-on']} style={{ background:'green' }}>合闸</span>
                                        <Switch defaultChecked checked={true}  onChange={()=>{
                                            setModalVisible(true);
                                        }} />
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div style={{ height:'30%', borderRadius:'6px', backgroundColor:'#04a3fe', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 6px' }}>
                            <div>
                                <span style={infoStyle}>
                                    <span>编号:</span>
                                    <span>{ currentMach.register_code }</span>
                                </span>
                                <span style={infoStyle}>
                                    <span>线电压:</span>
                                    <span>{ data.real_time ? Math.round(data.real_time.Ullavg) + 'V' : '-- --' }</span>
                                </span>
                                <span style={infoStyle}>
                                    <span>相电压:</span>
                                    <span>{ data.real_time ? Math.round(data.real_time.Uavg) + 'V' : '-- --' }</span>
                                </span>
                            </div>
                            <div>
                                <span style={infoStyle}>
                                    <span>支路:</span>
                                    <span>{ currentMach.branch_name || '-- --' }</span>
                                </span>
                                <span style={infoStyle}>
                                    <span>有功功率:</span>
                                    <span>{ data.real_time ? Math.round(data.real_time.P) + 'kw' : '-- --' }</span>
                                </span>
                                <span style={infoStyle}>
                                    <span>状态:</span>
                                    <span>{ data.is_outline ? '离线' : '在线' }</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={style['inline-item-wrapper']} style={wrapperStyle}>
                    <div className={style['inline-item']}>
                        <div className={style['inline-item-title']}>功率(kw)</div>
                        <div className={style['inline-item-content']}>
                            {
                                machLoading 
                                ?
                                <Spin className={style['spin']} size='large' />
                                :
                                <MachLineChart xData={data.view.date} yData={data.view.P} />
                            }
                        </div>
                    </div>
                </div>
                <div className={style['inline-item-wrapper']} style={wrapperStyle}>
                    <div className={style['inline-item']}>
                        <div className={style['inline-item-title']}>相电流(A)</div>
                        <div className={style['inline-item-content']}>
                            {
                                machLoading 
                                ?
                                <Spin className={style['spin']} size='large' />
                                :
                                <MachLineChart xData={data.view.date} yData={data.view.I1} y2Data={data.view.I2} y3Data={data.view.I3} multi={true} />
                            }
                        </div>
                    </div>
                </div>
                <div className={style['inline-item-wrapper']} style={wrapperStyle}>
                    <div className={style['inline-item']}>
                        <div className={style['inline-item-title']}>终端状态</div>
                        <div className={style['inline-item-content']}>
                            {
                                machLoading
                                ?
                                <Spin className={style['spin']} />
                                :
                                <PieChart data={data.warning_info} />
                            }
                        </div>
                        
                    </div>
                </div>
                <div className={style['inline-item-wrapper']} style={wrapperStyle}>
                    <div className={style['inline-item']}>
                        <div className={style['inline-item-title']}>相电压(V)</div>
                        <div className={style['inline-item-content']}>
                            {
                                machLoading 
                                ?
                                <Spin className={style['spin']} size='large' />
                                :
                                <MachLineChart xData={data.view.date} yData={data.view.U1} y2Data={data.view.U2} y3Data={data.view.U3} multi={true} />
                            }
                        </div>
                    </div>
                </div>
                <div className={style['inline-item-wrapper']} style={wrapperStyle}>
                    <div className={style['inline-item']}>
                        <div className={style['inline-item-title']}>功率因素(cosΦ)</div>
                        <div className={style['inline-item-content']}>
                            {
                                machLoading 
                                ?
                                <Spin className={style['spin']} size='large' />
                                :
                                <MachLineChart xData={data.view.date} yData={data.view.factor}/>
                            }

                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    )
}

export default MachDetail;