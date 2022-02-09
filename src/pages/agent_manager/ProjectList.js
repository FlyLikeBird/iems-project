import React, { useState, useEffect } from 'react';
import { Tree, Badge } from 'antd';
import { connect } from 'dva';
import style from './AgentMonitor.css';

let loaded = false;
let treeData = [];

function getTreeData(data){
    let sum = 0;
    let result = { title:'全国', key:'全国', type:'country' };
    if ( data && Object.keys(data).length ){
        result.children = [];
        Object.keys(data).forEach(key=>{
            let province = data[key];
            let provinceSum = 0;
            let provinceChildren = [];
            if ( Object.keys(province).length ) {
                Object.keys(province).forEach(cityKey=>{
                    provinceSum += province[cityKey].length;
                    provinceChildren.push({ title:(<span>{ cityKey + ' '}<span className={style['num']}>{ province[cityKey].length }</span></span>), key:cityKey, type:'city' });
                })
            };
            result.children.push({ title:(<span>{ key + ' ' }<span className={style['num']}>{ provinceSum }</span></span>), key, type:'province', children:provinceChildren });
            sum += provinceSum;
        });
        result.title = (<span>{ '全国' + ' ' }<span className={style['num']}>{ sum }</span></span>)
    }
    return result;
}

function filterCompany(companyList, type, currentKey){
    let result;
    if ( type === 'country') {
        result = companyList.concat();
    } else if ( type === 'province'){
        result = companyList.filter(i=>i.province === currentKey );
    } else if ( type === 'city') {
        result = companyList.filter(i=>i.city === currentKey );
    }
    return result;
}
function ProjectList({ dispatch, agentMonitor, user }){
    let [currentNode, setCurrentNode] = useState({ title:'全国', key:'全国', type:'country' });
    let [list, setList] = useState([]);
    const { userInfo, companyList } = user;
    if ( userInfo.city && !loaded ){
        treeData.push(getTreeData(userInfo.city));
        loaded = true;
    }
    useEffect(()=>{
        return ()=>{
            treeData = [];
            loaded = false;
        }
    },[])
    useEffect(()=>{
        if ( companyList.length ){
            setList(filterCompany(companyList, currentNode.type, currentNode.key ));
        }
    },[currentNode, companyList]);
    return (
            <div className={style['project-container-2']}>
                {
                    loaded 
                    ?
                    <Tree 
                        treeData={treeData}
                        defaultExpandAll={true}
                        selectedKeys={[currentNode.key]}
                        onSelect={(selectedKeys, { node })=>{
                            setCurrentNode(node);
                        }}
                    />
                    :
                    null
                }
                <div className={style['item-container']}>
                    {
                        
                            list && list.length
                            ?
                            list.map((item, index)=>(
                                <div className={style['item-wrapper']} key={item.company_id} >
                                    <div className={style['item']} onClick={()=>{
                                        if(window.handleTooltipClick){
                                            window.handleTooltipClick(item.company_id);
                                        }
                                    }}>
                                        <img src={item.logo_path} style={{ height:'60%' }} />
                                        <div>{ item.company_name }</div>
                                        <div className={style['tag']}><Badge count={item.warning_cnt} /></div>
                                    </div>
                                </div>
                            ))
                            :
                            null
                        
                    }
                </div>
                
            </div>
    )
}

export default connect(({ user, agentMonitor })=>({ user, agentMonitor }))(ProjectList);