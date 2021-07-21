import React from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Spin } from 'antd';
import PowerRoomMonitor from './PowerRoomMonitor';
import WarningStatusPie from './components/WarningStatusPie';
import MachStatusBar from './components/MachStatusBar';
import WarningTypePie from './components/WarningTypePie';
import GaugeChart from './components/GaugeChart';
import ScrollTable from './components/ScrollTable/index';
import style from './PowerRoom.css';
import tempeImg from '../../../../../public/power-room/tempe.png';
import wetImg from '../../../../../public/power-room/wet.png';
import waterImg from '../../../../../public/power-room/water.png';
const arr = [1,2,3];

const envArr = [
    { title:'温度', icon:tempeImg, avg:'--', low:'--', high:'--', unit:'℃' },
    { title:'湿度', icon:wetImg, avg:'--', low:'--', high:'--', unit:'%' },
    { title:'水浸', icon:waterImg, avg:'--', low:'--', high:'--', unit:'mm' }
];

const warningData = [];
for( var i=0;i<6;i++){
    warningData.push({ type_name:'电气安全', region_name:'1-D5出线', status:'温度越限', date_time:'2020-12-15 12:00'})
}

function PowerRoomIndex({ powerRoom }){
    const { monitorInfo, machScenes } = powerRoom;
    let loaded = Object.keys(monitorInfo).length ? true : false;
    return (
        <div>
            <div className={style['left']}>
                {/* 平台概况 */}
                <div className={style['item-container-wrapper']}>
                    <div className={style['item-container']}>
                        <div className={style['item-title']}>平台概况</div>
                        <div className={style['item-content']}>
                            {
                                loaded
                                ?
                                <div className={style['flex-container']}>
                                    {   
                                        monitorInfo.platformInfo.map((item,index)=>(
                                            <div key={index} className={style['flex-item']}>
                                                <div className={style['sub-text']}>{ item.title }</div>
                                                <div className={style['text']}>{ item.value }</div>
                                            </div>
                                        ))  
                                    }
                                </div>
                                :
                                <Spin className={style['spin']} />
                            }
    
                        </div>
                    </div>
                </div>
                {/* 工单监控 */}
                <div className={style['item-container-wrapper']}>
                    <div className={style['item-container']}>
                        <div className={style['item-title']}>工单监控</div>
                        <div className={style['item-content']}>
                            {
                                loaded 
                                ?
                                <WarningStatusPie data={monitorInfo.orderInfo} />
                                :
                                <Spin className={style['spin']} />
                            }
                        </div>
                    </div>
                </div>
                {/* 终端在线情况 */}
                <div className={style['item-container-wrapper']}>
                    <div className={style['item-container']}>
                        <div className={style['item-title']}>终端在线情况</div>
                        <div className={style['item-content']}>
                            {
                                loaded 
                                ?
                                <MachStatusBar data={monitorInfo.meterList} />
                                :
                                <Spin className={style['spin']} />
                            }
                        </div>
                    </div>
                </div>
            </div>

            <div className={style['middle']}>
                <div className={style['item-container-wrapper']} style={{ height:'66.6%', position:'relative'}}>
                    <div className={style['item-container']}>
                    {
                        Object.keys(machScenes).length 
                        ?
                        machScenes.data && machScenes.data.length 
                        ?
                        <PowerRoomMonitor data={machScenes.data} />
                        :
                        <div>还没有配置配电房</div>
                        :
                        <Spin className={style['spin']} />
                    }
                    </div>
                </div>
                <div style={{ height:'33.3%'}}>
                    {
                        loaded 
                        ?
                        <div className={style['flex-container']}>
                            {
                                monitorInfo.chartList.map((item, index)=>(
                                    <div key={index} className={style['flex-item']} style={{ height:'100%', padding:'0', borderRadius:'6px' }}>
                                        <div className={style['item-container']} style={{ padding:'0' }}>
                                            <div className={style['item-title']} style={{
                                                color:'#fff',
                                                padding:'0',
                                                paddingLeft:'10px',
                                                borderTopLeftRadius:'6px',
                                                borderTopRightRadius:'6px',
                                                backgroundImage:'linear-gradient( to right, #a1c8fe, #7db2fd)'
                                            }}>{ item.title }</div>
                                            <div className={style['item-content']} style={{ backgroundColor:'#569cff', borderBottomLeftRadius:'6px', borderBottomRightRadius:'6px' }}>
                                                <GaugeChart value={item.value} maxValue={item.maxValue} unit={item.unit} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        :
                        <div style={{ height:'100%', backgroundColor:'#fff', position:'relative' }}>
                            <Spin className={style['spin']} />
                        </div>
                    }
                    
                </div>
            </div>

            <div className={style['right']}>
                {/* 环境监测 */}
                <div className={style['item-container-wrapper']} style={{ height:'33.3%'}}>
                    <div className={style['item-container']}>
                        <div className={style['item-title']}>环境监测</div>
                        <div className={style['item-content']}>
                            {
                                envArr.map((item,index)=>(
                                    <div key={index} className={style['item-container-wrapper']} style={{ paddingBottom:'10px'}}>
                                        <div className={style['item-container']} style={{ 
                                            backgroundColor:'#f8f8f8', 
                                            boxShadow:'none',
                                            display:'flex',
                                            alignItems:'center',
                                            textAlign:'center'
                                        }}>

                                            <div style={{ flex:'1' }}>
                                                <img src={item.icon} />
                                                <div className={style['sub-text']}>{ item.title }</div>
                                            </div>
                                            <div style={{ flex:'2' }}>
                                                <div>{ item.avg }{ item.unit }</div>
                                                <span style={{ display:'inline-block', padding:'2px 8px', backgroundColor:'#dde9fa', color:'#3b89f8', transform:'scale(0.8)'}}>平均</span>
                                            </div>
                                            <div style={{ flex:'2' }}>
                                                <div>{ item.low }{ item.unit }</div>
                                                <span style={{ display:'inline-block', padding:'2px 8px', backgroundColor:'#dde9fa', color:'#3b89f8', transform:'scale(0.8)'}}>最低</span>
                                            </div>
                                            <div style={{ flex:'2' }}>
                                                <div>{ item.high }{ item.unit }</div>
                                                <span style={{ display:'inline-block', padding:'2px 8px', backgroundColor:'#dde9fa', color:'#3b89f8', transform:'scale(0.8)'}}>最高</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
                {/* 告警监控 */}
                <div className={style['item-container-wrapper']} style={{ height:'33.3%'}}>
                    <div className={style['item-container']}>
                        <div className={style['item-title']}>告警监控</div>
                        <div className={style['item-content']}>
                            {
                                loaded 
                                ?
                                <WarningTypePie data={monitorInfo.warningInfo} />
                                :
                                <Spin className={style['spin']} />
                            }
                        </div>
                    </div>
                </div>
                {/* 告警列表 */}
                <div className={style['item-container-wrapper']}>
                    <div className={style['item-container']}>
                        <div className={style['item-title']}>告警列表
                        </div>
                        <div className={style['item-content']}>
                            {
                                loaded 
                                ?
                                <ScrollTable data={monitorInfo.warningDetail} />
                                :
                                <Spin className={style['spin']} />
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default connect(({ powerRoom })=>({ powerRoom }))(PowerRoomIndex);