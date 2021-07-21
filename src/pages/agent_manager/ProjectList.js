import React from 'react';
import { connect } from 'dva';
import style from './AgentMonitor.css';
// import bg1 from '../../../public/report-footer.jpg';
// import bg2 from '../../../public/bg1.jpg';

function ProjectList({ dispatch, agentMonitor, user }){
    // console.log(projectList);
    const { companyList } = user;
    return (
        <div className={style['project-container-2']}>
            {
                companyList && companyList.length
                ?
                companyList.map((item, index)=>(
                    <div key={item.company_id} style={{
                        padding:'0 6px 6px 0'
                    }}>
                    <div style={{ 
                        display:'inline-flex', 
                        width:'100%',
                        height:'100%',
                        flexDirection:'column', 
                        alignItems:'center', 
                        justifyContent:'space-around', 
                        border:'1px solid #000', 
                        textAlign:'center', 
                        backgroundColor:'rgba(0,0,0,0.4)', 
                        // margin:'0 10px 10px 0',
                        fontSize:'0.8rem',
                        whiteSpace:'nowrap',
                        cursor:'pointer'

                    }} onClick={()=>{
                        if(window.handleTooltipClick){
                            window.handleTooltipClick(item.company_id);
                        }
                    }}>
                        <img src={item.logo_path} style={{ height:'60%' }} />
                        <div>{ item.company_name }</div>
                    </div>
                    </div>
                ))
                :
                null
            }
        </div>
    )
}

export default connect(({ user, agentMonitor })=>({ user, agentMonitor }))(ProjectList);