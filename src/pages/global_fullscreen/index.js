import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Redirect } from 'dva/router';
import { Tooltip, Radio, Select, message, Spin } from 'antd';
import FullscreenSlider from '@/pages/components/FullscreenSlider';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import TooltipInfo from '@/pages/components/TooltipInfo';
import EnergyFlowManager from '@/pages/efficiency_manager/components/EnergyFlowManager';
import IndexStyle from '@/pages/IndexPage.css';
const { Option } = Select;

const dotStyle = {
    width:'8px',
    height:'8px',
    display:'inline-block',
    borderRadius:'50%',
    position:'absolute',
    top:'0',
    left:'-14px',
    transform:'translateY(50%)',
}

const warningColors = {
    'total':'#ff7862',
    'ele':'#198efb',
    'limit':'#29ccf4',
    'link':'#58e29f'
};

function GlobalFullscreen( { dispatch, user, fields, efficiency, location }){
    let [sourceData, setSourceData] = useState({});
    let { timeType, startDate, endDate } = user;
    let { allFields, energyList, energyInfo, currentField, currentAttr } = fields;
    let { chartLoading, chartInfo, rankInfo } = efficiency;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    
    useEffect(()=>{
        // console.log('sub-screen mounted');
        const handleMessage = e=>{      
            if ( e.data.from && e.data.state ){
                setSourceData({ from:e.data.from, state:e.data.state });
                
                if ( (e.data.from ==='/energy/energy_eff') && e.data.user ) {
                    // 全屏
                    let { chartInfo, rankInfo, allFields, energyInfo, currentField, currentAttr, timeType, beginDate, endDate } = e.data.state[0] || {};
                    dispatch({ type:'user/setUserInfo', payload:{ data:e.data.user.userInfo }})
                    dispatch({ type:'user/setFromWindow', payload:{ timeType, beginDate, endDate }});
                    dispatch({ type:'fields/setFromWindow', payload:{ allFields, energyInfo, currentField, currentAttr }});
                    dispatch({ type:'efficiency/setFlowChartInfo', payload:{ chartInfo, rankInfo }});
                    
                }
            }
        }
        window.addEventListener('message', handleMessage);
        window.addEventListener('unload', ()=>{
            window.opener.postMessage('closed');
        })
        window.opener.postMessage('loaded');
        return ()=>{
            window.removeEventListener('message', handleMessage);
        }
    },[]);
    let data = [];
    if ( sourceData.state && sourceData.state.length ){
        sourceData.state.map((item,index)=>{
            let content;
            let { warningAnalyze, imageInfo, scene ,tags, types, saveSpace, rank  } = item;
            if ( sourceData.from === '/energy/energy_manage') {
                content = (
                    <div>
                        <div className='img-container' data-width={ imageInfo ? imageInfo.width : 0} data-height={ imageInfo ? imageInfo.height : 0} >
                            <img src={ scene ? scene.bg_image_path : ''}  style={{width:'100%',height:'100%'}} />  
                        </div>
                        <div style={{ backgroundImage:'linear-gradient(to right, rgba(0,0,0,0.6) , transparent)', position:'absolute', left:'0', top:'0', width:'20%', height:'100%' }}>
                            <div style={{ color:'#fff', position:'absolute', transform:'translateY(-50%)', left:'0', top:'50%', padding:'0 40px'}}>
                                <div style={{ margin:'20px 0', position:'relative'}}>
                                    <div style={{...dotStyle, backgroundColor:'#2d54ef'}}></div>
                                    <div style={{ fontSize:'0.8rem'}}>本月力调电费节俭潜力</div>
                                    <div style={{ fontSize:'1.4rem', fontWeight:'bold'}}>{ `${saveSpace ? saveSpace.adjustCost : ''}元`}</div>
                                </div>
                                <div style={{ margin:'20px 0', position:'relative'}}>
                                    <div style={{...dotStyle, backgroundColor:'#1cc5c4'}}></div>
                                    <div style={{ fontSize:'0.8rem'}}>本月计量电费节俭潜力</div>
                                    <div style={{ fontSize:'1.4rem', fontWeight:'bold'}}>{ `${saveSpace ? saveSpace.eleCost : ''}元`}</div>
                                </div>
                                <div style={{ margin:'20px 0', position:'relative'}}>
                                    <div style={{...dotStyle, backgroundColor:'#732ad6'}}></div>
                                    <div style={{ fontSize:'0.8rem'}}>本月基本电费节俭潜力</div>
                                    <div style={{ fontSize:'1.4rem', fontWeight:'bold'}}>{ `${saveSpace ? saveSpace.baseCost : ''}元`}</div>
                                </div>
                                <div style={{ margin:'20px 0', position:'relative'}}>
                                    <div style={{...dotStyle, backgroundColor:'#e9eaf5'}}></div>
                                    <div style={{ fontSize:'0.8rem'}}>能源成本竞争力</div>
                                    <div style={{ fontSize:'1.4rem', fontWeight:'bold'}}>{ `排名第${saveSpace ? rank : ''}位`}</div>
                                </div>
                            </div>
                        </div>
                         
                    </div>
                )
            } else if ( sourceData.from === '/energy/alarm_manage') {
                content = (
                    <div>
                        <div className='img-container' data-width={scene ? imageInfo.width : 0} data-height={scene ? imageInfo.height : 0} >
                            { scene ? <img src={scene.bg_image_path} style={{width:'100%',height:'100%'}} /> : null }
                        </div>
                        <div style={{ backgroundImage:'linear-gradient(to right, rgba(0,0,0,0.6) , transparent)', position:'absolute', left:'0', top:'0', width:'20%', height:'100%' }}>
                            <div style={{ color:'#fff', position:'absolute', transform:'translateY(-50%)', left:'0', top:'50%', padding:'0 40px'}}>
                                <div style={{ margin:'20px 0', position:'relative'}}>
                                    <div style={{...dotStyle, backgroundColor:warningColors['ele']}}></div>
                                    <div style={{ fontSize:'0.8rem'}}>待处理安全电气警报</div>
                                    <div style={{ fontSize:'1.4rem', fontWeight:'bold'}}>{ `${warningAnalyze && warningAnalyze[1] ? warningAnalyze[1] : 0} 件`}</div>
                                </div> 
                                <div style={{ margin:'20px 0', position:'relative'}}>
                                    <div style={{...dotStyle, backgroundColor:warningColors['limit']}}></div>
                                    <div style={{ fontSize:'0.8rem'}}>待处理指标越限警报</div>
                                    <div style={{ fontSize:'1.4rem', fontWeight:'bold'}}>{ `${warningAnalyze && warningAnalyze[2] ? warningAnalyze[2] : 0} 件`}</div>
                                </div> 
                                <div style={{ margin:'20px 0', position:'relative'}}>
                                    <div style={{...dotStyle, backgroundColor:warningColors['link']}}></div>
                                    <div style={{ fontSize:'0.8rem'}}>待处理通讯采集警报</div>
                                    <div style={{ fontSize:'1.4rem', fontWeight:'bold'}}>{ `${warningAnalyze && warningAnalyze[3] ? warningAnalyze[3] : 0} 件`}</div>
                                </div> 
                            </div> 
                        </div> 
                         
                    </div>
                )
            } else if ( sourceData.from === '/energy/energy_eff'){
            
                content = (
                    <div className={IndexStyle['container'] + ' ' + IndexStyle['dark']} style={{ width:'100%', height:'100%', backgroundColor:'#191a2f', position:'relative' }}>
                        <div style={{ height:'40px', display:'flex' }}>             
                            <Radio.Group className={IndexStyle['custom-radio']} style={{ marginRight:'20px' }} value={energyInfo.type_id} onChange={e=>{
                                let temp = energyList.filter(i=>i.type_id === e.target.value )[0];
                                dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                                dispatch({ type:'efficiency/fetchFlowChart' });
                            }}>
                                {
                                    energyList.map((item)=>(
                                        <Radio.Button key={item.type_id} value={item.type_id}>{ item.type_name }</Radio.Button>
                                    ))
                                }
                            </Radio.Group>
                            <CustomDatePicker onDispatch={()=>{
                                dispatch({ type:'efficiency/fetchFlowChart'});
                            }} />
                            <Select style={{ width:'120px', marginLeft:'20px' }} className={IndexStyle['custom-select']} value={currentField.field_id} onChange={value=>{
                                if ( chartLoading ) {
                                    message.info('能流图还在加载中');
                                }
                                let current = fieldList.filter(i=>i.field_id === value )[0];
                                dispatch({ type:'fields/toggleField', payload:{ field:current } });
                                dispatch({ type:'efficiency/toggleChartLoading', payload:true });
                                new Promise((resolve, reject)=>{
                                    dispatch({ type:'fields/fetchFieldAttrs', resolve, reject })
                                })
                                .then(()=>{
                                    dispatch({ type:'efficiency/fetchFlowChart' });
                                })
                            }}>
                                {
                                    fieldList.map((item,index)=>(
                                        <Option key={index} value={item.field_id}>{ item.field_name }</Option>
                                    ))
                                }
                            </Select>
                        </div>
                        <div style={{ height:'calc(100% - 40px)'}}>
                            <EnergyFlowManager 
                                data={chartInfo}                        
                                rankInfo={rankInfo}
                                theme='dark'
                                chartLoading={chartLoading}
                                dispatch={dispatch}
                                energyInfo={energyInfo}
                            />
                        </div>
                    </div>
                )
            }
            data.push(content);
        })
    }
    return (
        // 如果全屏页刷新则重定向至全局监控页
        // location.pathname === '/global_fullscreen' && location.from
        // ?  
            <FullscreenSlider 
                interval={0} 
                data={data} 
                isFulled={true}
                sourceData={location.state} 
                currentPath={user.currentPath} 
                currentIndex={location.index} 
            />                                                                   
       
        // <Redirect to='/energy' />
        
    )
}

export default connect( ({ user, fields, efficiency }) => ({ user, fields, efficiency }))(GlobalFullscreen);