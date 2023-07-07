import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import style from '@/pages/IndexPage.css';
import StationLineChart from './StationLineChart';

const { TabPane } = Tabs;

function ChartContainer({ data, type, theme }){
    const tabList = type === 'frozen' 
        ?
        [
            { tab:'制冷量', key:'cryo', unit:'Kg' },
            { tab:'瞬时流量', key:'speedFlow', unit:'m³/min'},
            { tab:'压差', key:'pressDiff', unit:'bar'},
            { tab:'入水温度', key:'inTempArr', unit:'℃'},
            { tab:'出水温度', key:'outTempArr', unit:'℃'},
        ]
        :
        [
            { tab:'流量', key:'flow', unit:'m³'},
            { tab:'瞬时流量', key:'speed', unit:'m³/min' }
        ];
    const [info, setInfo] = useState(tabList[0]);
    return (
        <Tabs
            className={style['custom-tabs'] + ' ' + style['flex-tabs']}
            activeKey={info.key}
            onChange={activeKey=>{
                let temp = tabList.filter(i=>i.key === activeKey)[0];
                setInfo(temp);
            }}
        >
            {
                tabList.map((item,index)=>(
                    <TabPane key={item.key} tab={item.tab}>
                        { info.key === item.key && <StationLineChart tabList={tabList} info={info} data={data} theme={theme} type={type}  /> }
                    </TabPane>
                ))
            }
        </Tabs>
    )
}

export default ChartContainer;