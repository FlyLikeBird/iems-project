import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Spin, Pagination, Tooltip } from 'antd';
import style from '../PowerRoom.css';
const styleObj = {
    display:'inline-block',
    whiteSpace:'nowrap',
    fontSize:'0.8rem', 
    color:'#3e8fff', 
    marginLeft:'4px',
    verticalAlign:'top',
    overflow:'hidden',
    textOverflow:'ellipsis'
};

function MachList({ dispatch, match, location, machList, total, keyword, currentPage, onSelect, containerWidth }){
    let isSmallDevice = containerWidth <= 1440 ? true : false;
    return (
        <div style={{ width:'100%', height:'100%', padding:'20px 0 20px 20px' }}>
            {
                machList  
                ?
                machList.length 
                ?
                <div style={{ height:'100%'}}>
                    <div style={{ height:'94%'}}>
                        {
                            machList.map((mach,index)=>(
                                <div key={mach.mach_id} className={style['inline-item-container-wrapper']}>
                                    <div key={mach.mach_id} className={ mach.rule_name ? `${style['inline-item-container']} ${style['error']}` : style['inline-item-container']} onClick={()=>{
                                        // dispatch(routerRedux.push(`${match.url}${ type ? '' : '/1'}/${mach.mach_id}`))
                                        onSelect(mach);
                                    }}>
                                        {
                                            mach.img_path 
                                            ?
                                            <img src={mach.img_path} style={{ width:'40%', height:'auto'}}/>
                                            :
                                            <div style={{ height:'80%', width:'30%', display:'flex', alignItems:'center', textAlign:'center', margin:'10px', backgroundColor:'rgb(251 251 251)'}}>
                                                暂无产品图片
                                            </div>
                                        }
                                        <div style={{ whiteSpace:'nowrap' }}>
                                            <div>
                                                <span className={style['sub-text']}>编号:</span>
                                                <Tooltip title={mach.register_code}><span style={{...styleObj, width: isSmallDevice ? '70px' : '140px' }}>{mach.register_code}</span></Tooltip>
                                            </div>
                                            <div>
                                                <span className={style['sub-text']}>支路:</span>
                                                <Tooltip title={mach.branch_name}><span style={{...styleObj, width: isSmallDevice ? '70px' : '140px' }}>{ mach.branch_name}</span></Tooltip>
                                            </div>
                                            <div>
                                                <span className={style['sub-text']}>区域:</span>
                                                <Tooltip title={mach.region_name}><span style={{...styleObj, width: isSmallDevice ? '70px' : '140px' }}>{ mach.region_name}</span></Tooltip>
                                            </div>
                                            <div>
                                                <span className={style['sub-text']}>告警:</span>
                                                <Tooltip title={mach.rule_name}><span style={{...styleObj, width: isSmallDevice ? '70px' : '140px' }}>{ mach.rule_name || '--' }</span></Tooltip>
                                            </div>
                                        </div>
                                        <div className={style['extra-info']}>
                                            <span className={style['dot']} style={{ backgroundColor:mach.rule_name ? '#fd6051' : '#31cb98' }}></span>
                                            <Tooltip title={mach.model_desc}><span style={{...styleObj, width: isSmallDevice ? '70px' : '140px', color:'#5d5d5d' }}>{ mach.model_desc }</span></Tooltip>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    {/* 分页符 */}
                    {
                        total > 16 
                        ?
                        <div style={{ height:'6%'}}>
                            <Pagination current={+currentPage} showSizeChanger={false} defaultPageSize={16} total={total} onChange={page=>{
                                dispatch({ type:'powerRoom/setCurrentPage', payload:page });
                                dispatch({ type:'powerRoom/fetchMachList', payload:{ keyword }});
                            }}/>
                        </div>
                        :
                        null
                    }
                    
                </div>
                :
                <div>没有任何设备</div>
                :
                <Spin className={style['spin']} />
            }
        </div>
    )
}

export default MachList;