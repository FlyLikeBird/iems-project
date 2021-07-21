import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Radio, Spin, Skeleton, Tooltip, message, DatePicker } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, AlertFilled } from '@ant-design/icons';
import FullScreen from '../../../components/FullScreen';
import InfoItem from './components/InfoItem';
import AlarmSumChart from './components/AlarmSumChart';
import AlarmPieChart from './components/AlarmPieChart';
import AlarmDetailTable from './components/AlarmDetailTable';
import AlarmDetailChart from './components/AlarmDetailChart';
import style from './AlarmMonitor.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import { translateObj } from '../../../utils/translateObj';

const { RangePicker } = DatePicker;
// const warningColors = {
//     'total':'#2c3b4d',
//     'ele':'#ff7862',
//     'limit':'#62a4e2',
//     'link':'#65cae3'
// };
const warningColors = {
    'total':'#ff7862',
    'ele':'#198efb',
    'limit':'#29ccf4',
    'link':'#58e29f'
};

function AlarmDetail({ dispatch, user, alarm }){ 
    const { sumInfo, detailInfo, sumList, detailList, startTime, endTime } = alarm;
    const containerRef = useRef();
    const [timeType, setTimeType] = useState('month');
    // console.log(detailList);
    return (
        <div className={style['container']}>
            {/* 时间筛选和告警汇总信息 */}
            <div className={style['operation-container']}>
                <div>
                    <span>选择时间:</span>
                    <RangePicker style={{ marginLeft:'10px' }} locale={zhCN} allowClear={false} value={[startTime, endTime]} onChange={(momentArr)=>{
                        dispatch({type:'alarm/setDate', payload:{ moment:momentArr }});
                        dispatch({type:'alarm/fetchSumInfo'});
                    }} />
                    <Radio.Group style={{ marginLeft:'20px' }} buttonStyle="solid" value={timeType} onChange={e=>{
                        let startDate, endDate;
                        let date = new Date();
                        if ( e.target.value === 'month') {
                            startDate = moment(1,'DD');
                            endDate = moment(date.getDate(),'DD');
                        } else {
                            startDate = moment(1,'MM');
                            endDate = moment(date.getDate(),'DD');
                        
                        }
                        dispatch({type:'alarm/setDate', payload:{ moment:[startDate, endDate]}});
                        dispatch({type:'alarm/fetchSumInfo'});
                        setTimeType(e.target.value);
                    }}>
                        
                        <Radio.Button key='0' value='month'>本月</Radio.Button>
                        <Radio.Button key='1' value='year'>本年</Radio.Button>
                    </Radio.Group>
                </div>
                <div className={style['warning-container']} >
                    {
                        sumList && sumList.length ?
                        sumList.map((item,index)=>(
                            <div key={item.type} style={{ backgroundColor:warningColors[item.type]}} onClick={()=>{
                                dispatch(routerRedux.push({
                                    pathname:'/alarm_manage/alarm_execute',
                                    query:item.type
                                }))
                            }}>
                                <div className={style['icon']}><AlertFilled /></div>
                                <div>
                                    <div>{ item.text }</div>
                                    <div className={style['num']}>{ item.count ? item.count : 0 }条</div>
                                </div>
                            </div>
                        )) : null
                    }
                </div>
            </div>
            {/* 滚动的内容区 */}
            <div className={style['content-container']} >                    
                <div className={style['chart-container']} style={{ width:'50%' }}>
                    <div className={style['chart']}> 
                        {
                            sumInfo && sumInfo.view 
                            ?
                            <AlarmSumChart data={sumInfo.view} warningColors={warningColors} /> 
                            :
                            <Skeleton active />
                        }
                    </div>
                </div>
                <div className={style['chart-container']} style={{ width:'50%' }}>
                    <div className={style['chart']}>
                        <div className={style['title']} style={{ textAlign:'center' }}>告警事件处理进度</div>
                        <div className={style['content']}>
                            {
                                sumInfo && sumInfo.view
                                ?
                                <AlarmPieChart data={sumInfo.codeArr} totalInfo={sumList}  warningColors={warningColors} />
                                :
                                <Skeleton active />
                            }
                        </div>
                    </div>
                </div>
                {/* 告警详情--图表区(获取图表的最高高度，统一高度) */}
                <div style={{ margin:'10px 0'}}>
                    {
                        detailInfo && detailInfo.detail 
                        ?
                        detailList.map((item,index)=>(
                            <div className={style['chart-container']} key={index} style={ index === 0 ? { width:'25%', height:'400px', overflowY:'scroll', overflowX:'hidden'} : { width:'25%', height:'400px' }}>
                                <div className={style['chart']}>
                                {
                                    index === 0 ?
                                    <AlarmDetailTable data={item} /> 
                                    :
                                    item && item.length 
                                    ?
                                    <AlarmDetailChart data={item} warningColors={warningColors} />
                                    :
                                    <div style={{
                                        position:'absolute',
                                        top:'50%',
                                        left:'50%',
                                        transform:'translate(-50%, -50%)',
                                        fontSize:'1.2rem',
                                        fontWeight:'bold'
                                    }}>{ `暂时没有${sumList[index].text}`}</div>
                                }
                                </div>
                            </div>
                        )):null
                    }
                </div>
                
            </div>
            
        </div>
    )
}

export default connect(({ user, alarm })=>({ user, alarm }))(AlarmDetail);
