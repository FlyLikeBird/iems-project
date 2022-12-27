import React from 'react';
import { routerRedux } from 'dva/router';
import { Skeleton, Tabs, Popover, TreeSelect, Spin, Radio, Select, Button, Input, DatePicker } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, AlertFilled, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import PageItem from '../PageItem';
import ReactEcharts from 'echarts-for-react';
import zhCN from 'antd/es/date-picker/locale/zh_CN';

import MeasureBarChart from '@/pages/energy_manager/components/MeasureBarChart';
import BaseCostChart from '@/pages/energy_manager/components/BaseCostChart';
import AdjustCostChart from '@/pages/energy_manager/components/AdjustCostChart';

import style from '../../AnalyzeReport.css';
import energyStyle from '@/pages/energy_manager/EnergyManager.css';
const { RangePicker } = DatePicker;

const timeInfo = {
    '1':'峰时段',
    '2':'平时段',
    '3':'谷时段',
    '4':'尖时段'
};

const colorInfo = {
    '1':'#f5a623',
    '2':'#efdd07',
    '3':'#7ed321',
    '4':'#fd6e4c'
};


function PageItem8({ baseCost, dispatch, user, companyName }){
    const { machList, currentMach, measureCostInfo, measureInfoList, measureReferList, baseCostInfo, adjustCostInfo } = baseCost;
    const { timeType } = user;
    return (
        <PageItem title='能源成本分析-Energy Cost Analysis' companyName={companyName}> 
            {/* 电度电费 */}
            <div className={style['flex-container']} style={{ justifyContent:'space-between' }}>
                <div>
                    <span className={style['item-title']} style={{ marginRight:'10px' }}>电度电费</span>
                </div>
                <div>
                    <span className={style['select-container']} style={{ margin:'0' }}>
                        <span>总电费:</span>
                        <span style={{ fontSize:'1.6rem', fontWeight:'bold', color:'#1890ff', margin:'0 4px'}}>{ Math.floor(measureCostInfo.base && measureCostInfo.base.totalCost) }</span>
                        <span>元</span>
                        <span style={{ margin:'0 20px'}}>|</span>
                    </span>
                    <span className={style['select-container']} style={{ margin:'0' }}>
                        <span>可节省空间:</span>
                        <span style={{ fontSize:'1.6rem', fontWeight:'bold', color:'#1890ff', margin:'0 4px'}}>{ Math.floor(measureCostInfo.saveCost || 0) }</span>
                        <span>元</span>
                    </span>
                </div>
            </div>
            <div className={style['layout-container']}>
                <div className={energyStyle['flex-container']}>
                    {
                        measureInfoList && measureInfoList.length 
                        ?
                        measureInfoList.map((item,index)=>(
                            <div className={energyStyle['flex-item-wrapper']} key={index}>
                                <div className={energyStyle['flex-item']} key={index} style={{ backgroundColor:'#f7f7f7', padding:'1rem',  }}>
                                    <div className={energyStyle['title']}>
                                        <div className={energyStyle['text']}>{ timeInfo[item.time_type]}</div>
                                        <div className={energyStyle['sub-text']}>电价：{ item.fee_rate } 元</div>
                                    </div>
                                    <div className={energyStyle['info']}>
                                        <div className={energyStyle['info-item']} style={{ whiteSpace:'nowrap' }}>
                                            <div className={energyStyle['sub-text']}>电费(元)</div>
                                            <div className={energyStyle['text']}>{ Math.floor(+item.totalCost) }</div>
                                        </div>
                                        <div className={energyStyle['info-item']} style={{ whiteSpace:'nowrap' }}>
                                            <div className={energyStyle['sub-text']}>电费占比(%)</div>
                                            <div className={energyStyle['text']}>
                                                {
                                                    measureCostInfo.base.totalCost === 0 ? 0.00 : ((item.totalCost / measureCostInfo.base.totalCost)*100).toFixed(1)
                                                }
                                                %
                                            </div>
                                        </div>
                                        <div className={energyStyle['info-item']} style={{ whiteSpace:'nowrap' }}>
                                            <div className={energyStyle['sub-text']}>用电量(kwh)</div>
                                            <div className={energyStyle['text']}>{ Math.floor(+item.totalEnergy) }</div>
                                        </div>
                                    </div>
                                </div>
                            </div>                                
                        ))
                        :
                        <Skeleton active />                                                                                                                                                
                    }
                </div>
            </div>
            {/* 计量电费---chart */}
            <div className={style['layout-container']} style={{ height:'260px', backgroundColor:'#f7f7f7' }}>
                {
                    measureCostInfo && measureCostInfo.view 
                    ?
                    <MeasureBarChart data={measureCostInfo.view} timeType={timeType} forReport={true} />
                    :
                    null
                }   
            </div>
            
            {/* 基本电费 */}
            <div className={style['flex-container']}>
                <div>
                    <span className={style['item-title']}>基本电费</span>
                </div>
            </div>
            <div className={style['layout-container']}>
                <div className={energyStyle['basecost-container']}>
                    {/* 1:按需量计算, 2:按容量计算 */}
                    {
                        baseCostInfo.calc_type === 1
                        ?
                        <div className={energyStyle['item-wrapper']}>
                            <div className={energyStyle['item']} style={{ backgroundColor:'#f7f7f7' }}>
                                <div>
                                    <span>按需量计算</span>
                                    <span className={energyStyle['tag']} style={{ backgroundColor:'#09c1fd'}}>现在</span>
                                    {
                                        +baseCostInfo.demand_amount < +baseCostInfo.kva_amount
                                        ?
                                        <span className={energyStyle['tag']} style={{ backgroundColor:'#99ff66'}}>建议</span>
                                        :
                                        null
                                    }
                                </div>
                                <div className={energyStyle['info-container']}>
                                    <div>
                                        <div>本月最大需量</div>
                                        <div className={energyStyle['num']}>{ baseCostInfo.maxDemand ? (+baseCostInfo.maxDemand).toFixed(0) + ' KW' : 0 }</div>
                                    </div>
                                    <div>
                                        <div>单价</div>
                                        <div className={energyStyle['num']}>{ baseCostInfo.demand_price } 元/KW</div>
                                    </div>
                                    <div>
                                        <div>基本电费</div>
                                        <div className={energyStyle['num']} style={{ color:'rgb(69 181 13)'}}>{ (+baseCostInfo.demand_amount).toFixed(0) } 元</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        <div className={energyStyle['item-wrapper']}>
                            <div className={energyStyle['item']} style={{ backgroundColor:'#f7f7f7' }}>
                                <div>
                                    <span>按容量计算</span>
                                    <span className={energyStyle['tag']} style={{ backgroundColor:'#09c1fd', cursor:'pointer'}}>现在</span>
                                    {
                                        +baseCostInfo.demand_amount > +baseCostInfo.kva_amount
                                        ?
                                        <span className={energyStyle['tag']} style={{ backgroundColor:'#99ff66' }}>建议</span>
                                        :
                                        null
                                    }
                                </div>
                                <div className={energyStyle['info-container']}>
                                    <div>
                                        <div>变压器容量</div>                                            
                                        <div 
                                            className={energyStyle['num']}
                                        >
                                            <span>{ baseCostInfo.total_kva ? (+baseCostInfo.total_kva).toFixed(0) + ' KVA' : '-- --' }</span>
                                            
                                        </div>
                                        
                                    </div>
                                    <div>
                                        <div>单价</div>
                                        <div className={energyStyle['num']}>{ baseCostInfo.kva_price } 元/KVA</div>
                                    </div>
                                    <div>
                                        <div>基本电费</div>
                                        <div className={energyStyle['num']} style={{ color:'#09c1fd'}}>{ baseCostInfo.kva_amount ? baseCostInfo.kva_amount + ' 元' : '-- --' }</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }    
                    {
                        baseCostInfo.calc_type !== 1
                        ?
                        <div className={energyStyle['item-wrapper']}>
                            <div className={energyStyle['item']} style={{ backgroundColor:'#f7f7f7' }}>
                                <div>
                                    <span>按需量计算</span>
                                    {
                                        +baseCostInfo.demand_amount < +baseCostInfo.kva_amount
                                        ?
                                        <span className={energyStyle['tag']} style={{ backgroundColor:'#99ff66' }}>建议</span>
                                        :
                                        null
                                    }
                                </div>
                                <div className={energyStyle['info-container']}>
                                    <div>
                                        <div>本月最大需量</div>
                                        <div className={energyStyle['num']}>{ baseCostInfo.maxDemand ? (+baseCostInfo.maxDemand).toFixed(0) + ' KW' : 0 }</div>
                                    </div>
                                    <div>
                                        <div>单价</div>
                                        <div className={energyStyle['num']}>{ baseCostInfo.demand_price } 元/KW</div>
                                    </div>
                                    <div>
                                        <div>基本电费</div>
                                        <div className={energyStyle['num']} style={{ color:'rgb(69 181 13)'}}>{ (+baseCostInfo.demand_amount).toFixed(0) } 元</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        <div className={energyStyle['item-wrapper']}>
                            <div className={energyStyle['item']} style={{ backgroundColor:'#f7f7f7' }}>
                                <div>
                                    <span>按容量计算</span>
                                    {
                                        +baseCostInfo.demand_amount > +baseCostInfo.kva_amount
                                        ?
                                        <span className={energyStyle['tag']} style={{ backgroundColor:'#99ff66' }}>建议</span>
                                        :
                                        null
                                    }
                                </div>
                                <div className={energyStyle['info-container']}>
                                    <div>
                                        <div>变压器容量</div>                                     
                                        <div 
                                            className={energyStyle['num']} 
                                            // onClick={()=>setEditing(true)}
                                        >
                                            <span>{ baseCostInfo.total_kva ? (+baseCostInfo.total_kva).toFixed(0) + ' KVA' : '-- --' }</span>     
                                        </div>
                                        
                                    </div>
                                    <div>
                                        <div>单价</div>
                                        <div className={energyStyle['num']}>{ baseCostInfo.kva_price } 元/KVA</div>
                                    </div>
                                    <div>
                                        <div>基本电费</div>
                                        <div className={energyStyle['num']} style={{ color:'#09c1fd'}}>{ baseCostInfo.kva_amount ? (+baseCostInfo.kva_amount).toFixed(0) + ' 元' : '-- --' }</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }                  
                </div>
            </div>
            <div className={style['layout-container']} style={{ height:'260px', backgroundColor:'#f7f7f7' }}>
                {
                    baseCostInfo && baseCostInfo.view 
                    ?
                    <BaseCostChart data={baseCostInfo} forReport={true} />
                    :
                    <Skeleton active />
                }
            </div>
            {/* 力调电费 */}
            <div>
                <span className={style['item-title']}>力调电费</span>
            </div>
            <div className={style['layout-container']}>
                {
                    adjustCostInfo && adjustCostInfo.view 
                    ?
                    <div className={energyStyle['basecost-container']}>
                        {/* 无功罚款 */}
                        <div className={energyStyle['item-wrapper']} style={{ paddingRight:'0'}}>
                            <div className={energyStyle['item']} style={{ backgroundColor:'#f7f7f7', borderTopRightRadius:'0', borderBottomRightRadius:'0'}}>
                                <div><span>无功罚款</span></div>
                                <div className={energyStyle['info-container']}>
                                    <div>
                                        <div>年累计</div>
                                        <div className={energyStyle['num']}>{ Math.round(adjustCostInfo.totalAdjustCost) } 元 </div>
                                    </div>
                                    <div>
                                        <div>最大值</div>
                                        <div className={energyStyle['num']}>{ Math.round(adjustCostInfo.maxAdjustCost) } 元</div>
                                    </div>
                                    <div>
                                        <div>每月平均</div>
                                        <div className={energyStyle['num']}>{ Math.round(adjustCostInfo.avgAdjustCost) } 元</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* 功率因素 */}
                        <div className={energyStyle['item-wrapper']} style={{ paddingRight:'0'}}> 
                            <div className={energyStyle['item']} style={{ backgroundColor:'#f7f7f7', borderRadius:'0' }}>
                                <div><span>功率因素</span></div>
                                <div className={energyStyle['info-container']}>
                                    <div>
                                        <div>功率因素考核值</div>
                                        <div className={energyStyle['num']}>{ adjustCostInfo.factorRef }</div>
                                    </div>
                                    <div>
                                        <div>平均功率因素</div>
                                        <div className={energyStyle['num']}>{ adjustCostInfo.avgFactor }</div>
                                    </div>
                                    <div>
                                        <div>低于考核值次数</div>
                                        <div className={energyStyle['num']}>{ adjustCostInfo.unqualified } 次</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* 提示信息 */}
                        <div className={energyStyle['item-wrapper']} >
                            <div className={energyStyle['item']} style={{ backgroundColor:'#f7f7f7', borderTopLeftRadius:'0', borderBottomLeftRadius:'0' }}>
                                <div><span>提示</span></div>
                                <div className={energyStyle['info-container']} style={{ justifyContent:'center', whiteSpace:'normal' }}>
                                    {
                                        !adjustCostInfo.totalAdjustCost 
                                        ?
                                        <span>-- --</span>
                                        :
                                        +(adjustCostInfo.totalAdjustCost) < 0 
                                        ?
                                        <span style={{ color:'#69d633', fontSize:'1.2rem', fontWeight:'bold'}}><CheckCircleOutlined style={{ marginRight:'4px'}}/>当前使用状态良好，请继续保持</span> 
                                        :
                                        <span style={{ color:'#09c1fd', fontSize:'1.2rem', fontWeight:'bold'}}><ExclamationCircleOutlined style={{ marginRight:'4px' }} />当前罚款较多，可以通过合理的无功补偿，可以提高功率因素，避免罚款</span>                           
                                    }
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    :
                    <Skeleton active />
                }
            </div>
            <div className={style['layout-container']} style={{ height:'260px', backgroundColor:'#f7f7f7'}}>
                {
                    adjustCostInfo && adjustCostInfo.view 
                    ?
                    <AdjustCostChart data={adjustCostInfo.view} forReport={true} />
                    :
                    <Skeleton active />
                }
            </div>
        </PageItem>
    )
}

export default PageItem8;