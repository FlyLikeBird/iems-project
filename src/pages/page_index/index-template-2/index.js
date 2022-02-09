import React from 'react';
import { Spin } from 'antd';
import titleImg from '../../../../public/page-index-template/title.png';
import infoImg from '../../../../public/page-index-template/info-bg.png';
import MotionImg from '../../../../public/page-index-template/motion.webp';
import style from './template2.css';
import InfoContainer from './InfoContainer';
import LineChart from './LineChart';
import PieChart from './PieChart';
import EnergyProcess from './EnergyProcess';
import ScrollTable from './ScrollTable/index';
// 切换总能源成本， 电成本， 水成本

function IndexTemplate2({ monitor }){
    let { energyInfoList, monitorInfo, saveSpace, tplInfo, coalInfo } = monitor;
    let loaded = Object.keys(monitorInfo).length ? true : false ;
    return (
        <div className={style['container']}>
            <div className={style['title-container']} style={{ backgroundImage:`url(${titleImg})` }}>智慧能源大屏</div>
            <div className={style['info-container']} style={{ backgroundImage:`url(${infoImg})` }}>
                {
                    loaded && Object.keys(tplInfo).length && Object.keys(coalInfo).length 
                    ?
                    <InfoContainer data={monitorInfo.energyInfo} coal={tplInfo.coal} carbon={tplInfo.gas_coal}  />
                    :
                    null
                }
            </div>
            {/* 图表区 */}
            <div className={style['content-container']}>
                {/* 左侧 */}
                <div className={style['card-container-wrapper']} style={{ width:'34%' }}>
                    <div className={style['card-container']} style={{ height:'46%'}}>
                        <div className={style['card-title']}>
                            今日用电负荷
                            <div className={style['tag']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                loaded
                                ?
                                <LineChart xData={monitorInfo.view.date} yData={monitorInfo.view.ele} unit='kw' />
                                :
                                <Spin size='large' className={style['spin']} />
                            }
                        </div>
                    </div>
                    <div className={style['card-container']} style={{ height:'54%' }}>
                        <div className={style['card-title']}>
                            本月能源对标
                            <div className={style['tag']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                energyInfoList.length
                                ?
                                <EnergyProcess data={energyInfoList} />
                                :
                                <Spin size='large' className={style['spin']} />
                            }
                        </div>
                    </div>
                </div>
                {/* 中侧 */}
                <div className={style['card-container-wrapper']} style={{ width:'32%', position:'relative', overflow:'hidden' }}>
                    <div><img src={MotionImg} style={{ width:'100%', transform:'scale(1.2)' }} /></div>
                    <div style={{ position:'absolute', left:'0', width:'100%', bottom:'0', height:'160px' }}>
                        {
                            loaded 
                            ?
                            <ScrollTable data={monitorInfo.warningRecord} />
                            :
                            null
                        }
                    </div>
                </div>
                {/* 右侧 */}
                <div className={style['card-container-wrapper']} style={{ width:'34%' }}>
                    <div className={style['card-container']} style={{ height:'46%'}}>
                        <div className={style['card-title']}>
                            本月碳排放趋势
                            <div className={style['tag']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                Object.keys(coalInfo).length 
                                ?
                                <LineChart xData={coalInfo.date} yData={coalInfo.view.energy} unit='t' />
                                :
                                <Spin size='large' className={style['spin']} />
                            }
                        </div>
                    </div>
                    <div className={style['card-container']} style={{ height:'54%' }}>
                        <div className={style['card-title']}>
                            本月节俭空间
                            <div className={style['tag']}></div>
                        </div>
                        <div className={style['card-content']}>
                            {
                                Object.keys(saveSpace).length 
                                ?
                                <PieChart data={saveSpace.costInfo} />
                                :
                                <Spin size='large' className={style['spin']} />
                            }
                        </div>
                    </div>
                </div>
            </div>
       
        </div>
    )
}

export default IndexTemplate2;