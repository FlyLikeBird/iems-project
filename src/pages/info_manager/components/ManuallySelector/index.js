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

function ManuallySelector({ dispatch, manually, fields }){
    let { isMeterPage, current, meterType, fillType, year, time_type } = manually;
    let { fieldList, fieldAttrs, currentField, currentAttr } = fields;
    return (
        <div>            
            <div className='select-container'>
                <span>填报指标:</span>
                <Select value={+current} style={{width:120, marginLeft:'6px'}} onChange={value=>{
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
            </div>           
            <div className='select-container'>
                <span>填报方式:</span>
                <Select value={time_type} style={{width:120, marginLeft:'6px'}} onChange={value=>{
                    dispatch({type:'manually/toggleTimeType', payload:value});
                    dispatch({type:'manually/fetchInfo'});
                }}>
                    <Option key="1" value="1">按年填报</Option>
                    <Option key="2" value="2">按月填报</Option>
                </Select>
            </div>
            <div className='select-container'>
                <span>选择年份:</span>
                <Select value={year} style={{width:120, marginLeft:'6px'}} onChange={value=>{
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
        </div>                
    )
};

ManuallySelector.propTypes = {
};

export default connect( ({manually, fields}) => ({manually, fields}))(ManuallySelector);