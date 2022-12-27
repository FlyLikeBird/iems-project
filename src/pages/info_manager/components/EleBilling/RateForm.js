import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Button, Divider, InputNumber, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';

const { Option } = Select;
let timer = null;
const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
};
function RateForm({ dispatch, info, onClose }){
    let [form] = Form.useForm();
    let [cityList, setCityList] = useState([]);
    useEffect(()=>{
        form.setFieldsValue({
            rate_name:info.forEdit ? info.current.rate_name : null,
            front_value:info.forEdit ? info.current.front_value : null,
            front_type:info.forEdit ? info.current.front_type + '' : '1',
            city_name : info.forEdit ? info.current.front_city_name : null,
            order_by : info.forEdit ? info.current.order_by : null,
            
        })
        return ()=>{
            clearTimeout(timer);
            timer = null;
        }
    },[]);
    function handleSearch(value){
        clearTimeout(timer);
        timer = setTimeout(()=>{
            new Promise((resolve, reject)=>{
                dispatch({ type:'billing/fetchCity', payload:{ keyword:value, resolve, reject }})
            })
            .then(res=>{
                setCityList(res);
            })
        },500)
    }
    return (    
        <Form 
            {...layout} 
            name="billing-form"
            form={form}
            onFinish={values=>{
                if ( info.forEdit ){
                    values['rate_id'] = info.current.rate_id;
                }
                new Promise((resolve,reject)=>{
                    dispatch({type:'billing/addRateAsync', payload:{ values, forEdit:info.forEdit, resolve, reject }});               
                })
                .then(()=>{
                    onClose();
                    message.success(`${info.forEdit ? '修改' : '添加'}${ info.current ? info.current.rate_name : '方案' }成功`);
                })
                .catch(msg=>{
                    message.error(msg);               
                })
            }}
        >
            <Form.Item name='rate_name' label="方案名称" rules={[{ required: true, message:'方案名称不能为空' }]}>
                <Input />
            </Form.Item>
            <Form.Item name='front_type' label="生效条件" rules={[{ required: true, message:'生效条件不能为空' }]}>
                <Select>
                    <Option value='1' key='1'>默认</Option>
                    <Option value='2' key='2'>温度大于等于阈值</Option>
                    <Option value='3' key='3'>温度小于等于阈值</Option>
                </Select>
            </Form.Item>
            
            <Form.Item noStyle shouldUpdate={( prevValues, currentValues )=>{
                return prevValues.front_type !== currentValues.front_type;
            }}>
                {
                    ({ getFieldValue })=>{
                        let temp = getFieldValue('front_type');
                        return (
                            temp !== '1' 
                            ?   
                            <Form.Item name='front_value' label="温度阈值" rules={[{ required: true, message:'温度阈值不能为空' }]}>
                                <InputNumber style={{ width:'100%' }} />
                            </Form.Item>
                            :
                            null
                        )
                    }                    
                }
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prevValues, currentValues)=>{
                return prevValues.front_type !== currentValues.front_type;
            }}>
                {
                    ({ getFieldValue })=>{
                        let temp = getFieldValue('front_type');
                        return (
                            temp !== '1' 
                            ?
                            <Form.Item name='city_name' label="城市" rules={[{ required: true, message:'城市名不能为空' }]}>
                                <Select
                                    showSearch
                                    onSearch={value=>{
                                        if (value) {
                                            handleSearch(value);
                                        } else {
                                            setCityList([])
                                        }
                                    }}
                                    notFoundContent={<div>输入城市名查询</div>}
                                >
                                    {
                                        cityList.map(item=>(
                                            <Option key={item} value={item}>{ item }</Option>
                                        ))
                                    }
                                </Select>
                            </Form.Item>
                            :
                            null
                        )
                    }
                }
            </Form.Item>
            <Form.Item name='order_by' label="优先级" rules={[{ required: true, message:'请指定方案的优先级' }]}>
                <InputNumber style={{ width:'100%' }} />
            </Form.Item>
           
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
                <Button type="primary" htmlType="submit">
                    确定
                </Button>
                <Button type="primary" style={{margin:'0 10px'}} onClick={()=>onClose()}>
                    取消
                </Button>
            </Form.Item>
        </Form>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.info !== nextProps.info  ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(RateForm, areEqual);