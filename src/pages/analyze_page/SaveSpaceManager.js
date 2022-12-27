import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Card, Spin, Tree, Tabs, DatePicker, Radio, Modal, Skeleton, message } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import TabPaneContent from './components/TabPaneContent';
import UselessChart from '@/pages/efficiency_manager/components/UselessChart';
import AnalyzLineChart from '@/pages/efficiency_manager/components/AnalyzLineChart';
import AreaLineChart from './components/AreaLineChart';
import style from '../IndexPage.css';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
function SaveSpaceManager({ dispatch, user, analyze, demand }){
    const { theme, timeType, startDate, endDate } = user;
    const [activeKey, setActiveKey] = useState('basecost');
    // 保存当前查看的柱状图的一个item
    const [currentInfo, setCurrentInfo] = useState({ visible:false, value:''});
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
            {
                saveSpaceLoading 
                ?
                <Loading />
                :
                null
            }
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
                    { 
                        activeKey === 'basecost'
                        ?
                        <TabPaneContent 
                            data={baseSaveSpace} 
                            toggleVisible={setCurrentInfo} 
                            activeKey={activeKey} 
                            onDispatch={action=>dispatch(action)} 
                            title={title}
                            theme={theme}
                        />
                        :
                        null
                    }
                    
                </TabPane>
                <TabPane tab='力调电费-无功优化' key='adjust'>
                    {
                        activeKey === 'adjust' 
                        ?
                        <TabPaneContent 
                            data={adjustSaveSpace} 
                            toggleVisible={setCurrentInfo} 
                            activeKey={activeKey} 
                            onDispatch={action=>dispatch(action)}
                            title={title}
                            theme={theme}
                        />
                        :
                        null
                    }
                    
                </TabPane>
                <TabPane tab='电度电费-移峰填谷' key='meter'>
                    {
                        activeKey === 'meter'
                        ?
                        <TabPaneContent 
                            data={meterSaveSpace} 
                            toggleVisible={setCurrentInfo} 
                            activeKey={activeKey} 
                            onDispatch={action=>dispatch(action)}
                            startDate={modalStartDate}
                            endDate={modalEndDate}
                            theme={theme}  
                            title={title}
                        />
                        :
                        null
                    }
                    
                </TabPane>
            </Tabs>
            <Modal
                width='80vw' 
                height='80vh' 
                bodyStyle={{ height:'80vh', padding:'40px 20px 20px 20px' }}
                visible={currentInfo.visible}
                onCancel={()=>{
                    setCurrentInfo({ visible:false });
                    if ( activeKey === 'basecost' ) {
                        dispatch({ type:'analyze/fetchBaseSaveSpace'});
                    } 
                    if ( activeKey === 'meter' ) {
                        dispatch({ type:'analyze/fetchMeterSaveSpace'})
                    }
                    if ( activeKey === 'adjust') {
                        dispatch({ type:'analyze/fetchAdjustSaveSpace'});
                    }
            
                }}
                destroyOnClose={true}
                footer={null}
                title={ 
                    <div className={style['container']} style={{ display:'flex', alignItems:'center' }}>
                        <div style={{ marginRight:'1rem' }}>{ title + '-' + currentInfo.attr_name }</div>
                        <CustomDatePicker mode='light' onDispatch={()=>{
                            if ( activeKey === 'meter') {
                                dispatch({ type:'analyze/fetchSaveSpaceTrend', payload:currentInfo.attr_id });
                            } else if ( activeKey === 'adjust') {
                                dispatch({ type:'demand/fetchUseless', payload:currentInfo.attr_id })
                            } else if ( activeKey === 'basecost') {
                                dispatch({ type:'demand/fetchAnalyz', payload:currentInfo.attr_id });
                            }
                        }} />
                    </div>
                }
            >
                {
                    activeKey === 'basecost'
                    ?                 
                    <div style={{ height:'100%', position:'relative' }}>
                        {
                            demandLoading
                            ?
                            <Loading />
                            :
                            null
                        }
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
                    </div> 
                    :
                    activeKey === 'adjust' 
                    ?
                    <div style={{ height:'100%' }}>
                        {
                            uselessLoading
                            ?
                            <Loading />
                            :
                            null
                        }                 
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
                    </div>            
                    :
                    activeKey === 'meter' 
                    ?
                    <div style={{ height:'100%' }}>
                        {
                            saveTrendLoading 
                            ?
                            <Loading />
                            :
                            null
                        }    
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