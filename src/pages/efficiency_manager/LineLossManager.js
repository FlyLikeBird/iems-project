import React, { useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, DatePicker, Skeleton, Menu, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined,   } from '@ant-design/icons';
import ColumnCollapse from '../../../components/ColumnCollapse';
import LineLossChart from './components/LineLossChart';
import LineLossTable from './components/LineLossTable';
import CountUp from 'react-countup';
import style from './EfficiencyManager.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import { energyIcons } from '../../../utils/energyIcons';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function format(dateStr){
    return dateStr.substring(5,dateStr.length);
}

function LineLossManager({ dispatch, demand }) {
    const { mainLineList, currentMainLine, lineLossInfo, lineLossList, lineLossLoading, energyList, energyInfo, treeLoading, startDate, endDate } = demand;
  
    const sidebar = (
        <div>
            <Card title="能耗类别" className='card-container'>
                <Radio.Group value={energyInfo.type_id} onChange={e=>{
                    dispatch({type:'demand/toggleEnergyType', payload:e.target.value });
                }}>
                    {
                        energyList.map(item=>(
                            <Radio.Button key={item.type_id} value={item.type_id}>{ energyIcons[item.type_code] }{item.type_name}</Radio.Button>
                        ))
                    }
                </Radio.Group>                                                        
            </Card>
            <Card title="统计对象" className='card-container' >              
                {
                    !Object.keys(currentMainLine).length
                    ?
                    <Spin />
                    :
                    <Menu
                        onClick={({ key })=>{
                            if ( +currentMainLine.main_id !== +key ) {
                                let temp = mainLineList.filter(i=>i.main_id == key )[0];
                                dispatch({type:'demand/setMainLine', payload:temp });
                                dispatch({type:'demand/fetchLineLoss', payload:{} });
                            }
                        }}
                        selectedKeys={[currentMainLine.main_id+'']}
                    >
                        {
                            mainLineList && mainLineList.length 
                            ?
                            mainLineList.map((item)=>(
                                <Menu.Item key={item.main_id}>{ item.main_name }</Menu.Item>
                            ))
                            :
                            null
                        }
                    </Menu>
                }                           
            </Card>
        </div>
    );
    const content = (
        <div>
            <div className='card-container'>
                <Card title='统计周期'>
                    <div>选择日期: <RangePicker value={[startDate, endDate]} locale={zhCN} allowClear={false} onChange={momentArr=>{
                        dispatch({type:'demand/setMachAndLineDate', payload:{ startDate:momentArr[0], endDate:momentArr[1] }});
                        dispatch({type:'demand/fetchLineLoss', payload:{} });
                        console.log(momentArr);
                    }}/></div>
                </Card>
            </div>
                    
            <div className='card-container'>
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
            </div>
            
            {
                lineLossLoading
                ?
                <Skeleton active />
                :
                lineLossInfo && lineLossInfo.view 
                ?
                <div className='card-container'>
                    <Card>                               
                        <LineLossChart data={lineLossInfo.view} />
                    </Card>
                </div>
                :
                null
            }

            {
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
            
        </div>
    );
   
    return (  
        <ColumnCollapse sidebar={sidebar} content={content} />
    );
}

export default connect(({ demand })=>({ demand }))(LineLossManager);
