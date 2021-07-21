import React, { useState, useRef } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Modal, DatePicker, Select, message, Skeleton } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CountUp from 'react-countup';
import AnalyzLineChart from './components/AnalyzLineChart';
import style from '../IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
import { energyIcons } from '@/pages/utils/energyIcons';

const { Option } = Select;
const { RangePicker } = DatePicker;

function DemandAnalyz({ dispatch, demand, theme, loading }) {
    const { energyList, energyInfo, machList, currentMach, analyzInfo, beginTime, endTime, treeLoading, demandLoading } = demand;
    return (  
        Object.keys(analyzInfo).length 
        ?
        <div style={{ height:'100%'}}>
            <div className={style['card-container-wrapper']} style={{ display:'block', height:'20%', paddingRight:'0' }}>
                <div className={style['card-container-wrapper']} style={{ width:'25%', paddingBottom:'0' }}>
                    <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
                        <div>平均需量(kw)</div>
                        <div className={style['data']} style={{ color:'#1890ff' }}>{ Math.round(analyzInfo.avgDemand) || '-- --' }</div>
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ width:'25%', paddingBottom:'0' }}>
                    <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
                        <div>最大需量(kw)</div>
                        <div className={style['data']} style={{ color:'#1890ff' }}>{ Math.round( analyzInfo.maxDemand && analyzInfo.maxDemand.demand ) || '-- --' }</div>
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ width:'25%', paddingBottom:'0' }}>
                    <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
                        <div>需量电费效率(%)</div>
                        <div className={style['data']} style={{ color:'#1890ff' }}>{ analyzInfo.effRatio  || '-- --' }</div>
                    </div>
                </div>
                <div className={style['card-container-wrapper']} style={{ width:'25%', paddingBottom:'0', paddingRight:'0' }}>
                    <div className={style['card-container']} style={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
                        <div>下月需量预测(kw)</div>
                        <div className={style['data']} style={{ color:'#1890ff' }}>{ Math.round(analyzInfo.maxPredDemand) || '-- --' }</div>
                    </div>
                </div>
            </div>
            <div className={style['card-container-wrapper']} style={{ height:'80%', paddingRight:'0', paddingBottom:'0'}}>
                <div className={style['card-container']}>
                    {
                        loading 
                        ?
                        <Skeleton active className={style['skeleton']} />
                        :
                        <AnalyzLineChart data={analyzInfo} theme={theme} />
                    }
                </div>
            </div>
        </div>
        :
        <Skeleton active className={style['skeleton']} />
        
    );
}

export default DemandAnalyz;
