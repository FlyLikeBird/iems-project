import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Card, Spin, Tree, Tabs, Skeleton, DatePicker, Radio } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import style from '../IndexPage.css';
import HarmonicBarChart from './components/HarmonicBarChart';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function EleHarmonicManager({ dispatch, fields, eleQuality, user }){
    const inputRef = useRef();
    const { timeType, startDate, endDate, theme } = user;
    const { allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    const { eleHarmonic, isLoading } = eleQuality;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'eleQuality/resetHarmonic'});
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
                            dispatch({ type:'eleQuality/fetchEleHarmonic'});
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
                                            dispatch({ type:'eleQuality/fetchEleHarmonic'});
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
        Object.keys(eleHarmonic).length 
        ?
        <div style={{ position:'relative' }}>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'40px'}}>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({ type:'eleQuality/fetchEleHarmonic'});
                }} />
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div className={style['card-container-wrapper']} style={{ display:'block', height:'50%', paddingRight:'0'}}>
                    <div className={style['card-container']}>
                        <HarmonicBarChart data={eleHarmonic.volt} title='电压谐波趋势' timeType={timeType} type='U' theme={theme} />
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ display:'block', height:'50%', paddingRight:'0', paddingBottom:'0' }}>
                    <div className={style['card-container']}>
                        <HarmonicBarChart data={eleHarmonic.ele} title='电流谐波趋势' timeType={timeType} type='I' theme={theme} />
                    </div>
                </div>
            </div>
        </div>
        :
        <Skeleton active className={style['skeleton']} />
       
    );
    return <ColumnCollapse sidebar={sidebar} content={content} />
}

export default connect(({ fields, user, eleQuality })=>({ fields, user, eleQuality }))(EleHarmonicManager);