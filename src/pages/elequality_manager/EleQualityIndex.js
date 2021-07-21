import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Card, Spin, Tree, Tabs, Skeleton, DatePicker, Radio, Table } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import style from '../IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import HarmonicBarChart from './components/HarmonicBarChart';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const tagStyle = {
    fontSize:'0.8rem',
    height:'1rem',
    lineHeight:'1rem',
    padding:'2px 6px',
    borderRadius:'10px',
    color:'#fff'
}
const shortColumns = [
    { key:'title', title:'项目', dataIndex:'title', width:'180px'},
    { key:'value', title:'功率因数水平', dataIndex:'value'},
    { key:'refer', title:'标准范围', dataIndex:'refer'},
    { key:'standard', title:'考核标准', dataIndex:'standard'},
    {
        key:'is_pass',
        title:'结论',
        width:'100px',
        render:row=>{
            return (
                <span style={{ ...tagStyle, backgroundColor:row.is_pass === 1 ? '#35c2cb' : '#f5222d'}}>{ row.is_pass === 1 ? '合格' : '不合格'}</span>
            )
        }
    }
];
const longColumns = [
    { key:'title', title:'项目', dataIndex:'title', width:'180px'},
    { key:'max', title:'最大值', dataIndex:'max' },
    { key:'min', title:'最小值', dataIndex:'min'},
    { key:'avg', title:'平均值', dataIndex:'avg'},
    { key:'fail', title:'超限次数', dataIndex:'fail'},
    { key:'pass_rate', title:'合格率', dataIndex:'pass_rate', render:(value)=>value + '%' },
    {
        key:'is_pass',
        title:'结论',
        width:'100px',
        render:row=>{
            return (
                <span style={{ ...tagStyle, backgroundColor:row.is_pass === 1 ? '#35c2cb' : '#f5222d'}}>{ row.is_pass === 1 ? '合格' : '不合格'}</span>
            )
        }
    }
]
function EleQualityIndex({ dispatch, fields, eleQuality, user }){
    const inputRef = useRef();
    const { timeType, startDate, endDate, theme } = user;
    const { allFields, currentField, currentAttr, treeLoading } = fields;
    const { eleIndex, isLoading } = eleQuality;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'eleQuality/resetQualityIndex'});
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
                            dispatch({ type:'eleQuality/fetchEleQualityIndex'});
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
                                            dispatch({ type:'eleQuality/fetchEleQualityIndex'});
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
        Object.keys(eleIndex).length 
        ?
        <div>
            <div style={{ height:'40px'}}>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({ type:'eleQuality/fetchEleQualityIndex'});
                }} />
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div className={style['card-container-wrapper']} style={{ height:'20%' }}>
                <div className={style['card-container']}>
                    <div className={style['card-title']}>功率因素分析</div>
                    <div className={style['card-content']}>
                        
                        <Table 
                            size='small'
                            rowKey='key'
                            className={style['self-table-container'] + ' ' + style['small']}
                            style={{ padding:'0 1rem' }}
                            pagination={false}
                            bordered={true}
                            columns={shortColumns}
                            dataSource={eleIndex.factor || []}
                            locale={{ emptyText:'数据加载中...' }}
                        />
                           
                    </div>
                </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ height:'30%'}}>
                <div className={style['card-container']}>
                    <div className={style['card-title']}>电压谐波监控</div>
                    <div className={style['card-content']}>
                        
                        <Table 
                            size='small'
                            rowKey='key'
                            bordered={true}
                            className={style['self-table-container'] + ' ' + style['small']}
                            style={{ padding:'0 1rem' }}
                            pagination={false}
                            columns={longColumns}
                            dataSource={eleIndex.volt || []}
                            locale={{ emptyText:'数据加载中...' }}
                        />
                           
                    </div>
                </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ height:'30%'}}>
                <div className={style['card-container']}>
                    <div className={style['card-title']}>电流谐波监控</div>
                    <div className={style['card-content']}>
                        
                        
                        <Table 
                            size='small'
                            rowKey='key'
                            pagination={false}
                            className={style['self-table-container'] + ' ' + style['small']}
                            style={{ padding:'0 1rem' }}
                            bordered={true}
                            columns={longColumns}
                            dataSource={eleIndex.ele || []}
                            locale={{ emptyText:'数据加载中...' }}
                        />
                            
                    </div>
                </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ height:'20%', paddingBottom:'0'}}>
                <div className={style['card-container']}>
                    <div className={style['card-title']}>三相不平衡分析</div>
                    <div className={style['card-content']}>
                        
                        <Table 
                            size='small'
                            rowKey='key'
                            bordered={true}
                            pagination={false}
                            className={style['self-table-container'] + ' ' + style['small']}
                            style={{ padding:'0 1rem' }}
                            columns={longColumns}
                            dataSource={eleIndex.banlance || []}
                            locale={{ emptyText:'数据加载中...' }}
                        />
                            
                    </div>
                </div>
                </div>
            </div>
        </div>
        :
        <Skeleton active className={style['skeleton']} />
            
    );
    return <ColumnCollapse sidebar={sidebar} content={content} />
}

export default connect(({ fields, user, eleQuality })=>({ fields, user, eleQuality }))(EleQualityIndex);