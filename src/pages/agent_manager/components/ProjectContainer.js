import React from 'react';
import { Tooltip, Button } from 'antd';
import style from '../AgentMonitor.css';
import entryImg from '../../../../public/agent/entry.png';
import sceneIcons from '../../../../public/agent/scene-icons.png';

const iconsMap = {
    'aiot':0,
    'prepaid':8,
    'build':9,
    'water':10,
    'ele_safe':2,
    'perception_system':3,
    'environment':4,
    'camera':5,
    'store':12,
    'ele_room':13,
    'parking':17,
    'air_conditioning':14,
    'it_room':13,
    'street_lamp':19,
    'elevator':20,
    'light':21,
    'workshop':16,
    'shop_warning':23,
    'air_compressor':15,
    'energy_manage':1
}
function ProjectContainer({ data }){
    return (
        <div className={style['middle']} style={{ top:'80px' }}>
            {
                Object.keys(data).length 
                ?
                <div className={style['project-container']}>
                    {
                        Object.keys(data).map(key=>(
                            <div className={style['project-item']} key={key}>
                                <div className={style['project-item-title']}>
                                    <div style={{ 
                                        display:'inline-block',
                                        height:'30px',
                                        width:'144px',
                                        backgroundSize:'cover',
                                        backgroundImage:`url(${entryImg})`,
                                        backgroundRepeat:'no-repeat',
                                        backgroundPosition:`${ key === 'scene' ? -144 : 0 }px 0`
                                    }}>
                                    </div>
                                </div>
                                <div className={style['project-item-content']}>
                                    {
                                        data[key].map((item,index)=>(
                                            <Tooltip overlayClassName={style['project-tooltip']} key={item.name} title={
                                                key === 'scene' 
                                                ?
                                                item.name 
                                                :
                                                <div>
                                                    <div className={style['title']}>{ item.name }</div>                                             
                                                    {
                                                        item.list && item.list.length 
                                                        ?
                                                        <div className={style['content']}>
                                                            {
                                                                item.list.map((company)=>(
                                                                    <div key={company.company_name} onClick={()=>{
                                                                        if ( window.handleTooltipClick ){
                                                                            window.handleTooltipClick(company.company_id, item.code);
                                                                        }
                                                                    }}>
                                                                        <span>{ company.company_name }</span>
                                                                        {/* <span><Button size='small' type='primary' style={{ fontSize:'0.8rem', marginLeft:'10px' }} onClick={()=>{
                                                                            if ( window.handleTooltipClick ){
                                                                                window.handleTooltipClick(company.company_id);
                                                                            }
                                                                        }}>进入项目</Button></span> */}
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                        :
                                                        <div style={{ padding:'4px 10px'}}>该项目下还没有用户</div>
                                                    }
                                                </div>
                                            }><div style={{ 
                                                backgroundImage:`url(${sceneIcons})`,
                                                backgroundPosition:`-${( iconsMap[item.code] || 0 ) * 34}px 0`
                                            }}>
                                                <div 
                                                    className={style['tag']} 
                                                    // style={{ color: key === 'scene' ? '#07b8d1' : '#51b8f4'}}
                                                >{ item.num }</div>
                                            </div>
                                            </Tooltip>
                                        ))
                                    }
                                </div>
                            </div>
                        ))
                    }
                </div>
                :
                null
            }
        </div>
    )
}

export default ProjectContainer;