import React, { useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, DatePicker, Select, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined  } from '@ant-design/icons';
import ColumnCollapse from '../../components/ColumnCollapse';
import CountUp from 'react-countup';
import DemandCostChart from './components/DemandCostChart';
import DemandCostTable from './components/DemandCostTable';
import style from './DemandManager.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
const { Option } = Select;

function format(dateStr){
    return dateStr.substring(5,dateStr.length);
}

function DemandCost({ dispatch, demand }) {
    const { energyList, energyInfo, machList, currentMach, costInfo, beginTime, endTime, treeLoading } = demand;
    const [timeMode, setTimeMode] = useState('past_week');
    const [showMode, setShowMode] = useState('cost');
    const sidebar = (
        <div>
            <Card title="能耗类别" className='card-container'>
                <Radio.Group value={energyInfo.type_id} onChange={e=>{
                    dispatch({type:'demand/toggleEnergyType', payload:e.target.value });
                }}>
                    {
                        energyList.map(item=>(
                            <Radio.Button key={item.type_id} value={item.type_id}>{item.type_name}</Radio.Button>
                        ))
                    }
                </Radio.Group>                                                        
            </Card>
            <Card title="统计对象" className='card-container' >              
                {
                    treeLoading
                    ?
                    <Spin />
                    :
                    <Tree
                        defaultExpandAll={true}
                        defaultSelectedKeys={[currentMach.key]}
                        treeData={machList}
                        onSelect={(selectedKeys, {node})=>{
                            dispatch({type:'demand/selectMach', payload:node });
                            dispatch({type:'demand/fetchCost'});
                        }}
                    />
                }                           
            </Card>
        </div>
    );
    const content = (
        <div className={style['container']}>
            <Card title={
                <div className='card-title'>
                    <div>报告类型</div>
                    <Radio.Group buttonStyle='solid' value={showMode} onChange={e=>setShowMode(e.target.value)} >
                        <Radio.Button value='cost'>成本</Radio.Button>
                        <Radio.Button value='energy'>能耗</Radio.Button>
                    </Radio.Group>
                </div>
            } className='card-container'>
                <div className={style['top-container']} style={{ margin:'0', border:'none', textAlign:'left', borderBottom:'1px solid #f0f0f0' }}>
                    <div className={style['right']}>
                        <div className={style['info-item']}>
                            <div className={style['info-title']}>显示时间段</div>
                            <div className={style['info-text']}>
                                <Select value={timeMode} onChange={value=>{
                                    let beginTime;
                                    if ( value === 'past_week' ) {
                                        beginTime = moment().subtract(7,'days');
                                    } else if ( value === 'past_month') {
                                        beginTime = moment().subtract(30,'days');
                                    } else if ( value === 'past_3_month'){
                                        beginTime = moment().subtract(90,'days');
                                    }
                                    setTimeMode(value);
                                    dispatch({type:'demand/setTimePeriod', payload:{ beginTime, endTime } })
                                    dispatch({type:'demand/fetchCost'});
                                }} >
                                    <Option value='past_week'>过去一周</Option>
                                    <Option value='past_month'>过去一个月</Option>
                                    <Option value='past_3_month'>过去三个月</Option>
                                </Select>
                            </div>                           
                        </div>
                    </div>
                    <div className={style['right']}>
                        <div className={style['info-item']}>
                            <div className={style['info-title']}>报告时间起</div>
                            <div className={style['info-text']}>
                                <DatePicker value={beginTime} locale={zhCN}  allowClear={false} onChange={moment=>{
                                    dispatch({type:'demand/setTimePeriod', payload:{ beginTime:moment }});
                                    dispatch({type:'demand/fetchCost'});
                                }} />
                            </div>                           
                        </div>
                    </div>
                    <div className={style['right']}>
                        <div className={style['info-item']}>
                            <div className={style['info-title']}>报告时间止</div>
                            <div className={style['info-text']}>
                                <DatePicker value={endTime} locale={zhCN} allowClear={false} onChange={moment=>{
                                    dispatch({type:'demand/setTimePeriod', payload:{ endTime:moment }});
                                    dispatch({type:'demand/fetchCost'});
                                }}/>
                            </div>                           
                        </div>
                    </div>
                </div>
                
            </Card>
            {/*  用户需量图表 */}
            <div style={{ height:'300px'}}>
                <DemandCostChart data={costInfo} showMode={showMode} />
                { 
                    costInfo && costInfo.date 
                    ?
                    <DemandCostTable data={costInfo} />
                    :
                    <Skeleton active />
                }
                
            </div>
        </div>
    );
   
    return (  
        <ColumnCollapse sidebar={sidebar} content={content} />
    );
}

export default connect(({ demand })=>({ demand }))(DemandCost);
