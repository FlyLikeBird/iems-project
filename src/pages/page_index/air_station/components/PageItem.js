import React, { useEffect, useRef } from 'react';
import { Tooltip } from 'antd';
import style from '../AirStation.css';
import ReactEcharts from 'echarts-for-react';

let initWidth = 1720, initHeight = 1000;

let statusMaps = {
    '0':{ color:'#66d04c', text:'运行'},
    '1':{ color:'#8d919a', text:'停止'},
    '2':{ color:'#66d04c', text:'故障'},
};

function PageItem({ path, rect, data }){
    const imgRef = useRef();
    let { points, infoList, chartList } = data || {};
    useEffect(()=>{
        let containerWidth = rect.width;
        let containerHeight = rect.height;
        let xRatio = initWidth /containerWidth;
        let yRatio = initHeight / containerHeight;
        let direc = xRatio <= yRatio ? 'vertical' : 'horizon';
        let finalRatio = direc === 'vertical' ? yRatio : xRatio;
        // console.log(finalRatio);
        let fixWidth = direc === 'vertical' ? initWidth / finalRatio : containerWidth;
        let fixHeight = direc === 'vertical' ? containerHeight : initHeight / finalRatio;
        // console.log(fixWidth, fixHeight);
        // if ( direc === 'vertical' ) {
        //     let offset = (containerWidth - fixWidth)/2;
        //     imgRef.current.style.margin = `0 ${offset}px`;
        // }      
        imgRef.current.style.width = fixWidth + 'px';
        imgRef.current.style.height = fixHeight + 'px';
    },[rect]);
    
    return (
        <div ref={imgRef} className={style['img-container']}>
            <img src={path} />
            {
                points && points.length 
                ?
                points.map((item,index)=>(
                    <div
                        key={index}
                        className={style['float-item'] + ' ' + style['dot']}
                        style={{
                            top:item.top + '%',
                            left:item.left + '%',
                            backgroundColor:statusMaps[item.status].color
                        }}
                    ></div>
                ))
                :
                null
            }
            {
                infoList && infoList.length 
                ?
                infoList.map((item,index)=>(
                    <Tooltip title={item.name} key={index} destroyTooltipOnHide={true}>
                        <div
                            className={style['float-item']}
                            style={{
                                transform: item.direc === 'middle' ? 'translate(-50%,-50%)' : 'none',
                                top:item.top + '%',
                                left: item.direc === 'middle' ? item.left + '%' : item.direc === 'left' ? 'unset' : item.left + '%',
                                right:item.direc === 'left' ? item.right + '%' : 'unset',
                                backgroundColor:'rgba(6,40,77,0.7)',
                                border:'1px solid #1b4997',
                                color:'#fff',
                                padding:'4px 12px',
                                borderRadius:'4px',
                                fontWeight:'bold'
                            }}
                        >
                            { `${ !item.unit ?  item.direc === 'left' ? 'A:':'B:' : ''} ${item.value}${item.unit}` }
                        </div>
                    </Tooltip>
                ))
                :
                null
            }
            {/* 空压机图表区 */}
            {
                chartList && chartList.length 
                ?
                chartList.map((item,index)=>(
                    <div
                        key={index}
                        className={style['float-item']}
                        style={{
                            transform:'none',
                            left:item.left + '%',
                            top:item.top + '%',
                            width:item.width + '%',
                            height:item.height + '%',
                            // backgroundColor:'rgba(0,0,0,0.2)'
                        }}
                    >
                        <ReactEcharts
                            style={{ height:'100%', width:'100%' }}
                            notMerge={true}
                            option={{
                                grid:{
                                    top:40,
                                    left:4,
                                    right:4,
                                    bottom:10,
                                    containLabel:true
                                },
                                tooltip:{
                                    trigger:'axis'
                                },
                                xAxis: {
                                    type:'category',
                                    axisTick:{ show:false },
                                    axisLine:{ show:false },
                                    axisLabel:{
                                        textStyle:{
                                            fontWeight:'bold',
                                            color:'#2069dc'
                                        }
                                    },
                                    data:item.category
                                },
                                yAxis: {
                                    type:'value',
                                    axisLine:{ show:false },
                                    axisTick:{ show:false },
                                    axisLabel:{ show:false },
                                    splitLine:{ show:false },
                                    min:0,
                                    max:100,
                                    splitNumber:1
                                },
                                series:[{
                                    data:item.value,
                                    type: 'bar',
                                    barWidth:14,
                                    showBackground: true,
                                    itemStyle:{
                                        color:'#05ca92'
                                    },
                                    backgroundStyle: {
                                        color: '#05543f'
                                    },
                                    label:{
                                        show:true,
                                        position:'top',
                                        color:'#fff',
                                        fontSize:14,
                                        backgroundColor:'rgba(9,48,90,0.8)',
                                        borderColor:'#1c4a98',
                                        borderWidth:2,
                                        padding:[4,6],
                                        formatter: ( params )=>{
                                            return params.data + '%'
                                        }
                                    }
                                }],
                                
                            }}
                        />
                    </div>
                ))
                :
                null
            }
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.path !== nextProps.path || prevProps.rect !== nextProps.rect || prevProps.data !== nextProps.data  ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(PageItem, areEqual);