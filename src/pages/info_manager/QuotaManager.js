import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Modal, Drawer, Tree, Select, Spin, Tabs, Radio, Form, Upload, message } from 'antd';
import { FireOutlined, DownloadOutlined, DoubleLeftOutlined, DoubleRightOutlined, PlusOutlined } from '@ant-design/icons'
import QuotaSelector from './components/QuotaSelector';
import QuotaTable from './components/QuotaTable';
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import style from '../IndexPage.css';
const { TabPane } = Tabs;
const { Option } = Select;

let startYear = 2018;
let years = [];
for(var i=0;i<30;i++){
    let temp = ++startYear;
    years.push(temp);
}


function QuotaManager({ dispatch, user, quota, fields }){
    let { optionList, optionInfo, year, time_type, visible, list, pageNum, total, isLoading } = quota;
    let { allFields, currentField, currentAttr, energyList, energyInfo, expandedKeys, treeLoading } = fields;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
    let [fileList, changeFileList] = useState([]);
    const layout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
    };

    useEffect(()=>{
        return ()=>{
            dispatch({ type:'quota/reset'});
        }
    },[])
    // console.log(currentField);
    const sidebar = (
        <div>
            <div className={style['card-container']}>
            <Tabs className={style['custom-tabs']} activeKey={energyInfo.type_id} onChange={activeKey=>{
                    let temp = energyList.filter(i=>i.type_id === activeKey)[0];
                    dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                    new Promise((resolve, reject)=>{
                        dispatch({ type:'fields/init', payload:{ resolve, reject }})
                    })
                    .then(()=>{
                        dispatch({type:'quota/fetchQuota'});
                    })
                }}>
                    {
                        energyList.map((item,index)=>(
                            <TabPane key={item.type_id} tab={item.type_name}>
                                <Tabs  
                                    className={style['custom-tabs']}
                                    activeKey={currentField.field_id + ''}  
                                    type='card'                      
                                    onChange={fieldKey=>{
                                        let field = fieldList.filter(i=>i.field_id == fieldKey )[0];
                                        dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                                        new Promise((resolve)=>{
                                            dispatch({type:'fields/fetchFieldAttrs', resolve })
                                        })
                                        .then(()=>{
                                            dispatch({type:'quota/fetchQuota'});
                                        })
                                        
                                }}>
                                    {   
                                        fields.isLoading
                                        ?
                                        null
                                        :
                                        fieldList && fieldList.length
                                        ?                    
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
                                                        selectedKeys={[currentAttr.key]}
                                                        treeData={fieldAttrs}
                                                        onSelect={(selectedKeys, {node})=>{
                                                            dispatch({type:'fields/toggleAttr', payload:node});
                                                            dispatch({type:'quota/fetchQuota'});
                                                        }}
                                                    />
                                                }
                                            </TabPane>
                                        ))
                                        :
                                        <div className={style['text']} style={{ padding:'1rem'}}>
                                            <div>{`${energyInfo.type_name}能源类型还没有设置维度`}</div>
                                            <div style={{ padding:'1rem 0'}}><Button type='primary' onClick={()=>{
                                                history.push(`/energy/info_manage_menu/field_manage?type=${energyInfo.type_code}`);
                                            }} >设置维度</Button></div>
                                        </div>
                                    }
                                </Tabs>
                            </TabPane>
                        ))
                    }
                </Tabs>
            </div>
        </div>
    );
    const content = (
        <div>
            <div style={{ height:'40px', display:'flex' }}>
                <Radio.Group size='small' className={style['custom-radio']} value={optionInfo.type_id} onChange={e=>{
                    let temp = optionList.filter(i=>i.type_id == e.target.value )[0];
                    dispatch({type:'quota/toggleOption', payload:temp });
                    dispatch({type:'quota/fetchQuota'});
                }}>
                    {
                        optionList.map(item=>(
                            <Radio.Button key={item.type_id} value={item.type_id}>{item.type_name}</Radio.Button>
                        ))
                    }
                </Radio.Group> 
                <Select value={time_type} className={style['custom-select']} style={{width:120, marginLeft:'14px'}} onChange={value=>{
                    dispatch({type:'quota/toggleTimeType', payload:value});
                    dispatch({type:'quota/fetchQuota'});
                }}>
                    <Option key="1" value="1">年定额</Option>
                    <Option key="2" value="2">月定额</Option>
                </Select> 
                <Select value={year}  className={style['custom-select']} style={{width:120, marginLeft:'14px'}} onChange={value=>{
                    dispatch({type:'quota/toggleYear', payload:value});
                    dispatch({type:'quota/fetchQuota'});
                }}>
                    {
                        years.map((year, index)=>(
                            <Option key={index} value={year}>{year}</Option>
                        ))
                    }
                </Select>
            </div>
            <div style={{ height:'calc( 100% - 40px)'}}>
                
                <div className={style['card-container']}>
                    <QuotaTable
                        dispatch={dispatch}
                        data={list}
                        year={year}
                        timeType={time_type}
                        pageNum={pageNum}
                        total={total}
                        isLoading={isLoading}
                        pagesize={user.pagesize}
                    />
                </div>
            </div>
            <Modal
                visible={visible}
                footer={null}
                title="定额管理导入"
                closable={false}
                destroyOnClose={true}
                onCancel={()=>{
                    dispatch({type:'quota/toggleVisible', payload:false});
                    changeFileList([]);
                }}
            >
               <Form {...layout}>
                   <Form.Item label="选择文件" name="upload">
                        <Upload 
                            fileList={fileList} 
                            onRemove={(file)=>{
                                let index = fileList.indexOf(file);
                                let newArr = fileList.slice();
                                newArr.splice(index,1);
                                changeFileList(newArr);
                            }} 
                            beforeUpload={ file => {
                              
                                let type = file.name.split('.')[1];
                                if ( type === 'xls' || type === 'xlsx' ){
                                    changeFileList([...fileList, file]);
                                } else {
                                    message.error('请上传EXCEL格式文件');
                                }
                                return false;
                            }}
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
                   </Form.Item>
                   <Form.Item label="模板下载" name="download">
                       <a onClick={()=>dispatch({type:'quota/export'})}>请上传编辑后的Excel模板<DownloadOutlined /></a>
                   </Form.Item>
                   <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
                       <Button type="primary" onClick={()=>{
                            if (!fileList.length){
                                message.error('还没有上传EXCEL文件');
                            } else {
                                dispatch({type:'quota/import', payload:{ file:fileList[0]}});
                                message.success('模板正在导入中,请稍后...');
                            }
                       }}>导入</Button>
                       <Button style={{margin:'0 10px'}} onClick={()=>dispatch({type:'quota/toggleVisible', payload:false})}>取消</Button>
                   </Form.Item>
               </Form>
            </Modal>  
        </div>
    );

    return (
        <ColumnCollapse sidebar={sidebar} content={content} />    
    )
};

QuotaManager.propTypes = {
};

export default connect( ({ user, quota, fields}) => ({ user, quota, fields}))(QuotaManager);

{/* <div className='card-container' style={{ height:'16%'}}>
                <Card title={
                        <div className='card-title'>
                            <div>定额管理</div>
                            <div className='button-container'>
                                
                            </div>                                   
                        </div>
                    }
                >
                    <QuotaSelector />
                </Card>
            </div> */}