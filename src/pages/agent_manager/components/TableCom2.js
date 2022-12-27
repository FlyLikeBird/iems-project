import React, { useEffect, useState, useRef } from 'react';
import { Radio } from 'antd';
import style from '../AgentMonitor.css';
import firstIcon from '../../../../public/agent/first.png';
import secondIcon from '../../../../public/agent/second.png';
import thirdIcon from '../../../../public/agent/third.png';

const tabs = [
    { title:'碳排放', key:'1' },
    { title:'标煤排放', key:'2'},
    // { title:'万元产值比排名', key:'2'},
    // { title:'节省空间排名', key:'3'}
]

function TableCom({ dispatch, data }){
    const [current, setCurrent] = useState('1');
    const [timeType, setTimeType] = useState('1');
    const containerRef = useRef();
    const [list, setList] = useState();
    const timerRef = useRef();
    const countRef = useRef();
    useEffect(()=>{
        return ()=>{
            clearInterval(timerRef.current);
        }
    },[]);
    useEffect(()=>{
        countRef.current = 0;
        clearInterval(timerRef.current);
        let container = containerRef.current;
        if (container){
            data = data.map((item,index)=>{
                item.rank = index;
                return item;
            })
            let tempArr = data.slice(countRef.current, 10);
            setList(tempArr);
            countRef.current = countRef.current + 1;
            startScroll();
        }
    },[data]);
    function handleToggleRank(item){
        new Promise((resolve, reject)=>{
            dispatch({ type: item.key === '1' ? 'agentMonitor/fetchCo2Rank' : 'agentMonitor/fetchEnergyRank', payload:{ resolve, reject, timeType }})
        })
        .then(()=>{
            setCurrent(item.key);
        })
    }
    function startScroll(){
        let scrollCount = Math.ceil(data.length/10);
        if ( scrollCount > 1 ){
            timerRef.current = setInterval(()=>{
                if ( countRef.current >= scrollCount ){
                    countRef.current = 0;
                }
                let tempArr = data.slice(countRef.current*10, (countRef.current+1)*10);
                setList(tempArr);
                countRef.current = countRef.current + 1;
            },5000);
        }
    }

    function handleMouseOver(){
        clearInterval(timerRef.current);
    }
    function handleMouseOut(){
        startScroll();
        
    }
    return (
        <div style={{ height:'100%', paddingBottom:'10px'}}>
            <Radio.Group size='small' className={style['my-radio']} style={{ position:'absolute', right:'0', top:'-30px' }} value={timeType} onChange={e=>{
                new Promise((resolve, reject)=>{
                    dispatch({ type:current === '1' ? 'agentMonitor/fetchCo2Rank' : 'agentMonitor/fetchEnergyRank', payload:{ resolve, reject, timeType:e.target.value }})
                })
                .then(()=>{
                    setTimeType(e.target.value);
                })

            }}>
                <Radio.Button value='1'>本日</Radio.Button>
                <Radio.Button value='2'>本月</Radio.Button>
                <Radio.Button value='3'>本年</Radio.Button>

            </Radio.Group>
            <div style={{ height:'6%' }}>
                <div className={style['table-tabs']} style={{ position:'relative', transform:'none' }}>
                    {
                        tabs.map((item,index)=>(
                            <div key={index} className={item.key === current ? `${style['tabs-item']} ${style['selected']}` : style['tabs-item']} onClick={()=>handleToggleRank(item)}>{ item.title }</div>
                        ))
                    }                 
                </div>
            </div>
            <div style={{ height: '94%', fontSize:'0.8rem' }} ref={containerRef} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}> 
                <div style={{ display:'flex', alignItems:'center', height:'9%', padding:'4px 6px' }}>
                    <div style={{ flex:'1' }}>排名</div>
                    <div style={{ flex:'2' }}>公司</div>
                    <div style={{ flex:'2' }}>{ current === '1' ? '碳排放(t)' : current === '2' ? '标煤排放(tce)' : ''}</div>
                    <div style={{ flex:'1' }}>同比变化</div>
                </div>
                {
                    list && list.length 
                    ?
                    list.map((item,index)=>(
                        <div key={index} style={{ display:'flex', alignItems:'center', height:'9%', padding:'4px 6px', backgroundColor: index % 2 === 0 ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
                            <div style={{ flex:'1' }}>
                                {
                                    item.rank === 0 
                                    ?
                                    <span><img src={firstIcon}/></span>
                                    :
                                    item.rank === 1
                                    ?
                                    <span><img src={secondIcon}/></span>
                                    :
                                    item.rank === 2
                                    ?
                                    <span><img src={thirdIcon} /></span>
                                    :
                                    <span className={style['dot']}>{ +item.rank + 1 }</span>
                                }
                            </div>
                            <div style={{ flex:'2', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ item.company_name }</div>
                            <div style={{ flex:'2', color:'#17e6ff' }}>{  Math.floor( item.totalEnergy ) }</div>
                            <div style={{ flex:'1', color:'#ffa633'}}>{ (+item.same).toFixed(1) + '%' }</div>
                        </div>
                    ))
                    :
                    <div>暂时没有排名信息</div>
                }
            </div>
            
        </div>
    )
}

export default TableCom;