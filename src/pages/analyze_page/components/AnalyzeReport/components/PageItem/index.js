import React from 'react';
import style from '../../AnalyzeReport.css';

function PageItem({ content, children, title, companyName }){
    let titleStr = title.split('-');
    return (
        <div className={style['page-container']} >
            <div>
                <div className={style['page-title']}>{ titleStr[0]}</div>
                <div>{ titleStr[1] }</div>
            </div>
            <div style={{ position:'relative', marginTop:'10px' }} >
                <div className={style['page-symbol']} ></div>
                <div className={style['page-head-mark']} style={{ backgroundColor:'#00b0f0'}}></div>
                <div className={style['page-head-mark']} style={{ backgroundColor:'#b8de95'}}></div>
            </div>
            { children }
            <div className={style['page-footer']}>
                <div style={{ width:'100%', height:'1px', display:'inline-block', backgroundColor:'#000'}}></div>
                <div style={{ position:'absolute', right:'0', top:'6px', backgroundColor:'#fff', paddingLeft:'10px', fontSize:'0.8rem'}}>{ companyName }</div>
            </div>
        </div>
    )
}

export default PageItem;