import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Button, Radio, InputNumber, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';

const { Option } = Select;
let timer = null;
const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};
function BaseInfoForm({ dispatch, info, onClose }){
    let [form] = Form.useForm();
    useEffect(()=>{
        form.setFieldsValue({
            calc_type:info.calc_type,
            total_kva:+info.total_kva,
            kva_price:+info.kva_price,
            demand_price : info.demand_price,
        })
        return ()=>{
            clearTimeout(timer);
            timer = null;
        }
    },[]);
   
    return (    
        <Form 
            {...layout} 
            name="billing-form"
            form={form}
            onFinish={values=>{               
                new Promise((resolve,reject)=>{
                    dispatch({type:'billing/setRateInfo', payload:{ values, resolve, reject }});               
                })
                .then(()=>{
                    onClose();
                    message.success('设置计费信息成功');
                })
                .catch(msg=>{
                    message.error(msg);
                })
            }}
        >
            <Form.Item name='calc_type' label="计费类型" rules={[{ required: true, message:'计费类型不能为空' }]}>
                <Radio.Group>
                    <Radio value={1}>按需量计费</Radio>
                    <Radio value={2}>按容量计费</Radio>
                </Radio.Group>
            </Form.Item>
            <Form.Item name='total_kva' label="变压器总容量" rules={[{ required: true, message:'变压器总容量不能为空' }]}>
                <InputNumber style={{ width:'100%' }}  />
            </Form.Item>
            <Form.Item name='kva_price' label="容量基本电费单价" rules={[{ required: true, message:'容量基本电费单价不能为空' }]}>
                <InputNumber style={{ width:'100%' }}  />
            </Form.Item>
            <Form.Item name='demand_price' label="需量基本电费单价" rules={[{ required: true, message:'需量基本电费单价不能为空' }]}>
                <InputNumber style={{ width:'100%' }}  />
            </Form.Item>
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
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

export default React.memo(BaseInfoForm, areEqual);