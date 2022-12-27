import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import { Menu, Card, Form, DatePicker, Skeleton, Input, Tabs, Tree, Spin, Button, Modal, Select, message } from 'antd';
import { CloseCircleFilled, LeftOutlined, RightOutlined } from '@ant-design/icons';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import AnalyzeChart from './components/AnalyzeChart';
import style from '../IndexPage.css';
import AnalyzeMachForm from './components/AnalyzeMachForm';
import CustomDatePicker from '@/pages/components/CustomDatePicker';
import Loading from '@/pages/components/Loading';

const { Option } = Select;
const { TabPane } = Tabs;

function validator(a,value){
    if ( value && typeof +value === 'number' && +value >= 0 ){
        return Promise.resolve();
    } else {
        return Promise.reject('请输入合适的阈值');
    }
}

function AnalyzeMachManager({ dispatch, user, analyze, fields }){
    const { startDate, theme } = user;
    const { runEffInfo, machList, machInfoList, machEffLoading, currentMach, deviceList } = analyze;
    const { allFields, currentField, currentAttr, expandedKeys, treeLoading } = fields;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    const [editing, setEditing] = useState(false);
    const [deviceVisible, toggleDeviceVisible] = useState(false);
    const [currentDevice, setCurrentDevice] = useState('');
    const [visible, toggleVisible] = useState(false);
    const [form] = Form.useForm();
    const inputRef = useRef();
    const sidebar = (
        <div>
            <div className={style['card-container']}>
                <Tabs className={style['custom-tabs']} activeKey={currentField.field_id + ''} onChange={activeKey=>{
                    let field = fieldList.filter(i=>i.field_id == activeKey )[0];
                    dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                    new Promise((resolve)=>{
                        dispatch({type:'fields/fetchFieldAttrs', resolve })
                    }).then(()=>{
                        dispatch({type:'analyze/fetchMachEff'});
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
                                        className={style['custom-tree']}
                                        expandedKeys={expandedKeys}
                                        onExpand={temp=>{
                                            dispatch({ type:'fields/setExpandedKeys', payload:temp });
                                        }}
                                        defaultSelectedKeys={[currentAttr.key]}
                                        treeData={fieldAttrs}
                                        onSelect={(selectedKeys, {node})=>{
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            dispatch({type:'analyze/fetchMachEff'});
                                        }}
                                    />
                                }
                            </TabPane>
                        ))
                    }
                </Tabs>
            </div>                                                                   
        </div>
    );
    // 设置设备的阈值数据
    useEffect(()=>{
        form.setFieldsValue({
            'off_power':runEffInfo.off_power ? (+runEffInfo.off_power).toFixed(0) : '',
            'empty_power':runEffInfo.empty_power ? (+runEffInfo.empty_power).toFixed(0) : '',
            'over_power':runEffInfo.over_power ? (+runEffInfo.over_power).toFixed(0) : ''
        });
    },[runEffInfo]);
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'analyze/resetMachEff'});
        }
    },[])
    // console.log(currentDate);
    const content = (
        
                Object.keys(runEffInfo).length
                ?
                <div>
                    {
                        machEffLoading 
                        ?
                        <Loading />
                        :
                        null
                    }
                    <div style={{ height:'40px'}}>
                        <CustomDatePicker noToggle onDispatch={()=>{
                            dispatch({type:'analyze/fetchMachEff', payload:{ hasMach:true }});
                        }} />
                    </div>
                    <div style={{ height:'calc( 100% - 40px)'}}>               
                        <div className={style['card-container-wrapper']} style={{ display:'block', height:'20%', paddingRight:'0' }}>                        
                                {
                                    machInfoList.map((item,index)=>(
                                        <div className={style['card-container-wrapper']} key={index} style={{ width:'20%', paddingBottom:'0', paddingRight:index === machInfoList.length -1 ? '0' : '1rem' }}>
                                            <div className={style['card-container']}>
                                                <div className={style['card-title']}>{ item.title }</div>
                                                <div className={style['card-content']}>
                                                    <div className={style['flex-container']}>
                                                        {
                                                            item.subInfo.map((sub,j)=>(
                                                                <div className={style['flex-item']} key={j}>
                                                                    <div>{ sub.title }</div>
                                                                    <div style={{ color:'#1890ff', fontSize:'1.2rem', fontWeight:'bold' }}>{ `${sub.value}${sub.unit}` }</div>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <div className={style['info-title']}>{ item.title }</div>
                                            <div className={style['sub-info-container']}>
                                                {
                                                    item.subInfo.map((subItem,index)=>(
                                                        <div className={style['sub-item']} key={index}>
                                                            <div className={style['sub-title']}>{ subItem.title} </div>
                                                            <div className={style['sub-content']}>{ `${subItem.value}${subItem.unit}` }</div>
                                                        </div>
                                                    ))
                                                }
                                            </div>           */}
                                        </div>
                                    ))
                                }                         
                        </div>                                                     
                    
                        <div className={style['card-container']} style={{ height:'80%' }}>
                            <div className={style['card-title']} >
                                    {
                                        deviceVisible
                                        ?
                                        <Select
                                            size='small'
                                            open={ deviceVisible ? true : false }
                                            style={{
                                                width:'450px'
                                            }}
                                            allowClear={false}
                                            value={[currentDevice]}
                                            onChange={value=>{                                
                                                if ( value === 'null'){
                                                    message.info('请选择一个设备库模型');
                                                    return ;
                                                } else {
                                                    setCurrentDevice(value);

                                                }                                      
                                            }}
                                            dropdownRender={menu=>(
                                                <div>
                                                    { menu }
                                                    <div style={{ padding:'4px 10px'}}>
                                                        <Button size='small' type='primary' onClick={()=>{
                                                            if ( !currentDevice ){
                                                                message.info('请选择一个设备模型')
                                                            } else {
                                                                dispatch({type:'analyze/copyDevice', payload:currentDevice});
                                                                toggleDeviceVisible(false);
                                                            }
                                                        }}>应用</Button>
                                                        <Button size='small' style={{ marginLeft:'6px' }} onClick={()=>{
                                                            setCurrentDevice('');
                                                            toggleDeviceVisible(false);
                                                        }}>取消</Button>
                                                    </div>
                                                </div>
                                            )}
                                        >
                                            {
                                                deviceList && deviceList.length 
                                                ?
                                                deviceList.map((item,index)=>(
                                                    <Option key={item.device_id} title={item.device_name}>
                                                        <div style={{ fontSize:'1rem', position:'relative' }}>
                                                            <div style={{ fontWeight:'bold', color:'#35363c' }}>{ item.device_name }</div>
                                                            <div style={{ display:'flex'}}>
                                                                <div style={{ marginRight:'6px', fontSize:'0.8rem' }}><span>关机功率:</span><span style={{ color:'#1890ff'}}>{ +item.off_power }kw</span></div>
                                                                <div style={{ marginRight:'6px', fontSize:'0.8rem' }}><span>空载功率:</span><span style={{ color:'#1890ff'}}>{ +item.empty_power }kw</span></div>
                                                                <div style={{ marginRight:'6px', fontSize:'0.8rem' }}><span>重载功率:</span><span style={{ color:'#1890ff'}}>{ +item.over_power }kw</span></div>
                                                                <div style={{ marginRight:'6px', fontSize:'0.8rem' }}><span>额定功率:</span><span style={{ color:'#1890ff'}}>{ +item.rated_power }kw</span></div>
                                                            </div>
                                                            <div style={{ position:'absolute', top:'50%', right:'10px', transform:'translateY(-50%)'}}>
                                                                <CloseCircleFilled onClick={e=>{
                                                                    e.stopPropagation();
                                                                    dispatch({type:'analyze/deleteDevice', payload:item.device_id });

                                                                }}/>
                                                            </div>
                                                        </div>
                                                    </Option>
                                                ))
                                                :
                                                <Option key='null'>还没有添加设备至设备库</Option>
                                            }
                                        </Select>
                                        :
                                        <div>
                                            <Select size='small' style={{ marginRight:'10px', width:'180px' }} value={[currentMach.mach_id ? currentMach.mach_id : '0']} onChange={value=>{
                                                let data = machList.filter(i=>i.mach_id == value )[0];
                                                dispatch({ type:'analyze/selectMach', payload:{ data }});
                                                dispatch({ type:'analyze/fetchMachEff', payload:{ hasMach:true }});
                                            }}>
                                                {
                                                    machList && machList.length 
                                                    ?
                                                    machList.map((item,i)=>(
                                                        <Option key={item.mach_id} value={item.mach_id}>{item.meter_name}</Option>
                                                    ))
                                                    :
                                                    <Option key="0">该属性下没有挂载设备</Option>
                                                }
                                            </Select>
                                        {/* <Button size='small' type='primary' onClick={()=>{
                                            dispatch({type:'analyze/fetchDeviceList'});
                                            toggleDeviceVisible(true);
                                        }}>设备模型库</Button> */}
                                        </div>
                                    }
                                    {/* 设置阈值 */}
                                    {
                                        editing
                                        ?
                                        <Form form={form} layout='inline'>
                                            <Form.Item label='关机阈值' name='off_power'>
                                                <Input size='small' />
                                            </Form.Item>
                                            <Form.Item label='空载阈值' name='empty_power'>
                                                <Input size='small' />
                                            </Form.Item>
                                            <Form.Item label='重载阈值' name='over_power'>
                                                <Input size='small' />
                                            </Form.Item>
                                            <Form.Item>
                                                <Button size='small' type='primary' onClick={()=>{
                                                    form.validateFields()
                                                    .then(values=>{
                                                        let { off_power, empty_power, over_power } = values;
                                                        if ( !(off_power && +off_power >= 0 )){
                                                            message.info('请输入合适的关机阈值');
                                                            return ;
                                                        }
                                                        if ( !(empty_power && +empty_power >= 0 )){
                                                            message.info('请输入合适的空载阈值');
                                                            return ;
                                                        }
                                                        if ( !(over_power && +over_power >= 0 )){
                                                            message.info('请输入合适的重载阈值');
                                                            return ;
                                                        }
                                                        dispatch({type:'analyze/setMachEff', payload:{ values }})        
                                                        setEditing(false);
                                                    })
                                                    .catch(err=>{
                                                        console.log(err);
                                                    })

                                                }}>确定</Button>
                                                <Button size='small' style={{ marginLeft:'4px' }} onClick={()=>setEditing(false)}>取消</Button>
                                            </Form.Item>
                                        </Form>
                                        :
                                        <Button size='small' type='primary' onClick={()=>setEditing(true)}>设置电流阈值</Button>                            
                                    }
                            </div>
                            <div className={style['card-content']} style={{ padding:'0' }}>
                                {
                                        runEffInfo && runEffInfo.view 
                                        ?
                                        <AnalyzeChart data={runEffInfo} theme={theme} />
                                        :
                                        <Skeleton active />
                                    }  
                            </div>  
                                                                                         
                        </div>
                    
                    {/* 添加设备库表单 */}
                    <Modal visible={visible} footer={null} bodyStyle={{ padding:'40px' }} onCancel={()=>toggleVisible(false)} closable={false} destroyOnClose={true}>
                        <AnalyzeMachForm data={runEffInfo} onClose={()=>toggleVisible(false)} onDispatch={action=>dispatch(action)} />
                    </Modal>
                    </div>
                </div>
                :
                <Skeleton active className={style['skeleton']} />
            
    );
    return (
        <ColumnCollapse sidebar={sidebar} content={content} />
    )
}

export default connect(({ user, analyze, fields })=>({ user, analyze, fields }))(AnalyzeMachManager);