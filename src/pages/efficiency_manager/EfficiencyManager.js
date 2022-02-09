import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Skeleton, Tooltip, Select, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, PayCircleOutlined, ThunderboltOutlined, ExperimentOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import EnergyCostChart from '../energy_manager/components/EnergyCostChart';
import RegionQuotaChart from '../energy_manager/components/RegionQuotaChart';
import EnergyFlowManager from './components/EnergyFlowManager';
import RatioChart from './components/RatioChart';
import OutputChart from './components/OutputChart';
import FullscreenSlider from '@/pages/components/FullscreenSlider';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import style from '../IndexPage.css';
import { energyIcons } from '@/pages/utils/energyIcons';
const { Option } = Select;
const labelStyle = {
    display:'inline-block',
    width:'40px',
    height:'40px',
    lineHeight:'40px',
    borderRadius:'10px',
    color:'#fff',
    fontWeight:'bold',
    background:'#af2aff'
};
function EfficiencyManager({ dispatch, user, fields, efficiency }){ 
    const { timeType, startDate, endDate, theme  } = user;
    const { allFields, energyList, energyInfo, currentField, currentAttr } = fields;
    const { chartInfo,  parentNodes, rankInfo, costChart, maskVisible, ratioInfo, outputInfo, attrData, regionData, chartLoading, year, month, day } = efficiency;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'efficiency/cancelInit'});
        }
    },[])
    const containerRef = useRef();
    const content = (
        <div className={style['card-container']}>
            <EnergyFlowManager 
                data={chartInfo}
                currentField={currentField}
                fieldList={fieldList}
                rankInfo={rankInfo}
                flowTimeType={timeType}
                beginDate={startDate}
                endDate={endDate}
                energyInfo={energyInfo}
                chartLoading={chartLoading}
                dispatch={dispatch}
                theme={theme}
            />
        </div>
    );
    return (
        <div 
            className={style['page-container']} 
            ref={containerRef} 
            // onScroll={e=>handleScroll(e)}
            style={{ overflowX:'hidden', overflowY:'scroll' }}
        >
            {/* 遮罩层 */}
            {
                maskVisible
                ?
                <div className={style['over-mask']}>
                    <Spin size='large' />
                </div>
                :
                null
            }
            <div style={{ height:'40px', display:'flex' }}>
                <Radio.Group className={style['custom-radio']} style={{ marginRight:'20px'}} value={energyInfo.type_id} onChange={e=>{
                    let temp = energyList.filter(i=>i.type_id === e.target.value)[0];
                    if ( temp.type_code === 'ele' || temp.type_code === 'water' ) {
                        dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                        dispatch({ type:'efficiency/toggleChartLoading', payload:true });
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'fields/init', payload:{ resolve, reject }});
                        })
                        .then(()=>{
                            dispatch({ type:'efficiency/fetchFlowChart' });
                        })
                    } else {
                        message.info(`还没有接入${temp.type_name}能源数据`);
                    }
                    
                }}>
                    {
                        energyList.map((item)=>(
                            <Radio.Button key={item.type_id} value={item.type_id}>{ item.type_name }</Radio.Button>
                        ))
                    }
                </Radio.Group>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({ type:'efficiency/fetchFlowChart'});
                }} />
                {
                    fieldList && fieldList.length 
                    ?
                    <Select style={{ width:'120px', marginLeft:'20px' }} className={style['custom-select']} value={currentField.field_id} onChange={value=>{
                        if ( chartLoading ) {
                            message.info('能流图还在加载中');
                        }
                        let current = fieldList.filter(i=>i.field_id === value )[0];
                        dispatch({ type:'fields/toggleField', payload:{ field:current } });
                        dispatch({ type:'efficiency/toggleChartLoading', payload:true });
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'fields/fetchFieldAttrs', resolve, reject });
                        })
                        .then(()=>{
                            dispatch({ type:'efficiency/fetchFlowChart' });
                        })
                    }}>
                        {
                            fieldList.map((item,index)=>(
                                <Option key={index} value={item.field_id}>{ item.field_name }</Option>
                            ))
                        }
                    </Select>
                    :
                    null
                }
                
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div style={{ height:'60%'}}>
                    <div className={style['card-container-wrapper']} style={{ width:'70%'}}>
                        <div className={style['card-container']}>
                            {
                                Object.keys(chartInfo).length
                                ?
                                <FullscreenSlider isLoading={chartLoading} interval={0} data={content} collapsed={user.collapsed} currentPath={user.currentPath} user={user} />                                                                                                          
                                :
                                <Spin size='large' className={style['spin']} />
                            }
                        </div>
                    </div>
                    <div className={style['card-container-wrapper']} style={{ width:'30%', paddingRight:'0' }}>
                        {
                                ratioInfo && ratioInfo.length
                                ?
                                ratioInfo.map((item,index)=>(
                                    <div key={index} className={style['card-container-wrapper']} style={{ display:'block', height:'25%', paddingBottom:index === ratioInfo.length -1 ? '0' : '1rem', paddingRight:'0' }}>
                                        <div className={style['card-container']}>
                                            <div className={style['flex-container']}>
                                                <div className={style['flex-item']} style={{ flex:'1'}}>
                                                    <span style={{ ...labelStyle, backgroundColor: item.key === 'output' ? '#af2aff' : item.key === 'person' ? '#6dcffb' : item.key === 'area' ? '#ffb863' : '#7a7ab3'}}><MoneyCollectOutlined /></span>
                                                </div>
                                                <div className={style['flex-item']} style={{ flex:'2'}}>
                                                    <span>{`本年${item.text}`}</span>
                                                    <br/>
                                                    <span>
                                                        <span className={style['data']}>{ item.value.year }</span>
                                                        <span style={{ marginLeft:'4px'}}>{ `${item.key === 'output' ? '' : energyInfo.unit + '/'}${item.unit}` }</span>
                                                    </span>
                                                </div>
                                                <div className={style['flex-item']} style={{ flex:'2'}}>
                                                    <span>{`本月${item.text}`}</span>
                                                    <br/>
                                                    <span>
                                                        <span className={style['data']}>{ item.value.month }</span>
                                                        <span style={{ marginLeft:'4px'}}>{ `${item.key === 'output' ? '' : energyInfo.unit + '/'}${item.unit}` }</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                                :
                                <div className={style['card-container']}>
                                    <Spin size='large' className={style['spin']} />
                                </div>
                            }
                    </div>
                </div>
                <div style={{ height:'40%'}}>
                    <div className={style['card-container-wrapper']} style={{ width:'70%', paddingBottom:'0'}}>
                        <div className={style['card-container']}>
                            {
                                costChart && costChart.date 
                                ?
                                <RatioChart data={costChart} theme={user.theme} />                     
                                :
                                <Skeleton active className={style['skeleton']} />
                            }  
                        </div>
                    </div>
                    <div className={style['card-container-wrapper']} style={{ width:'30%', paddingBottom:'0', paddingRight:'0' }}>
                        <div className={style['card-container']}>
                            <OutputChart data={outputInfo} theme={user.theme} />

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
        
}

export default connect(({ user, fields, efficiency  })=>({ user, fields, efficiency }))(EfficiencyManager);
