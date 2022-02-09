import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Modal, Spin } from 'antd';
import style from './AlarmManager.css';
import AlarmList from './AlarmList';
import AlarmAnalyze from './AlarmAnalyze';
import Loading from '@/pages/components/Loading';

function AlarmManager({ dispatch, user, agentMonitor }){
    let [currentKey, setCurrentKey] = useState('1');
    let [ info, setInfo] = useState({ visible:false, current:null, action_code:'' });

    let { userInfo, timeType } = user;
    let { warningList, currentPage, total, alarmLoading, progressLog, logTypes, chartInfo, chartLoading } = agentMonitor;
   
    return (
        <div className={style['container']}>
            <div className={style['btn-container']}>
                <span className={style['btn'] + ' ' + ( currentKey === '1' ? style['selected'] : '')} onClick={()=>setCurrentKey('1')}>告警列表</span>
                <span className={style['btn'] + ' ' + ( currentKey === '2' ? style['selected'] : '')} onClick={()=>setCurrentKey('2')}>告警分析</span>
            </div>
            {
                alarmLoading 
                ?
                <Loading />
                :
                null
            }
            {
                Object.keys(userInfo).length 
                ?
                currentKey === '1' 
                ?
                <AlarmList 
                    dispatch={dispatch} 
                    userInfo={userInfo} 
                    data={warningList} 
                    info={info}
                    currentPage={currentPage} 
                    total={total} 
                    onProgress={info=>setInfo(info)}
                    logTypes={logTypes}
                    progressLog={progressLog}
                />
                :
                currentKey === '2'
                ?
                <AlarmAnalyze dispatch={dispatch} timeType={timeType} chartInfo={chartInfo} isLoading={chartLoading} />
                :
                null
                :
                <Spin className={style['spin']} />
            }
        </div>
    )
}

export default connect(({ user, agentMonitor })=>({ user, agentMonitor }))(AlarmManager);