import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Card, Spin, Tree, Tabs, Skeleton, DatePicker, Radio } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import style from '../IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import BalanceBarChart from './components/BalanceBarChart';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function EleStatementManager({ dispatch, fields, eleQuality, user }){
    const inputRef = useRef();
    const { timeType, startDate, endDate, theme } = user;
    const { allFields, currentField, currentAttr, treeLoading } = fields;
    const { eleBalance } = eleQuality;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'eleQuality/resetEleBalance'});
        }
    },[])
    const sidebar = (
        <div>
            <div className={style['card-container']}>
                <Tabs  
                    className={style['custom-tabs']}
                    activeKey={currentField.field_id + ''}                        
                    onChange={fieldKey=>{
                        let field = fieldList.filter(i=>i.field_id == fieldKey )[0];
                        dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                        new Promise((resolve)=>{
                            dispatch({type:'fields/fetchFieldAttrs', resolve })
                        }).then(()=>{
                            dispatch({ type:'eleQuality/fetchEleBalance'});

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
                                        defaultExpandAll={true}
                                        selectedKeys={[currentAttr.key]}
                                        treeData={fieldAttrs}
                                        onSelect={(selectedKeys, {node})=>{
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            dispatch({ type:'eleQuality/fetchEleBalance'});
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
        Object.keys(eleBalance).length 
        ?
        <div>
            <div style={{ height:'40px'}}>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({ type:'eleQuality/fetchEleBalance'});
                }} />
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div className={style['card-container-wrapper']} style={{ display:'block', height:'50%', paddingRight:'0'}}>
                    <div className={style['card-container']}>
                        <BalanceBarChart xData={eleBalance.date} yData={eleBalance.voltage} title='电压三相不平衡' timeType={timeType} theme={user.theme} />
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ display:'block', height:'50%', paddingRight:'0', paddingBottom:'0' }}>
                    <div className={style['card-container']}>
                    <BalanceBarChart xData={eleBalance.date} yData={eleBalance.current} title='电流三相不平衡' timeType={timeType} theme={user.theme} />
                    </div>
                </div>
            </div>
        </div>
        :
        <Skeleton active className={style['skeleton']} />
        
    );
    return <ColumnCollapse sidebar={sidebar} content={content} />
}

export default connect(({ fields, user, eleQuality })=>({ fields, user, eleQuality }))(EleStatementManager);