import React, { useState, useRef } from 'react';
import { routerRedux } from 'dva/router';
import { Skeleton, Tabs, Popover, TreeSelect, Spin, Radio, Select, Button, DatePicker } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, AlertFilled, LeftOutlined, RightOutlined } from '@ant-design/icons';
import PageItem from '../PageItem';
import ReactEcharts from 'echarts-for-react';
import moment from 'moment';
import CountUp from 'react-countup';

import DemandGauge from '@/pages/efficiency_manager/components/DemandGauge';
import DemandLineChart from '@/pages/efficiency_manager/components/DemandLineChart';
import AnalyzLineChart from '@/pages/efficiency_manager/components/AnalyzLineChart';

import zhCN from 'antd/es/date-picker/locale/zh_CN';
import style from '../../AnalyzeReport.css';
import IndexStyle from '@/pages/IndexPage.css';
const { Option } = Select;
const { RangePicker } = DatePicker;
function format(dateStr){
    if (!dateStr) return '';
    return dateStr.substring(5,dateStr.length);
}
const warningColors = {
    'total':'#ff7862',
    'ele':'#198efb',
    'limit':'#29ccf4',
    'link':'#58e29f'
};

function PageItem6({ demand, analyze, dispatch, companyName }){
    const { demandInfo, referTime, analyzInfo, beginTime, endTime } = demand;
    const { reportInfo } = analyze;
    const infoData = demandInfo.info ? demandInfo.info : { };
    const [timeType, toggleTimeType] = useState('1');
    const inputRef = useRef();
    console.log(analyzInfo);
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
            <div className={style['layout-container']} style={{ height:'200px'}}>
                {/* 本月概况 */}
                <div className={style['item-container-wrapper']}>
                    <div className={style['item-container']}>
                        <div className={style['item-title']} style={{ textAlign:'center', padding:'10px 0' }}>本月概况</div>
                        <div>
                            <div className={style['item-container-wrapper']} style={{ textAlign:'center' }}>
                                <div>本月最大需量</div>
                                <div className={style['item-data']}>{ `${Math.floor(infoData.month_max_demand)} kw` }</div>
                                <div className={style['item-sub-title']} style={{ color:'#1890ff'}}>{ `${format(infoData.month_max_demand_date)}` }</div>
                            </div>
                            <div className={style['item-container-wrapper']} style={{ textAlign:'center' }}>
                                <div>本月申报需量</div>
                                <div className={style['item-data']}>{ `${infoData.demand_declare} kw` }</div>
                            </div>                                                                                      
                        </div>
                        <div>
                            <div className={style['item-container-wrapper']} style={{ textAlign:'center' }}>
                                <div>参考曲线</div>
                                <div>
                                    <DatePicker size='small' locale={zhCN} value={referTime} allowClear={false} onChange={moment=>{
                                            dispatch({type:'demand/setDate', payload:moment });
                                            dispatch({type:'demand/fetchDemand'});
                                        
                                    }} />
                                </div>
                            </div>
                            <div className={style['item-container-wrapper']} style={{ textAlign:'center' }}>
                                <div>变压器容量</div>
                                <div className={style['item-data']}>{  `${Math.floor(infoData.kva_value)} kva` }</div>
                            </div> 
                        </div>
                    </div>
                </div>
                {/* 当前需量 */}
                <div className={style['item-container-wrapper']}>
                    <div className={style['item-container']}>
                        <div className={style['item-container-wrapper']}>
                            <div className={style['item-container']} style={{ display:'flex', flexDirection:'column'}}>
                                <div className={style['item-title']} style={{ textAlign:'center', padding:'10px 0' }}>当前需量</div>
                                <div style={{ flex:'1'}}> { demandInfo.info && <DemandGauge data={demandInfo.info}/> } </div>
                            </div>
                        </div>
                        <div className={style['item-container-wrapper']}>
                            <div className={style['item-container']} style={{ textAlign:'center' }}>
                                <div className={style['item-title']} style={{ padding:'10px 0'}}>今日概况</div>
                                <div>
                                    <div>本日最小需量</div>
                                    <div className={style['item-data']}>{ infoData.today_min ? `${Math.floor(infoData.today_min.demand)} kw` : '' }</div>
                                    <div className={style['item-sub-title']} style={{ color:'#1890ff'}}>{ infoData.today_min ? `${format(infoData.today_min.record_date)}` : '' }</div>
                                    <div className={style['item-sub-title']} style={{ color:'#f7f7f7'}}>-- --</div>
                                </div>
                                <div>
                                    <div>本日最大需量</div>
                                    <div className={style['item-data']}>{ infoData.today_max ? `${Math.floor(infoData.today_max.demand)} kw` : '' }</div>
                                    <div className={style['item-sub-title']} style={{ color:'#1890ff'}}>{ infoData.today_max ? `${format(infoData.today_max.record_date)}` :'' }</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* 用户需量折线图 */}
            <div className={style['layout-container']} style={{ height:'400px', backgroundColor:'#f7f7f7'}}>
                {
                    demandInfo.view
                    ?
                    <DemandLineChart data={demandInfo} forReport={true} />
                    :
                    null
                }
            </div>
            {/* 需量分析与预测 */}
            <div className={style['flex-container']} style={{ alignItems:'center', justifyContent:'space-between' }}>
                <div className={style['item-title']}>需量分析与预测</div>
                <div>
                    <span className={style['item-title']}>下月需量预测</span>
                    {
                        analyzInfo.maxPredDemand 
                        ?
                        <span className={style['item-data']}><CountUp  start={0} end={analyzInfo.maxPredDemand} decimals={1} useGrouping={true} separator=',' decimal='.' />kw</span>
                        :
                        <span className={style['item-data']}>-- --</span>
                    }
                </div> 
            </div>
            <div className={style['layout-container']} style={{ backgroundColor:'#f7f7f7', padding:'20px'}}>
                <div className={style['flex-container']} style={{ justifyContent:'space-around' }}>
                    
                    
                    <div className={style['flex-item']}>
                        <div className={style['info-title']}>平均需量</div>
                        <div className={style['data']}>
                            {
                                analyzInfo.avgDemand 
                                ?
                                <span className={style['item-data']}><CountUp  start={0} end={analyzInfo.avgDemand} decimals={0} useGrouping={true} separator=',' lastSymbol='KW' decimal='.' />kw</span>
                                :
                                <span onClick={()=>alert('lalala')}>-- --</span>
                            }
                        </div>
                        
                    </div>
                    <div className={style['flex-item']}>
                        <div className={style['info-title']}>最大需量</div>
                        <div className={style['data']}>
                            {
                                analyzInfo.maxDemand && analyzInfo.maxDemand.demand
                                ?
                                <span className={style['item-data']}><CountUp  start={0} end={analyzInfo.maxDemand.demand} decimals={0} useGrouping={true} separator=',' lastSymbol='KW' decimal='.' />kw</span>
                                :
                                <span onClick={()=>alert('lalala')}>-- --</span>
                            }
                        </div>
                        {                               
                            analyzInfo.maxDemand && analyzInfo.maxDemand.record_date 
                            ?
                            <div className={style['time-tag']}>{ analyzInfo.maxDemand.record_date }</div>
                            :
                            null                                    
                        }
                    </div>
                    <div className={style['flex-item']}>
                        <div className={style['info-title']}>需量电费效率</div>
                        <div className={style['data']}>
                            {
                                analyzInfo.effRatio 
                                ?
                                <span className={style['item-data']}><CountUp  start={0} end={analyzInfo.effRatio} decimals={1} useGrouping={true} separator=',' lastSymbol='KW' decimal='.' />%</span>
                                :
                                <span onClick={()=>alert('lalala')}>-- --</span>
                            }
                        </div>
                    </div>         
                </div>
            </div>

            <div className={style['layout-container']} style={{ height:'400px', backgroundColor:'#f7f7f7'}}>
                {
                    analyzInfo && analyzInfo.date 
                    ?
                    <AnalyzLineChart data={analyzInfo} forReport={true} />
                    :
                    <Skeleton active />
                }
            </div>
        </PageItem>
    )
}

export default PageItem6;