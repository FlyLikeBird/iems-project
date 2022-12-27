import React, { useRef } from 'react';
import { connect } from 'dva';
import { AlertOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Radio, Button, Skeleton, DatePicker } from 'antd';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import AlarmDetailTable from './components/AlarmDetailTable';
import TotalPieChart from './components/TotalPieChart';
import WarningTypePieChart from './components/WarningTypePieChart';
import FieldBarChart from './components/FieldBarChart';
import style from '../IndexPage.css';
const { RangePicker } = DatePicker;
let colorsMap = {
    'total':'#ff7862',
    'ele':'#198efb',
    'limit':'#29ccf4',
    'link':'#58e29f'
}

function AlarmTrend({ dispatch, user, alarm }){
    const { sumInfo, sumList, warningTypeInfo, fieldWarning, isLoading, machWarning, timeType, beginDate, endDate } = alarm;
    const dateRef = useRef();
    
    return (
        <div className={style['page-container']}>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'40px' }}>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({ type:'alarm/fetchSumInfo'});
                }} />
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                {
                    sumList && sumList.length 
                    ?
                    sumList.map((item,index)=>(
                        <div className={style['card-container-wrapper']} key={index} style={{ width:'25%', paddingBottom:'0', paddingRight:index === sumList.length - 1 ? '0' : '1rem' }}>
                            <div className={style['card-container']}>
                                <div className={style['card-title']} style={{
                                    backgroundColor:colorsMap[item.type],
                                    color:'#fff'
                                }}>
                                    <div><AlertOutlined />{ item.text }</div>
                                </div>
                                <div className={style['card-content']}>
                                    <div style={{ height:'40%', position:'relative'}}>
                                        {
                                            item.type === 'total'
                                            ?
                                            <TotalPieChart data={sumInfo.codeCountArr} theme={user.theme} />
                                            :
                                            <WarningTypePieChart 
                                                theme={user.theme}
                                                type={item.type} 
                                                data={ item.type === 'ele' ? warningTypeInfo.typeArr['ele'] : item.type === 'limit' ? warningTypeInfo.typeArr['limit'] : warningTypeInfo.typeArr['link'] } 
                                                statusData={ item.type === 'ele' ? warningTypeInfo.codeArr[0] : item.type === 'limit' ? warningTypeInfo.codeArr[1] : warningTypeInfo.codeArr[2] } />
                                        }
                                    </div>
                                    <div className={style['trend-scroll-container']} style={{ height:'60%', overflow:'hidden auto' }}>
                                        {
                                            item.type === 'total' 
                                            ?
                                            <AlarmDetailTable data={sumInfo.detail} />
                                            :
                                            <FieldBarChart theme={user.theme} type={ item.type === 'ele' ? 'branch' : item.type === 'limit' ? 'region' : 'mach' } data={item.type === 'ele' ? fieldWarning['branch'] : item.type === 'limit' ? fieldWarning['region'] : fieldWarning['mach']} />
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                    :
                    <Skeleton active className={style['skeleton']} />
                }
            </div>
        </div>
    )
}

export default connect(({ user, alarm })=>({ user, alarm }))(AlarmTrend);