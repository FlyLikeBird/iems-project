import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Button, Input, Popconfirm, Form, Modal, Select, Tag, message } from 'antd';
import style from './BillingManager.css';
import MainLineTable from './components/MainLineTable';

const { Option } = Select;

function MainLineManager({ dispatch, incoming }){
    const [visible, toggleVisible] = useState(false);
    const [form] = Form.useForm();
    const { mainLineList, machList } = incoming;
    const [inSelected, setInSelected] = useState(machList);
    const [outSelected, setOutSelected] = useState(machList);
    const layout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
    };
    const filterOptions = machList.filter(item=>{
        return !inSelected.includes(item.mach_id) && !outSelected.includes(item.mach_id);
    });
    // console.log(filterOptions);
    return (
            <div className={style['container']}>
                <div className={style['operation-container']}>                  
                        <Button type='primary' onClick={()=>toggleVisible(true)}>添加干线</Button>
                </div>
                <MainLineTable data={mainLineList} machList={machList} onDispatch={action=>dispatch(action)} />
                <Modal visible={visible} footer={null} destroyOnClose={true} bodyStyle={{ padding:'40px' }} onCancel={()=>{
                    toggleVisible(false);
                    form.setFieldsValue({
                        main_name:'',
                        in_mach:[],
                        out_mach:[]
                    })
                }}>
                    <Form form={form} {...layout}>
                        <Form.Item label='干线名称' name='main_name' rules={[{ required:true, message:'干线名称不能为空' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label='输入设备' name='in_mach' rules={[{ required:true, message:'请至少选择一个输入设备' }]}>
                            <Select 
                                mode="multiple"
                                allowClear
                                onChange={value=>{
                                    setInSelected(value);
                                }}
                                placeholder='请至少选择一个输入设备'
                                tagRender={props=>{
                                    const { value, closable, onClose } = props;
                                    return <Tag closable={closable} onClose={onClose} style={{ marginRight:'4px'}}>{ machList.filter(i=>i.mach_id === value)[0].meter_name}</Tag>
                                }}
                            >
                                {
                                    filterOptions && filterOptions.length 
                                    ?
                                    filterOptions.map((item)=>(
                                        <Option key={item.mach_id} value={+item.mach_id}>
                                            { item.meter_name }
                                        </Option>
                                    ))
                                    :
                                    null
                
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item label='输出设备' name='out_mach' rules={[{ required:true, message:'请至少选择一个输出设备' }]}>
                            <Select
                                mode="multiple"
                                allowClear
                                onChange={value=>{
                                    setOutSelected(value);
                                }}
                                placeholder='请至少选择一个输出设备'
                                tagRender={props=>{
                                    const { value, closable, onClose } = props;
                                    return <Tag closable={closable} onClose={onClose} style={{ marginRight:'4px'}}>{ machList.filter(i=>i.mach_id === value)[0].meter_name}</Tag>
                                }}
                            >
                                {
                                    filterOptions && filterOptions.length 
                                    ?
                                    filterOptions.map((item)=>(
                                        <Option key={item.mach_id} value={+item.mach_id}>
                                            { item.meter_name }
                                        </Option>
                                    ))
                                    :
                                    null
                                }
                            </Select>
                        </Form.Item>
                        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
                            <Button type='primary' onClick={()=>{
                                form.validateFields()
                                .then(values=>{
                                    // console.log(values);
                                    dispatch({type:'incoming/addMain', payload:values });
                                    toggleVisible(false);                            
                                })
                                .catch(error=>{
                                    console.log(error);
                                })
                            }}>添加</Button>
                            <Button style={{ margin:'0 10px' }} onClick={()=>toggleVisible(false)}>取消</Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
    )
}

export default connect(({ incoming })=>({ incoming }))(MainLineManager);