import React,{ useEffect } from 'react';
import { Skeleton, message, Select, Radio } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import PageItem from '../PageItem';
import PieChart from '@/pages/energy_manager/components/PieChart';
import RangeBarChart from '@/pages/energy_manager/components/RangeBarChart';
import RegionQuotaChart from '@/pages/energy_manager/components/RegionQuotaChart';
import EnergyQuotaChart from '@/pages/energy_manager/components/EnergyQuotaChart';
import style from '../../AnalyzeReport.css';

const { Option } = Select;

function PageItem1({ energy, attrEnergy, analyze, startDate, dispatch, energyList, fieldList, currentField, companyName }){
    const { energyInfo, showType, costAnalysis, costInfo, chartLoading, chartInfo, timeType } = energy;
    const { reportInfo }= analyze;
    let energyArr = [{ type_id:0, type_name:'总', type_code:'total', unit:'tce' }, ...energyList];
    if ( reportInfo.text && reportInfo.text.length && reportInfo.text[0].length ){
        if ( reportInfo.text[0].length === 1 ){
            let str = costInfo.length && reportInfo.text && reportInfo.text.length ? `${startDate.month() + 1}月电费:${Math.floor(costInfo[1].cost)}元，占比100%， 对比上月${costInfo[1].adjoinRate <= 0 ? '减少':'增加'}${Math.abs(costInfo[1].adjoinRate).toFixed(1)}%` : '';
            reportInfo.text[0].unshift(str);
        }
    }
    return (
        <PageItem title='能源成本分析-Energy Cost Analysis' companyName={companyName}> 
            <div>
                {
                    reportInfo.text && reportInfo.text[0] && reportInfo.text[0].length 
                    ?
                    <div className={style['layout-container']}>
                        <ul style={{ fontWeight:'bold' }}>
                            {
                                reportInfo.text[0].map((item,index)=>(
                                    <li key={index}>{ item }</li>
                                ))
                            }
                        </ul>
                    </div>
                    :
                    null
                }
                <div className={style['layout-container']} style={{ height:'340px'}}>
                    <div className={style['item-container-wrapper']}>
                        <div className={style['item-container']}>
                            <PieChart data={costAnalysis} energyInfo={energyInfo} energyList={energyList} showType={showType} startDate={startDate} forReport={true} />
                        </div>
                    </div>
                    <div className={style['item-container-wrapper']}>
                        <div style={{ height:'30px', display:'flex', justifyContent:'space-between'}}>
                            <Radio.Group buttonStyle='solid' size='small' value={energy.energyInfo.type_id} onChange={e=>{
                                let temp = energyArr.filter(i=>i.type_id === e.target.value )[0];
                                dispatch({ type:'energy/toggleEnergyType', payload:temp });
                                dispatch({ type:'energy/fetchCost', payload:{ forReport:true }});
                                dispatch({ type:'energy/fetchCostByTime', payload:{ forReport:true }}); 
                                dispatch({ type:'attrEnergy/fetchAttrQuota', payload:{ forReport:true }});                    
                            }}>
                                {
                                    energyArr.map((item,index)=>(
                                        <Radio.Button key={item.type_id} value={item.type_id}>{item.type_name}</Radio.Button>
                                    ))
                                }
                            </Radio.Group>
                            <Radio.Group style={{ marginLeft:'10px' }} size='small' buttonStyle="solid" value={showType} onChange={e=>dispatch({type:'energy/toggleShowType', payload:e.target.value})}>
                                <Radio.Button key='0' value='0'>成本</Radio.Button>
                                <Radio.Button key='1' value='1'>能耗</Radio.Button>
                            </Radio.Group>
                        </div>
                        <div style={{ height:'310px'}}>
                            {
                                costInfo.map((item,index)=>{
                                    let sameRate = showType === '0' ? item.sameRate  : item.sameEnergyRate ;
                                    let adjoinRate = showType === '0' ? item.adjoinRate  : item.adjoinEnergyRate ;
                                    let value = showType === '0' ? Math.round(item.cost) : Math.round(item.energy);
                                    return (
                                        <div key={index} style={{ height:'33.3%', paddingBottom:index === costInfo.length - 1 ? '0' : '10px'}}>
                                            <div style={{ textAlign:'center', display:'flex', alignItems:'center', height:'100%', backgroundColor:'#f7f7f7'}}>
                                                <div style={{ flex:'2' }}>
                                                    <div>
                                                        {
                                                            `${ item.key === 'day' ? '今日' : item.key === 'month' ? `${startDate.month() + 1}月` : '本年'}${energyInfo.type_name}${ showType ==='0' ? '费用' : '能耗'}(${ showType === '0' ? '元' : energyInfo.unit })`
                                                        }
                                                    </div>
                                                    <div style={{ fontSize:'1.6rem', fontWeight:'bold', color:'#323238'}}>{ value }</div>
                                                </div>
                                                <div style={{ flex:'1', textAlign:'left' }}>
                                                    <div>同比
                                                        {
                                                            sameRate 
                                                            ?
                                                            <span style={{  marginLeft:'10px', fontSize:'1.2rem', fontWeight:'bold', color:sameRate <= 0 ? '#6fcc17' : ':#e83320' }} >
                                                                { sameRate <= 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined /> }
                                                                { Math.abs(sameRate).toFixed(1) + '%' }
                                                            </span>
                                                            :
                                                            <span style={{ marginLeft:'10px', fontSize:'1.2rem', fontWeight:'bold' }}><ArrowDownOutlined style={{ color:'#f7f7f7' }} />-- --</span>
                                                        }
                                                    </div>
                                                    <div>环比
                                                        {
                                                            adjoinRate
                                                            ?
                                                            <span style={{  marginLeft:'10px', fontSize:'1.2rem', fontWeight:'bold', color:adjoinRate <= 0 ? '#6fcc17' : ':#e83320' }} >
                                                                { adjoinRate <= 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined /> }
                                                                { Math.abs(adjoinRate).toFixed(1) + '%' }
                                                            </span>
                                                            :
                                                            <span style={{ marginLeft:'10px', fontSize:'1.2rem', fontWeight:'bold' }}><ArrowDownOutlined style={{ color:'#f7f7f7' }} />-- --</span>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )  
                                })
                            }
                        </div>
                    </div>
                </div>
                 {/* 成本趋势图  */}
                <div className={style['layout-container']} style={{ height:'470px'}}>
                    <div className={style['item-container-wrapper']} style={{ width:'100%' }}>
                        <div className={style['item-container']}>
                            <RangeBarChart 
                                data={chartInfo}
                                energyInfo={energyInfo} 
                                isLoading={chartLoading}
                                showType={showType}
                                timeType='2'
                                onDispatch={action=>dispatch(action)}
                                forReport={true}
                            />
                        </div>
                    </div>
                </div>
                 {/* 区域用能和定额执行概况  */}
                <div className={style['layout-container']} style={{ height:'350px'}}>
                    <div className={style['item-container-wrapper']} >                      
                        <div className={style['item-container']} style={{ position:'relative' }}>
                            <div style={{ position:'absolute', left:'130px', top:'0', zIndex:'10' }}>
                                <Select style={{ width:'120px' }} value={currentField.field_id} onChange={value=>{
                                    let current = fieldList.filter(i=>i.field_id === value )[0];
                                    dispatch({ type:'fields/toggleField', payload:{ field:current } });
                                    dispatch({ type:'attrEnergy/fetchAttrQuota', payload:{ forReport:true }});
                                }}>
                                    {
                                        fieldList.map((item)=>(
                                            <Option key={item.field_id} value={item.field_id}>{ item.field_name }</Option>
                                        ))
                                    }
                                </Select>
                            </div>
                            <RegionQuotaChart 
                                data={attrEnergy.attrQuota} 
                                showType={showType} 
                                energyInfo={energy.energyInfo} 
                                forReport={true}
                                startDate={startDate}
                            />
                        </div>                      
                    </div>
                    <div className={style['item-container-wrapper']}>                   
                        <div className={style['item-container']}>
                            <EnergyQuotaChart 
                                data={attrEnergy.energyQuota} 
                                showType={showType} 
                                forReport={true}                                   
                            />
                        </div>                     
                    </div>
                </div>
            </div>
    </PageItem>
    )
}

export default PageItem1;