import React, { useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, DatePicker, Skeleton, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ArrowRightOutlined, RightCircleOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import MeasureBarChart from './components/MeasureBarChart';
import style from '../IndexPage.css';

const { TabPane } = Tabs;
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

function format(dateStr){
    return dateStr.substring(5,dateStr.length);
}

function MeasureCostManager({ dispatch, user, baseCost }) {
    const { machList, currentMach, energyList, energyInfo, measureCostInfo, measureInfoList, measureReferList, measureTimeType, measureStartDate, measureEndDate, treeLoading } = baseCost;
    let totalCost = measureCostInfo.base ? measureCostInfo.base.totalCost : 0;
    return ( 
        Object.keys(measureCostInfo).length 
        ?
        <div style={{ height:'100%' }}>
            
            <div className={style['card-container-wrapper']} style={{ height:'20%', paddingRight:'0' }}>
                {
                    measureInfoList && measureInfoList.length 
                    ?
                    measureInfoList.map((item,index)=>(
                        <div key={index} className={style['card-container-wrapper']} style={{ width:100/measureInfoList.length + '%', paddingBottom:'0', paddingRight:index === measureInfoList.length - 1 ? '0' : '1rem' }}>
                            <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 1rem' }}>
                                <div style={{ display:'flex', justifyContent:'space-between' }}>
                                        <div style={{ fontSize:'1.2rem' }}>{ timeInfo[item.time_type]}</div>
                                        <div className={style['sub-text']}>电价：{ item.fee_rate } 元</div>
                                </div>
                                <div style={{ display:'flex', justifyContent:'space-between', margin:'10px 0' }}>
                                    <div>
                                        <div className={style['sub-text']}>电费(元)</div>
                                        <div className={style['data']}>{ Math.floor(+item.totalCost) }</div>
                                    </div>
                                    <div>
                                        <div className={style['sub-text']}>电费占比(%)</div>
                                        <div className={style['data']}>
                                            {
                                                measureCostInfo.base.totalCost ? ((item.totalCost / measureCostInfo.base.totalCost)*100).toFixed(1) : 0.00
                                            }
                                            %
                                        </div>
                                    </div>
                                    <div>
                                        <div className={style['sub-text']}>用电量(kwh)</div>
                                        <div className={style['data']}>{ Math.floor(+item.totalEnergy) }</div>
                                    </div>
                                </div>
                            </div>
                        </div>       
                    ))
                    :
                    null
                }        
            </div>
            <div className={style['card-container-wrapper']} style={{ height:'80%', paddingRight:'0', paddingBottom:'0' }}>
                <div className={style['card-container']}>
                    <MeasureBarChart data={measureCostInfo.view} timeType={user.timeType} theme={user.theme} />
                </div>
            </div>

        </div>
        :
        <Skeleton active className={style['skeleton']} /> 
            
    );
}

export default connect(({ user, baseCost})=> ({ user, baseCost}))(MeasureCostManager);

{/* <div className='card-container'>
                <div className={style['flex-container']}>
                    尖峰平谷分析 
                    <div className={style['flex-item-wrapper']}>
                        <div className={style['flex-item']}>
                            <div className={style['text']} style={{ textAlign:'center' }}>尖峰平谷分析</div>
                            <div className={style['sub-flex-container']}>
                                   <div className={style['sub-item']}>
                                       <div>总电费: <span className={style['text']}>{ measureCostInfo.base ? Math.floor(measureCostInfo.base.totalCost) : 0 } 元</span></div>
                                   </div>
                                   <div className={style['sub-item']}>
                                       <div>平均电价: <span className={style['text']}>{ measureCostInfo.base ? measureCostInfo.base.price : 0 } 元</span></div>
                                   </div>
                                   {
                                       measureInfoList && measureInfoList.length 
                                       ?
                                       measureInfoList.map((item,index)=>(
                                           <div className={style['sub-item']} key={index}>
                                               <div>
                                                   { `${timeInfo[item.time_type]}(共${item.longTime}小时)` }
                                               </div>
                                               <div className={style['progress-container']}>
                                                   <div className={style['progress']} style={{ 
                                                       backgroundColor:colorInfo[item.time_type],
                                                       width: measureCostInfo.base.totalCost === 0 ? '0' : (item.totalCost / measureCostInfo.base.totalCost)*100 + '%'
                                                   }}></div>
                                               </div>
                                               <div style={{ color:colorInfo[item.time_type]}}>电价: { item.fee_rate }元</div>
                                           </div>
                                       ))
                                       :
                                       null
                                   }    
                            </div>
                        </div>
                    </div>

                    避峰用谷分析 
                    <div className={style['flex-item-wrapper']}>
                        <div className={style['flex-item']}>
                             <div className={style['text']} style={{ textAlign:'center' }}>
                                避峰用谷分析 
                             </div>
                             <div style={{ position:'absolute', right:'0', top:'0', backgroundColor:'#1890ff', padding:'6px 10px'}} >
                                <span>使用后省: </span>
                                <span style={{ color:'#fff', fontSize:'1.4rem', fontWeight:'bold'}}>{`${((measureCostInfo.base && measureCostInfo.base.totalCost) - (measureCostInfo.referInfo && measureCostInfo.referInfo.totalCost)).toFixed(0) }元`}</span>
                             </div> 
                             <div className={style['sub-flex-container']}>
                                    <div className={style['sub-item']}>
                                        <div>总电费: <span className={style['text']}>{ measureCostInfo.referInfo ? Math.floor(measureCostInfo.referInfo.totalCost) : 0 } 元</span></div>
                                    </div>
                                    <div className={style['sub-item']}>
                                        <div>平均电价: <span className={style['text']}>{ measureCostInfo.referInfo ? measureCostInfo.referInfo.price : 0 } 元</span></div>
                                    </div>
                                    {
                                        measureReferList && measureReferList.length 
                                        ?
                                        measureReferList.map((item,index)=>(
                                            <div className={style['sub-item']} key={index}>
                                                <div>
                                                    { `${timeInfo[item.time_type]}(共${item.longTime}小时)` }
                                                </div>
                                                <div className={style['progress-container']}>
                                                    <div className={style['progress']} style={{ 
                                                        backgroundColor:colorInfo[item.time_type],
                                                        width: measureCostInfo.referInfo.totalCost === 0 ? '0' : (item.totalCost / measureCostInfo.referInfo.totalCost)*100 + '%'
                                                    }}></div>
                                                </div>
                                                <div style={{ color:colorInfo[item.time_type]}}>电价: { item.fee_rate }元</div>
                                            </div>
                                        ))
                                        :
                                        null
                                    }
                             </div>
                        </div>
                    </div>
                    
                </div>
            </div>   */}