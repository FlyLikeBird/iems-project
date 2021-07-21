import React, { useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Table, Button, Modal, Drawer, Popconfirm, Checkbox, Radio, Tooltip, Spin } from 'antd';
import { DashboardOutlined, ThunderboltOutlined, ExperimentOutlined, HourglassOutlined, FireOutlined, ArrowUpOutlined, ArrowDownOutlined  } from '@ant-design/icons';
import style from './GlobalMonitor.css'
import config from '../../../config';

const energyIcons = {
    'ele':<ThunderboltOutlined />,
    'water':<ExperimentOutlined />,
    'gas':<HourglassOutlined />,
    'hot':<FireOutlined />
};

const energyTypes = {
    'ele':'电',
    'water':'水',
    'hot':'热',
    'gas':'气'
};

function AgentMonitorManager({ dispatch, monitor, user, location }){
    console.log('global page render()...');
    const { monitorInfo, chartLoading, sceneList } = monitor;
    console.log(sceneList);
    console.log(user);
    // console.log(+company.company_id === +localStorage.getItem('company_Id'));

    return (       
        <div className={style['container']}>
            <div className={style['head-title']}>
                <div className={style['title']}>中台监控大屏</div>
            </div>
            <div className={style['content-container']}>
                <div className={style['flex-container']} style={{ height:'100%'}} >
                    {
                        user.companyList && user.companyList.length 
                        ?
                        user.companyList.map((company,index)=>(
                            <div className={style['flex-item-wrapper']}>
                                <div key={company.company_id} className={ +company.company_id === +localStorage.getItem('company_id') ? `${style['flex-item']} ${style['selected']}` : style['flex-item'] } onClick={()=>{
                                    dispatch({type:'user/changeCompany', payload:company.company_id});
                                    dispatch(routerRedux.push({

                                        pathname:'/global_monitor',
                                        state:{
                                            reload:true
                                        }
                                    }));
                                    
                                }}>
                                    {/* <div className={style['img-container']} style={{ backgroundImage:`url(http://${config.apiHost}${company.logo_path})` }}></div> */}
                                    <div className={style['img-container']}>
                                        <img src={`http://${config.apiHost}${company.logo_path}`} />
                                    </div>
                                    <div>{ company.company_name }</div>
                                </div>
                            </div>
                        ))
                        :
                        <Spin size='large' style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)' }}/>
                    }
                    
                </div>
            </div>
        </div>   
    )
};

AgentMonitorManager.propTypes = {

};

export default connect( ({ monitor, user })=>({ monitor, user }))(AgentMonitorManager);
