import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Link, Redirect } from 'dva/router';
import { Table, Button, Card, Form, Input, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

import style from '../login_page/LoginPage.css';

import logo from '../../../public/logo.png';
import loginLogo from '../../../public/loginLogo.png';

import loginBg from '../../../public/loginBg.jpg';

const layout = {
    labelCol: { span: 0 },
    wrapperCol: { span: 24 },
};
const tailLayout = {
    wrapperCol: { offset: 0, span: 24 },
};

function LoginPage({ dispatch, user }) {  
    const { thirdAgent } = user;
    const [form] = Form.useForm();
    useEffect(()=>{
        if ( form && Object.keys(thirdAgent).length ){
            form.setFieldsValue({
                'user_name':thirdAgent.default_user_name,
                'password':thirdAgent.default_pwd
            });
        }
    },[thirdAgent])
    return (
        localStorage.getItem('user_id')
        ?
        <Redirect to='/energy' />
        :
        <div className={style.container}>
            <div className={style['login-container']}>
                <div className={style['logo-container']}>
                    <img src={ thirdAgent.logo_path || loginLogo} />
                </div>
                <div className={style['form-container']}>
                    <Form
                        {...layout}
                        className={style['form']}
                        form={form}
                    >
                        <Form.Item                            
                            name="user_name"
                            rules={[{required:true, message:'账号不能为空!'}]}
                        >
                            <Input addonBefore={<UserOutlined />} bordered='false' />
                        </Form.Item>
                        <Form.Item                           
                            name="password"
                            rules={[{required:true, message:'密码不能为空!'}]}
                        >
                            <Input.Password addonBefore={<LockOutlined />} bordered='false' />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" style={{width:'100%'}} onClick={()=>{
                                form.validateFields()
                                .then(values=>{
                                    new Promise((resolve,reject)=>{
                                        dispatch({type:'user/login', payload:values, resolve, reject })
                                    }).then(()=>{})
                                    .catch(msg=>{
                                        message.error(msg);
                                    })
                                })
                            }}>登录</Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>        
            <div className={style['bg-container']} style={{ backgroundImage:`url(${loginBg})` }}></div>        
        </div>
    )
}

export default connect(({ user })=>({ user }))(LoginPage);
