import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Card, Spin, Tree, Tabs, Skeleton, DatePicker, Radio } from 'antd';
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
    const { energyList, energyInfo, allFields, currentField, currentAttr, treeLoading } = fields;
    const { reportInfo, documentInfo, rateInfo } = costReport;
    const { currentCompany } = user;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
    // console.log(allFields);
    // console.log(fields);
    const sidebar = (
        <div>
            <div className={style['card-container']}>
                <Tabs className={style['custom-tabs']} activeKey={energyInfo.type_id} onChange={activeKey=>{
                    let temp = energyList.filter(i=>i.type_id === activeKey)[0];
                    dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                    dispatch({ type:'fields/init', payload:true });
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
                                            dispatch({type:'fields/fetchFieldAttrs', resolve, needsUpdate:true })
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
                                                        defaultExpandAll={true}
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
                                        <div className={style['text']} style={{ padding:'1rem'}}>该能源类型还没有设置维度</div>
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