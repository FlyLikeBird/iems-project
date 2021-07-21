import React from 'react';
import { routerRedux } from 'dva/router';
import { Skeleton, Tabs, Popover, TreeSelect, Spin, Radio, Select, Button } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, AlertFilled } from '@ant-design/icons';
import PageItem from '../PageItem';
import ReactEcharts from 'echarts-for-react';

import TabPaneContent from '../../../TabPaneContent';

import style from '../../AnalyzeReport.css';

const warningColors = {
    'total':'#ff7862',
    'ele':'#198efb',
    'limit':'#29ccf4',
    'link':'#58e29f'
};

function PageItem7({ analyze, dispatch, companyName }){
    const { baseSaveSpace, meterSaveSpace, adjustSaveSpace } = analyze;
    return (
        <PageItem title='节俭空间分析-Thrifty Space Analysis' companyName={companyName}>  
            <div className={style['layout-container']} style={{ height:'410px', backgroundColor:'#f7f7f7'}}>
                <div className={style['item-title']} style={{ textAlign:'center', padding:'10px 0' }}>基本电费节俭空间</div>
                {
                    Object.keys(baseSaveSpace).length 
                    ?
                    <TabPaneContent data={baseSaveSpace} forReport={true} />
                    :
                    null
                }
            </div>
            <div className={style['layout-container']} style={{ height:'410px', backgroundColor:'#f7f7f7'}}>
                <div className={style['item-title']} style={{ textAlign:'center', padding:'10px 0' }}>电度电费节俭空间</div>
                {
                    Object.keys(meterSaveSpace).length 
                    ?
                    <TabPaneContent data={meterSaveSpace} forReport={true} />
                    :
                    null
                }
            </div>
            <div className={style['layout-container']} style={{ height:'410px', backgroundColor:'#f7f7f7'}}>
                <div className={style['item-title']} style={{ textAlign:'center', padding:'10px 0' }}>力调电费节俭空间</div>
                {
                    Object.keys(adjustSaveSpace).length 
                    ?
                    <TabPaneContent data={adjustSaveSpace} forReport={true} />
                    :
                    null
                }
            </div>

           
        </PageItem>
    )
}

export default PageItem7;