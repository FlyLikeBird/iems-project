import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Card, Spin, Tree, Tabs, Skeleton, DatePicker, Button, Radio } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import Loading from '@/pages/components/Loading';
import style from '../IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import ReportDocument from './components/ReportDocument';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function EleStatementManager({ dispatch, fields, costReport, user }){
    const { energyList, energyInfo, allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    const { reportInfo, documentInfo, rateInfo } = costReport;
    const { currentCompany } = user;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
   
    const sidebar = (
        <div>
            <div className={style['card-container']}>
                <Tabs className={style['custom-tabs']} activeKey={energyInfo.type_id} onChange={activeKey=>{
                    let temp = energyList.filter(i=>i.type_id === activeKey)[0];
                    dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                    dispatch({ type:'fields/init' });
                }}>
                    {
                        energyList.map((item,index)=>(
                            <TabPane key={item.type_id} tab={item.type_name}>
                                <Tabs  
                                    className={style['custom-tabs']}
                                    activeKey={currentField.field_id + ''}  
                                    type='card'                      
                                    onChange={fieldKey=>{
                                        let field = fieldList.filter(i=>i.field_id == fieldKey )[0];
                                        dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                                        new Promise((resolve)=>{
                                            dispatch({type:'fields/fetchFieldAttrs', resolve })
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
                                                            dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                                        }}
                                                        selectedKeys={[currentAttr.key]}
                                                        treeData={fieldAttrs}
                                                        onSelect={(selectedKeys, {node})=>{
                                                            dispatch({type:'fields/toggleAttr', payload:node});
                                                        }}
                                                    />
                                                }
                                            </TabPane>
                                        ))
                                        :
                                        <div className={style['text']} style={{ padding:'1rem'}}>
                                            <div>{`${energyInfo.type_name}能源类型还没有设置维度`}</div>
                                            <div style={{ padding:'1rem 0'}}><Button type='primary' onClick={()=>{
                                                history.push(`/energy/info_manage_menu/field_manage?type=${energyInfo.type_code}`);
                                            }} >设置维度</Button></div>
                                        </div>
                                    }
                                </Tabs>
                            </TabPane>
                        ))
                    }
                </Tabs>
            </div>
        </div>
    );
    const content = (
        <div>
            {
                treeLoading
                ?
                <div style={{ height:'100%', position:'absolute', top:'0', left:'0', width:'100%' }}>
                    <Loading />
                </div>
                :
                null
            }
            {
                Object.keys(rateInfo).length 
                ?
                <ReportDocument 
                    theme={user.theme}
                    dispatch={action=>dispatch(action)}
                    onFetchDocument={ payload =>dispatch({type:'costReport/fetchDocument', payload })}
                    onCreateDocument={ htmlStr=>dispatch({type:'costReport/createDocument', payload:{ htmlStr }})} 
                    currentField={currentField} 
                    currentAttr={currentAttr}
                    energyInfo={energyInfo} 
                    rateInfo={rateInfo}
                    companyInfo={currentCompany}
                    documentInfo={documentInfo} 
                    onTranslateImg={payload=>dispatch({type:'costReport/translateImg', payload})}
                /> 
                :
                <Spin size='large' className={style['spin']} />
            }
                        
        </div>
    );
    return <ColumnCollapse sidebar={sidebar} content={content} />
}

export default connect(({ fields, user, costReport })=>({ fields, user, costReport }))(EleStatementManager);