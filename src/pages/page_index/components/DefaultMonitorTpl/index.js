import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Spin } from 'antd';
import style from './DefaultMonitorTpl.css';
import outerBg from '../../../../../public/monitor/outer-bg.png';
import innerBg from '../../../../../public/monitor/inner-bg.png';
import itemBg from '../../../../../public/monitor/item-bg.png';
import lineBg from '../../../../../public/monitor/line.png';
import icons from '../../../../../public/monitor/icons.png';

import CountUp from 'react-countup';

const positions = {
    'cost':2,
    'output':1,
    'coal':0,
    'ele':3,
    'limit':4,
    'link':5
}

function DefaultMonitorTpl({ data }){
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);
    useEffect(()=>{
        // console.log(containerRef.current);
        setContainerWidth(containerRef.current.offsetHeight);
    },[]);
    const leftData = [
        { title:'能源成本', value:data.cost, key:'cost', unit:'元' },
        { title:'能源成本万元产值比', value:data.output, key:'output', unit:'元/万元' },
        { title:'折合标煤', value:data.coal, key:'coal', unit:'tce' }
    ];
    
    const rightData = [
        { title:'待处理电气安全告警', value:data.ele_safe, key:'ele', unit:'次' },
        { title:'待处理指标越限告警', value:data.limit, key:'limit', unit:'次' },
        { title:'待处理通讯采集告警', value:data.link, key:'link', unit:'次' }
    ];
    
    return (
        
        <div className={style['container']} ref={containerRef}>
                    {/* 外层容器 */}
                    <div className={style['outer-image']} style={{ width:containerWidth * 0.8 + 'px', height:containerWidth * 0.8 + 'px' }}>
                        <img src={outerBg} />
                    </div>
                    {/* 内层容器 */}
                    <div className={style['inner-image']} style={{ width:containerWidth * 0.6 + 'px', height:containerWidth * 0.6 + 'px', transformOrigin:`50% ${containerWidth*0.6/2}px` }}>
                        <img src={innerBg} />
                        <div className={style['move-ball-1']} style={{ transformOrigin:`50% ${Math.floor(containerWidth * 0.6/2)+5}px` }}></div>
                        <div className={style['move-ball-2']} style={{ transformOrigin:`50% ${Math.floor(containerWidth * 0.6/2 - containerWidth * 0.6*0.18)+7}px` }}></div>
                    </div>
                    {/* 线条容器 */}
                    <div className={style['line-image']} >
                        <img src={lineBg} />
                    </div>
                    {/* 中心标题 */}
                    <div className={style['center']}>
                        <div style={{ display:'table-cell', verticalAlign:'middle'}}>
                            <span className={style['float-sub-text']}>电价排名</span>
                            <br/>
                            <span className={style['title']}>
                                <CountUp start={0} end={+data.rank} delay={1} duration={2} useGrouping={true} separator=',' decimal='.' />
                            </span>
                        </div>
                    </div>
                    {/* 左侧悬浮项 */}
                    <div className={style['left-float-container']} style={{ height:containerWidth * 0.8 + 'px'}}>
                        {
                            leftData.map((item,index)=>(
                                <div className={style['float-item-wrapper']} key={index}>
                                    <div className={style['float-item']} style={{ backgroundImage:`url(${itemBg})`, left:index === 1 ? '-40px' : '0'}}>
                                        <div className={style['float-icon']} style={{ backgroundImage:`url(${icons})`, backgroundPosition:`${-(positions[item.key] * 47)}px 0`}}></div>

                                        <div className={style['float-info']}>
                                            <div className={style['float-sub-text']}>{ item.title }</div>
                                            <div>
                                                <span className={style['float-text']}>{ item.value }</span>
                                                <span className={style['float-sub-text']} style={{ marginLeft:'4px' }}>{ item.unit }</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }

                    </div>
                    {/* 右侧悬浮项 */}
                    <div className={style['right-float-container']} style={{ height:containerWidth * 0.8 + 'px'}}>
                        {
                            rightData.map((item,index)=>(
                                <div className={style['float-item-wrapper']} key={index}>
                                    <div className={style['float-item']} style={{ backgroundImage:`url(${itemBg})`, right:index === 1 ? '-40px' : '0'}}>
                                        <div className={style['float-icon']} style={{ backgroundImage:`url(${icons})`, backgroundPosition:`${-(positions[item.key] * 47)}px 0`}}></div>

                                        <div className={style['float-info']}>
                                            <div className={style['float-sub-text']}>{ item.title }</div>
                                            <div>
                                                <span className={style['float-text']}>{ item.value }</span>
                                                <span className={style['float-sub-text']} style={{ marginLeft:'4px' }}>{ item.unit }</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
              
        </div>
        
    )
}

export default DefaultMonitorTpl;