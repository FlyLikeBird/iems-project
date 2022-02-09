import React from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import ReactEcharts from 'echarts-for-react';
import style from '../../IndexPage.css';

function CoalInfoItem({ data, theme }) {
    let { key, quota, value, rest, unit } = data;
    let ratio = quota ? Math.round(value / quota * 100 ) : 0;
    // console.log(value, quota);
    let fixRatio = ratio >= 100 ? 100 : ratio;
    let startColor = key === 'day' ? '#059ffe' : key === 'month' ? '#65b7fc' : '#fe9a45';
    let endColor = key === 'day' ? '#6452fd' : key === 'month' ? '#7ef5ea' : '#ffd166';
    return (  
        <div className={style['card-container-wrapper']} style={{ width:'33.3%', paddingRight:key === 'year' ? '0' : '1rem'}}>
            <div className={style['card-container']}>
                <div className={style['flex-container']}>
                    <div className={style['flex-item']} style={{ flex:'1', height:'100%', textAlign:'left' }}>
                        <ReactEcharts
                            style={{ height:'100%'}}
                            notMerge={true}
                            option={{
                                series:[
                                    {
                                        name: '碳排放定额',
                                        type: 'pie',
                                        radius: ['66%', '80%'],
                                        avoidLabelOverlap: false,
                                        label: {
                                            show:true,
                                            position: 'center',
                                            formatter:(params)=>{
                                                return `{b|${ key ==='day' ? '今日' : key === 'month' ? '本月' : '本年'}}\n{a|${ratio}%}`
                                            },
                                            rich:{
                                                'a':{
                                                    color: theme === 'dark' ? '#fff' : '#000',
                                                    fontSize:16,
                                                    // lineHeight:24
                                                },
                                                'b':{
                                                    color:'#9a9a9a',
                                                    fontSize:12,
                                                    lineHeight:20
                                                }
                                            }
                                        },
                                        labelLine: {
                                            show: false
                                        },
                                        data:[
                                            { value:fixRatio, name:'1', itemStyle:{
                                                color: {
                                                    type: 'linear',
                                                    x: 0,                 // 左上角x
                                                    y: 0,                 // 左上角y
                                                    x2: 0,                // 右下角x
                                                    y2: 1,                // 右下角y
                                                    colorStops: [{
                                                        offset: 0, color:startColor // 0% 处的颜色
                                                    }, {
                                                        offset: 1, color:endColor // 100% 处的颜色
                                                    }],
                                                },
                                            }},
                                            { value:100 - fixRatio, name:'2', itemStyle:{ color: theme === 'dark' ? '#000' : '#dcdcdc'}}
                                        ]
                                    }
                                ]
                                
                            }}
                        />
                    </div>
                    <div className={style['flex-item']} style={{ flex:'1', textAlign:'left' }}>
                        <div>{`${key === 'day' ? '今日' : key === 'month' ? '本月' : '本年'}碳排放定额`}</div>
                        <div>
                            <span className={style['data']}>{ quota || '-- --' }</span>
                            <span className={style['sub-text']}>{ unit }</span>
                        </div>
                    </div>  
                    <div className={style['flex-item']} style={{ flex:'1', textAlign:'left' }}>
                        <div>已排放</div>
                        <div>
                            <span className={style['data']} style={ value >= quota ? { color:'#ff2c2c' }:{}}>{ value || 0 }</span>
                            <span className={style['sub-text']}>{ unit }</span>
                        </div>
                    </div>    
                    <div className={style['flex-item']} style={{ flex:'1', textAlign:'left' }}>
                        <div>指标余量</div>
                        <div>
                            <span className={style['data']} >{ quota ? quota - value : '-- --' }</span>
                            <span className={style['sub-text']}>{ unit }</span>
                        </div>
                    </div>                        
                </div> 
            </div>
        </div>        
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data != nextProps.data ||  prevProps.theme !== nextProps.theme  ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(CoalInfoItem, areEqual);
