import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Form, Input, InputNumber, Button, Select, Switch, Modal, message } from 'antd';

const { Option } = Select;
const phoneReg = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
const emailReg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
const passwordReg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";\'<>?,.\/]).{8,20}$/ ;
let msg = '密码需是包含字母/数字/特殊字符且长度8-15位的字符串';

const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
};
const timeList = [];
for( let i = 0; i <= 48 ; i++){
    let rest = i % 24;
    timeList.push({ value:i, text: i > 24 ? `次日${ rest === 0 ? '24' : rest < 10 ? '0' + rest : rest }:00` : `${ i < 10 ? '0' + i : i}:00`});
}
function WorktimeForm({ info, onDispatch, onClose }){
    const [form] = Form.useForm();
    useEffect(()=>{
        if ( info.forEdit ) {
            let { name, begin, end, order_by } = info.current;
            form.setFieldsValue({
                name,
                begin,
                end,
                order_by
            })
        }
    },[]);

    return (
        
            <Form 
                {...layout}
                form={form} 
                name="nest-messages"          
                onFinish={values=>{
                    if ( info.forEdit ) {
                        values.id = info.current.id;
                    }
                    new Promise((resolve,reject)=>{
                        onDispatch({ type:'worktime/addWorktimeAsync', payload:{ values, forEdit:info.forEdit, resolve, reject }})                    
                    }).then(()=>{
                        message.success(info.forEdit ? '更新班次成功':'添加班次成功');
                        onClose();
                    }).catch(msg=>{
                        message.error(msg);
                    })                 
                }}
            >
                <Form.Item name='name' label="班次名称" rules={[{ required: true, message:'班次不能为空' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name='begin' label="开始时间" rules={[{ required: true, message:'开始时间不能为空' }]}>
                    <Select style={{ width:'100%' }}>
                        {
                            timeList.map((item)=>(
                                <Option key={item.value} value={item.value}>{ item.text }</Option>
                            ))
                        }
                    </Select>
                </Form.Item>
                <Form.Item name='end' label="结束时间" rules={[{ required:true, message:'结束时间不能为空'}]}>
                    <Select style={{ width:'100%' }}>
                        {
                            timeList.map((item)=>(
                                <Option key={item.value} value={item.value}>{ item.text }</Option>
                            ))
                        }
                    </Select>
                </Form.Item>
                <Form.Item name='order_by' label="排序值">
                    <InputNumber min={0} style={{ width:'100%' }} />
                </Form.Item>
                
                <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
                    <Button type="primary" htmlType="submit">
                        { info.forEdit ? '更新' : '添加' }
                    </Button>
                    <Button style={{ marginLeft:'1rem' }} onClick={()=>onClose()}>取消</Button>
                </Form.Item>
            </Form>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.info !== nextProps.info ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(WorktimeForm, areEqual);
