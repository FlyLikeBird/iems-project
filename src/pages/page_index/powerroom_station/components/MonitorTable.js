import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Table, Button, Card, Tree, Select, Tag, Skeleton } from 'antd';
import style from './MonitorTable.css';

let scrollNum = 5;
function format(dateStr){
    let result = '';
    let temp = dateStr.split(' ');
    if ( temp.length ){
        result = temp[0].slice(5) + ' ' + temp[1];
    }
    return result;
}

function ScrollTable({ data }){
    const [scroll, setScroll] = useState({ list: data && data.length ? data.slice(0,scrollNum) : [], current:0});
    const scrollRef = useRef(scroll);
    useEffect(()=>{
        scrollRef.current = scroll;
    });
    useEffect(()=>{
        let tempArr, timer, count;
        if ( data.length <= scrollNum ) {
            tempArr = data.slice();
            setScroll({ list:tempArr, current:0});
        } else {
            let temp = Math.floor((data.length)/scrollNum);
            count = (data.length)%scrollNum === 0 ? temp : temp + 1;
            timer = setInterval(()=>{
                let { current } = scrollRef.current;
                if ( current === count ){
                    current = 0;
                }
                let startIndex = current * scrollNum ;
                tempArr = data.slice(startIndex, startIndex + scrollNum );
                // if ( tempArr.length < scrollNum ) {
                //     // 当滚动到不足一屏数量时，填充item保证高度不变
                //     let diffNum = scrollNum - tempArr.length;
                //     for(let i=0;i<diffNum;i++){
                //         tempArr.push({ ...tempArr[0], fillItem:true });
                //     }
                // }
                ++current;
                setScroll({ list:tempArr, current});
            },5000)
        }
        return ()=>{
            clearInterval(timer);
        }
    },[]);
    return (
        <div className={style['container']}>
            <div className={style['thead']}>
                <div>位置</div>
                <div>设备</div>
                <div>分类</div>
                <div>发生时间</div>
            </div>
            <div className={style['content-container']}>
                {
                    scroll.list && scroll.list.length 
                    ?
                    scroll.list.map((item,index)=>(
                        <div className={style['item']} key={index}>
                            <div>{ item.region_name || '-- --' }</div>
                            <div>{ item.mach_name || '-- --' }</div>
                            <div>
                                <span className={style['tag']}>{ item.type_name || '-- --'}</span>
                            </div>
                            <div>{ format(item.date_time) }</div>
                        </div>
                    ))
                    :
                    <div>当前运行正常，没有异常发生</div>
                    
                }
            </div>
        </div>
    )
};

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(ScrollTable, areEqual);