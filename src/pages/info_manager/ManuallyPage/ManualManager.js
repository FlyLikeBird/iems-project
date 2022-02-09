import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, DatePicker, Card, Modal, Drawer, Tree, Select, Tabs, Spin, Radio, Form, Upload, Skeleton, message } from 'antd';
import { FireOutlined, DownloadOutlined, DoubleLeftOutlined, DoubleRightOutlined, PlusOutlined } from '@ant-design/icons'
import ColumnCollapse from '@/pages/components/ColumnCollapse';
import ManuallySelector from '../components/ManuallySelector';
import ManuallyTable from '../components/ManuallyTable';
import style from '../../IndexPage.css';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
import moment from 'moment';
const { TabPane } = Tabs;
const { Option } = Select;

function OperateInfoManager({ dispatch, user, manually, fields }){
    let { allFields, currentField, currentAttr, energyList, energyInfo, expandedKeys, treeLoading } = fields;
    let { fillType, currentFillType, total, visible, current, isMeterPage, meterType, fillDate, time_type, isLoading } = manually;
    let fieldList = allFields[energyInfo.type_code] ? allFields[energyInfo.type_code].fieldList : [];
    let fieldAttrs = allFields[energyInfo.type_code] && allFields[energyInfo.type_code].fieldAttrs ? allFields[energyInfo.type_code]['fieldAttrs'][currentField.field_name] : [];
    let [fileList, changeFileList] = useState([]);
    const layout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
    };
    useEffect(()=>{
        return ()=>{
            dispatch({ type:'manually/reset'});
        }
    },[]);
    const inputRef = useRef();
    const sidebar = (
            <div className={style['card-container']}>
                <Tabs className={style['custom-tabs']} activeKey={energyInfo.type_id} onChange={activeKey=>{
                    let temp = energyList.filter(i=>i.type_id === activeKey)[0];
                    dispatch({ type:'fields/toggleEnergyInfo', payload:temp });
                    new Promise((resolve, reject)=>{
                        dispatch({ type:'fields/init', payload:{ resolve, reject }})
                    })
                    .then(()=>{
                        dispatch({type:'manually/fetchInfo', payload:{ page:1 }});
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
                                            dispatch({type:'manually/fetchInfo', payload:{ page:1 }});
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
                                                            dispatch({type:'manually/fetchInfo', payload:{ page:1 }});
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
    );
    const content = (

        <div>
            <div style={{ height:'40px', display:'flex' }} >
                <Select className={style['custom-select']} value={+current} style={{width:120, marginRight:'20px' }} onChange={value=>{
                    // dispatch(routerRedux.push(`/info_manage_menu/manual_input/${ isMeterPage ? 'manualMeter' : 'operateInfo' }/${value}`));
                    dispatch({type:'manually/toggleFillType', payload:value });
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
                    <Option key="3" value="3">日定额</Option>
                </Select>
                <DatePicker ref={inputRef} className={style['custom-date-picker']} picker='month' value={fillDate} locale={zhCN} allowClear={false} onChange={value=>{
                    dispatch({ type:'manually/toggleFillDate', payload:value });
                    dispatch({type:'manually/fetchInfo'});
                    if ( inputRef.current && inputRef.current.blur ) inputRef.current.blur();
                }}  />
                {/* <Select value={year}  className={style['custom-select']} style={{width:120, marginRight:'20px'}} onChange={value=>{
                    dispatch({type:'manually/toggleYear', payload:value});
                    dispatch({type:'manually/fetchInfo'});
                }}>
                    {
                        years.map((year, index)=>(
                            <Option key={index} value={year}>{year}</Option>
                        ))
                    }
                </Select> */}
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
                onCancel={()=>{
                    dispatch({type:'manually/toggleVisible', payload:false});
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
                       <a onClick={()=>dispatch({type:'manually/export'})}>请上传编辑后的Excel模板<DownloadOutlined /></a>
                   </Form.Item>
                   <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 6 }}>
                       <Button type="primary" onClick={()=>{
                            if (!fileList.length){
                                message.error('还没有上传EXCEL文件');
                            } else {
                                dispatch({type:'manually/import', payload:{ file:fileList[0]}});
                                message.success('模板正在导入中,请稍后...');
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