import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Input, Upload, Radio, message, Button, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        
    });
}

function validator(a,value){
    if ( !value ) {
        return Promise.reject('该字段不能为空');
    } else {
        return Promise.resolve();
    }
}

function AlarmForm({ data, authType, onClose, onExecute, onConfirm }){
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [previewInfo, setPreviewInfo] = useState({});
    useEffect(()=>{
        form.setFieldsValue({
            'region_name':data.region_name,
            'position_name':data.position_name,
            'level':data.level,
            'type_name':data.type_name,
            'executor_name':data.executor_name,
            'warning_info':data.warning_info,
            'warning_value':data.warning_value,
            'satisfied': data.satisfied
        })
    },[]);
    const handleChange = ( { fileList })=>{
        setFileList(fileList);
    };
    const handlePreview = (file)=>{
        // file.thumbUrl 默认编译成200*200像素的64位字符串, 用FileReader重新解析
        if ( !file.preview ) {
            getBase64(file.originFileObj)
                .then(data=>{
                    file.preview = data;
                    setPreviewInfo({
                        visible:true,
                        img:data,
                        title:file.name
                    });
                })
        } else {
            setPreviewInfo({
                visible:true,
                img:file.preview,
                title:file.name
            })
        }
    };
    const handleBeforeUpload = (file)=>{
        const isJPG = file.type === 'image/jpeg';
        const isJPEG = file.type === 'image/jpeg';
        const isGIF = file.type === 'image/gif';
        const isPNG = file.type === 'image/png';
        if (!(isJPG || isJPEG || isGIF || isPNG)) {
            message.error('只能上传JPG 、JPEG 、GIF、 PNG格式的图片')
        }
        const isLt2M = file.size / 1024 / 1024 < 5;
        if (!isLt2M) {
            message.error('图片不能超过5M');
        }
        return false;
    };
    const uploadButton = (
        <div>
          <PlusOutlined />
          <div className="ant-upload-text">上传图片</div>
        </div>
    );
    
    return (
        <div>
            <Form
                form={form}
                onFinish={values=>{
                    console.log(values);
                    new Promise((resolve, reject)=>{
                        console.log(authType);
                        if ( +authType === 1){
                            // 区域执行人
                            console.log('a');
                            console.log(onExecute);
                            let record_id = data.record_id;
                            let executor_info = values.executor_info;
                            let warning_desc = values.warning_desc;
                            let photos = fileList.map(i=>i.thumbUrl);
                            onExecute({ record_id, executor_info, warning_desc, photos, resolve, reject });
                        } else if ( +authType === 2){
                            // 区域负责人
                            let record_id = data.record_id;
                            let satisfied = values.satisfied;
                            onConfirm({ record_id, satisfied, resolve, reject});
                        }
                    })
                    .then(()=>onClose())
                    .catch(msg=>{
                        message.error(msg);
                        
                    })
                   
                }}
            >
                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item label='责任区域:' name='region_name'><Input disabled/></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label='报警位置' name='position_name'><Input disabled/></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label='报警级别' name='level'><Input disabled/></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label='报警分类' name='type_name'><Input disabled/></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label='区域责任人' name='executor_name'><Input disabled/></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label='告警规则' name='warning_info'><Input disabled/></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label='告警值' name='warning_value'><Input disabled/></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label='发生时间' name='first_warnign_time'><Input /></Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label='恢复时间' name='lala'><Input /></Form.Item>
                    </Col>
                    <Col span={24} >
                        <Form.Item label='警告描述:' name='warning_desc' rules={[{ validator }]}><TextArea /></Form.Item>
                    </Col>
                    <Col span={12} >
                        <Form.Item label='执行人:' name='lala'><Input /></Form.Item>
                    </Col>
                    <Col span={12} >
                        <Form.Item label='执行时间:' name='lala'><Input /></Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label='执行措施:' name='executor_info' rules={[{ validator }]}><TextArea /></Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label='处理凭证:' name='photos'>
                            <Upload
                                listType="picture-card"
                                fileList={fileList}
                                onPreview={handlePreview}
                                onChange={handleChange}
                                beforeUpload={handleBeforeUpload}
                                
                            >
                                {
                                    fileList.length >= 4 ? null : uploadButton
                                }
                            </Upload>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label='区域管理责任人确认:' name='leader_name'><Input /></Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label='满意度评价:' name='satisfied'>
                        <Radio.Group disabled={ +authType === 2 ? false : true }>
                            <Radio value='1'>满意</Radio>
                            <Radio value='2'>较满意</Radio>
                            <Radio value='3'>不满意</Radio>
                        </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col span={24} style={{ textAlign:'center'}}>
                        <Button type='primary' htmlType='submit'>确定</Button>
                        <Button onClick={onClose} style={{ marginLeft:'10px'}}>关闭</Button>
                    </Col>
                </Row>
            </Form>
            <Modal visible={previewInfo.visible} width='1200px' title={previewInfo.title} footer={null} onCancel={()=>setPreviewInfo({ ...previewInfo, visible:false })}>
                <img src={previewInfo.img} style={{ width:'100%'}} />
            </Modal>
        </div>
    )
}

export default AlarmForm;