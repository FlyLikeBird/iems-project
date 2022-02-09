import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Card, Spin, Tree, Tabs, Skeleton, DatePicker, Radio } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import style from '../IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function CostCalendarManager({ dispatch, user, fields, baseCost }){
    const { timeType, startDate, endDate } = user;
    const { allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
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
        <div>
            <div style={{ height:'40px' }}>
                {
                    activeKey === 'measure'
                    ?
                    <CustomDatePicker noDay onDispatch={()=>dispatch({ type:'baseCost/fetchMeasureCost' })} />
                    :
                    <CustomDatePicker noToggle onDispatch={()=>{
                        dispatch({type:'baseCost/fetchEleCost', payload:{ eleCostType:activeKey }});
                    }} />
                }
                
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                
            </div>
        </div>
        :
        <Skeleton active className={style['skeleton']} />     
            
    );
    useEffect(()=>{
        return ()=>{
            
        }
    },[]);
    return <ColumnCollapse sidebar={sidebar} content={content} />
}

export default connect(({ user, fields, baseCost})=>({ user, fields, baseCost}))(CostCalendarManager);