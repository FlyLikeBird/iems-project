import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Radio, Spin, Card, Tree, Tabs, Button, message } from 'antd';
import { DoubleLeftOutlined , DoubleRightOutlined  } from '@ant-design/icons';
import ColumnCollapse from '../../../components/ColumnCollapse';
import EfficiencyTree from './components/EfficiencyTree';
import { energyIcons } from '../../../utils/energyIcons';
const { TabPane } = Tabs;

function EfficiencyTreeManager({ dispatch, efficiencyQuota, fields }) {
    const { energyList, energyInfo, quotaTree, chartLoading } = efficiencyQuota;
    const { fieldList, fieldAttrs, currentField, currentAttr, treeLoading } = fields;
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'efficiencyQuota/reset'});
        }
    },[]);
    // console.log(currentAttr);
    const sidebar = (
        <div>
            <Card title="能耗类别" className='card-container'>
                <Radio.Group value={energyInfo.type_id} onChange={e=>{
                    
                    let currentEnergy = energyList.filter(i=>i.type_id === e.target.value )[0];
                    if ( e.target.value === 0 || e.target.value === 1 ) {
                        dispatch({type:'efficiencyQuota/toggleEnergyType', payload:e.target.value });
                        dispatch({type:'efficiencyQuota/fetchTree'});
                    } else {
                        message.info(`还没有接入${currentEnergy.type_name}能源数据`);

                    }
                }}>
                    {
                        energyList.map(item=>(
                            <Radio.Button key={item.type_id} value={item.type_id}>{ energyIcons[item.type_code]} {item.type_name}</Radio.Button>
                        ))
                    }
                </Radio.Group>                                                        
            </Card>
            
            <Card title="统计对象"  className='card-container' >
                <Tabs selectedKeys={[currentField.field_id]} onChange={activeKey=>{
                    dispatch({type:'fields/toggleField', payload:{ visible:false, field: { field_id:activeKey } } });
                    new Promise((resolve)=>{
                        dispatch({type:'fields/fetchFieldAttrs', resolve })
                    }).then(()=>{
                        dispatch({type:'efficiencyQuota/fetchTree'});
                    })
                }}>
                    {                       
                        fieldList.map(field=>(
                            <TabPane 
                                key={field.field_id} 
                                tab={field.field_name}
                            >
                                {
                                    treeLoading
                                    ?
                                    <Spin />
                                    :
                                    <Tree
                                        defaultExpandAll={true}
                                        selectedKeys={[currentAttr.key]}
                                        treeData={fieldAttrs}
                                        onSelect={(selectedKeys, {node})=>{
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            dispatch({type:'efficiencyQuota/fetchTree'});
                                        }}
                                    />
                                }
                                
                            </TabPane>
                        ))
                    }
                </Tabs>
            </Card>
        </div>
    );
   
    const content = (
        <div style={{ backgroundColor:'#fff' }}>
            {
                chartLoading 
                ?
                <Spin size='large' />
                :
                <EfficiencyTree 
                    data={quotaTree} 
                    onDispatch={action=>dispatch(action)} 
                    energyInfo={energyInfo} 
                    currentField={currentField} 
                    currentAttr={currentAttr} 
                />
            }
        </div>
    )
    return (  
        <ColumnCollapse sidebar={sidebar} content={content} />
    );
}

export default connect(({ efficiencyQuota, fields})=>({ efficiencyQuota, fields }))(EfficiencyTreeManager);
