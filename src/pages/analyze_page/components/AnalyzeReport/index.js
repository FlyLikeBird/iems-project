import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'dva';
import { Input, Skeleton, Spin, Radio, Button, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import PageItem from './components/PageItem';
import ReactEcharts from 'echarts-for-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import style from './AnalyzeReport.css';
// import codeImg from '../../../../../../public/code.png';

import reportBg from '../../../../../public/report-bg.jpg';
// import reportFooter from '../../../../../../public/report-footer.jpg';

import PageItem0 from './components/PageItem0';
import PageItem1 from './components/PageItem1';
import PageItem2 from './components/PageItem2';
import PageItem3 from './components/PageItem3';
import PageItem4 from './components/PageItem4';
import PageItem5 from './components/PageItem5';
import PageItem6 from './components/PageItem6';
import PageItem7 from './components/PageItem7';
import PageItem8 from './components/PageItem8';

let canDownload = false;
let timer ;
let date = new Date();
function getBase64(dom){
    return html2canvas(dom, { dpi:96, scale:1 })
        .then(canvas=>{
            let MIME_TYPE = "image/png";
            return canvas.toDataURL(MIME_TYPE);
        })
}

function getPromise(dispatch, action){
    return new Promise((resolve, reject)=>{
        // forReport字段为了优化请求流程，不重复请求维度接口，共享维度属性树全局状态
        dispatch({ ...action, payload:{ resolve, reject, forReport:true }});
    })
}


function AnalyzeReport({ dispatch, user, demand, energy, monitor, baseCost, attrEnergy, fields, efficiency, efficiencyQuota, alarm, analyze }){
    const containerRef = useRef(null);
    const [loading, toggleLoading] = useState(false);
    const { currentCompany } = user;
    let companyName = currentCompany.company_name ? currentCompany.company_name : '';
    useEffect(()=>{
        new Promise((resolve, reject)=>{
            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                      
            dispatch({ type:'fields/init', payload:{ resolve, reject }});
        })
        .then(()=>{
            Promise.all([
                getPromise(dispatch, { type:'analyze/fetchReportInfo'}),
                getPromise(dispatch, { type:'monitor/fetchSaveSpace'}),
                getPromise(dispatch, { type:'energy/fetchInit'}),
                getPromise(dispatch, { type:'attrEnergy/init'}),
                getPromise(dispatch, { type:'efficiency/fetchInit'}),
                getPromise(dispatch, { type:'efficiency/fetchEffTrend'}),
                // getPromise(dispatch, { type:'efficiencyQuota/fetchTreeInit'}),              
                getPromise(dispatch, { type:'efficiencyQuota/fetchQuotaInit'}),
                getPromise(dispatch, { type:'demand/fetchDemandEntry'}),
                getPromise(dispatch, { type:'baseCost/fetchEleAnalyze'}),
                getPromise(dispatch, { type:'alarm/fetchMonitorInfo'}),
                getPromise(dispatch, { type:'alarm/fetchReportSumInfo'}),
                getPromise(dispatch, { type:'analyze/fetchBaseSaveSpace'}),
                getPromise(dispatch, { type:'analyze/fetchMeterSaveSpace'}),
                getPromise(dispatch, { type:'analyze/fetchAdjustSaveSpace'})
            ])
            .then(()=>{
                // 如果数据还没加载完，则标记为开始下载状态，等数据加载完自动生成文件
                // 如果数据加载完，用户没有点击下载，则待定
                canDownload = true;
                // console.log('b');
                // if ( canDownload && startDownload ) {
                //     timer = setTimeout(()=>{
                //         handleDownload();
                //     },500)
                // }
            })
            .catch(err=>{
                console.log(err);
            })
        })
        
        return ()=>{
            canDownload = false;
            clearTimeout(timer);
            // 重置各个model状态
            dispatch({ type:'analyze/reset'});
            dispatch({ type:'monitor/reset'});
            dispatch({ type:'energy/reset'});
            dispatch({ type:'attrEnergy/reset'});
            dispatch({ type:'efficiency/reset'});
            dispatch({ type:'efficiencyQuota/reset'});
            dispatch({ type:'demand/reset'});
            dispatch({ type:'baseCost/reset'});
            dispatch({ type:'alarm/reset'});
            dispatch({ type:'analyze/reset'});
        }
    },[]);
    
    const handleDownload = ()=>{
        let container = containerRef.current;
        if ( container ){
            let pageDoms = container.getElementsByClassName(style['page-container']);
            Promise.all(Array.from(pageDoms).map(dom=>getBase64(dom)))
            .then(base64Imgs=>{
                var pdf = new jsPDF('', 'pt', 'a4', true);
                base64Imgs.map((img, index)=>{
                    pdf.addImage(img, 'JPEG', 0, 0, 600, 840);
                    if ( index === base64Imgs.length - 1 ) return ;
                    pdf.addPage();
                })
                pdf.save('诊断报告.pdf');
                toggleLoading(false);            
            })
        }
    }
    return (
        <div className={style['report-container']}>
            {
                loading
                ?
                <div style={{ zIndex:'500', position:'fixed', left:'0', right:'0', top:'0', bottom:'0' ,backgroundColor:'rgba(0,0,0,0.8)'}}>
                    <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', textAlign:'center', color:'#fff' }}>
                        <div>报告生成中，请稍后...</div>
                        <Spin size='large' />
                    </div>
                </div>
                :
                null
            }
            <div style={{ width:'100%'}} ref={containerRef}>
                {/* 报告封面 */}
                <div className={`${style['page-container']}`} style={{ color:'#fff', backgroundImage:`url(${reportBg})`}}>
                    <div style={{ position:'absolute', width:'160px', left:'100px', top:'40px'}}>
                        <img src={ currentCompany.head_logo_path || user.thirdAgent.logo_path || user.newThirdAgent.logo_path } style={{ width:'100%', height:'auto' }} />
                    </div>
                    <div style={{ position:'absolute', right:'40px', top:'50px' }}>能源云 | 节能咨询 | 设备运维 | 能源大数据</div>
                    <div style={{ position:'absolute', left:'100px', fontSize:'3rem', whiteSpace:'nowrap', top:'400px', textAlign:'left'}}>
                        <div style={{ fontWeight:'bold' }}>{ companyName }</div>
                        <div>{`${date.getMonth() + 1}月能源运行报告`}</div>
                    </div>
                    {/* <div style={{ position:'absolute', width:'120px', bottom:'10%', left:'100px'}}>
                        <img src={codeImg} style={{ width:'100%', height:'auto' }} />
                    </div> */}
                </div>
                {/* 全局日期和维度控制 */}
                
                {/* 诊断结论 */}
                <PageItem0 analyze={analyze} monitor={monitor} dispatch={dispatch} companyName={companyName} />
                {/* 能源成本分析 */}
                <PageItem1 energy={energy} attrEnergy={attrEnergy} analyze={analyze} dispatch={dispatch} companyName={companyName}/>
                {/* 能源成本分析---计量电费、基本电费 */}
                <PageItem8 energy={energy} baseCost={baseCost} dispatch={dispatch} user={user} companyName={companyName} />
                {/* 能源效率分析 */}
                <PageItem2 efficiency={efficiency} dispatch={dispatch} analyze={analyze} fields={fields} companyName={companyName}/>
                {/* 能源效率分析 */}
                <PageItem3 efficiency={efficiency} efficiencyQuota={efficiencyQuota} analyze={analyze} fields={fields} dispatch={dispatch} companyName={companyName}/>
                {/* 能源效率分析---定额概况 */}
                <PageItem4 efficiency={efficiency} efficiencyQuota={efficiencyQuota} demand={demand} analyze={analyze} fields={fields} dispatch={dispatch} companyName={companyName}/>
                {/* 能源效率分析 ---- 需量分析 */}
                <PageItem5 demand={demand} analyze={analyze} dispatch={dispatch} companyName={companyName}/>
                {/* 能源安全分析 */}
                <PageItem6 alarm={alarm} user={user} analyze={analyze} dispatch={dispatch} companyName={companyName}/>
                {/* 诊断结论 */}
                <PageItem7 analyze={analyze} dispatch={dispatch} companyName={companyName}/>
                {/* 报告结尾 */}
                {/* <div className={`${style['page-container']}`} style={{ color:'#fff', backgroundImage:`url(${reportBg})`}}>
                    <div style={{ position:'absolute', width:'160px', left:'100px', top:'40px'}}>
                        <img src={ user.userInfo.user_name === 'feixundemo' ? feixunLogo : user.userInfo.user_name === 'mogudemo' ? moguLogo : logo } style={{ width:'100%', height:'auto' }} />
                    </div>
                    <div style={{ position:'absolute', right:'40px', top:'50px' }}>能源云 | 节能咨询 | 设备运维 | 能源大数据</div>
                    <div style={{ position:'absolute', left:'100px', fontSize:'4rem', top:'400px', textAlign:'left'}}>
                        <div>华翊云，为企业管理赋能</div>
                    </div>
                    <div style={{ position:'absolute', left:'0px', right:'0px', width:'100%', bottom:'0'}}>
                        <img src={reportFooter} style={{ width:'100%', height:'auto' }} />
                    </div>
                </div> */}
            </div>

            {/* 操作button */}
                <Button style={{ width:'46px', height:'46px', position:'fixed', right:'10%', bottom:'10%' }} type='primary' shape='circle' icon={<DownloadOutlined />} onClick={()=>{
                    if ( canDownload ){
                        toggleLoading(true);
                        handleDownload();
                    } else {
                        message.info('数据还在加载，请稍后再点击下载');
                    }
                }}/>

        </div>
    )
}

export default connect(({ user, energy, baseCost, attrEnergy, efficiency, efficiencyQuota, fields, alarm, analyze, demand, monitor })=>({ user, energy, baseCost, demand, attrEnergy, efficiency, efficiencyQuota, fields, alarm, analyze, monitor }))(AnalyzeReport);