import React, { useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, DatePicker, Skeleton, Menu, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined,   } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import LineLossChart from './components/LineLossChart';
import LineLossTable from './components/LineLossTable';
import style from '../elemonitor_manager/EleMonitor.css';
import IndexStyle from '@/pages/IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import { energyIcons } from '../utils/energyIcons';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function format(dateStr){
    return dateStr.substring(5,dateStr.length);
}

function LineLossManager({ dispatch, user, demand }) {
    const { mainLineList, currentMainLine, lineLossInfo, lineLossList, lineLossLoading } = demand;
  
    const sidebar = (
        <div className={IndexStyle['card-container']}>
            <div className={IndexStyle['card-title']}>线路选择</div>
            <div className={IndexStyle['card-content']}>
                <div className={ user.theme === 'dark' ? style['list-container'] + ' ' + style['dark'] : style['list-container']}>
                    {
                        mainLineList.length 
                        ?
                        mainLineList.map((item,index)=>(
                            <div className={ item.main_id === currentMainLine.main_id ? style['list-item'] + ' ' + style['selected'] : style['list-item']} key={item.main_id} onClick={()=>{
                                let temp = mainLineList.filter(i=>i.main_id == key )[0];
                                dispatch({type:'demand/setMainLine', payload:temp });
                                dispatch({type:'demand/fetchLineLoss'});
                            }}>{ item.main_name }</div>
                        ))
                        :
                        <Spin className={style['spin']} size='large' />
                    }
                </div>
                
            </div>
        </div>
    );
    const content = (
        <div>
            {
                lineLossLoading
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'40px' }}>
                <CustomDatePicker onDispatch={()=>{ dispatch({ type:'demand/fetchLineLoss' })}} />
            </div>
            <div style={{ height:'calc( 100% - 40px)' }}>
                <div style={{ height:'14%'}}>
                    {
                        lineLossList.map((item,index)=>(
                            <div key={index} className={IndexStyle['card-container-wrapper']} style={{ width:'25%', paddingRight:index === lineLossList.length - 1 ? '0' : '1rem' }}>
                                <div className={IndexStyle['card-container']} style={{ display:'flex', alignItems:'center', justifyContent:'space-around' }}>
                                    <div>
                                        <div>{ item.text }</div>
                                        <div>
                                            <span className={IndexStyle['data']}>{ item.value }</span>
                                            <span className={IndexStyle['unit']}>{ item.unit }</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div>上期对比</div>
                                        <div>
                                            <span className={IndexStyle['data']}>{ item.lastValue }</span>
                                            <span className={IndexStyle['unit']}>{ item.unit }</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
                <div className={IndexStyle['card-container']} style={{ height:'86%' }}>                        
                    <LineLossChart data={lineLossInfo.view} theme={user.theme} />                                
                </div>
            </div>     
            {/* <div className='card-container'>
                <Card title={
                    <div className='title'>
                        <div>
                            趋势图
                        </div>
                    </div>
                }
                >
                    <div className={style['flex-container']}>
                        {
                            lineLossLoading
                            ?
                            <Skeleton active />
                            :
                            lineLossList && lineLossList.length
                            ?
                            lineLossList.map((item, index)=>(
                                <div className={style['item']} key={index}>
                                    <div>
                                        <div className={style['title']}>{ item.text } </div>
                                        <div className={style['num']}>{ `${item.value.toFixed(2)} ${item.unit}`  }</div>
                                    </div>
                                    <div>
                                        <div className={style['title']}>昨日对比</div>
                                        <div className={style['num']}>
                                            { item.value >= item.lastValue ? <ArrowUpOutlined /> : <ArrowDownOutlined /> }
                                            { item.lastValue.toFixed(2) + '%' }
                                        </div>
                                    </div>
                                </div>
                            ))
                            :
                            <div>请先配置好干线 <Link to='/info_manage_menu/main_line'>前往设置</Link> </div>
                        }
                    </div>
                </Card>
            </div> */}
           
            {/* {
                lineLossLoading
                ?
                <Skeleton active />
                :
                lineLossInfo && lineLossInfo.view 
                ?
                <div className='card-container'>
                    <Card>
                        <LineLossTable data={lineLossInfo.detail} />
                    </Card>
                </div>
                :
                null
            } 
             */}
        </div>
    );
   
    return (  
        <ColumnCollapse sidebar={sidebar} content={content} />
    );
}

export default connect(({ user, demand })=>({ user, demand }))(LineLossManager);
