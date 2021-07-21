import React, { useRef } from 'react';
import style from '../AgentMonitor.css';
import project1 from '../../../../public/agent/project-1.png';
import project2 from '../../../../public/agent/project-2.png';
import project3 from '../../../../public/agent/project-3.png';
import project4 from '../../../../public/agent/project-4.png';
import project5 from '../../../../public/agent/project-5.png';
import project6 from '../../../../public/agent/project-6.png';
import project7 from '../../../../public/agent/project-7.png';
import project8 from '../../../../public/agent/project-8.png';

const mapProjectImg = {
    '能源管理项目':project1,
    '电气火灾项目':project2,
    '电力运维项目':project3,
    '智慧消防项目':project4,
    '环境监测项目':project5,
    '预付费项目':project6,
    '智慧楼宇项目':project7,
    '设备生命周期':project8,
}

function ProjectList({data}) {
    const containerRef = useRef();
    return (   
        <div ref={containerRef} className={style['layout-container']}>
            {
                Object.keys(data).length 
                ?
                Object.keys(data).map((key,index)=>(
                    <div key={key} className={style['layout-item-wrapper']} style={{ 
                        height:'auto',
                        textAlign:'center',
                        position:'relative',
                        margin:'10px 0'
                    }}>
                        <img src={mapProjectImg[key]} />
                        <div className={style['special-font']} style={{ marginTop:'20px' }}>{ data[key] }</div>
                        <div style={{ position:'absolute', top:'10px', left:'50%', transform:'translateX(-50%)'}}>{ key }</div>
                    </div>
                ))
                :
                null
            }
        </div>
          
    );
}


function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ) {
        return false;
    } else {
        return true;
    }
}

export default  ProjectList;
