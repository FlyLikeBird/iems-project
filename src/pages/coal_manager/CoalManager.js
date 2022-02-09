import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import CoalInfoItem from './components/CoalInfoItem';
import CoalStackBar from './components/CoalStackBar';
import Loading from '@/pages/components/Loading';
import style from '@/pages/IndexPage.css';

function CoalManager({ dispatch, user, carbon }){
    const { carbonInfoList, carbonData, carbonLoading } = carbon;
    useEffect(()=>{
        dispatch({ type:'carbon/fetchCarbonIndex'});
        return ()=>{
            dispatch({ type:'carbon/reset'});
        }
    },[])
    return (
        <div className={style['page-container']}>
            <div style={{ height:'16%' }}>
                {
                    carbonInfoList.map((item,key)=>(
                        <CoalInfoItem data={item} key={key} theme={user.theme} />
                    ))
                }
            </div>
            <div className={style['card-container']} style={{ height:'84%' }}>
                {
                    carbonLoading 
                    ?
                    <Loading />
                    :
                    null
                }
                {
                    Object.keys(carbonData).length 
                    ?
                    <CoalStackBar data={carbonData.view} theme={user.theme} timeType={user.timeType} dispatch={dispatch} startDate={user.startDate} />
                    :
                    <Spin size='large' className={style['spin']} />
                }
            </div> 
        </div>
    )
}

export default connect(({ user, carbon })=>({ user, carbon }))(CoalManager);