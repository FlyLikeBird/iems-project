import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Skeleton, Tooltip, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined } from '@ant-design/icons';
import InfoItem from './components/InfoItem';
import PieChart from './components/PieChart';
import RangeBarChart from './components/RangeBarChart';
import FullscreenSlider from '@/pages/components/FullscreenSlider';
import style from '../IndexPage.css';
import TooltipInfo from '@/pages/components/TooltipInfo';
import { energyIcons } from '@/pages/utils/energyIcons';
const dotStyle = {
    width:'8px',
    height:'8px',
    display:'inline-block',
    borderRadius:'50%',
    position:'absolute',
    top:'0',
    left:'-14px',
    transform:'translateY(50%)',
}
let timer;
function EnergyManager({ dispatch, user, fields, energy }){
    const { timeType, maskVisible, energyInfo, showType, chartInfo, sceneInfo, costInfo, costAnalysis, isLoading, chartLoading } = energy;
    const { energyList, energyMaps } = fields;
    // 添加滚动事件，如果滚出视图区，则变为固定定位
    // const  handleScroll = (e)=>{
    //         clearTimeout(clearIndex);
    //         clearIndex = setTimeout(()=>{
    //             if ( !loaded ) {
    //                 dispatch({ type:'attrEnergy/init'});
    //                 loaded = true;
    //             } 
    //         },500);
    //     };
    useEffect(()=>{
        // 当组件卸载时重置loaded的状态
        dispatch({ type:'fields/fetchEnergy'});
        dispatch({ type:'energy/fetchCost'});
        dispatch({ type:'energy/fetchCostByTime'});
        timer = setInterval(()=>{
            dispatch({ type:'energy/fetchCost'});
            dispatch({ type:'energy/fetchCostByTime'});
        },3 * 60 * 1000)
        return ()=>{
            clearInterval(timer);
            timer = null;
            dispatch({type:'energy/reset'});
        }
    },[]);
    const containerRef = useRef();
    const content = (
        <div style={{ height:'100%' }}>
            <div className='img-container' style={{ 
                height:'100%',
                backgroundImage:`url(${sceneInfo.scene ? sceneInfo.scene.bg_image_path : ''})`,
                backgroundRepeat:'no-repeat',
                backgroundSize:'cover'
            }}> 
            </div>
            <div style={{ display:energyInfo.type_code === 'total' || energyInfo.type_code === 'ele' ? 'block' : 'none', backgroundImage:'linear-gradient(to right, rgba(0,0,0,0.4) , transparent)', position:'absolute', left:'0', top:'0', width:'20%', height:'100%' }}>
                <div style={{ color:'#fff', position:'absolute', transform:'translateY(-50%)', left:'0', top:'50%', padding:'0 40px'}}>
                    <div style={{ margin:'20px 0', position:'relative', whiteSpace:'nowrap' }}>
                        <div style={{...dotStyle, backgroundColor:'#2d54ef'}}></div>
                        <div style={{ fontSize:'0.8rem'}}>本月力调电费节俭潜力</div>
                        <div style={{ fontSize:'1.4rem', fontWeight:'bold'}}>{ `${sceneInfo.saveSpace ? sceneInfo.saveSpace.adjustCost : ''}元`}</div>
                    </div>
                    <div style={{ margin:'20px 0', position:'relative', whiteSpace:'nowrap' }}>
                        <div style={{...dotStyle, backgroundColor:'#1cc5c4'}}></div>
                        <div style={{ fontSize:'0.8rem'}}>本月计量电费节俭潜力</div>
                        <div style={{ fontSize:'1.4rem', fontWeight:'bold'}}>{ `${sceneInfo.saveSpace ? sceneInfo.saveSpace.eleCost : ''}元`}</div>
                    </div>
                    <div style={{ margin:'20px 0', position:'relative', whiteSpace:'nowrap' }}>
                        <div style={{...dotStyle, backgroundColor:'#732ad6'}}></div>
                        <div style={{ fontSize:'0.8rem'}}>本月基本电费节俭潜力</div>
                        <div style={{ fontSize:'1.4rem', fontWeight:'bold'}}>{ `${sceneInfo.saveSpace ? sceneInfo.saveSpace.baseCost : ''}元`}</div>
                    </div>
                    <div style={{ margin:'20px 0', position:'relative', whiteSpace:'nowrap' }}>
                        <div style={{...dotStyle, backgroundColor:'#e9eaf5'}}></div>
                        <div style={{ fontSize:'0.8rem'}}>能源成本竞争力</div>
                        <div style={{ fontSize:'1.4rem', fontWeight:'bold'}}>{ `排名第${sceneInfo.saveSpace ? sceneInfo.rank : ''}位`}</div>
                    </div>
                </div>
            </div> 
        </div>
    );
    const data = [];
    data.push(content);
    return (
        <div 
            className={style['page-container']} 
            ref={containerRef} 
        >
            {/* 遮罩层 */}
            {
                maskVisible
                ?
                <div className={style['over-mask']}>
                    <Spin size='large' className={style['spin']} />
                </div>
                :
                null
            }
            <div style={{ height:'40px'}}>
                {
                    energyList.length 
                    ?
                    <Radio.Group buttonStyle='solid' size='small' style={{ marginRight:'20px' }} value={energyInfo.type_code} className={style['custom-radio']} onChange={(e)=>{
                        dispatch({ type:'energy/setEnergyInfo', payload: { ...energyMaps[e.target.value] }});
                        dispatch({ type:'energy/fetchCost'});
                        dispatch({ type:'energy/fetchCostByTime'});       
                    }}>
                        {
                            ['total'].concat(energyList.map(i=>i.type_code)).map((item,index)=>(
                                <Radio.Button key={item} value={item}>{ energyMaps[item] ? energyMaps[item].type_name : '' }</Radio.Button>
                            ))
                        }
                    </Radio.Group>
                    :
                    null
                }           
                <Radio.Group buttonStyle='solid' size='small' value={showType} className={style['custom-radio']} onChange={(e)=>{
                    dispatch({ type:'energy/toggleShowType', payload:e.target.value });
                }}>
                    <Radio.Button value='0'>成本</Radio.Button>
                    <Radio.Button value='1'>能耗</Radio.Button>
                </Radio.Group>
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div style={{ height:'60%' }}>
                    <div className={style['card-container-wrapper']} style={{ width:'70%'}}>
                        <div className={style['card-container']}>
                        
                        {
                            Object.keys(sceneInfo).length                 
                            ?
                            <FullscreenSlider interval={0} data={data} sourceData={[sceneInfo]} collapsed={user.collapsed} currentPath={user.currentPath} dispatch={dispatch} user={user} />                                                             
                            :
                            <Spin size='large' className={style['spin']} />
                        }
                        </div>
                    </div>
                    <div className={style['card-container-wrapper']} style={{ width:'30%', paddingRight:'0' }}>
                        {
                            isLoading
                            ?
                            <div className={style['card-container']} >
                                <Spin size='large' className={style['spin']} />
                            </div>
                            :
                            costInfo.map((item,index)=>(
                                <div key={index} className={style['card-container-wrapper']} style={{ height:'33.3%', paddingRight:'0', paddingBottom:index === costInfo.length - 1 ? '0' : '1rem' }}>
                                    <div className={style['card-container']}>
                                        <InfoItem key={index} data={item} energyInfo={energyInfo}  showType={showType} />
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div style={{ height:'40%' }}>
                    <div className={style['card-container-wrapper']} style={{ width:'70%', paddingBottom:'0' }}>
                        <div className={style['card-container']}>
                            {
                                chartInfo.date 
                                ?
                                <RangeBarChart 
                                    data={chartInfo}
                                    energyInfo={energyInfo} 
                                    isLoading={chartLoading}
                                    showType={showType}
                                    timeType={timeType}
                                    onDispatch={action=>dispatch(action)}
                                    theme={user.theme}
                                /> 
                                :
                                <Spin size='large' className={style['spin']} />
                            }
                                 
                        </div>
                    </div> 
                    <div className={style['card-container-wrapper']} style={{ width:'30%', paddingRight:'0', paddingBottom:'0' }}>
                        <div className={style['card-container']}>
                            {
                                Object.keys(costAnalysis).length 
                                ?
                                <PieChart data={costAnalysis} energyInfo={energyInfo} energyMaps={energyMaps} showType={showType} theme={user.theme} />
                                :
                                <Spin size='large' className={style['spin']} />
                            }   
                        </div>               
                    </div> 
                </div>
            </div>         
        </div>     
    )    
}

export default connect(({ user, fields, energy })=>({ user, fields, energy }))(EnergyManager);
