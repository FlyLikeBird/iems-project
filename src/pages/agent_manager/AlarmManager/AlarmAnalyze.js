import React, { useEffect } from 'react';
import { Spin } from 'antd';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import style from './AlarmManager.css';
import MultiBarChart from './MultiBarChart';
import Loading from '@/pages/components/Loading';

function AlarmAnalyze({ dispatch, timeType, chartInfo, isLoading }){
    useEffect(()=>{
       dispatch({ type:'agentMonitor/fetchSumTrend'}); 
    },[])
    return (
        <div style={{ height:'100%' }}>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'40px'}}>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({ type:'agentMonitor/fetchSumTrend'}); 
                }} />
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div style={{ height:'40%', marginBottom:'1rem', backgroundColor:'rgba(0, 0, 0, 0.2)' }}>
                    {
                        Object.keys(chartInfo).length 
                        ?
                        <MultiBarChart data={chartInfo.sumInfo} timeType={timeType} title='告警趋势' theme='dark' />
                        :
                        <Spin className={style['spin']} />
                    }
                </div>
                <div style={{ height:'60%', marginBottom:'1rem', backgroundColor:'rgba(0, 0, 0, 0.2)' }}>
                    {
                        Object.keys(chartInfo).length 
                        ?
                        <MultiBarChart data={chartInfo.trendInfo} timeType={timeType} title='项目告警排名' theme='dark' forProject={true} />
                        :
                        <Spin className={style['spin']} />
                    }
                </div>
            </div>
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.chartInfo !== nextProps.chartInfo || prevProps.isLoading !== nextProps.isLoading   ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(AlarmAnalyze, areEqual);