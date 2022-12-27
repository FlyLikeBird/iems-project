import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Card, Spin, Tree, Tabs, Select, Skeleton, DatePicker, Radio } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import MeasureCostManager from './MeasureCostManager';
import BaseCostManager from './BaseCostManager';
import AdjustCostManager from './AdjustCostManager';
import style from '../IndexPage.css';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

function EleCostManager({ dispatch, user, fields, baseCost, worktime }){
    const { timeType, startDate, endDate } = user;
    const { list, currentWorktime } = worktime;
    const { allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    const { isLoading, measureCostInfo, baseCostInfo, adjustCostInfo } = baseCost;
    const [activeKey, setActiveKey] = useState('measure');
    const inputRef = useRef();
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    // console.log(fieldAttrs);
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
                            dispatch({type:'baseCost/fetchEleCost', payload:{ eleCostType:activeKey }});
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
                                        onExpand={(temp)=>{
                                            dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                        }}
                                        selectedKeys={[currentAttr.key]}
                                        treeData={fieldAttrs}
                                        onSelect={(selectedKeys, {node})=>{
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            dispatch({type:'baseCost/fetchEleCost', payload:{ eleCostType:activeKey }});
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
        Object.keys(measureCostInfo).length
        ?
        <div style={{ position:'relative' }}>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ display:'flex', height:'40px' }}>
                {
                    activeKey === 'measure'
                    ?
                    <CustomDatePicker noDay onDispatch={()=>dispatch({ type:'baseCost/fetchMeasureCost' })} />
                    :
                    <CustomDatePicker noToggle onDispatch={()=>{
                        dispatch({type:'baseCost/fetchEleCost', payload:{ eleCostType:activeKey }});
                    }} />
                }
                {
                    list.length 
                    ?
                    <Select style={{ width:'160px', marginLeft:'1rem' }} className={style['custom-select']} value={currentWorktime.id} onChange={value=>{
                        let temp = value === 0 ? { id:0 } : list.filter(i=>i.id === value )[0];
                        dispatch({ type:'worktime/setCurrentWorktime', payload:temp });
                        dispatch({type:'baseCost/fetchEleCost', payload:{ eleCostType:activeKey }});
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
                <Tabs className={style['custom-tabs'] + ' ' + style['flex-tabs']} tabBarStyle={{ paddingLeft:'20px', marginBottom:'0' }} activeKey={activeKey} onChange={activeKey=>{
                    if ( activeKey === 'basecost' || activeKey === 'adjust') {
                        dispatch({ type:'user/toggleTimeType', payload:'3' });
                    }
                    dispatch({ type:'baseCost/fetchEleCost', payload:{ eleCostType:activeKey } });
                    setActiveKey(activeKey);
                }} tabBarExtraContent={{
                    right:(
                        activeKey === 'measure' 
                        ?
                        <div className={style['text']} style={{ display:'inline-flex', alignItems:'center', padding:'0 1rem' }}>
                            <span>总电费:</span>
                            <span style={{ fontSize:'1.4rem', fontWeight:'bold', color:'#1890ff', margin:'0 6px'}}>{ measureCostInfo.base ? Math.floor(measureCostInfo.base.totalCost) : 0 }</span>
                            <span>元</span>
                            <span style={{ margin:'0 20px'}}>|</span>
                            <span>可节省空间:</span>
                            <span style={{ fontSize:'1.4rem', fontWeight:'bold', color:'#1890ff', margin:'0 6px'}}>{ measureCostInfo.saveCost ? Math.floor(measureCostInfo.saveCost) : 0 }</span>
                            <span>元</span>
                        </div>
                        :
                        activeKey === 'basecost' 
                        ?
                        <div className={style['text']} style={{ display:'inline-flex', alignItems:'center', padding:'0 1rem' }}>
                            <span>需量电费二次节俭空间:</span>
                            <span style={{ fontSize:'1.4rem', fontWeight:'bold', color:'#1890ff', margin:'0 6px'}}>{  baseCostInfo.demand_save_cost ? Math.floor(baseCostInfo.demand_save_cost) : 0 }</span>
                            <span>元</span>
                            <span style={{ margin:'0 20px'}}>|</span>
                            <span>基本电费差价:</span>
                            <span style={{ fontSize:'1.4rem', fontWeight:'bold', color:'#1890ff', margin:'0 6px'}}>{  baseCostInfo.demand_amount ? Math.floor(baseCostInfo.demand_amount < baseCostInfo.kva_amount ? baseCostInfo.kva_amount - baseCostInfo.demand_amount : baseCostInfo.demand_amount - baseCostInfo.kva_amount) : 0 }</span>
                            <span>元</span>
                        </div>
                        :
                        activeKey === 'adjust' 
                        ?
                        <div className={style['text']} style={{ display:'inline-flex', alignItems:'center', padding:'0 1rem' }}>
                            <span>力调电费二次节俭空间:</span>
                            <span style={{ fontSize:'1.4rem', fontWeight:'bold', color:'#1890ff', margin:'0 6px',  }}>{  adjustCostInfo.adjuest_save_cost ? Math.round(adjustCostInfo.adjuest_save_cost) : 0}</span>
                            <span>元</span>
                            <span style={{ margin:'0 20px'}}>|</span>
                            <span>力调电费:</span>
                            <span style={{ fontSize:'1.4rem', fontWeight:'bold', color:'#1890ff', margin:'0 6px' }}>{  adjustCostInfo.avgAdjustCost ? Math.round(adjustCostInfo.avgAdjustCost) : 0 }</span>
                            <span>元</span>
                        </div>
                        :
                        null
                    )
                }}>
                    <TabPane tab='电度电费' key='measure'>                     
                        <MeasureCostManager />                       
                    </TabPane>
                    <TabPane tab='基本电费' key='basecost'>            
                        <BaseCostManager />                   
                    </TabPane>
                    <TabPane tab='力调电费' key='adjust'>
                        <AdjustCostManager />                      
                    </TabPane>
                </Tabs> 
            </div>
        </div>
        :
        <Skeleton active className={style['skeleton']} />     
            
    );
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'baseCost/reset'});
            dispatch({ type:'user/toggleTimeType', payload:'1' });
        }
    },[]);
    return <ColumnCollapse sidebar={sidebar} content={content} />
}

export default connect(({ user, fields, baseCost, worktime })=>({ user, fields, baseCost, worktime }))(EleCostManager);