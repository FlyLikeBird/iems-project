import React, { useState } from 'react';
import { routerRedux } from 'dva/router';
import { Skeleton, Tabs, Popover, TreeSelect, Spin, Radio, Select, Button } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, AlertFilled } from '@ant-design/icons';
import PageItem from '../PageItem';
import ReactEcharts from 'echarts-for-react';
import plateImg from '../../../../../../../public/plate-bg.png';
import ResultPieChart from '../ResultPieChart';
import RadarChart from '../RadarChart';
import SaveSpacePieChart from '../../../../../page_index/components/SaveSpacePieChart';
import style from '../../AnalyzeReport.css';

function PageItem0({ analyze, monitor, companyName }){
    const { rankAndGrade, eleHealth, reportInfo } = analyze;
    const { saveSpace } = monitor;
    const infoList = reportInfo.baseCostText ? Object.keys(reportInfo.baseCostText).map(key=>reportInfo.baseCostText[key]) : [];
    // console.log(eleHealth);
    // console.log(reportInfo);
    
    return (
        <PageItem title='诊断结论-The Diagnosis Summary' companyName={companyName}>
            {
                infoList && infoList.length 
                ?
                <div className={style['layout-container']}>
                    <ul style={{ fontWeight:'bold' }}>
                        {
                            infoList.map((item,index)=>(
                                <li key={index}>{ item }</li>
                            ))
                        }
                    </ul>
                </div>
                :
                null
            }  
            <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div className={style['item-title']} >用电评价</div>
                {/* <div>
                    <Radio.Group size='small' buttonStyle="solid" value={rankTimeType} onChange={e=>{
                        dispatch({ type:'analyze/fetchRankAndGrade', payload:{ timeType:e.target.value }})
                        toggleRankTimeType(e.target.value);
                    }}>
                        <Radio.Button key='1' value='2'>本月</Radio.Button>
                        <Radio.Button key='2' value='3'>本年</Radio.Button>
                    </Radio.Group>
                </div> */}
            </div>
            <div className={style['layout-container']} style={{ height:'300px'}}>
                <div className={style['item-container-wrapper']}>
                    <div className={style['item-container']} style={{ position:'relative', textAlign:'center' }}>
                        <ResultPieChart data={rankAndGrade} />
                        <div style={{ position:'absolute', left:'50%', bottom:'10px', marginLeft:'-40px'}}>综合电价排名</div>
                    </div>     
                </div>
                <div className={style['item-container-wrapper']}>
                    <div className={style['item-container']} style={{ textAlign:'center', position:'relative' }}>
                        <img src={plateImg} style={{ width:'200px' }} />
                        <div style={{ position:'absolute', left:'50%', top:'110px', transform:'translateX(-50%)', fontWeight:'bold', fontSize:'3rem' }}>
                            { `第${rankAndGrade.rank || '-'}名` }
                        </div>
                        <div style={{ position:'absolute', left:'50%', bottom:'10px', marginLeft:'-40px'}}>平台能效排名</div>
                    </div>
                </div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div className={style['item-title']} >能源健康指数</div>
                {/* <div>
                    <Radio.Group size='small' buttonStyle="solid" value={healthTimeType} onChange={e=>{
                        dispatch({ type:'analyze/fetchEleHealth', payload:{ timeType:e.target.value }})
                        toggleHealthTimeType(e.target.value);
                    }}>
                        <Radio.Button key='0' value='1'>本月</Radio.Button>
                        <Radio.Button key='1' value='2'>本年</Radio.Button>
                    </Radio.Group>
                </div> */}
            </div>
            <div className={style['layout-container']} style={{ height:'360px', backgroundColor:'#f7f7f7' }}>
                {
                    eleHealth && Object.keys(eleHealth).length 
                    ?
                    <RadarChart data={eleHealth} />
                    :
                    null
                }
            </div>
            <div>
                <div className={style['item-title']}>本月节俭空间</div>
            </div>
            <div className={style['layout-container']} style={{ height:'380px', backgroundColor:'#f7f7f7'}}>
                {
                    saveSpace && Object.keys(saveSpace).length
                    ?
                    <SaveSpacePieChart data={saveSpace.costInfo} forReport={true} />
                    :
                    null
                }
            </div>
        </PageItem>
    )
}

export default PageItem0;