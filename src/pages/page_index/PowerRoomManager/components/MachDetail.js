import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Spin, DatePicker, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import style from '../PowerRoom.css';
import IndexStyle from '../../../IndexPage.css';
import moment from 'moment';
import LineChart from './LineChart';
import PieChart from './PieChart';
import zhCN from 'antd/es/date-picker/locale/zh_CN';

function getRandomData(arr){
    let result = [];
    for(var i=0;i<arr.length;i++){
        result.push(Math.random()*100 + 50 );
    }
    return result;
}
function MachDetail({ dispatch, currentMach, machDetail, machLoading }){
    const [date, setDate] = useState(moment(new Date()));
    let isPhaseU = machDetail.real_time && +machDetail.real_time.Uavg > 0 ? true : false;
    useEffect(()=>{
        dispatch({ type:'powerRoom/fetchMachDetail', payload:{ mach_id:currentMach.mach_id, date_time:date }});
        return ()=>{
            dispatch({ type:'powerRoom/clearMachDetail'});
        } 
    },[])
    return (
        Object.keys(machDetail).length 
        ?
        <div style={{ width:'100%', height:'100%', padding:'20px 0 0 20px'}}>
            <div className={style['inline-item-container-wrapper']} style={{ width:'33.3%', height:'50%'}}>
                <div className={style['inline-item-container']} style={{ display:'block', backgroundColor:'#fff' }}>
                    {/* 日期筛选和返回button */}
                    <div style={{ position:'absolute', right:'0', top:'0', zIndex:'10'}}>
                        <div style={{ display:'inline-flex'}}>
                            <div className={IndexStyle['date-picker-button-left']} onClick={()=>{
                                let temp = new Date(date.format('YYYY-MM-DD'));
                                let result = moment(temp).subtract(1,'days');
                                dispatch({ type:'powerRoom/fetchMachDetail', payload:{ mach_id:currentMach.mach_id, date_time:result }});
                                setDate(result);
                            }}><LeftOutlined /></div>
                            <DatePicker size='small' locale={zhCN} allowClear={false} value={date} onChange={moment=>{
                                dispatch({ type:'powerRoom/fetchMachDetail', payload:{ mach_id:currentMach.mach_id, date_time:moment }});
                                setDate(moment);
                            }} />
                            <div className={IndexStyle['date-picker-button-right']} onClick={()=>{
                                let temp = new Date(date.format('YYYY-MM-DD'));
                                let result = moment(temp).add(1,'days');
                                dispatch({ type:'powerRoom/fetchMachDetail', payload:{ mach_id:currentMach.mach_id, date_time:result }});
                                setDate(result);
                            }}><RightOutlined /></div>
                        </div>
                        
                    </div>
                    <div style={{ position:'absolute', left:'0', top:'0', fontWeight:'bold' }}>
                        <span>{ machDetail.mach ? machDetail.mach.model_desc : '' }</span>
                    </div>
                    <div style={{ height:'70%', display:'flex', alignItems:'center' }}>
                        <img src={machDetail.img_path} style={{ width:'50%'}}/>
                        <div style={{ whiteSpace:'nowrap' }}>
                            <div>
                                <span className={style['sub-text']} style={{ color:'rgb(152 154 156)' }}>编号:</span>
                                <span style={{ marginLeft:'4px', fontWeight:'bold', color:'rgb(105, 159, 244)' }}>{ machDetail.mach ? machDetail.mach.register_code : '' }</span>
                            </div>
                            <div>
                                <span className={style['sub-text']} style={{ color:'rgb(152 154 156)' }}>支路:</span>
                                <span style={{ marginLeft:'4px', fontWeight:'bold', color:'rgb(105, 159, 244)' }}>{ machDetail.branch }</span>
                            </div>
                            <div>
                                <span className={style['sub-text']} style={{ color:'rgb(152 154 156)' }}>区域:</span>
                                <span style={{ marginLeft:'4px', fontWeight:'bold', color:'rgb(105, 159, 244)' }}>{ machDetail.region }</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ height:'30%', backgroundColor:'#699ff4', padding:'20px 20px 0 20px', borderRadius:'6px', color:'#fff' }}>
                        {
                            machDetail.infoList && machDetail.infoList.length 
                            ?
                            machDetail.infoList.map((item,index)=>(
                                <div key={index} className={style['inline-item-container-wrapper']} style={{ width:'33.3%', height:'33.3%', whiteSpace:'nowrap' }}>
                                    <div className={style['inline-item-container']} style={{ backgroundColor:'#699ff4' }}>
                                        <span className={style['sub-text']} style={{ color:'#cbddfc' }}>{ item.title }:</span>
                                        <span style={{ marginLeft:'4px', fontWeight:'bold' }}>{ item.value }{ item.unit }</span>
                                    </div>
                                </div>
                            ))
                            :
                            null
                        }
                    </div>
                </div>
            </div>
            <div className={style['inline-item-container-wrapper']} style={{ width:'33.3%', height:'50%'}}>
                <div className={style['inline-item-container']}>
                    {
                        machLoading
                        ?
                        <Spin className={style['spin']} />
                        :
                        <LineChart xData={machDetail.view.date} yData={machDetail.view.P} title='功率/KW' />
                    }
                </div>
            </div>
            <div className={style['inline-item-container-wrapper']} style={{ width:'33.3%', height:'50%'}}>
                <div className={style['inline-item-container']}>
                    {
                        machLoading
                        ?
                        <Spin className={style['spin']} />
                        :
                        <LineChart xData={machDetail.view.date} yData={getRandomData(machDetail.view.date)} title='剩余电流/mA' hidden={true} />
                    }
                </div>
            </div>
            <div className={style['inline-item-container-wrapper']} style={{ width:'33.3%', height:'50%'}}>
                <div className={style['inline-item-container']} style={{ justifyContent:'center' }}>
                    {
                        machLoading
                        ?
                        <Spin className={style['spin']} />
                        :
                        <PieChart data={machDetail.warning_info} />
                    }
                </div>
            </div>
            <div className={style['inline-item-container-wrapper']} style={{ width:'33.3%', height:'50%'}}>
                <div className={style['inline-item-container']}>
                    {
                        machLoading
                        ?
                        <Spin className={style['spin']} />
                        :
                        <LineChart xData={machDetail.view.date} yData={machDetail.view} title={ isPhaseU ?  '相电压/V' : '线电压/V'} multi={true} isPhaseU={isPhaseU} />
                    }
                </div>
            </div>
           
            <div className={style['inline-item-container-wrapper']} style={{ width:'33.3%', height:'50%'}}>
                <div className={style['inline-item-container']}>
                    {
                        machLoading
                        ?
                        <Spin className={style['spin']} />
                        :
                        <LineChart xData={machDetail.view.date} yData={getRandomData(machDetail.view.date)} title='温度/℃' hidden={true} />
                    }
                </div>
            </div>
        </div>
        :
        <Spin size='large' className={style['spin']} />
    )
}
// 功率变电流
// 电压变需量
export default MachDetail;