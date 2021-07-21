import React, { Component, useState, useRef } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Table, Button, Breadcrumb, Dropdown, Select, Radio, DatePicker, message } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import style from '../../routes/EnergyManagerProject/IndexPage.css';
import { energyIcons } from '../../utils/energyIcons';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import CustomDatePicker from '../CustomDatePicker';
import moment from 'moment';

const { Option } = Select;

const BreadcrumbComponent = ({ dispatch, user, efficiency, energy, attrEnergy }) => {
    const { routePath, currentCompany, userInfo, currentPath } = user;
    const { energyList, energyInfo, showType, currentDate, timeType } = 
        currentPath === '/energy/energy_manage' 
        ? 
        energy
        :
        currentPath === '/energy/energy_manage/cost_trend'
        ?
        attrEnergy
        :     
        currentPath === '/energy/energy_eff' || currentPath === '/energy/energy_eff/eff_trend'
        ? 
        efficiency 
        :
        {}; 
    const inputRef = useRef();
    return (    
        //  指定页面不渲染导航条             
        // currentPath === '/info_manage_menu/quota_manage' || currentPath.includes('/manual_input/operateInfo') || currentPath.includes('/manual_input/manualMeter')
        // ?
        // null
        // :
        <div className={style['breadcrumb']}>
            <Breadcrumb>
            {
                routePath && routePath.length 
                ?
                routePath.map((route,index)=>(
                    route && route.menu_name
                    ?
                    <Breadcrumb.Item key={index}>
                            {
                                route.linkable 
                                ? 
                                <Link to={`${route.path}`}>{route.menu_name}</Link>
                                :
                                <span>{route.menu_name}</span>
                            }
                    </Breadcrumb.Item>
                    :
                    null
                ))
                :
                null
            }                       
            </Breadcrumb> 
            {/* <div>
                <span style={{ fontWeight:'bold', color:'#34363c' }}>当前公司: </span>
                <Select size='small' style={{ width:'200px', marginLeft:'6px' }} value={+currentCompany} onChange={value=>{
                    onDispatch({ type:'user/changeCompany', payload:value });
                    // 基础填报信息页面
                    if ( currentPath.includes('/info_manage_menu')){
                        // 维度管理
                        if ( currentPath === '/info_manage_menu/field_manage') onDispatch({type:'fields/fetchField'});
                        // 定额管理
                        if ( currentPath === '/info_manage_menu/quota_manage') onDispatch({type:'quota/fetchInit'});
                        // 手工填报
                        if ( currentPath.includes('/info_manage_menu/manual_input')) onDispatch({type:'manually/fetchInit'});
                    }
                    if ( currentPath.includes('/energy_manage')) {
                        // 能源成本主页
                        if ( currentPath === '/energy_manage') onDispatch({ type:'energy/fetchInit'});
                        if ( currentPath === '/energy_manage/energy_cost_report') onDispatch({ type:''})
                    } else if ( currentPath === '') {

                    }
                }}>
                    {
                        userInfo.companys && userInfo.companys.length 
                        ?
                        userInfo.companys.map((item)=>(
                            <Option key={item.company_id} value={item.company_id}>{ item.company_name }</Option>
                        ))
                        :
                        null
                    }
                </Select>
            </div>  */}
            {/* 能源效率页面 */}
            {
                currentPath === '/energy/energy_eff' && energyList && energyInfo
                ?
                <div>
                    <Radio.Group size='small' buttonStyle='solid' value={energyInfo.type_id} onChange={e=>{
                        let prevEnergy = energyInfo;
                        let currentEnergy = energyList.filter(i=>i.type_id === e.target.value )[0];
                        if ( e.target.value === 0 || e.target.value === 1 ){
                            dispatch({type:'efficiency/toggleEnergyType', payload:currentEnergy });
                            dispatch({type:'efficiency/setCostChart'});
                            dispatch({type:'efficiency/toggleMaskVisible', payload:true});
                            Promise.all([
                                new Promise((resolve, reject)=>{
                                    dispatch({type:'efficiency/fetchRatio', payload:{ resolve, reject }});
                                }),
                                new Promise((resolve, reject)=>{
                                    dispatch({type:'efficiency/fetchAttrRatio', payload:{ resolve, reject }});
                                })
                            ])
                            .then(()=>{
                                dispatch({type:'efficiency/toggleMaskVisible', payload:false});
                            })
                            .catch(()=>{
                                dispatch({type:'efficiency/toggleEnergyType', payload:prevEnergy});
                            })
                            
                        } else {
                            message.info(`还没有接入${currentEnergy.type_name}能源数据`);
                        }

                    }}>
                        {
                            energyList.map((item,index)=>(
                                <Radio.Button key={item.type_id} value={item.type_id}>{item.type_name}</Radio.Button>
                            ))
                        }
                    </Radio.Group>
                </div>
                :
                null
            }
            {/* 能源成本页面 */}
            {
                currentPath === '/energy/energy_manage' && energyList && energyInfo
                ?
                <div>
                    <Radio.Group buttonStyle='solid' size='small' value={energyInfo.type_id} onChange={e=>{
                        let prevEnergy = energyInfo;
                        let currentEnergy = energyList.filter(i=>i.type_id === e.target.value )[0];
                        if ( e.target.value === 0 || e.target.value === 1 ){
                            dispatch({type:'energy/toggleEnergyType', payload:currentEnergy });
                            dispatch({type:'energy/toggleMaskVisible', payload:true });
                            Promise.all([
                                new Promise((resolve,reject)=>{
                                    dispatch({type:'energy/fetchCost', payload:{ resolve, reject }});
                                }),
                                new Promise((resolve, reject)=>{
                                    dispatch({type:'energy/fetchCostByTime', payload:{ resolve, reject }})
                                })
                            ])
                            .then(()=>{
                                dispatch({type:'energy/toggleMaskVisible', payload:false});
                            })
                            .catch(()=>{
                                dispatch({type:'energy/toggleEnergyType', payload:prevEnergy});
                            })
                        } else {
                            message.info(`还没有接入${currentEnergy.type_name}能源数据`);
                        }                           
                    }}>
                        {
                            energyList.map((item,index)=>(
                                <Radio.Button key={item.type_id} value={item.type_id}>{item.type_name}</Radio.Button>
                            ))
                        }
                    </Radio.Group>
                    <Radio.Group style={{ marginLeft:'10px' }} size='small' buttonStyle="solid" value={showType} onChange={e=>dispatch({type:'energy/toggleShowType', payload:e.target.value})}>
                        <Radio.Button key='0' value='0'>成本</Radio.Button>
                        <Radio.Button key='1' value='1'>能耗</Radio.Button>
                    </Radio.Group>
                </div>
                :
                null
            }
            {/* 成本趋势页面 */}
            {
                currentPath === '/energy/energy_manage/cost_trend' && energyList && energyInfo
                ?
                <div style={{ display:'flex', alignItems:'center' }}>
                    <Radio.Group buttonStyle='solid' size='small' style={{ marginRight:'10px' }} value={timeType} onChange={(e)=>{
                        let temp = moment(new Date());
                        dispatch({ type:'attrEnergy/toggleTimeType', payload:{ data:e.target.value }});
                    }}>
                        <Radio.Button key='day' value='day'>日</Radio.Button>
                        <Radio.Button key='month' value='month'>月</Radio.Button>
                        <Radio.Button key='year' value='year'>年</Radio.Button>
                    </Radio.Group>
                    <div style={{ display:'inline-flex', marginRight:'10px' }}>
                        <div className={style['date-picker-button-left']} onClick={()=>{
                            let date = new Date(currentDate.format('YYYY-MM-DD'));
                            let temp;
                            if ( timeType === 'day'){
                                temp = moment(date).subtract(1,'days');
                                dispatch({ type:'attrEnergy/setDate', payload:{ data:temp }});
                                dispatch({ type:'attrEnergy/fetchCost'});
                            } else if ( timeType === 'month'){
                                temp = moment(date).subtract(1,'months');
                                dispatch({ type:'attrEnergy/setDate', payload:{ data:temp }});
                                dispatch({ type:'attrEnergy/fetchCost'});
                            } else if ( timeType === 'year') {
                                temp = moment(date).subtract(1,'years');
                                dispatch({ type:'attrEnergy/setDate', payload:{ data:temp }});
                                dispatch({ type:'attrEnergy/fetchCost'});
                            }
                        }}><LeftOutlined /></div>
                        <DatePicker size='small' ref={inputRef} locale={zhCN} allowClear={false} value={currentDate} onChange={date=>{
                            dispatch({ type:'attrEnergy/setDate', payload:{ data:date }});
                            dispatch({ type:'attrEnergy/fetchCost'});
                            if ( inputRef.current && inputRef.current.blur ) inputRef.current.blur();
                        }}/>
                        <div className={style['date-picker-button-right']} onClick={()=>{
                            let date = new Date(currentDate.format('YYYY-MM-DD'));
                            let temp;
                            if ( timeType === 'day'){
                                temp = moment(date).add(1,'days');
                                dispatch({ type:'attrEnergy/setDate', payload:{ data:temp }});
                                dispatch({ type:'attrEnergy/fetchCost'});
                            } else if ( timeType === 'month') {
                                temp = moment(date).add(1,'months');
                                dispatch({ type:'attrEnergy/setDate', payload:{ data:temp }});
                                dispatch({ type:'attrEnergy/fetchCost'});
                            } else if ( timeType === 'year'){
                                temp = moment(date).add(1,'years');
                                dispatch({ type:'attrEnergy/setDate', payload:{ data:temp }});
                                dispatch({ type:'attrEnergy/fetchCost'});
                            }
                        }}><RightOutlined /></div>

                    </div>
                    <Radio.Group buttonStyle='solid' size='small' value={energyInfo.type_id} onChange={e=>{
                        let prevEnergy = energyInfo;
                        let currentEnergy = energyList.filter(i=>i.type_id === e.target.value )[0];
                        if ( e.target.value === 0 || e.target.value === 1 ){
                            dispatch({ type:'attrEnergy/toggleEnergyType', payload:currentEnergy });
                            dispatch({ type:'attrEnergy/fetchCost' });
                        } else {
                            message.info(`还没有接入${currentEnergy.type_name}能源数据`);
                        }                           
                    }}>
                        {
                            energyList.map((item,index)=>(
                                <Radio.Button key={item.type_id} value={item.type_id}>{item.type_name}</Radio.Button>
                            ))
                        }
                    </Radio.Group>
                    <Radio.Group style={{ marginLeft:'10px' }} size='small' buttonStyle="solid" value={showType} onChange={e=>dispatch({type:'attrEnergy/toggleShowType', payload:e.target.value})}>
                        <Radio.Button key='0' value='0'>成本</Radio.Button>
                        <Radio.Button key='1' value='1'>能耗</Radio.Button>
                    </Radio.Group>
                </div>
                :
                null
            }
            {/* 能效趋势页面 */}
            {
                currentPath === '/energy/energy_eff/eff_trend' && energyList && energyInfo
                ?
                <div style={{ display:'flex', alignItems:'center' }}>
                    <Radio.Group buttonStyle='solid' size='small' style={{ marginRight:'10px' }} value={timeType} onChange={(e)=>{
                        let temp = moment(new Date());
                        dispatch({ type:'efficiency/toggleTimeType', payload:{ data:e.target.value }});
                    }}>
                        <Radio.Button key='day' value='day'>日</Radio.Button>
                        <Radio.Button key='month' value='month'>月</Radio.Button>
                        <Radio.Button key='year' value='year'>年</Radio.Button>
                    </Radio.Group>
                    <div style={{ display:'inline-flex', marginRight:'10px' }}>
                        <div className={style['date-picker-button-left']} onClick={()=>{
                            let date = new Date(currentDate.format('YYYY-MM-DD'));
                            let temp;
                            if ( timeType === 'day'){
                                temp = moment(date).subtract(1,'days');
                                dispatch({ type:'efficiency/setDate', payload:{ data:temp }});
                                dispatch({ type:'efficiency/fetchAttrRatio'});
                            } else if ( timeType === 'month'){
                                temp = moment(date).subtract(1,'months');
                                dispatch({ type:'efficiency/setDate', payload:{ data:temp }});
                                dispatch({ type:'efficiency/fetchAttrRatio'});
                            } else if ( timeType === 'year') {
                                temp = moment(date).subtract(1,'years');
                                dispatch({ type:'efficiency/setDate', payload:{ data:temp }});
                                dispatch({ type:'efficiency/fetchAttrRatio'});
                            }
                        }}><LeftOutlined /></div>
                        <DatePicker size='small' ref={inputRef} locale={zhCN} allowClear={false} value={currentDate} onChange={date=>{
                            dispatch({ type:'efficiency/setDate', payload:{ data:date }});
                            dispatch({ type:'efficiency/fetchAttrRatio'});
                            if ( inputRef.current && inputRef.current.blur ) inputRef.current.blur();
                        }}/>
                        <div className={style['date-picker-button-right']} onClick={()=>{
                            let date = new Date(currentDate.format('YYYY-MM-DD'));
                            let temp;
                            if ( timeType === 'day'){
                                temp = moment(date).add(1,'days');
                                dispatch({ type:'efficiency/setDate', payload:{ data:temp }});
                                dispatch({ type:'efficiency/fetchAttrRatio'});
                            } else if ( timeType === 'month') {
                                temp = moment(date).add(1,'months');
                                dispatch({ type:'efficiency/setDate', payload:{ data:temp }});
                                dispatch({ type:'efficiency/fetchAttrRatio'});
                            } else if ( timeType === 'year'){
                                temp = moment(date).add(1,'years');
                                dispatch({ type:'efficiency/setDate', payload:{ data:temp }});
                                dispatch({ type:'efficiency/fetchAttrRatio'});
                            }
                        }}><RightOutlined /></div>

                    </div>
                    <Radio.Group buttonStyle='solid' size='small' value={energyInfo.type_id} onChange={e=>{
                        let prevEnergy = energyInfo;
                        let currentEnergy = energyList.filter(i=>i.type_id === e.target.value )[0];
                        if ( e.target.value === 0 || e.target.value === 1 ){
                            dispatch({ type:'efficiency/toggleEnergyType', payload:currentEnergy });
                            dispatch({ type:'efficiency/fetchAttrRatio' });
                        } else {
                            message.info(`还没有接入${currentEnergy.type_name}能源数据`);
                        }                           
                    }}>
                        {
                            energyList.map((item,index)=>(
                                <Radio.Button key={item.type_id} value={item.type_id}>{item.type_name}</Radio.Button>
                            ))
                        }
                    </Radio.Group>
                </div>
                :
                null
            }
            {/* 成本透视页面 */}
            {
                currentPath === '/energy/energy_manage/cost_analyz'
                ?
                <CustomDatePicker onDispatch={()=>{
                    dispatch({ type:'costReport/fetchCostAnalyze'});
                }}/>
                :
                null
            }
           
        </div>
        
    )
}

BreadcrumbComponent.propTypes = {
};

export default connect(({ user, efficiency, energy, attrEnergy, meterReport })=>({ user, efficiency, energy, attrEnergy, meterReport }))(BreadcrumbComponent);