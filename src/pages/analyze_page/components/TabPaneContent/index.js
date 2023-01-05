import React, { useState, useRef } from 'react';
import { Radio, Card, Button, Skeleton,  } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import style from '../../../IndexPage.css';
import TabChart from './components/TabChart';

function TabPaneContent({ data, toggleVisible, activeKey, onDispatch, theme, title, forReport }) {
    return (    
      
        <div style={ forReport ? { height:'calc( 100% - 46px)'} : { height:'100%' }}>
            <div className={style['card-container']} style={ forReport ? { height:'60px', background:'#f0f0f0', boxShadow:'none', overflow:'hidden' } : { height:'16%', overflow:'hidden' }}>
                <div className={style['flex-container']}>
                    {
                        data.info && data.info.length
                        ?
                        data.info.map((item,index)=>(
                            <div key={index} className={style['flex-item']} style={{ padding: forReport ? '0' : '20px'}}>
                                <div style={{ 'backgroundColor':'#09c1fd', color: '#fff', borderRadius:'40px', padding:'2px 10px'}}>{ item.text }</div>
                                <div className={style['data']} style={ forReport ? { color:'#000'} : {}}>{ `${item.value} ${item.unit}`}</div>
                            </div>
                        ))
                        :
                        null
                    }
                </div>
            </div>
            <div className={style['card-container']} style={ forReport ? { height:'calc( 100% - 60px)', background:'#f0f0f0', overflow:'hidden', boxShadow:'none' } : { height:'84%', overflow:'hidden' }}>         
                <TabChart 
                    data={data.view || {}} 
                    forReport={forReport} 
                    activeKey={activeKey} 
                    onDispatch={onDispatch} 
                    toggleVisible={toggleVisible} 
                    theme={ forReport ? 'light' : theme} 
                    title={title}
                />            
            </div>
        </div>
    );
}


export default TabPaneContent
