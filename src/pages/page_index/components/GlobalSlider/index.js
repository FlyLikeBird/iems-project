import React, { useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Table, Button, Modal, Drawer, Popconfirm, Checkbox, Radio, Tooltip, Spin } from 'antd';
import { DashboardOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined, ArrowUpOutlined, ArrowDownOutlined  } from '@ant-design/icons';
import FullscreenSlider from '../../../../components/FullscreenSlider';
import TooltipInfo from '../../../../components/TooltipInfo';
import EfficiencyFlowChart from '../../../EfficiencyManagerPage/components/EfficiencyFlowChart';
import pointImg from '../../../../../public/pointer.png';

const energyIcons = {
    'ele':<ThunderboltOutlined />,
    'water':<ExperimentOutlined />,
    'gas':<HourglassOutlined />,
    'hot':<FireOutlined />
};

const energyTypes = {
    'ele':'电',
    'water':'水',
    'hot':'热',
    'gas':'气'
};

function GlobalSlider({ interval, sceneList, levelInfo, contentWidth, dispatch, chartLoading, currentPath, currentIndex }){
    const [timeType, toggleTimeType] = useState('2');  
    const data = [];
    console.log(sceneList);
    sceneList.map((item,index)=>{
        let content;
        let { imageInfo, scene ,tags, warningAnalyze } = item;
        
        if ( item.scene ){
            // 拟态图
            content = (
                <div>
                    <div className='img-container' data-width={imageInfo ? imageInfo.width: 0} data-height={imageInfo ? imageInfo.height : 0}>
                        <img src={scene.bg_image_path} style={{width:'100%',height:'100%'}} />
                        {
                            tags && tags.length
                            ?              
                            tags.map((tag)=>(
                                index === 0 
                                ?
                                <Tooltip 
                                    key={tag.tag_id} 
                                    // trigger="click" 
                                    placement="rightTop" 
                                    title={<TooltipInfo data={tag} />} 
                                    overlayClassName='tooltip'
                                >
                                    <div className='tag-container' style={{ left:tag.pos_left+'%', top:tag.pos_top+'%'}}>
                                        <div className='tag'>{ tag.tag_name }</div>
                                        <div className='sub-tag'>{`今日总成本: ${tag.cost}元`}</div>
                                    </div>
                                </Tooltip> 
                                :
                                index === 2 
                                ?
                                <Tooltip
                                    key={tag.tag_id} 
                                    // trigger="click" 
                                    placement="rightTop" 
                                    title={<div></div>} 
                                    overlayClassName='tooltip'
                                >
                                    <div className='point-container motion' style={{ left:tag.pos_left+'%', top:tag.pos_top+'%'}}>
                                        <img src={pointImg} />
                                    </div>
                                </Tooltip>
                                :
                                null                              
                            ))
                            :
                            null
                        }
                    </div>
                    {
                        index === 0 
                        ?
                        <div className='info-container animate__animated animate__bounceInLeft'>
                            <div>今日能源成本竞争力</div>
                            <div className='text'>排名<span style={{color:'red', padding:'0 4px'}}>1</span>位</div>
                        </div>
                        :
                        null 
                    }
                    {
                        index === 2
                        ?
                        <div className='info-container-2 animate__animated animate__bounceInLeft' >
                            <div>当前安全电气警报</div>
                            <div className='text'>{ `${warningAnalyze[1] ? warningAnalyze[1] : 0} 件`}</div>
                        </div>
                        :
                        null
                    }
                    {
                        index === 2
                        ?
                        <div className='info-container-2 animate__animated animate__bounceInLeft' >
                            <div>当前指标越限警报</div>
                            <div className='text'>{ `${warningAnalyze[2] ? warningAnalyze[2] : 0} 件`}</div>
                        </div>
                        :
                        null
                    }
                    {
                        index === 2
                        ?
                        <div className='info-container-2 animate__animated animate__bounceInLeft' >
                            <div>当前通讯采集警报</div>
                            <div className='text'>{ `${warningAnalyze[3] ? warningAnalyze[3] : 0} 件`}</div>
                        </div>
                        :
                        null
                    }
                       
                </div>
                );
        } else {
            // 能流图
            content = (
                <div style={{ width:'100%', height:'100%', position:'relative'}}>
                    {
                        chartLoading 
                        ?
                        <Spin />
                        :
                        <div style={{backgroundColor:'#091935', height:'100%', position:'relative'}}>
                            <div style={{ position:'absolute', left:'50%', top:'10px', fontSize:'18px', color:'#fff', textDecoration:'underline', marginLeft:'-45px'}}>能源流向图</div>
                            <div style={{ position:'absolute', top:'0', right:'0', backgroundColor:'#ade6f6', color:'#000', textAlign:'center', padding:'20px' }}>
                                <div>能源成本产值比排名</div>
                                <div style={{ fontSize:'18px'}}>排名第<span style={{ fontWeight:'bold', color:'red'}}>1</span>位</div>
                            </div> 
                            <div style={{ position:'absolute', top:'60px', bottom:'40px', left:'60px', right:'60px' }}>
                                <EfficiencyFlowChart 
                                    data={item} 
                                    levelInfo={levelInfo} 
                                    chartLoading={chartLoading} 
                                    onFetchData={payload=>dispatch({type:'monitor/fetchFlowChart', payload})} 
                                    onSetLevel={payload=>dispatch({type:'monitor/setLevelInfo', payload})}
                                    mode='dark'
                                />
                            </div> 
                        </div>
                    }
                </div>
            )    
        }
        data.push(content);
    });
    return (       
        <FullscreenSlider interval={interval} data={data} sourceData={sceneList} contentWidth={contentWidth} currentPath={currentPath} currentIndex={ currentIndex ? currentIndex : 0 } />                                                             
    )
};

GlobalSlider.propTypes = {
    
};

export default GlobalSlider;
