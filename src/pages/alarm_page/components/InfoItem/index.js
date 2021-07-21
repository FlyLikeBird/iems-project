import React from 'react';
import { routerRedux } from 'dva/router';
import style from '../../../IndexPage.css';
import ReactEcharts from 'echarts-for-react';

const warningColors = {
    'total':'#ff7862',
    '电气安全':'#2d4861',
    '指标越限':'#65cae3',
    '通讯异常':'#57e29f'
};

function formatLegend(arr){
    let count = 0;
    for(let i=0;i<arr.length;i++){
        if ( i !== 0 && i % 2 === 0) {
            arr.splice(i + count, 0, '');
            count++;
        }
    }
    return arr;
}

function InfoItem({ data, onDispatch, optionStyle, theme, forReport }){ 
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let ratio = !data.finishCount && !data.unfinishCount 
                ?
                0 : 
                (+data.finishCount / +data.count )*100;
    // console.log(data);
    // style={{ backgroundColor: forReport ? '#f7f7f7' : '#fff'}}
    return (
        <div className={style['card-container-wrapper']} style={optionStyle}>
            <div className={style['card-container-wrapper']} style={{ width:'50%', paddingBottom:'0' }}>
                <div className={style['card-container']} style={ forReport ? { backgroundColor:'#f0f0f0', textAlign:'center', boxShadow:'none' } : { textAlign:'center' }}>
                    <div className={style['card-title']} style={{ display:'block', borderBottom:'none', textDecoration:'underline', color:warningColors[data.warning_type]}} >{`${data.warning_type}警报`}</div>
                    <div className={style['card-content']}>
                        <div className={style['flex-container']}>
                            <div className={style['flex-item'] + ' ' + style['data']} style={{ color:warningColors[data.warning_type]}} onClick={()=>{
                                onDispatch(routerRedux.push({
                                    pathname:'/energy/alarm_manage/alarm_execute',
                                    query: { type:data.warning_type === '电气安全' ? 'ele' : data.warning_type === '指标越限' ? 'limit' : data.warning_type === '通讯异常' ? 'link' : '' }
                                }))
                            }}>{ +data.count }件</div>
                            <div className={style['flex-item']} style={{ textAlign:'left' }}>
                                <div>已处理: <span style={{ fontWeight:'bold', color:theme === 'dark' ? '#fff' : 'rgba(0,0,0,.65)' }}>{ data.finishCount }件</span></div>
                                <div>未处理: <span style={{ fontWeight:'bold', color:theme === 'dark' ? '#fff' : 'rgba(0,0,0,.65)' }}>{ data.unfinishCount }件</span></div>
                                <div>处理率: <span style={{ fontWeight:'bold', color:theme === 'dark' ? '#fff' : 'rgba(0,0,0,.65)' }}>{ `${ratio.toFixed(1)}%`}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={style['card-container-wrapper']} style={{ width:'50%', paddingRight:'0', paddingBottom:'0' }}>
                <div className={style['card-container']} style={ forReport ? { backgroundColor:'#f0f0f0', boxShadow:'none' } : { }}>
                    <ReactEcharts
                        notMerge={true}
                        style={{ width:'100%', height:'100%'}}
                        option={{
                            tooltip:{
                                trigger:'item'
                            },
                            legend:{
                                type:'scroll',
                                orient:'vertical',
                                align:'right',
                                right:20,
                                top:10,
                                data:data.detail.map(i=>i.type_name),
                                itemWidth: 10,
                                itemHeight: 10,
                                textStyle:{
                                    color:textColor,
                                    fontSize:10
                                }
                            },
                            color:['#92d050', '#09c1fd', '#bfbfbf', '#ffff00', '#36637b', '#edab5b', '#62a4e2', '#65cae3', '#57e29f' ],
                            series:[{
                                type: 'pie',
                                radius: ['50%', '70%'],
                                center:['30%','50%'],
                                avoidLabelOverlap: false,
                                label: {
                                    position: 'inner',
                                    color:'#000',
                                    formatter:(params)=>{

                                        return params.data.value || '';
                                    }
                                },
                                
                                itemStyle:{
                                    shadowBlur: 100,
                                    shadowColor: 'rgba(0, 0, 0, 0.2)'
                                },
                                emphasis: {
                                    label: {
                                        show: true,
                                        fontSize: '30',
                                        fontWeight: 'bold'
                                    }
                                },
                                labelLine: {
                                    show: false
                                },
                                data:data.detail.map(i=>({ name:i.type_name, value:i.typeCount }))
                            }]
                        }}
                    />
                </div>
            </div>
           
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.theme !== nextProps.theme  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(InfoItem, areEqual);