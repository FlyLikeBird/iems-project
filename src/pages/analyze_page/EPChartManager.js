import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Tree, Spin, Modal, DatePicker, Tabs, Select, message, Table, Button, Skeleton } from 'antd';
import { LeftOutlined, RightOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import EPInfoList from './components/EPInfoList';
import EPChart from './components/EPChart';
import Loading from '@/pages/components/Loading';
import style from '@/pages/IndexPage.css';
const { TabPane } = Tabs;
const { Option } = Select;
function EPChartManager({ dispatch, user, fields, analyze }){
    const { authorized, theme } = user;
    useEffect(()=>{
        if ( authorized ) {
            dispatch({ type:'user/toggleTimeType', payload:'2' });
            dispatch({ type:'analyze/initEPChart'});
        }
    },[authorized]);
    let inputRef = useRef();
    let { treeLoading, allFields, currentField, energyList, currentAttr, energyInfo, expandedKeys } = fields;
    let { isLoading, EPChartInfo, sumTable, checkedDates } = analyze;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
    const sidebar = (
        <div className={style['card-container']}>
                <Tabs className={style['custom-tabs']} activeKey={energyInfo.type_id} onChange={activeKey=>{
                    let temp = energyList.filter(i=>i.type_id === activeKey)[0];
                    dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                    new Promise((resolve, reject)=>{
                        dispatch({ type:'fields/init', payload:{ resolve, reject }});
                    })
                    .then((node)=>{
                        dispatch({type:'analyze/fetchEPChartInfo', payload:{ firstLoad:true }});
                    })
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
                                        new Promise((resolve, reject)=>{
                                            dispatch({type:'fields/fetchFieldAttrs', resolve, reject })
                                        })
                                        .then(()=>{
                                            dispatch({type:'analyze/fetchEPChartInfo', payload:{ firstLoad:true }});
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
                                                            dispatch({type:'analyze/fetchEPChartInfo', payload:{ firstLoad:true }});
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
    );
    const rowSelection = {
        checkedRowKeys:checkedDates,
        onChange: selectedRowKeys => dispatch({type:'analyze/setCheckedDates', payload:selectedRowKeys })
    };
    const content = (
        <div>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'40px' }}>
                <CustomDatePicker noDay={true} onDispatch={()=>{
                    dispatch({ type:'analyze/setCheckedDates', payload:[] });
                    dispatch({type:'analyze/fetchEPChartInfo', payload:{ firstLoad:true }});
                }}/>
            </div>
            <div className={style['scroll-container']} style={{ height:'calc( 100% - 40px)' }}>
                <EPInfoList data={EPChartInfo} theme={theme} />
                <div style={{ height:'500px', paddingBottom:'1rem' }}>
                    <div className={style['card-container']}>
                        <EPChart data={EPChartInfo} theme={theme} />
                    </div>
                </div>
                <div className={style['card-container']} style={{ height:'auto' }}>
                    <div style={{ padding:'1rem 0 0 1rem'}}>
                        <Button type='primary' onClick={()=>{
                            if ( checkedDates.length ) {
                                dispatch({ type:'analyze/fetchEPChartInfo' });
                            } else {
                                message.info('请先勾选要生成EP图的数据项');
                            }
                        }}>生成EP图</Button>
                    </div> 
                   
                    <Table
                        columns={[
                            { title:'日期', dataIndex:'date' },
                            { title:'产量(台)', dataIndex:'product', render:value=>(<span>{ value || 0 }</span>)},
                            { title:'能耗(kwh)', dataIndex:'energy', render:value=>(<span>{ value || 0 }</span>)},
                            { title:'产品电单耗(kwh/台)', dataIndex:'ratio', render:value=>(<span>{ value || 0 }</span>)}
                        ]}
                        dataSource={sumTable || []}
                        rowKey='date'
                        className={style['self-table-container']}
                        rowSelection={rowSelection}
                        bordered={true}    
                        pagination={false}       
                        // pagination={{ total:data ? data.length : 0, current:currentPage, pageSize:pagesize, showSizeChanger:false }}
                    />
                                 
                    
                             
                </div>
            </div>
        </div>
            
    );
    return ( <ColumnCollapse sidebar={sidebar} content={content} />)

}

export default connect(({ user, fields, analyze })=>({ user, fields, analyze }))(EPChartManager);