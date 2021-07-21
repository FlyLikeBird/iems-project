import React, { useEffect, useRef } from 'react';
import { Link, Route, Switch } from 'dva/router';
import { Button, Table, Form } from 'antd';

let clearIndex = null;

function EditTable(props){
    let distance = 0;
    // 滚动的最大距离
    let maxWidthRef = useRef();
    maxWidthRef.current = props.maxWidth;
    // // 监听表格横向滚动条的滚动事件
    // useEffect(()=>{
    //     let tableDom = document.getElementsByClassName('table-container')[0];
    //     let scrollDom = document.getElementsByClassName('ant-table-content')[0];
    //     let maxScrollDistance = maxWidthRef.current - scrollDom.offsetWidth;
    //     // console.log(scrollDom);
    //     // console.log(maxScrollDistance);
    //     // console.log(maxWidthRef.current);
    //     if ( tableDom && scrollDom && !props.closeScroll  ){            
    //         tableDom.addEventListener('wheel',(e)=>{
    //             clearTimeout(clearIndex);
    //             e.stopPropagation();
    //             e.preventDefault();
    //             // console.log('hello');
    //             // console.log(maxWidthRef.current);
    //             if ( !maxWidthRef.current ) return;
            
    //             clearIndex = setTimeout(()=>{
    //                 if ( e.wheelDelta < 0 ) {
    //                     distance += 600;                   
    //                 } else {               
    //                     distance -= 600;  
    //                 }
                    
    //                 if ( distance <= 0 && e.wheelDelta > 0 ) {
    //                     distance = 0;
    //                 }
    //                 if ( distance >= ( maxWidthRef.current - scrollDom.offsetWidth) && e.wheelDelta < 0 ){
    //                     distance =  maxWidthRef.current - scrollDom.offsetWidth ;                
    //                 }     
    //                 scrollDom.scrollTo({
    //                     left:distance,
    //                     behavior:'smooth'
    //                 })
    //             },100);
                
    //         })
    //     }
        
    // },[]);
    return (
        <Table
            { ...props}
        />
    )
}

export default EditTable
