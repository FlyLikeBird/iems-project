import React from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import style from '../../IndexPage.css';
const labelStyle = {
    display:'inline-block',
    width:'40px',
    height:'40px',
    lineHeight:'40px',
    borderRadius:'10px',
    color:'#fff',
    fontWeight:'bold'
};
function InfoItem({ data }) {
    let { key, value, unit, sameRate, adjoinRate } = data;
    return (  
        <div className={style['card-container-wrapper']} style={{ width:'33.3%', paddingRight:key === 'year' ? '0' : '1rem'}}>
            <div className={style['card-container']}>
                <div className={style['flex-container']}>
                    <div className={style['flex-item']}>
                        <span style={{...labelStyle, backgroundColor: key === 'day' ? '#af2aff' : key === 'month' ? '#6dcffb' : '#ffc177'}}>{ key === 'day' ? '日' : key === 'month' ? '月' : '年' }</span>
                    </div>
                    <div className={style['flex-item']} style={{ flex:'1' }}>
                        <div>{`${key === 'day' ? '今日' : key === 'month' ? '本月' : '本年'}碳排放`}</div>
                        <div>
                            <span className={style['data']}>{ value }</span>
                            <span className={style['sub-text']}>{ unit }</span>
                        </div>
                    </div>  
                    <div className={style['flex-item']} style={{ flex:'1' }}>
                        <span>同比</span>
                        <br/>
                        {
                            !sameRate
                            ?
                            <span className={style['data']}>-- --</span>
                            :
                            <span className={`${style['data']} ${style[ sameRate < 0 ? 'down' : 'up']}`}>
                                { Math.abs(sameRate).toFixed(1) + '%' }
                                { sameRate < 0 ? <CaretDownOutlined style={{ fontSize:'1rem' }} /> : <CaretUpOutlined style={{ fontSize:'1rem' }}/> }                        
                            </span>
                        }

                    </div>    
                    <div className={style['flex-item']} style={{ flex:'1' }}>
                        <span>环比</span>
                        <br/>
                        {
                            !adjoinRate
                            ?
                            <span className={style['data']}>-- --</span>
                            :
                            <span className={`${style['data']} ${style[ adjoinRate < 0 ? 'down' : 'up']}`}>
                                { Math.abs(adjoinRate).toFixed(1) + '%' }
                                { adjoinRate < 0 ? <CaretDownOutlined style={{ fontSize:'1rem' }}/> : <CaretUpOutlined style={{ fontSize:'1rem' }}/> }

                            </span>
                        }
                    </div>                        
                </div> 
            </div>
        </div>        
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data != nextProps.data  ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(InfoItem, areEqual);
