import React from 'react';
import { Skeleton } from 'antd';
import { MoneyCollectOutlined } from '@ant-design/icons';
import PageItem from '../PageItem';

import RatioChart from '@/pages/efficiency_manager/components/RatioChart';
import OutputChart from '@/pages/efficiency_manager/components/OutputChart';
import EfficiencyFlowChart from '@/pages/efficiency_manager/components/EnergyFlowManager';
import style from '../../AnalyzeReport.css';
const labelStyle = {
    display:'inline-block',
    width:'40px',
    height:'40px',
    lineHeight:'40px',
    borderRadius:'10px',
    color:'#fff',
    fontWeight:'bold',
    background:'#af2aff',
    textAlign:'center'
};
function PageItem2({ efficiency, analyze, fields, dispatch, companyName }){
    const { reportInfo } = analyze;
    const { energyInfo } = fields;
    const { rankInfo, chartInfo, chartLoading } = efficiency;
    return (
        <PageItem title='能源效率分析-Energy Efficiency Analysis' companyName={companyName}>
        {
            efficiency.costChart.date
            ?
            <div>
                {
                    reportInfo.text && reportInfo.text[1] && reportInfo.text[1].length 
                    ?
                    <div className={style['layout-container']}>
                        <ul style={{ fontWeight:'bold' }}>
                            {
                                reportInfo.text[1].map((item,index)=>(
                                    <li key={index}>{ item }</li>
                                ))
                            }
                        </ul>
                    </div>
                    :
                    null
                }
                
                {/* 能源成本产值比 */}
                <div className={style['layout-container']} style={{ height:'300px'}}>
                    <div className={style['item-container']}>
                        <RatioChart data={efficiency.costChart} forReport={true} />                     
                    </div>
                </div>
                {/* 能效指标分解 */}
                <div className={style['layout-container']} style={{ height:'260px'}}>
                    <div className={style['item-container-wrapper']}>
                        <div className={style['item-container']}>
                            <OutputChart data={efficiency.outputInfo} />
                        </div>
                    </div>
                    <div className={style['item-container-wrapper']}>
                        {
                            efficiency.ratioInfo && efficiency.ratioInfo.length 
                            ?
                            efficiency.ratioInfo.map((item,index)=>(
                                <div key={index} className={style['item-container-wrapper']} style={{ 
                                    width:'100%',
                                    height:'25%', 
                                    paddingRight: '0',
                                    paddingBottom: index === efficiency.ratioInfo.length - 1 ? '0' : '10px'
                                }}>
                                    <div className={style['item-container']}>
                                        <div className={style['flex-container']} style={{ justifyContent:'space-around'}}>
                                            <div className={style['flex-item']}>
                                                <span style={{ ...labelStyle, backgroundColor: item.key === 'output' ? '#af2aff' : item.key === 'person' ? '#6dcffb' : item.key === 'area' ? '#ffb863' : '#7a7ab3'}}><MoneyCollectOutlined /></span>
                                            </div>
                                            <div className={style['flex-item']} >
                                                <span>{`本年${item.text}`}</span>
                                                <br/>
                                                <span>
                                                    <span className={style['data']}>{ item.value.year }</span>
                                                    <span style={{ marginLeft:'4px'}}>{ `${item.key === 'output' ? '' : energyInfo.unit + '/'}${item.unit}` }</span>
                                                </span>
                                            </div>
                                            <div className={style['flex-item']}>
                                                <span>{`本月${item.text}`}</span>
                                                <br/>
                                                <span>
                                                    <span className={style['data']}>{ item.value.month }</span>
                                                    <span style={{ marginLeft:'4px'}}>{ `${item.key === 'output' ? '' : energyInfo.unit + '/'}${item.unit}` }</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                            :
                            null
                        }
                    </div>
                </div>
                {/* 能流图 */}
                <div className={style['layout-container']} style={{ height:'570px', backgroundColor:'#f7f7f7'}}>
                    <EfficiencyFlowChart 
                        forReport={true}
                        data={chartInfo} 
                        theme='light'
                        rankInfo={rankInfo}
                        energyInfo={energyInfo}
                        dispatch={dispatch}
                        chartLoading={chartLoading} 
                    />   
                </div>
            </div>
            :
            <Skeleton active />
        }

    </PageItem>
    )
}

export default PageItem2;