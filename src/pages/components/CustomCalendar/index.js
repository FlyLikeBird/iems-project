import React, { useState } from 'react';
import { Calendar, Tooltip } from 'antd';
import zhCN from 'antd/es/calendar/locale/zh_CN';
import moment from 'moment';
import style from './Calendar.css';

let info = {
    'total':{ text:'总', unit:'tce', color:'#fff', value:30000, quota:40000 },
    'ele':{ text:'电', unit:'kwh', color:'#0c9dff', value:6485, quota:8000 },
    'water':{ text:'水', unit:'m³', color:'#79e9ef', value:6485, quota:8000 },
    'gas':{ text:'气', unit:'m³', color:'#fecd63', value:6485, quota:8000 },
    'hot':{ text:'热', unit:'GJ', color:'#ae2aff', value:6485, quota:8000 },

}
function CustomCalendar({ currentDate, onChangeDate, mode, theme }){
    let currentDateStr = currentDate.format('YYYY-MM-DD').split('-');
    function dateCellRender(value){
        let itemDateStr = value.format('YYYY-MM-DD').split('-');
        let isInMonth = itemDateStr[1] === currentDateStr[1] ? true : false ;
        return (
            <Tooltip overlayInnerStyle={{ overflow:'hidden', backgroundColor:'#47475b', border:'1px solid #6c6c7c', borderRadius:'6px' }} title={(
                <div style={{ padding:'0 1rem' }}>
                    <div style={{ textAlign:'center', fontSize:'0.8rem' }}>{ value.format('YYYY-MM-DD') }</div>
                    {
                        ['total', 'ele','water','gas','hot'].map((type,index)=>(
                            <div key={type} style={{ 
                                width:'200px', 
                                display:'flex', 
                                alignItems:'center', 
                                justifyContent:'space-between',
                                borderBottom: index === 4 ? 'none' : '1px solid rgba(255, 255, 255,0.2)',
                                padding:'0.5rem 0',
                                position:'relative'
                            }}>
                                <div>{ info[type].text + '成本' }</div>
                                <div>
                                    <span style={{ fontWeight:'bold' }}>{ info[type].value }</span>
                                    <span style={{ margin:'0 6px'}}>/</span>
                                    <span className={style['unit']}>{ info[type].quota }</span>
                                    <span className={style['unit']} style={{ marginLeft:'4px'}}>元</span>
                                </div>
                                {
                                    index 
                                    ?
                                    <span style={{ position:'absolute', width:'14px', height:'24px', borderRadius:'6px', background:info[type].color, left:'-30px'  }}></span>
                                    :
                                    null
                                }
                            </div>
                        ))
                    }
                </div>
            )} trigger='click' destroyTooltipOnHide={true}>
                <div className={style['content-wrapper'] + ' ' + ( isInMonth ? style['in-month'] : '' ) }>
                    <div className={style['content']}>
                        <div className={style['content-head']}>{ value.date() } </div>             
                        <div className={style['content-body']}>
                            <span className={style['text']}>{ isInMonth ? 26493 : '' }</span>
                            <span className={style['unit']} style={{ marginLeft:'4px' }}>{ isInMonth ? '元' : ''}</span>
                        </div>

                    </div>
                </div>
            </Tooltip>
        )
    };
    function monthCellRender(value){
        return (
            <div className={style['content-wrapper'] + ' ' + style['in-month']}>
                <div className={style['content']}>
                    <div className={style['content-head']}>{ ( value.month() + 1) + '月' }</div>
                    <div className={style['content-body']}>
                        {
                            ['total','ele','water','gas','hot'].map((type,i)=>(
                                <div key={type} style={{
                                    display:'inline-flex',
                                    alignItems:'center',
                                    margin:'6px 0',
                                    width: i === 0 ? '100%' : '50%'
                                }}>
                                    <div style={{ marginRight:'1rem', borderRadius:'50%', border:`1px solid ${info[type].color}`, padding:'2px 6px', fontSize:'0.8rem', color:info[type].color }}>{ info[type].text }</div>
                                    <div>
                                        <span style={{ fontSize:'1.2rem', fontWeight:'bold' }}>{ info[type].value }</span>
                                        <span style={{ margin:'0 4px'}}>/</span>
                                        <span className={style['unit']}>{ info[type].quota }</span>
                                        <span className={style['unit']}>元</span>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div style={{ height:'100%'}}>
            <Calendar
                className={style['custom-calendar'] + ' ' + ( theme === 'dark' ? style['dark'] : '')}
                locale={zhCN}
                value={currentDate}
                mode={mode}
                headerRender={()=>null}
                dateFullCellRender={dateCellRender}
                monthFullCellRender={monthCellRender}
                onSelect={value=>{
                    if ( onChangeDate && typeof onChangeDate === 'function' ) onChangeDate(value);
                }}
            />
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.currentDate !== nextProps.currentDate || prevProps.theme !== nextProps.theme || prevProps.mode !== nextProps.mode ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(CustomCalendar, areEqual);