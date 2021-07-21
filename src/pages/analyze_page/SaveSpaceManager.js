import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Card, Spin, Tree, Tabs, DatePicker, Radio, Modal, Skeleton, message } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import TabPaneContent from './components/TabPaneContent';
import UselessChart from '@/pages/efficiency_manager/components/UselessChart';
import AnalyzLineChart from '@/pages/efficiency_manager/components/AnalyzLineChart';
import AreaLineChart from './components/AreaLineChart';
import style from '../IndexPage.css';
import moment from 'moment';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
function SaveSpaceManager({ dispatch, user, analyze, demand }){
    const { theme, timeType, startDate, endDate } = user;
    const [activeKey, setActiveKey] = useState('basecost');
    // 保存当前查看的柱状图的一个item
    const [currentInfo, setCurrentInfo] = useState({ visible:false, value:''});
    const dateRef = useRef();
    const measureDateRef = useRef();
    const { baseSaveSpace, meterSaveSpace, adjustSaveSpace, fieldType, saveSpaceLoading, saveSpaceTrend, saveTrendLoading, modalTimeType, modalStartDate, modalEndDate } = analyze;
    const { uselessInfo, uselessLoading, demandLoading, analyzInfo } = demand;
    const monthData = uselessInfo.month ? uselessInfo.month : {};
    const nowData = uselessInfo.now ? uselessInfo.now : {};
    let title = activeKey === 'basecost' ? '基本电费-需量均衡' : activeKey === 'adjust' ? '力调电费-无功优化' : '电度电费-移峰填谷';
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'analyze/cancelAll' });
        }
    },[])
    return (
        <div className={style['page-container']}>
            <div style={{ height:'40px', display:'flex'}}>
                <CustomDatePicker onDispatch={()=>{
                    if ( activeKey === 'basecost') {
                        dispatch({ type:'analyze/fetchBaseSaveSpace'});
                    } else if ( activeKey === 'adjust') {
                        dispatch({ type:'analyze/fetchAdjustSaveSpace'});
                    } else if ( activeKey === 'meter') {
                        dispatch({ type:'analyze/fetchMeterSaveSpace'});
                    }
                }} />
                <Radio.Group className={style['custom-radio']} size='small' style={{ marginLeft:'1rem' }} buttonStyle='solid' value={fieldType} onChange={e=>{
                    dispatch({ type:'analyze/toggleFieldType', payload:e.target.value });
                    if ( activeKey === 'basecost') {
                        dispatch({ type:'analyze/fetchBaseSaveSpace'});
                    } else if ( activeKey === 'adjust') {
                        dispatch({ type:'analyze/fetchAdjustSaveSpace'});
                    } else if ( activeKey === 'meter') {
                        
                        dispatch({ type:'analyze/fetchMeterSaveSpace'});
                    }                    
                }}>
                    <Radio.Button value='1'>支路</Radio.Button>
                    <Radio.Button value='2'>区域</Radio.Button>
                </Radio.Group>
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
            <Tabs className={style['custom-tabs'] + ' ' + style['flex-tabs']} tabBarStyle={{ paddingLeft:'20px', height:'46px', margin:'0' }} activeKey={activeKey} onChange={activeKey=>{
                // dispatch({ type:'baseCost/fetchEleCost', payload:{ eleCostType:activeKey } })
                if ( saveSpaceLoading ){
                    message.info('数据加载中，请稍后');
                } else {
                    dispatch({ type:'analyze/toggleSaveSpaceLoading'});             
                    if ( activeKey === 'basecost' ) {
                        dispatch({ type:'analyze/fetchBaseSaveSpace'});
                    } 
                    if ( activeKey === 'meter' ) {
                        dispatch({ type:'analyze/fetchMeterSaveSpace'})
                    }
                    if ( activeKey === 'adjust') {
                        dispatch({ type:'analyze/fetchAdjustSaveSpace'});
                    }
                    setActiveKey(activeKey);
                }               
            }}>
                <TabPane tab='基本电费-需量均衡' key='basecost'>
                    <TabPaneContent 
                        data={baseSaveSpace} 
                        isLoading={saveSpaceLoading} 
                        toggleVisible={setCurrentInfo} 
                        activeKey={activeKey} 
                        onDispatch={action=>dispatch(action)} 
                        startDate={modalStartDate}
                        endDate={modalEndDate}
                        title={title}
                        theme={theme}
                    />
                </TabPane>
                <TabPane tab='力调电费-无功优化' key='adjust'>
                    <TabPaneContent 
                        data={adjustSaveSpace} 
                        isLoading={saveSpaceLoading} 
                        toggleVisible={setCurrentInfo} 
                        activeKey={activeKey} 
                        onDispatch={action=>dispatch(action)}
                        startDate={modalStartDate}
                        endDate={modalEndDate}
                        title={title}
                        theme={theme}
                    />
                </TabPane>
                <TabPane tab='电度电费-移峰填谷' key='meter'>
                    <TabPaneContent 
                        data={meterSaveSpace} 
                        isLoading={saveSpaceLoading} 
                        toggleVisible={setCurrentInfo} 
                        activeKey={activeKey} 
                        onDispatch={action=>dispatch(action)}
                        startDate={modalStartDate}
                        endDate={modalEndDate}
                        theme={theme}  
                        title={title}
                    />
                </TabPane>
            </Tabs>
            <Modal
                width='80vw' 
                height='80vh' 
                bodyStyle={{ height:'80vh', padding:'40px 20px 20px 20px' }}
                visible={currentInfo.visible}
                onCancel={()=>{
                    setCurrentInfo({ visible:false});
                    if ( activeKey === 'basecost' || activeKey === 'adjust') {
                        dispatch({ type:'demand/reset'});
                    } else if ( activeKey === 'meter') {
                        dispatch({ type:'analyze/resetSaveSpaceTrend'});
                    }
            
                }}
                destroyOnClose={true}
                footer={null}
                title={ 
                    <div className={style['container']} style={{ display:'flex', alignItems:'center' }}>
                        <div>{ title + ' - ' + currentInfo.attr_name }</div>
                        <div style={{ display:'inline-flex'}}>
                            <Radio.Group size='small' className={style['custom-radio']} style={{ margin:'0 1rem' }} buttonStyle='solid' value={modalTimeType} onChange={e=>{
                                if ( saveTrendLoading && demandLoading && uselessLoading  ) {
                                    message.info('数据加载中，请稍后');
                                    return ;
                                }
                                dispatch({ type:'analyze/toggleModalTimeType', payload:e.target.value });
                                if ( activeKey === 'meter') {
                                    dispatch({ type:'analyze/fetchSaveSpaceTrend', payload:{ key:currentInfo.attr_id, title:currentInfo.attr_name }});
                                } else if ( activeKey === 'adjust') {
                                    dispatch({ type:'demand/fetchUseless', payload:{ key:currentInfo.attr_id, title:currentInfo.attr_name }})
                                } else if ( activeKey === 'basecost') {
                                    dispatch({ type:'demand/fetchAnalyz', payload:{ key:currentInfo.attr_id, title:currentInfo.attr_name }});
                                }                                       
                            }}>
                                <Radio.Button value='1'>日</Radio.Button>
                                <Radio.Button value='2'>月</Radio.Button>
                                <Radio.Button value='3'>年</Radio.Button>
                            </Radio.Group>
                            <div style={{ display:'inline-flex'}}>
                                <div className={style['date-picker-button-left']} onClick={()=>{
                                    if ( saveTrendLoading && demandLoading && uselessLoading ) {
                                        message.info('数据加载中，请稍后');
                                        return ;
                                    }
                                    
                                    let date = new Date(modalStartDate.format('YYYY-MM-DD'));
                                    let start,end;
                                    if ( modalTimeType === '1'){
                                        start = end = moment(date).subtract(1,'days');
                                    } else if ( modalTimeType === '2'){
                                        start = moment(date).subtract(1,'days').startOf('month');
                                        end = moment(date).subtract(1,'days').endOf('month');
                                    } else if ( modalTimeType === '3'){
                                        start = moment(date).subtract(1,'years').startOf('year');
                                        end = moment(date).subtract(1,'years').endOf('year');
                                    }
                                    dispatch({ type:'analyze/setModalDate', payload:{ modalStartDate:start, modalEndDate:end }});    
                                    if ( activeKey === 'meter') {
                                        dispatch({ type:'analyze/fetchSaveSpaceTrend', payload:{ key:currentInfo.attr_id, title:currentInfo.attr_name }});
                                    } else if ( activeKey === 'adjust') {
                                        dispatch({ type:'demand/fetchUseless', payload:{ key:currentInfo.attr_id, title:currentInfo.attr_name }})
                                    } else if ( activeKey === 'basecost') {
                                        dispatch({ type:'demand/fetchAnalyz', payload:{ key:currentInfo.attr_id, title:currentInfo.attr_name }});
                                    }
                                    
                                }}><LeftOutlined /></div>
                                {
                                    modalTimeType === '1' 
                                    ?
                                    <DatePicker className={style['custom-date-picker']} ref={measureDateRef} size='small' locale={zhCN} allowClear={false} value={modalStartDate} onChange={date=>{
                                        if ( saveTrendLoading && demandLoading && uselessLoading  ) {
                                            message.info('数据加载中，请稍后');
                                            return ;
                                        }
                                        dispatch({ type:'analyze/setModalDate', payload:{ modalStartDate:date, modalEndDate:date }});                                        
                                        if ( activeKey === 'meter') {
                                            dispatch({ type:'analyze/fetchSaveSpaceTrend', payload:{ key:currentInfo.attr_id, title:currentInfo.attr_name }});
                                        } else if ( activeKey === 'adjust') {
                                            dispatch({ type:'demand/fetchUseless', payload:{ key:currentInfo.attr_id, title:currentInfo.attr_name }})
                                        } else if ( activeKey === 'basecost') {
                                            dispatch({ type:'demand/fetchAnalyz', payload:{ key:currentInfo.attr_id, title:currentInfo.attr_name }});
                                        }                                  
                                        if ( measureDateRef.current && measureDateRef.current.blur ) measureDateRef.current.blur();
                                    }}/>
                                    :
                                    <RangePicker className={style['custom-date-picker']} ref={measureDateRef} size='small' locale={zhCN} allowClear={false} picker={modalTimeType === '2' ? 'date' : 'month'} value={[modalStartDate, modalEndDate]} onChange={dateArr=>{
                                        if ( saveTrendLoading && demandLoading && uselessLoading ) {
                                            message.info('数据加载中，请稍后');
                                            return ;
                                        }
                                        dispatch({ type:'analyze/setModalDate', payload:{ modalStartDate:dateArr[0], modalEndDate:dateArr[1] }});                                    
                                        if ( activeKey === 'meter') {
                                            dispatch({ type:'analyze/fetchSaveSpaceTrend', payload:{ key:currentInfo.attr_id, title:currentInfo.attr_name }});
                                        } else if ( activeKey === 'adjust') {
                                            dispatch({ type:'demand/fetchUseless', payload:{ key:currentInfo.attr_id, title:currentInfo.attr_name }})
                                        } else if ( activeKey === 'basecost') {
                                            dispatch({ type:'demand/fetchAnalyz', payload:{ key:currentInfo.attr_id, title:currentInfo.attr_name }});
                                        }                                    
                                        if ( measureDateRef.current && measureDateRef.current.blur ) measureDateRef.current.blur();
                                    }} />
                                }
                                <div className={style['date-picker-button-right']} onClick={()=>{
                                    if ( saveTrendLoading && demandLoading && uselessLoading  ) {
                                        message.info('数据加载中，请稍后');
                                        return ;
                                    }
                                    let date = new Date(modalStartDate.format('YYYY-MM-DD'));
                                    let start,end;
                                    if ( modalTimeType === '1'){
                                        start = end = moment(date).add(1,'days');
                                    } else if ( modalTimeType === '2'){
                                        start = moment(date).add(1,'months').startOf('month');
                                        end = moment(date).add(1,'months').endOf('month');
                                    } else if ( modalTimeType === '3'){
                                        start = moment(date).add(1,'years').startOf('year');
                                        end = moment(date).add(1,'years').endOf('year');
                                    }
                                    dispatch({ type:'analyze/setModalDate', payload:{ modalStartDate:start, modalEndDate:end }});                            
                                    if ( activeKey === 'meter') {
                                        dispatch({ type:'analyze/fetchSaveSpaceTrend', payload:{ key:currentInfo.attr_id, title:currentInfo.attr_name }});
                                    } else if ( activeKey === 'adjust') {
                                        dispatch({ type:'demand/fetchUseless', payload:{ key:currentInfo.attr_id, title:currentInfo.attr_name }})
                                    } else if ( activeKey === 'basecost') {
                                        dispatch({ type:'demand/fetchAnalyz', payload:{ key:currentInfo.attr_id, title:currentInfo.attr_name }});
                                    }                               
                                }}><RightOutlined /></div>
                            </div>
                        </div>
                    </div>
                }
            >
                {
                    activeKey === 'basecost'
                    ?                 
                    <div style={{ height:'100%' }}>
                        {
                            demandLoading
                            ?
                            <Skeleton active className={style['skeleton']} />
                            :
                            <div style={{ height:'100%' }}>
                                <div className={style['flex-container']} style={{ height:'16%' }}>
                                    <div className={style['flex-item']}>
                                        <div>平均需量(kw)</div>
                                        <div className={style['data']}>{ analyzInfo.avgDemand ? Math.round(analyzInfo.avgDemand) : '-- --' }</div>
                                    </div>
                                    <div className={style['flex-item']}>
                                        <div>最大需量(kw)</div>
                                        <div className={style['data']}>{ analyzInfo.maxDemand ? Math.round(analyzInfo.maxDemand.demand) : '-- --'}</div>
                                    </div>
                                    <div className={style['flex-item']}>
                                        <div>需量电费效率(%)</div>
                                        <div className={style['data']}>{ analyzInfo.effRatio ? (analyzInfo.effRatio).toFixed(1) : '-- --'}</div>
                                    </div>
                                    <div className={style['flex-item']}>
                                        <div>节省空间(元)</div>
                                        <div className={style['data']}>{ currentInfo.value  }</div>
                                    </div>
                                </div>
                                <div style={{ height:'84%', position:'relative' }}>                               
                                    <AnalyzLineChart data={analyzInfo} forModal={true} />                                
                                </div>
                            </div>
                        }
                        
                    </div> 
                    :
                    activeKey === 'adjust' 
                    ?
                    <div style={{ height:'100%' }}>
                        {
                            uselessLoading 
                            ?
                            <Skeleton active className={style['skeleton']} />
                            :
                            <div style={{ height:'100%' }}>
                                <div className={style['flex-container']} style={{ height:'16%' }}>
                                    <div className={style['flex-item']}>
                                        <div>无功电量(kVarh)</div>
                                        <div className={style['data']}>{ monthData.revEleEnergy ? Math.round(monthData.revEleEnergy) : '-- --' }</div>
                                    </div>
                                    <div className={style['flex-item']}>
                                        <div>无功功率(kVar)</div>
                                        <div className={style['data']}>{ nowData.uselessPower ? Math.round(nowData.uselessPower) : '-- --'}</div>
                                    </div>
                                    <div className={style['flex-item']}>
                                        <div>功率因素(COSΦ)</div>
                                        <div className={style['data']}>{ monthData.avgFactor ? (monthData.avgFactor).toFixed(2) : '-- --'}</div>
                                    </div>
                                    <div className={style['flex-item']}>
                                        <div>节省空间(元)</div>
                                        <div className={style['data']}>{ Math.round(currentInfo.value)  }</div>
                                    </div>
                                </div>
                                <div style={{ height:'84%', position:'relative' }}>                        
                                    <UselessChart data={uselessInfo} forModal={true} />
                                </div>                   
                            </div>
                        }                
                    </div> 
                    
                    :
                    activeKey === 'meter' 
                    ?
                    <div style={{ height:'100%' }}>
                        {
                            saveTrendLoading 
                            ?
                            <Skeleton active className={style['skeleton']} />
                            :
                            <div style={{ height:'100%' }}>
                                <div className={style['flex-container']} style={{ height:'16%' }}>
                                    <div className={style['flex-item']}>
                                        <div>电费成本(元)</div>
                                        <div className={style['data']}>{ saveSpaceTrend.totalCost || '-- --' }</div>
                                    </div>
                                    <div className={style['flex-item']}>
                                        <div>用量(kwh)</div>
                                        <div className={style['data']}>{ saveSpaceTrend.totalEnergy || '-- --'}</div>
                                    </div>
                                    <div className={style['flex-item']}>
                                        <div>电单价(元/kwh)</div>
                                        <div className={style['data']}>{ saveSpaceTrend.elePrice || '-- --'}</div>
                                    </div>
                                    <div className={style['flex-item']}>
                                        <div>节省空间(元)</div>
                                        <div className={style['data']}>{ saveSpaceTrend.saveCost || '-- --'  }</div>
                                    </div>
                                </div>
                                <div style={{ height:'84%', position:'relative' }}>                              
                                    <AreaLineChart data={saveSpaceTrend} forModal={true} />                                 
                                </div>
                            </div>
                        }
                        
                        
                    </div>
                    :
                    null
                }
            </Modal>
            </div>
        </div>
    )
}

export default connect(({ user, analyze, demand })=>({ user, analyze, demand }))(SaveSpaceManager);