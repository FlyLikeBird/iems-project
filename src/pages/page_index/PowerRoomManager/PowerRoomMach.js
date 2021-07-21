import React, { useEffect, useState, useLayoutEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Modal, Button } from 'antd';
import style from './PowerRoom.css';
import machImg from '../../../../../public/power-room/total-mach.png';
import inline from '../../../../../public/power-room/inline-mach.png';
import outline from '../../../../../public/power-room/outline-mach.png';
import todayWarning from '../../../../../public/power-room/today-warning.png';
import unfinish from '../../../../../public/power-room/undealed-warning.png';
import ReactEcharts from 'echarts-for-react';
import MachList from './components/MachList';
import MachDetail from './components/MachDetail';
import { Skeleton } from 'antd';

const iconsMap = {
    '0':machImg,
    '1':inline,
    '2':outline,
    '3':todayWarning,
    '4':unfinish
}

const infoList = [];
for(var i=0;i<6;i++){
    infoList.push({ title:'设备数', value:38 });
}
const menuList = [];
for(var i=0;i<1;i++){
    menuList.push({ title:'智能电表', value:0});
}

let reg = /\/mach_info\/\d*\/\d*/;

function PowerRoomMach({ dispatch, user, powerRoom, match, history, location }){
    let { machListInfo, machDetail, total, currentPage, machLoading } = powerRoom ;
    const [currentMach, setCurrentMach] = useState({});
    const [keyword, setKeyWord] = useState('1');
    useLayoutEffect(()=>{
        let menuDom = document.getElementsByClassName(style['menu-container'])[0];
        let mainContentDom = document.getElementsByClassName(style['main-content'])[0];
        let width = 'calc((100% - 56px)/5)';
        if ( menuDom && mainContentDom ){
            menuDom.style.width = width;
            mainContentDom.style.width = `calc( 100% - ${width})`;
        }
    },[]);
    useEffect(()=>{
        // 监听路由变化
        dispatch({ type:'powerRoom/fetchMachList'});
        return ()=>{
            dispatch({ type:'powerRoom/resetPage'});
        }
    },[]);
    return (
        <div style={{ width:'100%'}}>
            <div className={style['flex-container']} style={{ height:'14%'}}>
                {
                    machListInfo.infoList && machListInfo.infoList.length 
                    ?
                    machListInfo.infoList.map((item,index)=>(
                        <div key={index} className={`${style['flex-item']} flex-basic`} style={{
                            width:'calc((100% - 56px)/5)',
                            height:'100%',
                            display:'flex',
                            flexDirection:'row',
                            alignItems:'center',
                            borderRadius:'6px',
                            color:'#fff',
                            padding:'0',
                            cursor:'pointer',
                            backgroundImage:'linear-gradient( to bottom, #3777de, #75a8f9)'
                        }} onClick={()=>{
                            dispatch({ type:'powerRoom/resetPage'});
                            dispatch({ type:'powerRoom/fetchMachList', payload:{ keyword:item.key }});
                            setKeyWord(item.key);
                        }}>                           
                            <div style={{ width:'30%', textAlign:'center' }}><img src={iconsMap[index]} /></div>
                            <div style={{ width:'70%', paddingLeft:'20px' }}>
                                <div className={style['data']}>{ item.value }</div>
                                <div className={style['sub-text']}>{ item.title }</div>
                            </div>
                            <div className={style['mask']}></div> 
                            {
                                keyword === item.key 
                                ?
                                <div className={style['tag']}>当前</div>                   
                                :
                                null
                            }                   
                        </div>
                    ))
                    :
                    <div style={{ height:'100%', backgroundColor:'#fff', borderRadius:'6px' }}><Skeleton active /></div>
                }
            </div>
            <div style={{ height:'86%', paddingTop:'14px' }}>
                <div className={style['menu-container']}>
                    <div className={style['menu-title']}>设备在线率</div>
                    <div className={style['menu-chart']}>
                        <div style={{ flex:'1'}}><span className={style['data']}>{ machListInfo.total_meter ? Math.floor( machListInfo.total_meter - machListInfo.outline_meter ) : 0 }</span> / <span className={style['sub-text']}>{ machListInfo.total_meter ? machListInfo.total_meter : 0 }</span></div>
                        <div style={{ flex:'1'}}>
                            <ReactEcharts
                                notMerge={true}
                                style={{ width:'100%', height:'100%'}}
                                option={{
                                    polar:{
                                        radius:['64%','80%']
                                    },
                                    angleAxis:{
                                        show:false,
                                        max:machListInfo.total_meter
                                    },
                                    radiusAxis:{
                                        type:'category',
                                        show:true,
                                        axisLabel:{ show:false },
                                        axisLine:{ show:false },
                                        axisTick:{ show:false }
                                    },
                                    graphic:{
                                        type:'text',
                                        left:'center',
                                        top:'46%',
                                        style:{
                                            text:`${machListInfo.total_meter ? Math.floor((machListInfo.total_meter - machListInfo.outline_meter)/machListInfo.total_meter * 100) : 0}%`,
                                            textAlign:'center',
                                            fill:'#ffc654',
                                            fontWeight:'bold',
                                            fontSize:14
                                        }
                                    },
                                    series:[{
                                        type:'bar',
                                        roundCap:true,
                                        coordinateSystem:'polar',
                                        barWidth:30,
                                        showBackground:true,
                                        backgroundStyle:{
                                            color:'#89b4f6'
                                        },
                                        itemStyle:{
                                            color:'#f5a60a'
                                        },
                                        data:[machListInfo.total_meter ? machListInfo.total_meter - machListInfo.outline_meter : 0]
                                    }]
                                }}
                            />
                        </div>
                    </div>
                    <div className={style['menu-list']}>
                        {/* {
                            menuList.map((menu,index)=>(
                                <div key={index} className={style['menu-item']} onClick={()=>{
                                    dispatch(routerRedux.push(`${match.url}/${index}`));
                                }}>
                                    <div>{ menu.title }</div>
                                    <div className={style['text']}>{ menu.value }</div>
                                </div>
                            ))
                        } */}
                        <div className={`${style['menu-item']} ${style['selected']}`}>
                            <div>智能电表</div>
                            <div className={style['text']}>{ machListInfo.total_meter ? machListInfo.total_meter : 0 } </div>
                        </div>
                    </div>
                    
                </div>
                <div className={style['main-content']}>
                    <MachList 
                        dispatch={dispatch} 
                        machList={machListInfo.meterList} 
                        currentPage={currentPage} 
                        total={total}
                        keyword={keyword}
                        onSelect={(item)=>setCurrentMach(item)} 
                        containerWidth={global.containerWidth}
                    /> 
                </div>
                <Modal 
                    width='80vw' 
                    height='80vh' 
                    bodyStyle={{ height:'80vh' }}
                    visible={Object.keys(currentMach).length ? true : false } 
                    cancelText='关闭' 
                    onCancel={()=>setCurrentMach({})} 
                    maskClosable={false}
                    destroyOnClose={true}
                    footer={ null }
                >
                    <MachDetail 
                        dispatch={dispatch}
                        machDetail={machDetail}
                        currentMach={currentMach}
                        machLoading={machLoading}
                    />
                </Modal>
            </div>
            
        </div>
    )
}

export default connect(({ powerRoom })=>({ powerRoom }))(PowerRoomMach);