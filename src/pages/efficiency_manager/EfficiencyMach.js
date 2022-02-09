import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, Input, Modal, DatePicker, Skeleton, message } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, LeftOutlined, RightOutlined  } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import MachEffChart from './components/MachEffChart';
// import MachEffTable from './components/MachEffTable';
import CountUp from 'react-countup';
import style from '../IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import { energyIcons } from '@/pages/utils/energyIcons';
import moment from 'moment';
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function getPowerLevel(power){
    let str = '';
    if ( power === 0 ) {
        str = '-- --';
        return str;
    } 
    if ( power < 40 || power > 100 ) {
        str = '中';
    } else if ( (power >= 40 && power < 60) || ( power > 80 && power < 100 )) {
        str = '良';
    } else if ( power >= 60 && power <=80 ) {
        str = '优';
    }
    return str;
}

const levelColors = {
    '优':'#6ec71e',
    '良':'#ffc80c',
    '中':'#fd6e4c'
};

function EfficiencyMach({ dispatch, user, demand, fields }) {
    const { timeType, startDate, endDate, theme } = user;
    const { machEffInfo, machRatioList, machLoading, energyList, energyInfo  } = demand;
    const { allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState('');
    const inputRef = useRef();
    let rated_power = (+machEffInfo.rated_power).toFixed(0);
    let powerLevel = getPowerLevel( machEffInfo.rated_power ? (machEffInfo.viewpower/machEffInfo.rated_power)*100 : 0 );
    const sidebar = (
        <div>
            <div className={style['card-container']}>
                <Tabs className={style['custom-tabs']} activeKey={currentField.field_id + ''} onChange={activeKey=>{
                    let field = fieldList.filter(i=>i.field_id == activeKey )[0];
                    dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                    new Promise((resolve)=>{
                        dispatch({type:'fields/fetchFieldAttrs', resolve })
                    }).then(()=>{
                        dispatch({type:'demand/fetchMachEfficiency'});                   
                    })
                }}>
                    {                       
                        fieldList.map(field=>(
                            <TabPane 
                                key={field.field_id} 
                                tab={field.field_name}                                                
                            >
                                {
                                    treeLoading
                                    ?
                                    <Spin />
                                    :
                                    <Tree
                                        className={style['custom-tree']}
                                        expandedKeys={expandedKeys}
                                        onExpand={temp=>{
                                            dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                        }}
                                        selectedKeys={[currentAttr.key]}
                                        treeData={fieldAttrs}
                                        onSelect={(selectedKeys, {node})=>{
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            dispatch({type:'demand/fetchMachEfficiency'});
                                        }}
                                    />
                                }
                            </TabPane>
                        ))
                    }
                </Tabs>
            </div>
        </div>
    );
    useEffect(()=>{
        setValue(rated_power);
    },[machEffInfo]);

    useEffect(()=>{
        return ()=>{
            dispatch({type:'demand/cancelAll'});
        }
    },[]);
    const content = (
        
                Object.keys(machEffInfo).length
                ?
                <div>
                    <div style={{ height:'40px' }}>
                        <CustomDatePicker onDispatch={()=>{
                            dispatch({type:'demand/fetchMachEfficiency'});
                        }} />
                    </div>
                    <div style={{ height:'calc( 100% - 40px'}}>
                        <div className={style['card-container-wrapper']} style={{ display:'block', height:'20%', paddingRight:'0' }}>
                            <div className={style['card-container']}>
                                <div className={style['card-title']}>
                                    <div>曲线分析</div>
                                    <div>
                                        <span style={{ margin:'0 20px'}}>
                                            <span>当前视在功率等级:</span>
                                            <span style={{ fontSize:'1.2rem', margin:'0 4px', color:levelColors[powerLevel]}}>{ powerLevel }</span>           
                                        </span>
                                        <span className='select-container' style={{ margin:'0'}}> 
                                            <span>额定功率: </span> 
                                            {
                                                editing
                                                ?
                                                <span><Input style={{ width:'120px' }} value={value} onChange={e=>setValue(e.target.value)} /></span>
                                                :
                                                machEffInfo.rated_power
                                                ?
                                                <span style={{ margin:'0 4px', fontSize:'1.2rem', color:'#1890ff'}}>{  Math.floor(rated_power) + 'kw' }</span>
                                                :
                                                '-- --'
                                            }
                                            {
                                                editing 
                                                ?
                                                <span>
                                                    <Button type='primary' size='small' onClick={()=>{
                                                        new Promise((resolve, reject)=>{
                                                            dispatch({type:'demand/setMachPower', payload: { rated_power:value, resolve, reject }});
                                                        })
                                                        .then(()=>{
                                                            dispatch({type:'demand/fetchMachEfficiency'});
                                                            setEditing(false);
                                                        })
                                                        .catch(msg=>message.error(msg))
                                                    }}>确定</Button>
                                                    <Button size='small' onClick={()=>setEditing(false)}>取消</Button>
                                                </span>
                                                :
                                                null
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div className={style['card-content']}>
                                    <div className={style['flex-container']}>
                                        {
                                            machRatioList.map((item, index)=>(
                                                <div className={style['flex-item']} key={index} style={{ display:'flex', justifyContent:'space-around', borderRight:index === machRatioList.length - 1 ? 'none' : theme === 'dark' ? '1px solid #22264b' : '1px solid #f0f0f0' }}>
                                                    <div>
                                                        <div>{ item.text } </div>
                                                        <div className={style['data']}>{ `${ item.unit === '%' ? item.value.toFixed(1) : item.value.toFixed(0) }` + item.unit }</div>
                                                    </div>
                                                    <div>
                                                        <div>昨日对比</div>
                                                        <div className={style['data']}>
                                                            { item.value >= item.lastValue ? <ArrowUpOutlined /> : <ArrowDownOutlined /> }
                                                            { item.lastValue.toFixed(1) + '%' }
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={style['card-container']} style={{ height:'80%'}}>
                            <div className={style['float-button-group']}>
                                    
                            </div>
                            {
                                !machLoading
                                ?
                                <MachEffChart data={machEffInfo.view} rated_power={machEffInfo.rated_power} timeType={timeType} currentAttr={currentAttr} theme={theme} />
                                :
                                <Skeleton active className={style['skeleton']} />
                            }
                        </div>
                    </div>         
                </div>
                :
                <Skeleton active className={style['skeleton']} />
          
    );
   
    return (  
        <ColumnCollapse sidebar={sidebar} content={content} />
    );
}

export default connect(({ user, demand, fields })=>({ user, demand, fields }))(EfficiencyMach);
