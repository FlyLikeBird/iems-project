import React, { useEffect } from 'react';
import { connect } from 'dva';
import { DatePicker, Select, Radio, Skeleton } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import EnergyCostChart from '../energy_manager/components/EnergyCostChart';
import RegionQuotaChart from '../energy_manager/components/RegionQuotaChart';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import style from '../IndexPage.css';
import moment from 'moment';

const { Option } = Select;

function EfficiencyTrendManager({ dispatch, user, fields, efficiency }){
    let { allFields, energyList, energyInfo, currentField } = fields;
    let { attrData, regionData, currentDate, isLoading, regionLoading } = efficiency;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let dateArr = currentDate.format('YYYY-MM-DD').split('-');
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'efficiency/cancelEffTrend'});  
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
                        dispatch({ type:'efficiency/fetchAttrRatio'});
                        dispatch({ type:'efficiency/fetchRegionRatio'});
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
                        dispatch({ type:'efficiency/fetchAttrRatio'});
                        dispatch({ type:'efficiency/fetchRegionRatio'});
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
                <div style={{ display:'inline-flex', alignItems:'center' }}>
                    <div className={style['date-picker-button-left']} onClick={()=>{
                        let temp = new Date(currentDate.format('YYYY-MM-DD'));
                        let date = moment(temp).subtract(1,'days');
                        dispatch({ type:'efficiency/setDate', payload:date });
                        dispatch({ type:'efficiency/fetchAttrRatio'});
                    }}><LeftOutlined /></div>
                    <DatePicker className={style['custom-date-picker']} locale={zhCN} allowClear={false} value={currentDate} onChange={value=>{
                        dispatch({ type:'efficiency/setDate', payload:value });
                        dispatch({ type:'efficiency/fetchAttrRatio'});
                    }}/> 
                    <div className={style['date-picker-button-right']} onClick={()=>{
                        let temp = new Date(currentDate.format('YYYY-MM-DD'));
                        let date = moment(temp).add(1,'days');
                        dispatch({ type:'efficiency/setDate', payload:date });
                        dispatch({ type:'efficiency/fetchAttrRatio'});
                    }}><RightOutlined /></div>
                </div>                     
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div style={{ height:'50%'}}>           
                    {
                        attrData.map((item,index)=>(
                                <EnergyCostChart 
                                    key={index}
                                    data={item} 
                                    energyInfo={energyInfo} 
                                    onSetDate={date=> { dispatch({type:'efficiency/setDate', payload:date }); dispatch({type:'efficiency/fetchAttrRatio'})}}
                                    year={dateArr[0]}
                                    month={dateArr[1]}
                                    day={dateArr[2]} 
                                    isLoading={isLoading}
                                    theme={user.theme}
                                />
                        ))
                    }
                </div>
                <div style={{ height:'50%'}}>
                    <RegionQuotaChart 
                        data={regionData} 
                        onLink={action=>dispatch(action)} 
                        energyInfo={energyInfo} 
                        theme={user.theme}
                        currentField={currentField}
                        isLoading={regionLoading}
                    />
                    <RegionQuotaChart 
                        data={regionData} 
                        onLink={action=>dispatch(action)} 
                        energyInfo={energyInfo} 
                        multi={true} 
                        theme={user.theme}
                        currentField={currentField}
                        isLoading={regionLoading}
                    />
                </div>
            </div>              
        </div>
    )
}

export default connect(({ user, fields, efficiency })=>({ user, fields, efficiency }))(EfficiencyTrendManager);