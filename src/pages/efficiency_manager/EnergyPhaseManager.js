import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Menu, Button, Modal, Tabs, Select, Skeleton, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ArrowRightOutlined, RightCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import PhaseLineChart from './components/PhaseLineChart';
import style from '../IndexPage.css';

const { TabPane } = Tabs;
const { Option } = Select;

const dayTimeTypes = {
    '1':'小时',
    '2':'30分钟',
    '3':'15分钟',
    // '4':'5分钟',
};

let dayTimeList=[];

for(let i=1;i<5;i++){
    dayTimeList.push({
        text:dayTimeTypes[i],
        value:i+''
    });
}

function EnergyPhaseManager({ dispatch, user, fields, demand }) {
    const { timeType, startDate, endDate, theme } = user;
    const { energyList, energyInfo, optionTypes, currentOption, typeRule, phaseInfo, phaseValueList, phaseLoading, phaseDayTimeType,  phaseOptionType } = demand ;
    const { allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    const inputRef = useRef();
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'demand/reset'});
        }
    },[]);
    const sidebar = (
        <div>
            <div className={style['card-container']}>
                <Tabs className={style['custom-tabs']} activeKey={currentField.field_id + ''} onChange={activeKey=>{
                    let field = fieldList.filter(i=>i.field_id == activeKey )[0];
                    dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                    new Promise((resolve)=>{
                        dispatch({type:'fields/fetchFieldAttrs', resolve })
                    }).then(()=>{
                        dispatch({type:'demand/fetchEnergyPhase'});     
                        dispatch({ type:'demand/fetchTypeRule'});              
                    })
                }}>
                    {                       
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
                                            dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                        }}
                                        selectedKeys={[currentAttr.key]}
                                        treeData={fieldAttrs}
                                        onSelect={(selectedKeys, {node})=>{
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            dispatch({type:'demand/fetchEnergyPhase'});
                                            dispatch({ type:'demand/fetchTypeRule'});              
                                        }}
                                    />
                                }
                            </TabPane>
                        ))
                    }
                </Tabs> 
            </div>
        </div>
    );
    const content = (
        Object.keys(phaseInfo).length 
        ?
        <div style={{ position:'relative' }}>
            {
                phaseLoading
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'40px', display:'flex' }}>
                <Select size='small' className={style['custom-select']} style={{ width:'140px', marginRight:'1rem' }} value={currentOption.key} onChange={(value)=>{
                    let result = optionTypes.filter(i=>i.key === value)[0];
                    dispatch({type:'demand/toggleCurrentOption', payload:result });
                    dispatch({type:'demand/fetchEnergyPhase'});
                    dispatch({ type:'demand/fetchTypeRule'});              
                }}>
                    {
                        optionTypes.map((item)=>(
                            <Option value={item.key} key={item.key}>{ item.title }</Option>
                        ))
                    }
                </Select>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({ type:'demand/fetchEnergyPhase'});
                }} />
            </div>
            <div className={style['card-container']} style={{ height:'calc( 100% - 40px)'}}>
                <div className={style['card-title']}>
                    <div>{`能源趋势图--${currentOption.title}`}</div>
                    {
                        Object.keys(phaseInfo).length && timeType === '1'
                        ?
                        <Menu style={{ backgroundColor:'transparent', color:theme === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.65)', height:'2.4rem', lineHeight:'2.4rem', marginLeft:'40px', borderBottom:'none' }} selectedKeys={[phaseDayTimeType]} mode="horizontal" onClick={e=>{
                            dispatch({type:'demand/togglePhaseDayTimeType', payload:e.key});
                            dispatch({type:'demand/fetchEnergyPhase'});
                        }}>
                            {
                                dayTimeList.map(item=>(
                                    <Menu.Item key={item.value}>
                                        { item.text }
                                    </Menu.Item>
                                ))
                            }
                        </Menu>
                        :
                        null
                    }
                </div>
                <div className={style['card-content']}>
                    <div className={style['flex-container']} style={{ height:'14%'}}>
                        {
                            phaseValueList.map((item,index)=>(
                                <div key={index} className={style['flex-item']} style={{ borderRight:index === phaseValueList.length - 1 ? 'none' : theme === 'dark' ? '1px solid #22264b' : '1px solid #f0f0f0'}}>
                                    <div>{ item.text }</div>
                                    <div className={style['data']}>{ `${item.value} ${item.unit}`}</div>
                                </div>
                            ))
                        }
                    </div>
                    <div style={{ height:'86%'}}>
                        
                            <PhaseLineChart 
                                data={phaseInfo} 
                                currentOption={currentOption}
                                typeRule={typeRule}
                                timeType={timeType} 
                                currentAttr={currentAttr} 
                                theme={theme} 
                                dispatch={dispatch}
                            />
                        
                    </div>
                </div>
            </div>
        </div>
        :
        <Skeleton active className={style['skeleton']} />
        
            
    );
    return (   
        <ColumnCollapse sidebar={sidebar} content={content} />
    );
}

export default connect(({ user, fields, demand })=>({ user, fields, demand }))(EnergyPhaseManager);
