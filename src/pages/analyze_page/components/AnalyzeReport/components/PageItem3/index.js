import React from 'react';
import { Skeleton, Tabs, Popover, TreeSelect, Spin, Radio } from 'antd';
import PageItem from '../PageItem';

import EnergyCostChart from '@/pages/energy_manager/components/EnergyCostChart';
import RegionQuotaChart from '@/pages/energy_manager/components/RegionQuotaChart';
import EfficiencyTree from '@/pages/efficiency_manager/components/EfficiencyTree';
import style from '../../AnalyzeReport.css';

function PageItem3({ efficiency, efficiencyQuota, fields, analyze, dispatch, companyName }){
    const { regionLoading, attrData, regionData, currentDate } = efficiency;
    const { treeLoading, selectMach } = efficiencyQuota;
    const { energyInfo } = fields;
    const { reportInfo } = analyze;
    let dateArr = currentDate.format('YYYY-MM-DD').split('-');
    return (
        <PageItem title='能源效率分析-Energy Efficiency Analysis' companyName={companyName}>  
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
            <div className={style['layout-container']}>
                { 
                    attrData.map((item,index)=>(
                        <div className={style['item-container-wrapper']} style={{ display:'block', height:'260px', width:'100%', paddingRight:'0' }} key={index} >
                            <div className={style['item-container']}>
                                <EnergyCostChart 
                                    forReport={true}
                                    data={item} 
                                    energyInfo={energyInfo} 
                                    onSetDate={date=> { dispatch({type:'efficiency/setDate', payload:date }); dispatch({type:'efficiency/fetchAttrRatio'})}}
                                    year={dateArr[0]}
                                    month={dateArr[1]}
                                    day={dateArr[2]} 
                                />
                            </div>
                        </div>
                    ))
                }
            </div> 
            <div className={style['layout-container']} style={{ height:'340px'}}>
                <div className={style['item-container-wrapper']}>
                    <div className={style['item-container']}>                  
                        <RegionQuotaChart 
                            forReport={true}
                            data={regionData} 
                            onLink={action=>dispatch(action)} 
                            energyInfo={energyInfo} 
                            isLoading={regionLoading}
                        />                      
                    </div>
                </div>
                <div className={style['item-container-wrapper']}>
                    <div className={style['item-container']}>                   
                        <RegionQuotaChart 
                            forReport={true}
                            data={regionData} 
                            onLink={action=>dispatch(action)} 
                            energyInfo={energyInfo} 
                            isLoading={regionLoading}
                            multi={true}
                        />               
                    </div>
                </div>
            </div>
            {/* 能效定额树图 */}
            {/* <div className={style['layout-container']} style={{ height:'500px', backgroundColor:'#f7f7f7', position:'relative'}}>
                
                {
                    efficiencyQuota.chartLoading 
                    ?
                    <Spin size='large' />
                    :
                    <EfficiencyTree 
                        forReport={true}
                        data={efficiencyQuota.quotaTree} 
                        onDispatch={action=>dispatch(action)} 
                        energyInfo={efficiencyQuota.energyInfo} 
                        currentField={fields.currentField} 
                        currentAttr={fields.currentAttr} 
                        
                    />
                }
            </div> */}
        </PageItem>
    )
}

export default PageItem3;