import React, { useState } from 'react';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
import { Row, Col, Table, Button, Card, Tabs, Skeleton } from 'antd';
import { FireOutlined, DownloadOutlined, DoubleLeftOutlined, DoubleRightOutlined, PlusOutlined } from '@ant-design/icons'
import style from '../../IndexPage.css';
const { TabPane } = Tabs;

function InfoItem({dispatch, data, type, theme, currentProject}){
    let borderColor = theme === 'dark' ? '#303463' : '#f0f0f0';
    let { type_name, type_id } = data;
    
    
    
    return ( 
        <div className={style['card-container-wrapper']} style={{ width:'auto', height:'auto' }}>
            <div className={style['card-container']} style={{ cursor:'pointer', width:'300px', height:'160px', border:`1px solid ${borderColor}`, overflow:'hidden' }} onClick={()=>{
                dispatch(routerRedux.push(`/energy/info_manage_menu/manual_input/${type}/${type_id}`))
            }}>
                <div style={{ height:'120px', lineHeight:'120px', textAlign:'center' }}>          
                    <span className={style['data']}>{ type_name }</span>            
                </div>                
                <div style={{ height:'40px', lineHeight:'40px', textAlign:'center', backgroundColor:borderColor}}>确定</div> 
                </div>
        
        </div>        
    )
    
}
function ManualInfoList({ dispatch, user, manually }){
    const { fillType, meterType } = manually;
    const { currentProject } = user;
    return (

        <div className={style['page-container']}>
            {
                fillType.length || meterType.length 
                ?
                <div className={style['card-container']}>
                    <Tabs className={style['custom-tabs']}>
                        <TabPane tab="经营信息" key="1">
                             <div style={{ padding:'1rem'}}>
                                 {
                                     fillType.map((item,index)=>(
                                         <InfoItem key={index} data={item} dispatch={dispatch} type='operateInfo' currentProject={currentProject} theme={user.theme} />
                                     ))
                                 }
                             </div>
                        </TabPane>
                        <TabPane tab="人工抄表" key="2">
                             
                             <div style={{ padding:'1rem'}}>
                                 {
                                     meterType.map((item,index)=>(
                                         <InfoItem key={index} data={item} dispatch={dispatch} type='manualMeter' currentProject={currentProject} theme={user.theme} />
                                     ))
                                 }
                             </div>

                             
                        </TabPane>
                    </Tabs>
                </div>
                :
                <Skeleton active className={style['skeleton']} />
            }
        </div>
                 
    )
};

ManualInfoList.propTypes = {
};

export default connect( ({ user, manually }) => ({ user, manually }))(ManualInfoList);