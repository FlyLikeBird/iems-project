import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Tree, Spin, Pagination, Modal } from 'antd';
import { EyeOutlined, LeftOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import ChartContainer from './components/ChartContainer';
import style from './EleMonitor.css';
import IndexStyle from '@/pages/IndexPage.css';

function FrozenStationEff({ dispatch, user, monitorIndex }){
    const { authorized, theme } = user;
    const { machList, currentMach, chartInfo, isLoading } = monitorIndex;
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'monitorIndex/initFrozenStation'})
        }
    },[authorized])
    const sidebar = (
            <div className={IndexStyle['card-container']}>
                <div className={IndexStyle['card-title']}>设备列表</div>
                <div className={IndexStyle['card-content']}>
                    <div className={user.theme === 'dark' ? style['list-container'] + ' ' + style['dark'] : style['list-container']}>
                        {
                            machList && machList.length 
                            ?
                            machList.map((item,index)=>(
                                <div key={index} className={ currentMach.mach_id === item.mach_id ? style['list-item'] + ' ' + style['selected']: style['list-item']} onClick={()=>{
                                    let temp = machList.filter(i=>i.mach_id === item.mach_id)[0];
                                    dispatch({ type:'monitorIndex/setCurrentMach', payload:temp });
                                    dispatch({ type:'monitorIndex/fetchFrozenChartInfo', payload:{ type:'frozen' }});
                                }}>
                                    { item.meter_name }
                                </div>
                            ))
                            :
                            <Spin className={style['spin']} size='large' />
                        }
                    </div>
                </div>
            </div>
    );
    const content = (
        <div style={{ position:'relative' }}>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'40px' }}>
                <CustomDatePicker onDispatch={()=>dispatch({ type:'monitorIndex/fetchFrozenChartInfo', payload:{ type:'frozen' }})} />
            </div>
            <div style={{ height:'calc( 100% - 40px)' }}>
                <div className={IndexStyle['card-container']}>
                    <ChartContainer data={chartInfo} theme={theme} type='frozen' />
                </div>
            </div>
        </div>
    );
    return <ColumnCollapse sidebar={sidebar} content={content} optionStyle={{ height:'100%', backgroundColor:'#05050f'}} />
    
}

export default connect(({ user, monitorIndex })=>({ user, monitorIndex }))(FrozenStationEff);