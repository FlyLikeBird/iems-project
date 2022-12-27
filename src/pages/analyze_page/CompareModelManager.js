import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { Tree, Spin, Modal, DatePicker, Select, Skeleton } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';
import BoxplotChart from './components/BoxplotChart';
import AnalyzeChart from './components/AnalyzeChart';
import style from '@/pages/IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';

const { Option } = Select;
function CompareModelManager({ dispatch, user, fields, modelManager }){
    useEffect(()=>{
        if ( user.authorized ) {
            dispatch({ type:'modelManager/initCompareModel'});
        }
    },[user.authorized]);
    let [visible, setVisible] = useState(false);
    let inputRef = useRef();
    let { treeLoading, allFields, currentField, currentAttr, energyInfo, expandedKeys } = fields;
    let { isLoading, compareModel, machEffLoading, runEffInfo, machList, currentMach, currentDate } = modelManager;
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
    const sidebar = (
        <div>
            <div className={style['card-container']}>            
                {
                    treeLoading
                    ?
                    <Spin />
                    :
                    <Tree
                        expandedKeys={expandedKeys}
                        onExpand={temp=>{
                            dispatch({ type:'fields/setExpandedKeys', payload:temp });
                        }}
                        className={style['custom-tree']}
                        selectedKeys={[currentAttr.key]}
                        treeData={fieldAttrs}
                        onSelect={(selectedKeys, {node})=>{
                            dispatch({type:'fields/toggleAttr', payload:node});
                            dispatch({type:'modelManager/fetchCompareModel'});
                        }}
                    />
                }                     
            </div>
        </div>
    );
    const content = (
        <div>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
            <div style={{ height:'40px' }}>
                <CustomDatePicker onDispatch={()=>{
                    dispatch({type:'modelManager/fetchCompareModel'});
                }}/>
            </div>
            <div className={style['card-container']} style={{ height:'calc( 100% - 40px)' }}>
                <BoxplotChart data={compareModel} theme={user.theme} onVisible={visible=>setVisible(visible)} onDispatch={action=>dispatch(action)} startDate={user.startDate} />
            </div>
            <Modal
                width='80vw' 
                height='80vh' 
                bodyStyle={{ height:'80vh', padding:'40px 20px 20px 20px' }}
                visible={visible}
                onCancel={()=>{
                    setVisible(false);
                    dispatch({ type:'modelManager/resetChart'});
                }}
                destroyOnClose={true}
                footer={null}
            >
                <div style={{ height:'100%', position:'relative' }}>
                    {
                        machEffLoading 
                        ?
                        <Loading />
                        :
                        null
                    }
                    {
                        runEffInfo.view 
                        ?
                        <div style={{ display:'flex', alignItems:'center', position:'absolute', zIndex:'2' }}>
                            <Select style={{ width:'160px', marginRight:'1rem' }} value={currentMach.mach_id} onChange={value=>{
                                let result = machList.filter(i=>mach_id === value)[0];
                                dispatch({ type:'modelManager/selectMach', payload:{ data:result }});
                            }}>
                                {
                                    machList.length 
                                    ?
                                    machList.map((item)=>(
                                        <Option key={item.mach_id} value={item.mach_id}>{ item.meter_name }</Option>
                                    ))
                                    :
                                    null
                                }
                            </Select>
                            <div style={{ display:'inline-flex'}}>
                                <div className={style['date-picker-button-left']} onClick={()=>{
                                    let date = new Date(currentDate.format('YYYY-MM-DD'));
                                    dispatch({ type:'modelManager/setDate', payload:moment(date).subtract(1, 'days')});    
                                    dispatch({ type:'modelManager/fetchMachEff'});
                                    
                                }}><LeftOutlined /></div>                            
                                <DatePicker className={style['custom-date-picker']} ref={inputRef} size='small' locale={zhCN} allowClear={false} value={currentDate} onChange={date=>{
                                    dispatch({ type:'modelManager/setDate', payload:date });    
                                    dispatch({ type:'modelManager/fetchMachEff'});
                                    if ( inputRef.current && inputRef.current.blur ) inputRef.current.blur();
                                }}/>                          
                                <div className={style['date-picker-button-right']} onClick={()=>{
                                    dispatch({ type:'modelManager/setDate', payload:moment(date).add(1, 'days')});    
                                    dispatch({ type:'modelManager/fetchMachEff'});                             
                                }}><RightOutlined /></div>
                            </div>
                        </div>   
                        :
                        null
                    }
                    {
                        runEffInfo && runEffInfo.view 
                        ?
                        <AnalyzeChart data={runEffInfo} forModal={true} theme='light' />
                        :
                        <Skeleton active />
                    }
                </div>
                  
            </Modal>
        </div>
    );
    return ( <ColumnCollapse sidebar={sidebar} content={content} />)

}

export default connect(({ user, fields, modelManager })=>({ user, fields, modelManager }))(CompareModelManager);