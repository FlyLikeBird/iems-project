import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Modal, Drawer, Tree, Select, Tabs, Spin, Radio, Form, Upload, Skeleton, message } from 'antd';
import { FireOutlined, DownloadOutlined, DoubleLeftOutlined, DoubleRightOutlined, PlusOutlined } from '@ant-design/icons'
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import ManuallySelector from '../components/ManuallySelector';
import ManuallyTable from '../components/ManuallyTable';
import style from '../../IndexPage.css';
const { TabPane } = Tabs;
const { Option } = Select;
let startYear = 2018;
let years = [];
for(var i=0;i<30;i++){
    let temp = ++startYear;
    years.push(temp);
}

function OperateInfoManager({ dispatch, user, manually, fields }){
    let { allFields, currentField, currentAttr, treeLoading } = fields;
    let { fillType, currentFillType, total, visible, current, isMeterPage, meterType, year, time_type, isLoading } = manually;
    let fieldList = allFields['ele'] ? allFields['ele'].fieldList : [];
    let fieldAttrs = allFields['ele'] && allFields['ele'].fieldAttrs ? allFields['ele']['fieldAttrs'][currentField.field_name] : [];
    let [fileList, changeFileList] = useState([]);
    const layout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
    };
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'manually/reset'});
        }
    },[])
    const sidebar = (
        <div>
            <div className={style['card-container']}>
                <Tabs className={style['custom-tabs']} activeKey={currentField.field_id + ''} onChange={activeKey=>{
                        let field = fieldList.filter(i=>i.field_id == activeKey )[0];
                        dispatch({type:'fields/toggleField', payload:{ visible:false, field } });
                    new Promise((resolve)=>{
                        dispatch({type:'fields/fetchFieldAttrs', resolve })
                    }).then((attrs)=>{
                        dispatch({type:'manually/fetchInfo', payload:{ page:1 }});
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
                                        defaultExpandAll={true}
                                        selectedKeys={[currentAttr.key]}
                                        treeData={fieldAttrs}
                                        onSelect={(selectedKeys, {node})=>{
                                            dispatch({type:'fields/toggleAttr', payload:node});
                                            dispatch({type:'manually/fetchInfo', payload:{ page:1 }});
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
    const content = (

        <div>
            <div style={{ height:'40px', display:'flex' }} >
                <Select className={style['custom-select']} value={+current} style={{width:120, marginRight:'20px' }} onChange={value=>{
                    // dispatch(routerRedux.push(`/info_manage_menu/manual_input/${ isMeterPage ? 'manualMeter' : 'operateInfo' }/${value}`));
                    dispatch({type:'manually/toggleFillType', payload:value })
                    dispatch({type:'manually/fetchInfo'});
                }}>
                    {
                        isMeterPage 
                        ?                      
                        meterType.map( type =>(
                            <Option key={type.type_id} value={type.type_id}>{type.type_name}</Option>
                        ))
                        :
                        fillType.map( type =>(
                            <Option key={type.type_id} value={type.type_id}>{type.type_name}</Option>
                        ))
                    }
                </Select>
                <Select value={time_type} className={style['custom-select']} style={{width:120, marginRight:'20px'}} onChange={value=>{
                    dispatch({type:'manually/toggleTimeType', payload:value});
                    dispatch({type:'manually/fetchInfo'});
                }}>
                    <Option key="1" value="1">年定额</Option>
                    <Option key="2" value="2">月定额</Option>
                </Select> 
                <Select value={year}  className={style['custom-select']} style={{width:120, marginRight:'20px'}} onChange={value=>{
                    dispatch({type:'manually/toggleYear', payload:value});
                    dispatch({type:'manually/fetchInfo'});
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
                {
                    isLoading 
                    ?
                    <Skeleton active className={style['skeleton']} />
                    :
                    <ManuallyTable manually={manually} dispatch={dispatch} pagesize={user.pagesize} />
                }
                </div>
            </div>
            <Modal
                visible={visible}
                footer={null}
                title="填报信息导入"
                closable={false}
                destroyOnClose={true}
                onCancel={()=>dispatch({type:'manually/toggleVisible', payload:false})}
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
                       <a onClick={()=>dispatch({type:'manually/export'})}>请上传编辑后的Excel模板<DownloadOutlined /></a>
                   </Form.Item>
                   <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
                       <Button type="primary" onClick={()=>{
                            if (!fileList.length){
                                message.error('还没有上传EXCEL文件');
                            } else {
                                dispatch({type:'manually/import', payload:{ file:fileList[0]}})
                            }
                       }}>导入</Button>
                       <Button style={{margin:'0 10px'}} onClick={()=>dispatch({type:'manually/toggleVisible', payload:false})}>取消</Button>
                   </Form.Item>
               </Form>
            </Modal> 
            
            
        </div>
    )
    return (
        <ColumnCollapse sidebar={sidebar} content={content} />       
    )
};

OperateInfoManager.propTypes = {
};

export default connect( ({ user, manually, fields}) => ({ user, manually, fields}))(OperateInfoManager);

{/* <div className='card-title'>
                            <div>手工填报</div>
                            <div className='button-container'>
                                <Button size="small" type="primary" onClick={()=>dispatch({type:'manually/toggleVisible', payload:true})}>导入模板</Button>
                                <Button size="small" type="primary" style={{marginLeft:'10px'}} onClick={()=>dispatch({type:'manually/export'})}>导出模板</Button>
                            </div>                                   
                        </div> */}