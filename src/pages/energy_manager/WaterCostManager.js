import React, { useEffect, useState, useRef } from 'react';
import { history } from 'umi';
import { connect } from 'dva';
import { Card, Spin, Tree, Tabs, Select, Skeleton, DatePicker, Button, Radio } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import InfoItem from './components/InfoItem';
import WaterBarChart from './components/WaterBarChart';
import style from '../IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

function WaterCostManager({ dispatch, user, fields, energy, worktime, location }){
    const { timeType, startDate, endDate } = user;
    const { list, currentWorktime } = worktime;
    const { allFields, currentField, currentAttr, energyInfo, expandedKeys, treeLoading } = fields;
    const { waterCost, waterLoading } = energy;
    const inputRef = useRef();
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
    useEffect(()=>{
        let strArr = location.pathname.split('/');
        let routePath = strArr[strArr.length - 1];
        dispatch({ type:'energy/initWaterCost', payload:{ type:routePath }});
    },[])
    const sidebar = (
        <div>
            <div className={style['card-container']}>
                <Tabs 
                    className={style['custom-tabs']} 
                    style={{ backgroundColor:'transparent' }}
                    activeKey={currentField.field_id + ''}                        
                    onChange={fieldKey=>{
                        let field = fieldList.filter(i=>i.field_id == fieldKey )[0];
                        dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                        new Promise((resolve)=>{
                            dispatch({type:'fields/fetchFieldAttrs', resolve })
                        }).then(()=>{
                            dispatch({ type:'energy/fetchWaterCost', payload:{ type:energyInfo.type_code }});                  
                    })
                }}>
                    {   
                        fields.isLoading
                        ?
                        null
                        :
                        fieldList && fieldList.length
                        ?                    
                        fieldList.map(field=>(
                            <TabPane 
                                key={field.field_id} 
                                tab={field.field_name}
                            >
                                {
                                    treeLoading
                                    ?
                                    <Spin />
                                    :
                                    <Tree
                                        className={style['custom-tree']}
                                        expandedKeys={expandedKeys}
                                        onExpand={temp=>{
                                            dispatch({ type:'fields/setExpandedKeys', payload:temp })
                                        }}
                                        selectedKeys={[currentAttr.key]}
                                        treeData={fieldAttrs}
                                        onSelect={(selectedKeys, { selected, node })=>{
                                            if(!selected) return;
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            dispatch({ type:'energy/fetchWaterCost', payload:{ type:energyInfo.type_code }});                  
                                        }}
                                    />
                                }
                            </TabPane>
                        ))
                        :
                        <div className={style['text']} style={{ padding:'1rem'}}>
                            <div>{`${energyInfo.type_name}能源类型还没有设置维度`}</div>
                           
                        </div>
                    }
                </Tabs>
            </div>
        </div>
    );
    const content = (
        Object.keys(waterCost).length
        ?
        <div>
            {
                waterLoading
                ?
                <Loading />
                :
                null
            }
            {
                !Object.keys(currentField).length && !Object.keys(currentAttr).length 
                ?
                <div className={style['card-container']}>
                    <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
                        <div>{ `请先设置${energyInfo.type_name}能源维度信息` }</div>
                        <div style={{ padding:'1rem 0'}}><Button type='primary' onClick={()=>{
                                history.push('/energy/info_manage_menu/field_manage?type=' + energyInfo.type_code);
                            }} >设置维度</Button></div>
                    </div>
                </div>
                :
                <div style={{ height:'100%'}}>
                    <div style={{ display:'flex', height:'40px' }}>
                        <CustomDatePicker onDispatch={()=>{
                            dispatch({ type:'energy/fetchWaterCost', payload:{ type:energyInfo.type_code }});                  
                        }} />
                        {
                            list.length
                            ?
                            <Select style={{ width:'160px', marginLeft:'1rem' }} className={style['custom-select']} value={currentWorktime.id} onChange={value=>{
                                let temp = value === 0 ? { id:0 } : list.filter(i=>i.id === value )[0];
                                dispatch({ type:'worktime/setCurrentWorktime', payload:temp });
                                dispatch({ type:'energy/fetchWaterCost', payload:{ type:energyInfo.type_code }});                  
                            }}>
                                <Option key={0} value={0}>全部班次</Option>
                                {
                                    list.map((item)=>(
                                        <Option key={item.id} value={item.id}>{ item.name }</Option>
                                    ))
                                }
                            </Select>
                            :
                            null
                        }
                    </div>
                    <div style={{ height:'calc( 100% - 40px)'}}>
                        <div className={style['card-container-wrapper']} style={{ display:'block', height:'20%', paddingRight:'0' }}>
                            {
                                waterCost.costInfo && waterCost.costInfo.length 
                                ?
                                waterCost.costInfo.map((item,index)=>(
                                    <div key={index} className={style['card-container-wrapper']} style={{ width:'50%', paddingRight:index === waterCost.costInfo.length - 1 ? '0' : '1rem', paddingBottom:'0'}}>
                                        <div className={style['card-container']}>
                                            <InfoItem key={index} data={item} energyInfo={energyInfo}  showType='0' />
                                        </div>
                                    </div>
                                ))
                                :
                                null
                            }
                        </div>
                        <div className={style['card-container-wrapper']} style={{ display:'block', height:'80%', paddingRight:'0', paddingBottom:'0' }}>
                            <div className={style['card-container']}>
                                <WaterBarChart 
                                    data={waterCost}
                                    energyInfo={energyInfo} 
                                    theme={user.theme}
                                    timeType={user.timeType}
                                /> 
                            </div>
                        </div>
                    </div>        
                </div>
            }
            
        </div>
        :
        <Skeleton active className={style['skeleton']} />     
            
    );
    useEffect(()=>{
    },[]);
    return <ColumnCollapse sidebar={sidebar} content={content} />
}

export default connect(({ user, fields, energy, worktime })=>({ user, fields, energy, worktime }))(WaterCostManager);