import React, { useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Radio, DatePicker, Select, Skeleton, Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import EnergyCostChart from './components/EnergyCostChart';
import RegionQuotaChart from './components/RegionQuotaChart';
import EnergyQuotaChart from './components/EnergyQuotaChart';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import style from '../IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';

const { Option } = Select;

function CostTrendManager({ dispatch, user, fields, attrEnergy }){
    let { allFields, energyList, currentField, energyInfo } = fields;
    let { attrData, attrQuota, energyQuota, currentDate, showType, isLoading, regionLoading } = attrEnergy; 
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let dateArr = currentDate.format('YYYY-MM-DD').split('-');
    const inputRef = useRef();
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'attrEnergy/cancelAll'});
        }
    },[])
    return (
        <div className={style['page-container']} style={{ paddingBottom:'0' }}>
            <div style={{ height:'40px'}}>
                <Radio.Group className={style['custom-radio']} style={{ marginRight:'1rem' }} value={energyInfo.type_id} onChange={e=>{
                    let temp = energyList.filter(i=>i.type_id === e.target.value)[0];
                    dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                    new Promise((resolve, reject)=>{
                        dispatch({ type:'fields/fetchField', payload:{ resolve, reject }})
                    })
                    .then(()=>{
                        dispatch({ type:'attrEnergy/fetchCost'});
                        dispatch({ type:'attrEnergy/fetchAttrQuota'});
                    })         
                }}>
                    {
                        energyList.map((item,index)=>(
                            <Radio.Button key={item.type_id} value={item.type_id}>{ item.type_name }</Radio.Button>
                        ))
                    }
                </Radio.Group>
                {
                    fieldList.length 
                    ?
                    <Select style={{ width:'120px', marginRight:'1rem' }} className={style['custom-select']} value={currentField.field_id} onChange={value=>{
                        let current = fieldList.filter(i=>i.field_id === value )[0];
                        dispatch({ type:'fields/toggleField', payload:{ field:current } });
                        dispatch({ type:'attrEnergy/fetchCost'});
                        dispatch({ type:'attrEnergy/fetchAttrQuota'});
                    }}>
                        {
                            fieldList.map((item,index)=>(
                                <Option key={item.field_id} value={item.field_id} >{ item.field_name }</Option>
                            ))
                        }
                    </Select>
                    :
                    null
                }
                <Radio.Group className={style['custom-radio']} value={showType} style={{ marginRight:'1rem' }} onChange={e=>{
                    dispatch({ type:'attrEnergy/toggleShowType', payload:e.target.value });
                }}>
                    <Radio.Button key='0' value='0'>成本</Radio.Button>
                    <Radio.Button key='1' value='1'>能耗</Radio.Button>
                </Radio.Group>
                
                <div style={{ display:'inline-flex', alignItems:'center' }}>
                    <div className={style['date-picker-button-left']} onClick={()=>{
                        let temp = new Date(currentDate.format('YYYY-MM-DD'));
                        let date = moment(temp).subtract(1,'days');
                        dispatch({ type:'attrEnergy/setDate', payload:date });
                        dispatch({ type:'attrEnergy/fetchCost'});
                    }}><LeftOutlined /></div>
                    <DatePicker ref={inputRef} className={style['custom-date-picker']} locale={zhCN} allowClear={false} value={currentDate} onChange={value=>{
                        dispatch({ type:'attrEnergy/setDate', payload:value });
                        dispatch({ type:'attrEnergy/fetchCost'});
                        if ( inputRef.current && inputRef.current.blur ){
                            inputRef.current.blur();
                        }
                    }}/> 
                    <div className={style['date-picker-button-right']} onClick={()=>{
                        let temp = new Date(currentDate.format('YYYY-MM-DD'));
                        let date = moment(temp).add(1,'days');
                        dispatch({ type:'attrEnergy/setDate', payload:date });
                        dispatch({ type:'attrEnergy/fetchCost'});
                    }}><RightOutlined /></div>
                </div>                     
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div style={{ height:'50%' }}>
                    {
                        attrData.map((item,index)=>(                    
                            <EnergyCostChart 
                                key={item.key}
                                data={item} 
                                showType={showType} 
                                energyInfo={energyInfo} 
                                year={dateArr[0]}
                                month={dateArr[1]}
                                day={dateArr[2]}
                                isLoading={isLoading}
                                onLink={action=>dispatch(action)}
                                theme={user.theme}
                            />                     
                        ))  
                    }
                </div>
                <div style={{ height:'50%' }}>             
                    <RegionQuotaChart 
                        data={attrQuota} 
                        onLink={action=>dispatch(action)} 
                        showType={showType} 
                        energyInfo={energyInfo}
                        isLoading={regionLoading} 
                        currentField={currentField}
                        theme={user.theme}
                    />                                         
                    <EnergyQuotaChart 
                        data={energyQuota} 
                        showType={showType} 
                        energyList={energyList}
                        theme={user.theme}
                        onToggleTimeType={value=>{
                            dispatch({type:'attrEnergy/fetchEnergyQuota', payload:value });
                        }} 
                    />             
                </div>
            </div>      
        </div>
    )
}

export default connect(({ user, fields, attrEnergy })=>({ user, fields, attrEnergy }))(CostTrendManager);