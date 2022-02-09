import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Radio, Spin, Skeleton, Tooltip, DatePicker, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, AlertFilled, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, EnvironmentFilled } from '@ant-design/icons';
import FullscreenSlider from '@/pages/components/FullscreenSlider';
import InfoItem from './components/InfoItem';
import AlarmCountChart from './components/AlarmCountChart';
import AlarmRegionChart from './components/AlarmRegionChart';
import style from '../IndexPage.css';
import AlarmSumChart from './components/AlarmSumChart';
import AlarmPieChart from './components/AlarmPieChart';
import AlarmDetailTable from './components/AlarmDetailTable';
import AlarmDetailChart from './components/AlarmDetailChart';
import moment from 'moment';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
const { RangePicker } = DatePicker;
const energyIcons = {
    '0':<PayCircleOutlined />,
    '1':<ThunderboltOutlined />,
    '2':<ExperimentOutlined />
};

const warningColors = {
    'total':'#ff7862',
    'ele':'#198efb',
    'limit':'#29ccf4',
    'link':'#58e29f'
};
const dotStyle = {
    width:'8px',
    height:'8px',
    display:'inline-block',
    borderRadius:'50%',
    position:'absolute',
    top:'0',
    left:'-14px',
    transform:'translateY(50%)'
}
function AlarmMonitor({ dispatch, user, alarm }){ 
    const { sceneInfo, alarmInfo, warningChartInfo, regionChartInfo, sumInfo, sumList, detailInfo, detailList } = alarm;
    const containerRef = useRef();

    useEffect(()=>{
        return ()=>{
            dispatch({ type:'alarm/reset'});
        }
    },[])
    const content = (
        <div style={{ height:'100%' }}>
            <div className='img-container' style={{ 
                height:'100%',
                backgroundImage:`url(${sceneInfo.scene ? sceneInfo.scene.bg_image_path : ''})`,
                backgroundRepeat:'no-repeat',
                backgroundSize:'cover'
            }}>                
                {/*
                    sceneInfo.tags && sceneInfo.tags.length
                    ?              
                    sceneInfo.tags.map((tag,index)=>(
                        <Tooltip 
                            key={index} 
                            // trigger="click" 
                            placement="rightTop" 
                            title={<div></div>} 
                            overlayClassName='tooltip'
                        >
                            <div className='point-container motion' style={{ left:tag.pos_left+'%', top:tag.pos_top+'%'}}>
                                <img src={pointerImg} />
                            </div>
                        </Tooltip>                               
                    ))
                    :
                    null
                */}
                
            </div>
            <div style={{ backgroundImage:'linear-gradient(to right, rgba(0,0,0,0.6) , transparent)', position:'absolute', left:'0', top:'0', width:'20%', height:'100%' }}>
                <div style={{ color:'#fff', position:'absolute', transform:'translateY(-50%)', left:'0', top:'50%', padding:'0 40px'}}>
                    <div style={{ margin:'20px 0', position:'relative'}}>
                        <div style={{...dotStyle, backgroundColor:warningColors['ele']}}></div>
                        <div style={{ fontSize:'0.8rem'}}>待处理安全电气警报</div>
                        <div style={{ fontSize:'1.4rem', fontWeight:'bold'}}>{ `${sceneInfo.warningAnalyze && sceneInfo.warningAnalyze[1] ? sceneInfo.warningAnalyze[1] : 0} 件`}</div>
                    </div> 
                    <div style={{ margin:'20px 0', position:'relative'}}>
                        <div style={{...dotStyle, backgroundColor:warningColors['limit']}}></div>
                        <div style={{ fontSize:'0.8rem'}}>待处理指标越限警报</div>
                        <div style={{ fontSize:'1.4rem', fontWeight:'bold'}}>{ `${sceneInfo.warningAnalyze && sceneInfo.warningAnalyze[2] ? sceneInfo.warningAnalyze[2] : 0} 件`}</div>
                    </div> 
                    <div style={{ margin:'20px 0', position:'relative'}}>
                        <div style={{...dotStyle, backgroundColor:warningColors['link']}}></div>
                        <div style={{ fontSize:'0.8rem'}}>待处理通讯采集警报</div>
                        <div style={{ fontSize:'1.4rem', fontWeight:'bold'}}>{ `${sceneInfo.warningAnalyze && sceneInfo.warningAnalyze[3] ? sceneInfo.warningAnalyze[3] : 0} 件`}</div>
                    </div> 
                </div> 
            </div>      
        </div>
    );
    return (
        <div className={style['page-container']}>
            <div style={{ height:'60%'}}>
                <div className={style['card-container-wrapper']} style={{ width:'70%'}}>
                    <div className={style['card-container']}>
                        {
                            Object.keys(sceneInfo).length 
                            ?
                            <FullscreenSlider interval={0} data={content} dispatch={dispatch} collapsed={user.collapsed} currentPath={user.currentPath} />                                                             
                            :
                            <Spin size='large' className={style['spin']} />
                        }
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ width:'30%', paddingRight:'0' }}>
                    {
                        alarmInfo.length 
                        ?
                        alarmInfo.map((item,index)=>(
                            <InfoItem 
                                key={index} 
                                data={item} 
                                theme={user.theme}
                                onDispatch={action=>dispatch(action)} 
                                optionStyle={{ display:'block', height:'33.3%', paddingRight:'0', paddingBottom: index === alarmInfo.length - 1 ? '0' : '1rem' }} 
                            />
                        ))
                        :
                        <div className={style['card-container']}><Spin size='large' className={style['spin']} /></div>
                    }
                </div>
            </div>
            <div style={{ height:'40%'}}>
                <div className={style['card-container-wrapper']} style={{ width:'70%', paddingBottom:'0' }}>
                    <div className={style['card-container']}>
                        {
                            Object.keys(warningChartInfo).length
                            ?
                            <AlarmCountChart data={warningChartInfo} warningColors={warningColors} theme={user.theme} /> 
                            :
                            <Spin size='large' className={style['spin']} />
                        }  
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ width:'30%', paddingRight:'0', paddingBottom:'0' }}>
                    <div className={style['card-container']}>
                        {
                            regionChartInfo && regionChartInfo.length
                            ?
                            <AlarmRegionChart data={regionChartInfo} warningColors={warningColors} theme={user.theme} />
                            :
                            <Spin size='large' className={style['spin']} />
                        }
                    </div>
                </div>
            </div>
        </div>
    )
        
}

export default connect(({ user, alarm })=>({ user, alarm }))(AlarmMonitor);
