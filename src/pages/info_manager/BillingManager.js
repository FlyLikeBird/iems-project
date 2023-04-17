import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'dva';
import { Table, Tabs, Select, Spin, Switch, Form, Skeleton, Input, Tag } from 'antd';
import { FireOutlined, DownloadOutlined, DoubleLeftOutlined, DoubleRightOutlined, PlusOutlined } from '@ant-design/icons'
import style from '../IndexPage.css';
import EleBilling  from './components/EleBilling';
import WaterBilling from './components/WaterBilling';
const { Option } = Select;
const { TabPane } = Tabs;

const allTimeType = {
    1:'峰时段',
    2:'平时段',
    3:'谷时段',
    4:'尖时段'
};

function BillingManager({ dispatch, user, fields, billing }){
    let { companyList, currentCompany, theme } = user;
    let { energyList, energyInfo } = fields;
    let { rateList, rateInfo, tplList, feeRate } = billing;
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'billing/reset'});
        }
    },[]);
    const onDispatch = useCallback((action)=>{
        dispatch(action);
    },[]);
    return (
       <div className={style['page-container']}>
           <div className={style['card-container']}>
                <Tabs className={style['custom-tabs']} activeKey={energyInfo.type_id} onChange={activeKey=>{
                    let temp = energyList.filter(i=>i.type_id === activeKey)[0];
                    dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                }}>
                    {
                        energyList.map((item,index)=>(
                            <TabPane key={item.type_id} tab={item.type_name}>
                                {
                                    item.type_code === 'ele' 
                                    ?
                                    <EleBilling rateList={rateList} rateInfo={rateInfo} tplList={tplList}  theme={theme} dispatch={onDispatch} />
                                    :
                                    <WaterBilling  energyInfo={energyInfo} feeRate={feeRate} dispatch={onDispatch} />
                                }
                            </TabPane>
                        ))
                    }
                </Tabs>
           </div>
       </div>
    )
};

BillingManager.propTypes = {
};

export default connect( ({ user, fields, billing }) => ({ user, fields, billing }))(BillingManager);