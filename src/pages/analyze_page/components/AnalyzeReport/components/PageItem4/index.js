import React from 'react';
import { Skeleton, Tabs, Popover, TreeSelect, Spin, Radio, Select, Button, DatePicker } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import PageItem from '../PageItem';
import EfficiencyQuotaChart from '@/pages/efficiency_manager/components/EfficiencyQuotaChart';
import UselessChart from '@/pages/efficiency_manager/components/UselessChart';

import style from '../../AnalyzeReport.css';

import zhCN from 'antd/es/date-picker/locale/zh_CN';

function getToday(){
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    return `${year}年${month}月${day}日 ${hour}时${minute}分`;
}
const { Option } = Select;

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

function PageItem4({ efficiency, efficiencyQuota, analyze, demand, fields, dispatch, companyName }){
    const { quotaInfo, timeType, year } = efficiencyQuota;
    const { fieldList, currentField, fieldAttrs, currentAttr } = fields;
    const { uselessTime, uselessInfo } = demand;
    const monthData = uselessInfo.month ? uselessInfo.month : {};
    const nowData = uselessInfo.now ? uselessInfo.now : {};
    const { reportInfo } = analyze;
    let totalEnergy = getSum(quotaInfo.energy), totalQuota = getSum(quotaInfo.quota);
    let quotaRatio = 0;
    let setQuota = hasSetQuota(quotaInfo.quota);
    if ( setQuota ) {
        quotaRatio = getQuotaRatio(quotaInfo.energy, quotaInfo.quota);
    }
    return (
        <PageItem title='能源效率分析-Energy Efficiency Analysis' companyName={companyName}> 
            {   
                reportInfo.text && reportInfo.text[2] && reportInfo.text[2].length 
                ?
                <div className={style['layout-container']}>
                    <ul style={{ fontWeight:'bold' }}>
                        {
                            reportInfo.text[2].map((item,index)=>(
                                <li key={index}>{ item }</li>
                            ))
                        }
                    </ul>
                </div>
                :
                null
            } 
            {/* 统计周期 */}
            <div className={style['flex-container']}>
                <div className={style['item-title']} style={{ marginRight:'10px' }}>统计周期</div>
                <div>
                    <div className={style['select-container']} style={{ marginRight:'20px' }}>
                        <span>考核周期:</span>
                        <Select size='small' style={{ width:'140px' }} value={timeType} onChange={value=>{
                            dispatch({type:'efficiencyQuota/toggleTimeType', payload:value });
                            dispatch({type:'efficiencyQuota/fetchQuota'});
                        }}>
                            <Option key='year' value='1'>年定额</Option>
                            <Option key='month' value='2'>月定额</Option>
                        </Select>
                    </div>
                    <div className={style['select-container']} style={{ marginRight:'20px' }}>
                        <span>选择年份:</span>
                        <Select size='small' style={{ width:'140px'}} value={year} onChange={value=>{
                            dispatch({type:'efficiencyQuota/toggleYear', payload:value});
                            dispatch({type:'efficiencyQuota/fetchQuota'});
                        }}>
                            {
                                years.map(i=>(
                                    <Option key={i} value={i}>{i}</Option>
                                ))
                            }
                        </Select>
                    </div>
                    <Button type="primary" onClick={()=>{
                        dispatch({type:'efficiencyQuota/resetYear'});
                        dispatch({type:'efficiencyQuota/fetchQuota'});
                    }}>本年</Button>
                </div> 
            </div>

            {/* 定额信息 */}
                {
                    quotaInfo && quotaInfo.date
                    ?
                    <div className={style['layout-container']} style={{ height:'120px' }}>
                        <div className={style['item-container-wrapper']} style={{ width:'33.3%' }}>
                            <div className={style['item-container']} style={{ display:'flex', alignItems:'center', justifyContent:'space-around' }}>
                                <div>
                                    <div>年度定额执行率</div>
                                    <div className={style['item-data']}>
                                        <span>{ quotaRatio < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined />}</span>
                                        <span>{ `${(+quotaRatio).toFixed(1)}%`}</span>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ transform:'scale(0.8)' }}>定额: <span className={style['text']}>{ totalQuota.toFixed(0) } (kwh)</span></div>
                                    <div style={{ transform:'scale(0.8)' }}>实际: <span className={style['text']}>{ totalEnergy.toFixed(0) }(kwh)</span></div>
                                    <div style={{ transform:'scale(0.8)' }}>剩余: <span className={style['text']}>{ (totalEnergy - totalEnergy).toFixed(0)}(kwh)</span></div>
                                </div>

                            </div>
                        </div>
                        <div className={style['item-container-wrapper']} style={{ width:'33.3%' }}>
                            <div className={style['item-container']} style={{ display:'flex', alignItems:'center', justifyContent:'space-around' }}>
                                <div>
                                    <div>年同比增长率</div>
                                    <div className={style['item-data']}>
                                        <span>{ quotaRatio < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined />}</span>
                                        <span>{ `${Math.abs(quotaInfo.yearRatio).toFixed(1)}%` }</span>
                                    </div>
                                </div>
                                <div>
                                    <div>年同比定额</div>
                                    <div><span className={style['text']}>{ `${(+quotaInfo.yearQuotaRatio).toFixed(1)}%` }</span></div>
                                </div>

                            </div>
                        </div>
                        <div className={style['item-container-wrapper']} style={{ width:'33.3%' }}>
                            <div className={style['item-container']} style={{ display:'flex', alignItems:'center', justifyContent:'space-around' }}>
                                <div>
                                    <div>月同比增长率</div>
                                    <div className={style['item-data']}>
                                        <span>{ quotaRatio < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined />}</span>
                                        <span>{ `${Math.abs(quotaInfo.yearRatio).toFixed(1)}%` }</span>
                                    </div>
                                </div>
                                <div>
                                    <div>月同比定额</div>
                                    <div><span className={style['text']}>{ `${(+quotaInfo.monthQuotaRatio).toFixed(1)}%` }</span></div>
                                </div>

                            </div>
                        </div>
                    </div>                    
                    :
                    <Skeleton active />
                }
            {/* 定额图表 */}
            <div className={style['layout-container']} style={{ height:'400px', backgroundColor:'#f7f7f7' }}>
                {
                    quotaInfo && quotaInfo.date
                    ?                        
                    <EfficiencyQuotaChart data={quotaInfo} timeType={timeType} currentAttr={currentAttr} onLink={action=>dispatch(action)} forReport={true} />                             
                    :
                    <Skeleton active />
                }
            </div>
            {/* 无功监测 */}
            <div className={style['layout-container']}>
                {/* 本月概况 */}
                <div className={style['item-container-wrapper']}>
                    <div className={style['item-container']} style={{ textAlign:'center', padding:'10px' }}>
                        <div className={style['item-title']} style={{ padding:'10px 0'}}>本月概况</div>
                        <div className={style['flex-container']} style={{ justifyContent:'space-around'}}>
                            <div className={style['flex-item']}>
                                <div>有功电量(kwh)</div>
                                <div className={style['data']}>{ monthData && Math.floor(monthData.eleEnergy) } </div>
                            </div>
                            <div className={style['flex-item']}>
                                <div>无功电量(kVarh)</div>
                                <div className={style['data']}>{ monthData && Math.floor(monthData.revEleEnergy) }</div>
                            </div>
                            <div className={style['flex-item']}>
                                <div>功率因素(COSΦ)</div>
                                <div className={style['data']}>{ monthData && (+monthData.avgFactor).toFixed(1) } </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
                {/* 当前功率 */}
                <div className={style['item-container-wrapper']}>
                    <div className={style['item-container']} style={{ textAlign:'center', padding:'10px' }}>
                        <div className={style['item-title']} style={{ padding:'10px 0'}}>当前功率</div>
                        <div className={style['flex-container']} style={{ justifyContent:'space-around'}}>
                            <div className={style['flex-item']}>
                                <div>有功功率(kw)</div>
                                <div className={style['data']}>{ nowData && Math.floor(nowData.usePower) }</div>
                            </div>
                            <div className={style['flex-item']}>
                                <div>无功功率(kVar)</div>
                                <div className={style['data']}>{ nowData && Math.floor(nowData.uselessPower) }</div>
                            </div>
                            <div className={style['flex-item']}>
                                <div>功率因素(COSΦ)</div>
                                <div className={style['data']}>{ nowData && (+nowData.factor).toFixed(1) }</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* 无功功率--chart */}
            <div className={style['layout-container']} style={{ height:'460px', backgroundColor:'#f7f7f7'}}>
                {
                     uselessInfo.date 
                     ? 
                    <UselessChart data={uselessInfo} forReport={true} />
                     :
                    <Skeleton active />
                }
            </div>
        </PageItem>
    )
}

export default PageItem4;