import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons'


const UploadComponent = ()=>{
    let [fileList, changeFileList] = useState([]);
    const onRemove = file => {
        let index = fileList.indexOf(file);
        let newArr = fileList.slice();
        newArr.splice(index,1);
        changeFileList(newArr);
    };
    const beforeUpload = file =>{
        if ( file.type === 'application/vnd.ms-excel' ){
            changeFileList([...fileList, file])
        } else {
            message.error('请上传EXCEL格式文件');
        }
        return false;
    };
    
    return (
        <Upload 
            fileList={fileList} 
            onRemove={(file)=>onRemove(file)} 
            beforeUpload={(file)=>beforeUpload(file)}
        >
            {
                !fileList.length
                ?
                <Button>
                    <PlusOutlined /> 上传
                </Button>
                :
                null
            }
            
        </Upload>
    )
}

export default UploadComponent;

