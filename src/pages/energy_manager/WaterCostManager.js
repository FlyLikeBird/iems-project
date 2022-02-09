import React, { useEffect, useState, useRef } from 'react';
import { history } from 'umi';
import { connect } from 'dva';
import { Card, Spin, Tree, Tabs, Skeleton, DatePicker, Button, Radio } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import InfoItem from './components/InfoItem';
import RangeBarChart from './components/RangeBarChart';
import style from '../IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function WaterCostManager({ dispatch, user, fields, energy }){
    const { timeType, startDate, endDate } = user;
    const { allFields, currentField, currentAttr, energyInfo, expandedKeys, treeLoading } = fields;
    const { waterCost } = energy;
    const inputRef = useRef();
    let fieldList = allFields['water'] ? allFields['water'].fieldList : [];
    let fieldAttrs = allFields['water'] && allFields['water'].fieldAttrs ? allFields['water']['fieldAttrs'][currentField.field_name] : [];
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
                            dispatch({ type:'energy/fetchWaterCost'});
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
                                            dispatch({ type:'energy/fetchWaterCost'});
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
            {/* <div style={{ height:'40px' }}>            
                    <CustomDatePicker noToggle onDispatch={()=>{
                        dispatch({type:'baseCost/fetchEleCost', payload:{ eleCostType:activeKey }});
                    }} />
                
                
            </div> */}
            {
                !Object.keys(currentField).length && !Object.keys(currentAttr).length 
                ?
                <div className={style['card-container']}>
                    <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
                        <div>请先设置水能源维度信息</div>
                        <div style={{ padding:'1rem 0'}}><Button type='primary' onClick={()=>{
                                history.push('/energy/info_manage_menu/field_manage?type=water');
                            }} >设置维度</Button></div>
                    </div>
                </div>
                :
                <div style={{ height:'100%'}}>
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
                            <RangeBarChart 
                                data={waterCost}
                                energyInfo={energyInfo} 
                                isLoading={false}
                                showType='0'
                                timeType='2'
                                onDispatch={action=>dispatch(action)}
                                theme={user.theme}
                                forWater={true}
                            /> 
                        </div>
                    </div>
                </div>
            }
            
        </div>
        :
        <Skeleton active className={style['skeleton']} />     
            
    );
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'energy/reset'});
        }
    },[]);
    return <ColumnCollapse sidebar={sidebar} content={content} />
}

export default connect(({ user, fields, energy})=>({ user, fields, energy}))(WaterCostManager);