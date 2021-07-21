import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Spin, message } from 'antd';
import style from './AgentMonitor.css';
import entryBg from '../../../public/agent/entry-icons.png';

import sceneBg0 from '../../../public/agent/entry-icons-scene/0.png';
import sceneBg1 from '../../../public/agent/entry-icons-scene/1.png';
import sceneBg2 from '../../../public/agent/entry-icons-scene/2.png';
import sceneBg3 from '../../../public/agent/entry-icons-scene/3.png';
import sceneBg4 from '../../../public/agent/entry-icons-scene/4.png';
import sceneBg5 from '../../../public/agent/entry-icons-scene/5.png';
import sceneBg6 from '../../../public/agent/entry-icons-scene/6.png';
import sceneBg7 from '../../../public/agent/entry-icons-scene/7.png';
import sceneBg8 from '../../../public/agent/entry-icons-scene/8.png';
import sceneBg9 from '../../../public/agent/entry-icons-scene/9.png';
import sceneBg10 from '../../../public/agent/entry-icons-scene/10.png';
import sceneBg11 from '../../../public/agent/entry-icons-scene/11.png';
import sceneBg12 from '../../../public/agent/entry-icons-scene/12.png';

import projectBg0 from '../../../public/agent/entry-icons-project/0.png';
import projectBg1 from '../../../public/agent/entry-icons-project/1.png';
import projectBg2 from '../../../public/agent/entry-icons-project/2.png';
import projectBg3 from '../../../public/agent/entry-icons-project/3.png';
import projectBg4 from '../../../public/agent/entry-icons-project/4.png';
import projectBg5 from '../../../public/agent/entry-icons-project/5.png';
import projectBg6 from '../../../public/agent/entry-icons-project/6.png';
import projectBg7 from '../../../public/agent/entry-icons-project/7.png';
import projectBg8 from '../../../public/agent/entry-icons-project/8.png';
import projectBg9 from '../../../public/agent/entry-icons-project/9.png';
import projectBg10 from '../../../public/agent/entry-icons-project/10.png';
const sceneIconsMap = {
    'store':sceneBg1,
    'ele_room':sceneBg2,
    'parking':sceneBg6,
    'air_conditioning':sceneBg3,
    'it_room':sceneBg11,
    'air_compressor':sceneBg4,
    'street_lamp':sceneBg8,
    'elevator':sceneBg9,
    'light':sceneBg10,
    'workshop':sceneBg5,
    'shop_warning':sceneBg12
};
const projectIconsMap = {
    'energy_manage':projectBg1,
    'aiot':projectBg0,
    'prepaid':projectBg8,
    'build':projectBg9,
    'water':projectBg10,
    'ele_safe':projectBg2,
    'perception_system':projectBg3,
    'environment':projectBg4,
    'camera':projectBg5,
    'environment':projectBg6
}
// const sceneIconsMap = {
//     'store':1,
//     'ele_room':2,
//     'parking':6,
//     'air_conditioning':3,
//     'it_room':11,
//     'air_compressor':4,
//     'street_lamp':8,
//     'elevator':9,
//     'light':10,
//     'workshop':5,
//     'shop_warning':12
// };
// const projectIconsMap = {
//     'energy_manage':1,
//     'aiot':0,
//     'prepaid':8,
//     'build':9,
//     'water':10,
//     'ele_safe':2,
//     'perception_system':3,
//     'environment':4,
//     'camera':5,
//     'environment':6
// }
function SceneEntry({ dispatch, agentMonitor }){
    const { projects } = agentMonitor;

    return (
        
        <div className={style['scene-container']} >
            <div className={style['scene-title']}>快速入口</div>
            {
                Object.keys(projects).length 
                ?
                Object.keys(projects).map((key,index)=>(
                    <div key={key} style={{ marginBottom:'20px' }}>
                        <div className={style['scene-item-container']}>
                            <div className={style['scene-item-entry']} style={{ backgroundImage:`url(${entryBg})`, backgroundPosition:`-${key==='scene' ? 0 : 301}px 0`}}></div>
                            <div className={style['scene-item-child']}>
                                {
                                    projects[key] && projects[key].length 
                                    ?
                                    projects[key].map((item)=>(
                                        <div key={item.code} style={{
                                            backgroundImage:`url(${key === 'scene' ? sceneIconsMap[item.code] : projectIconsMap[item.code]})`,  
                                            // backgroundPosition:`-${key === 'scene' ? sceneIconsMap[item.code] * 168 : projectIconsMap[item.code] * 168 }px 0`
                                            // backgroundPosition:`-${key === 'scene' ? 166: 166 }px 0`
                                        }} onClick={()=>{
                                            if ( item.code ==='energy_manage') {
                                                dispatch(routerRedux.push('/agentMonitor/project'));
                                            } else {
                                                message.info('该项目还没有开放');
                                            }
                                        }}></div>
                                    ))
                                    :
                                    null
                                }
                            </div>
                        </div>
                    </div>
                ))
                :
                <Spin size='large' className={style['spin']} />
            }
        </div>
    
    )
}

export default connect(({ agentMonitor })=>({ agentMonitor }))(SceneEntry);