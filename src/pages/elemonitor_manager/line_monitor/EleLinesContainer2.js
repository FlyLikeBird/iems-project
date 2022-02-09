import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';
import style from './EleLinesContainer.css';
import IndexStyle from '@/pages/IndexPage.css';
import ChartContainer from './ChartContainer';
import html2canvas from 'html2canvas';

// let data = [
//     {
//         top:'35.5',
//         points:[
//             { left:'26.9', meter_name:'mach1', Ia:'10', Ib:'20', Ic:'30', P:'40', Q:'50', PF:'0.333' },
//             { left:'47.5', meter_name:'mach2', Ia:'10', Ib:'20', Ic:'30', P:'40', Q:'50', PF:'0.333' },
//         ]
//     },
//     {
//         top:'100',
//         points:[
//             { left:'73.7', meter_name:'mach3', Ia:'10', Ib:'20', Ic:'30', P:'40', Q:'50', PF:'0.333' },
//             { left:'80.6', meter_name:'mach4', Ia:'10', Ib:'20', Ic:'30', P:'40', Q:'50', PF:'0.333' },
//             { left:'87.5', meter_name:'mach5', Ia:'10', Ib:'20', Ic:'30', P:'40', Q:'50', PF:'0.333' },

//         ]
//     }
// ];
let columns = [
    { key:'btn', title:'' },
    { key:'type', title:'Ia', unit:'A' },
    { key:'', title:'Ib', unit:'A'},
    { key:'', title:'Ic', unit:'A' },
    { key:'', title:'P', unit:'kw'},
    { key:'', title:'Q', unit:'Kvar'},
    { key:'', title:'PF', unit:'' }
]
function EleLinesContainer2({ dispatch, currentScene, data, eleDetail, theme, isLoading, startDate, timeType, companyName  }){
    const containerRef = useRef();
    const [currentMach, setCurrentMach] = useState({});
    
    return (
        <div  style={{ height:'100%', padding:'20px 30px 0 50px' }}>
            <div  style={{ position:'relative', height:'100%' }}>
                {/* 线路图和锚点数据 */}
                <div ref={containerRef} className={style['img-container']} >
                    <img src={currentScene.bg_image_path} style={{ width:'100%' }} />
                    {
                        data.map((item,index)=>(
                            <div className={ theme === 'dark' ? style['float-container'] + ' ' + style['dark'] : style['float-container']} style={{ top:item.top + '%', left:'0', width:'100%' }} key={index} >
                                
                                {
                                    columns.map((col, j)=>(
                                        <div className={style['float-item']} key={j} style={ j===0 ? { background:'transparent'} : {}}>
                                            <div style={{ left:'-36px' }}>{ j === 0 ? col.title : `${col.title}${ col.unit ? '('+ col.unit + ')' : ''}` }</div>
                                            {
                                                item.points.map((point)=>(
                                                    <div style={{ left:point.left + '%'}} key={point.left}>
                                                        {
                                                            j === 0 
                                                            ?
                                                            <div className={style['btn']} style={{ backgroundColor:'#1545ff' }} onClick={()=>{
                                                                setCurrentMach({ mach_id:point.mach_id, meter_name:point.meter_name, scene_name:currentScene.scene_name });
                                                            }}>查看详情</div>
                                                            :
                                                            <span style={{ color: col.title === 'Ia' ? '#faec01' : col.title === 'Ib' ? '#7ee631' : col.title === 'Ic' ? '#f31226' : '#fff'}}>{ col.title === 'PF' ? point['PF'] : (+point[col.title]).toFixed(1) } </span>
                                                        }
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    ))
                                }
                            </div>
                        ))
                    }  
                </div>
                {/* <Button style={{ position:'absolute', left:'0', top:'0' }} onClick={()=>{
                    console.log(containerRef.current);
                    html2canvas(containerRef.current, { allowTaint:false, useCORS:false, backgroundColor:theme === 'dark' ? '#191a2f' : '#fff' })
                    .then(canvas=>{
                        let MIME_TYPE = "image/png";
                        let url = canvas.toDataURL(MIME_TYPE);
                        let linkBtn = document.createElement('a');
                        linkBtn.download = `${companyName}线路图` ;          
                        linkBtn.href = url;
                        let event;
                        if( window.MouseEvent) {
                            event = new MouseEvent('click');
                        } else {
                            event = document.createEvent('MouseEvents');
                            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                        }
                        linkBtn.dispatchEvent(event);
                    })
                }}><FileImageOutlined /></Button> */}
            </div>
            <Modal
                visible={ Object.keys(currentMach).length ? true : false }
                footer={null}
                className={IndexStyle['custom-modal']}
                width='1500px'
                height='800px'
                bodyStyle={{ padding:'20px' }}
                destroyOnClose={true}
                onCancel={()=>{
                    setCurrentMach({});
                    dispatch({ type:'eleMonitor/resetDetail'});
                }}
            >
                
                <ChartContainer currentMach={currentMach} data={eleDetail} dispatch={dispatch} isLoading={isLoading} startDate={startDate} timeType={timeType} />
                   
            </Modal>
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data ||  prevProps.eleDetail !== nextProps.eleDetail || prevProps.theme !== nextProps.theme ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(EleLinesContainer2, areEqual);

// useEffect(()=>{
    //     if ( document.getElementById('myImg')) {
    //         imgRef.current.removeChild(document.getElementById('myImg'));
    //     }
    //     let img = new Image();
    //     img.src = img2;
    //     img.id = 'myImg';
    //     img.onload = ()=>{
    //         let containerWidth = containerRef.current.offsetWidth;
    //         let containerHeight = containerRef.current.offsetHeight - 180;
    //         let isWidth = img.width >= img.height ? true : false;
    //         let ratio = isWidth ? img.width / containerWidth : item.height / containerHeight;
    //         console.log(ratio); 
    //         let fixWidth = isWidth ? containerWidth : ratio * containerWidth ;
    //         let fixHeight = isWidth ? ratio * containerHeight : containerHeight;
    //         console.log(containerWidth, containerHeight);
    //         console.log(img.width, img.height);
    //         console.log(fixWidth, fixHeight);
    //         imgRef.current.style.width = fixWidth + 'px';
    //         imgRef.current.style.height = fixHeight + 'px';
    //         imgRef.current.appendChild(img);     
    //     }
    // },[currentScene]);