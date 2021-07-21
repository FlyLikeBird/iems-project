import React from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Row, Col, Table, Button, Card, Modal, Drawer, Tree, Select } from 'antd';

const { Option } = Select;
let startYear = 2018;
let years = [];
for(var i=0;i<30;i++){
    let temp = ++startYear;
    years.push(temp);
}

function QuotaSelector({ dispatch, quota, fields }){
    let { year, time_type } = quota;
    let { fieldList, fieldAttrs, currentField, currentAttr } = fields;
    return (
        <div>
            {/* <div className='select-container'>
                <span>当前维度:</span>
                <Select value={currentField.field_id} style={{width:120, marginLeft:'6px'}} onChange={value=>{
                    new Promise((resolve)=>{
                        dispatch({type:'fields/toggleField', payload:{ visible:false, field:{field_id:value}}});
                        dispatch({type:'fields/fetchFieldAttrs', resolve});
                    }).then(()=>{
                        dispatch({type:'quota/fetch'});
                    })
                }}>
                    {
                        fieldList.map(field=>(
                            <Option key={field.field_id} value={field.field_id}>{field.field_name}</Option>
                        ))
                    }
                </Select>
            </div> */}
            <div className='select-container'>
                <span>定额周期:</span>
                <Select value={time_type} style={{width:120, marginLeft:'6px'}} onChange={value=>{
                    dispatch({type:'quota/toggleTimeType', payload:value});
                    dispatch({type:'quota/fetchQuota'});
                }}>
                    <Option key="1" value="1">年定额</Option>
                    <Option key="2" value="2">月定额</Option>
                </Select>
            </div>
            <div className='select-container'>
                <span>选择年份:</span>
                <Select value={year} style={{width:120, marginLeft:'6px'}} onChange={value=>{
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
        </div>                
    )
};

QuotaSelector.propTypes = {
};

export default connect( ({quota, fields}) => ({quota, fields}))(QuotaSelector);