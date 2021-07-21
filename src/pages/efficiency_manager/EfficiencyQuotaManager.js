import React, { useEffect, useMemo } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Select, Button, Skeleton, message } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, ArrowDownOutlined, ArrowUpOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import EfficiencyTable from './components/EfficiencyTable';
import EfficiencyQuotaChart from './components/EfficiencyQuotaChart';
import style from '../IndexPage.css';
import { energyIcons } from '@/pages/utils/energyIcons';

const { Option } = Select;
const { TabPane } = Tabs;

const years = [];
for(var i=2000;i<2050;i++){
    years.push(i);
}

function getSum(arr){
    if (!arr) return 0;
    return arr.reduce((sum,cur)=>{
        return sum+= +cur;
    },0)
}

function hasSetQuota(arr){
    if (!arr) return false;
    return arr.filter(i=>+i>0).length ? true : false;
}

function getQuotaRatio(energy, quota){
    let num = 0;
    if ( !energy || !energy.length ) return num;
    energy.forEach((item,index)=>{
        if ( item >= quota[index] ) {
            num++;
        }
    })
    return (num / energy.length).toFixed(2);
}

function EfficiencyQuota({ dispatch, user, efficiencyQuota, fields }) {
    const { quotaInfo, timeType, year } = efficiencyQuota;
    const { allFields, currentField, currentAttr, treeLoading } = fields;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    let totalEnergy = getSum(quotaInfo.energy), totalQuota = getSum(quotaInfo.quota);
    let quotaRatio = 0;
    let setQuota = hasSetQuota(quotaInfo.quota);
    if ( setQuota ) {
        quotaRatio = getQuotaRatio(quotaInfo.energy, quotaInfo.quota);
    }
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'efficiencyQuota/reset'});
        }
    },[])
    const sidebar = (
        <div>
            <div className={style['card-container']}>
            <Tabs className={style['custom-tabs']} activeKey={currentField.field_id + ''} onChange={activeKey=>{
                    dispatch({type:'fields/toggleField', payload:{ visible:false, field: { field_id:activeKey } } });
                    new Promise((resolve)=>{
                        dispatch({type:'fields/fetchFieldAttrs', resolve })
                    }).then(()=>{
                        dispatch({type:'efficiencyQuota/fetchQuota'});
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
                                            dispatch({type:'efficiencyQuota/fetchQuota'});
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
        Object.keys(quotaInfo).length 
        ?
        <div>
            <div style={{ height:'40px', display:'flex' }}>
                
                    <Select className={style['custom-select']} style={{ width:'120px', marginRight:'20px' }} size='small' value={timeType} onChange={value=>{
                        dispatch({type:'efficiencyQuota/toggleTimeType', payload:value });
                        dispatch({type:'efficiencyQuota/fetchQuota'});
                    }}>
                        <Option key='year' value='1'>年定额</Option>
                        <Option key='month' value='2'>月定额</Option>
                    </Select>
               
                
                    <Select className={style['custom-select']} style={{ width:'120px', marginRight:'20px' }} size='small' value={year} onChange={value=>{
                        dispatch({type:'efficiencyQuota/toggleYear', payload:value});
                        dispatch({type:'efficiencyQuota/fetchQuota'});
                    }}>
                        {
                            years.map(i=>(
                                <Option key={i} value={i}>{i}</Option>
                            ))
                        }
                    </Select>
                
                <Button size='small' type="primary" onClick={()=>{
                    dispatch({type:'efficiencyQuota/resetYear'});
                    dispatch({type:'efficiencyQuota/fetchQuota'});
                }}>本年</Button>
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                <div className={style['card-container-wrapper']} style={{ height:'20%', paddingRight:'0'}}>
                    <div className={style['card-container-wrapper']} style={{ width:'33.3%', paddingBottom:'0'}}>
                        <div className={style['card-container']}>
                            <div className={style['flex-container']}>
                                <div className={style['flex-item']}>
                                    <div>年度定额执行率</div>
                                    <div className={style['data']} style={{ color:'#1890ff'}}>
                                        <span>{ quotaRatio < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined />}</span>
                                        <span>{ `${(+quotaRatio).toFixed(1)}%`}</span>
                                    </div>
                                </div>
                                <div className={style['flex-item']} style={{ textAlign:'left'}}>
                                    <div>定额: <span style={{ color:'#1890ff'}}>{ totalQuota.toFixed(0) } (kwh)</span></div>
                                    <div>实际: <span style={{ color:'#1890ff'}}>{ totalEnergy.toFixed(0) }(kwh)</span></div>
                                    <div>剩余: <span style={{ color:'#1890ff'}}>{ Math.floor(totalEnergy - totalEnergy) }(kwh)</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={style['card-container-wrapper']} style={{ width:'33.3%', paddingBottom:'0'}}>
                        <div className={style['card-container']}>
                            <div className={style['flex-container']}>
                                <div className={style['flex-item']}>
                                    <div>年同比增长率</div>
                                    <div className={style['data']} style={{ color:'#1890ff'}}>
                                        <span>{ quotaInfo.yearRatio < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined />}</span>
                                        <span>{ `${(+quotaInfo.yearRatio).toFixed(1)}%`}</span>
                                    </div>
                                </div>
                                <div className={style['flex-item']} style={{ textAlign:'left'}}>
                                    <div>年同比定额</div>
                                    <div style={{ color:'#1890ff'}}>{ `${(+quotaInfo.yearQuotaRatio).toFixed(1)}%` }</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={style['card-container-wrapper']} style={{ width:'33.3%', paddingBottom:'0'}}>
                        <div className={style['card-container']}>
                            <div className={style['flex-container']}>
                                <div className={style['flex-item']}>
                                    <div>月同比增长率</div>
                                    <div className={style['data']} style={{ color:'#1890ff'}}>
                                        <span>{ quotaInfo.monthRatio < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined />}</span>
                                        <span>{ `${(+quotaInfo.monthRatio).toFixed(1)}%`}</span>
                                    </div>
                                </div>
                                <div className={style['flex-item']} style={{ textAlign:'left'}}>
                                    <div>月同比定额</div>
                                    <div style={{ color:'#1890ff'}}>{ `${(+quotaInfo.monthQuotaRatio).toFixed(1)}%` }</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ height:'80%', paddingBottom:'0'}}>
                    <div className={style['card-container']}>
                        <EfficiencyQuotaChart data={quotaInfo} timeType={timeType} currentAttr={currentAttr} onLink={action=>dispatch(action)} theme={user.theme} />                             
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

export default connect(({ user, efficiencyQuota, fields})=>({ user, efficiencyQuota, fields }))(EfficiencyQuota);
