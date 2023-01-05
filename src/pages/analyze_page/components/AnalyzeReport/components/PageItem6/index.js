import React, { useRef } from 'react';
import { routerRedux } from 'dva/router';
import { Skeleton, Tabs, Popover, TreeSelect, Spin, Radio, Select, Button, DatePicker } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, AlertFilled, LeftOutlined, RightOutlined } from '@ant-design/icons';
import PageItem from '../PageItem';
import ReactEcharts from 'echarts-for-react';
import InfoItem from '@/pages/alarm_page/components/InfoItem';
import AlarmRegionChart from '@/pages/alarm_page/components/AlarmRegionChart';
import AlarmCountChart from '@/pages/alarm_page/components/AlarmCountChart';
import AlarmDetailTable from '@/pages/alarm_page/components/AlarmDetailTable';
import AlarmPieChart from '@/pages/alarm_page/components/AlarmPieChart';
import style from '../../AnalyzeReport.css';
import IndexStyle from '@/pages/IndexPage.css';

const warningColors = {
    'total':'#ff7862',
    'ele':'#198efb',
    'limit':'#29ccf4',
    'link':'#58e29f'
};
const { RangePicker } = DatePicker;

function PageItem6({ alarm, analyze, dispatch, companyName }){
    const { alarmInfo, regionChartInfo, warningChartInfo, reportAlarmInfo, timeType, beginDate, endDate } = alarm;
    const { reportInfo } = analyze;
    return (
        <PageItem title='能源安全分析-Energy Safety Analysis' companyName={companyName}>  
            {   
                reportInfo.text && reportInfo.text[3] && reportInfo.text[3].length 
                ?
                <div className={style['layout-container']}>
                    <ul style={{ fontWeight:'bold' }}>
                        {
                            reportInfo.text[3].map((item,index)=>(
                                <li key={index}>{ item }</li>
                            ))
                        }
                    </ul>
                </div>
                :
                null
            }
            <div className={style['layout-container']} style={{ height:'450px'}}>
                <div className={style['item-container-wrapper']}>
                    {
                        alarmInfo.map((item,index)=>(
                            <InfoItem 
                                key={index} 
                                data={item} 
                                theme='light'
                                forReport={true}
                                onDispatch={action=>dispatch(action)} 
                                optionStyle={{ display:'block', height:'33.3%', paddingRight:'0', paddingBottom: index === alarmInfo.length - 1 ? '0' : '1rem' }} 
                            />
                        ))
                          
                    }
                </div>
                <div className={style['item-container-wrapper']}>
                    <div className={style['item-container']}>
                        {
                            regionChartInfo && regionChartInfo.length
                            ?
                            <AlarmRegionChart data={regionChartInfo} warningColors={warningColors} forReport={true} />
                            :
                            <span>当前没有告警信息</span>
                        }
                    </div>
                </div>
            </div>

            <div className={style['layout-container']} style={{ height:'280px', backgroundColor:'#f7f7f7'}}>
                {
                    warningChartInfo && warningChartInfo.day 
                    ?
                    <AlarmCountChart data={warningChartInfo} warningColors={warningColors} forReport={true} /> 
                    :
                    <Skeleton active />
                }  
            </div>
          
            <div className={style['layout-container']} style={{ height:'380px'}}>
                <div className={style['item-container-wrapper']}>
                    <div className={style['item-container']} style={{ overflow:'hidden scroll'}}>
                       
                        {
                            reportAlarmInfo.view 
                            ?
                            <AlarmDetailTable data={reportAlarmInfo.detail} forReport={true} />
                            :
                            <Skeleton active />
                        }
                    </div>
                </div>
                <div className={style['item-container-wrapper']}>
                    <div className={style['item-container']}>
                        {
                            reportAlarmInfo.view
                            ?
                            <AlarmPieChart data={reportAlarmInfo.codeArr} totalInfo={reportAlarmInfo.sumList}  warningColors={warningColors} forReport={true} />
                            :
                            <Skeleton active />
                        }
                    </div>
                </div>
            </div>
        </PageItem>
    )
}

export default PageItem6;