import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Spin, Tooltip, Badge, message } from 'antd';
import style from './AgentMonitor.css';

import sceneBg2 from '../../../public/agent/entry-icons-scene/2.png';
import sceneBg4 from '../../../public/agent/entry-icons-scene/4.png';


import projectBg0 from '../../../public/agent/entry-icons-project/0.png';
import projectBg1 from '../../../public/agent/entry-icons-project/1.png';
import projectBg11 from '../../../public/agent/entry-icons-project/11.png';
import projectBg12 from '../../../public/agent/entry-icons-project/12.png';
import projectBg14 from '../../../public/agent/entry-icons-project/14.png';
import projectBg15 from '../../../public/agent/entry-icons-project/15.png';

const projectIconsMap = {
    'energy_manage':projectBg1,
    'aiot':projectBg0,
    'air_compressor':sceneBg4,
    'hy_switch_system':projectBg11,
    'hy_ele_room':sceneBg2,
    'hy_combust':projectBg12,
    'hy_smoke':projectBg15,
    'hy_environment':projectBg14
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
const projectsMap = {
    energy_manage:'iot',
    aiot:'e',
    air_compressor:'acs',
    hy_switch_system:'safe',
    hy_ele_room:'pr',
    hy_combust:'fab',
    hy_smoke:'smk',
    hy_environment:'env'
};
function SceneEntry({ dispatch, user, agentMonitor }){
    const { projects } = agentMonitor;
    const { newThirdAgent, userInfo } = user;
    return (
        
        <div className={style['scene-container']} >
            <div className={style['scene-title']}>能耗云模块入口</div>
            {
                Object.keys(projects).length 
                ?
                Object.keys(projects).map((key,index)=>(
                    <div key={key} style={{ marginBottom:'20px' }}>
                        <div className={style['scene-item-container']}>
                            <div className={style['scene-item-child']}>
                                {
                                    projects[key] && projects[key].length 
                                    ?
                                    projects[key].map((item, index)=>(
                                        <Tooltip key={item.code} placement="rightBottom" overlayClassName={style['custom-tooltip']} title={(
                                            item.list && item.list.length 
                                            ?
                                            <div className={style['item-container']} style={{ height:'400px', overflow:'hidden auto' }}>
                                                {
                                                    item.list.map((sub)=>(
                                                        <div key={sub.company_id} className={style['item-wrapper']} style={{ width:'33.3%'}}>
                                                            <div className={style['item']} onClick={()=>{
                                                                // 兼容第三方服务商的location跳转
                                                                let temp = location.host.split('-');
                                                                let prefix = temp.length === 2 ? temp[1].split('.')[0] : '';
                                                                let linkPath = ( prefix ? projectsMap[item.code] + '-' + prefix : projectsMap[item.code] ) + '.' + window.g.host + '.com';                                                                
                                                                window.open(`http://${linkPath}?pid=${Math.random()}&&userId=${userInfo.user_id}&&companyId=${sub.company_id}&&mode=full`);
                                                            }}>
                                                                <div style={{ 
                                                                    height:'60%', 
                                                                    width:'80%',
                                                                    backgroundImage:`url(http://api.h1dt.com${sub.logo_path})`,
                                                                    backgroundRepeat:'no-repeat',
                                                                    backgroundSize:'contain',
                                                                    backgroundPosition:'50% 50%'
                                                                }}>
                                                                </div>
                                                                {/* <img src={ 'http://api.h1dt.com' + sub.logo_path} style={{ height:'40%' }} /> */}
                                                                <div>{ sub.company_name }</div>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                            :
                                            null
                                        )}><div key={item.code} style={{
                                            backgroundImage:`url(${key === 'project' ? projectIconsMap[item.code] : ''})`,  
                                            // backgroundPosition:`-${key === 'scene' ? sceneIconsMap[item.code] * 168 : projectIconsMap[item.code] * 168 }px 0`
                                            // backgroundPosition:`-${key === 'scene' ? 166: 166 }px 0`
                                        }}>
                                            <Badge
                                                className={style['custom-badge']}
                                                count={item.list.length}
                                                
                                                overflowCount={99}
                                                style={{ backgroundColor: '#1890ff' }}
                                            />
                                            <div style={{ position:'absolute', bottom:'12px', fontSize:'1.2rem', letterSpacing:'2px', whiteSpace:'nowrap', left:'50%', transform:'translateX(-50%)' }}>{ item.name }</div>    
                                        </div>
                                        </Tooltip>
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

export default connect(({ user, agentMonitor })=>({ user, agentMonitor }))(SceneEntry);