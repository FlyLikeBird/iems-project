import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Table, Button, Card, Tree, Select, Skeleton } from 'antd';
import style from './ScrollTable.css';

let scrollNum = 5;
let timer ;
function ScrollTable({ data }){
    const [scroll, setScroll] = useState({ list:data.slice(0,scrollNum), current:0});
    const scrollRef = useRef(scroll);
    useEffect(()=>{
        scrollRef.current = scroll;
    });
    useEffect(()=>{
        let tempArr, count;
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
                ++current;
                setScroll({ list:tempArr, current});
            },5000)
        }
        return ()=>{
            clearInterval(timer);
            timer = null;
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
                            <div style={{ color:'#559bff'}}>{ item.region_name ? item.region_name : '-- --' }</div>
                            <div>{ item.mach_name }</div>
                            <div>
                                <span style={{ display:'inline-block', transform:'scale(0.8)', padding:'2px 6px', backgroundColor:'#fef2da', color:'#f6b028'}}>{ item.type_name }</span>
                            </div>
                            <div>{ item.date_time }</div>
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