import React, { useState, useRef, useContext, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Modal, Drawer, Tree, Select, Form, Popconfirm, Input, message } from 'antd';
import style from '../../../IndexPage.css';

const EditableContext = React.createContext();

function validator(a, value){
    if(+value >= 0 ){
        return Promise.resolve();
    } else {
        return Promise.reject('请输入大于等于0的数值')
    }
}

const EditableRow = ({ index, ...props}) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    )
}

const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    sourceData,
    setSourceData,
    ...restProps
})=>{
    const [editing, setEditing] = useState(false);
    const inputRef = useRef();
    const form = useContext(EditableContext);
    const handleEdit = ()=>{
        setEditing(!editing);
        form.setFieldsValue({
            [dataIndex]:record[dataIndex]
        });
    };
    const save = ()=>{
        form.validateFields()
        .then(values=>{ 
            if( values[dataIndex] === record[dataIndex] ) {
                setEditing(false);
                return;
            }
            if ( values[dataIndex] >= 0 ){
                handleSave(values, record, dataIndex)
                .then(()=>setEditing(false))
            } else {
                message.info('请输入合适的值');
                return;
            }
            
        })
        .catch(err=>{
            console.log(err);
        })
    }
    useEffect(()=>{
        if(editing){
            inputRef.current.focus();
        }
    },[editing]);
    let childNode = children;
    if ( editable ) {
        childNode = editing ? (
            <Form.Item style={{ margin:'0' }} name={dataIndex} >
                <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        )
        :
        (
            <div className='editable-cell-value-wrapper' onClick={handleEdit}>
                { children }
            </div>
        )
    }
    return <td {...restProps}>{ childNode }</td>
}

function createMonthCols(year){
    let monthCols = [];
    for(var i=1;i<13;i++){
        let key = `month_${i}`;
        let obj = { width:120, title:`${year}年-${i}月`, dataIndex:key, key, editable:true };
        monthCols.push(obj);
    } 
    return monthCols;
}
function createDayCols(year, month){
    let today = new Date(year,month,0).getDate();
    let dayCols = [];
    month = Math.round(month);
    for(var i=1;i<=today;i++){
        let key = `day_${i}`;
        let obj = { width:120, title:`${month}月-${i}号`, dataIndex:key, key, editable:true };
        dayCols.push(obj);
    } 
    return dayCols;
}
function ManuallyTable({ dispatch, manually, currentAttr,  pagesize }){
    let { list, fillDate, time_type, current, pageNum, total, isLoading, isMeterPage, fillType, meterType } = manually;  
    let info = isMeterPage ? meterType.filter(i=>i.type_id === +current )[0] : fillType.filter(i=>i.type_id === +current)[0];
    let [form] = Form.useForm();
    let [sourceData, setSourceData] = useState(list);
    let dateArr = fillDate.format('YYYY-MM').split('-');
    useEffect(()=>{
        setSourceData(list);
    },[list]);
    let timeMode = time_type === '1' ? 'year' : time_type === '2' ? 'month' : 'day';
    let temp = timeMode === 'year'
                ?
                [ { width:150, title:`${dateArr[0]}年`, dataIndex:'fill_value', key:'year', editable:true }]
                :
                timeMode === 'month'
                ?
                createMonthCols(dateArr[0])
                :
                createDayCols(dateArr[0], dateArr[1])
    const columns = [
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return `${ ( pageNum - 1) * pagesize + index + 1}`;
            }
        },
        { width:150, fixed:'left', title:'填报主体', dataIndex:'attr_name', key:'attr_name', ellipsis:true },
        { width:120, fixed:'left', title:'数值单位', dataIndex:'type_unit', key:'type_unit' },
        ...temp
    ];
    const handleSave = (values, record, dataIndex, forDelete)=>{
        return new Promise(( resolve, reject)=>{
            dispatch({ type:'manually/save', payload:{ value:time_type === '1' ? values['fill_value'] : values[dataIndex], currentKey:record.attr_id, type_id:current, dataIndex, time_type, fillDate, forDelete, resolve, reject }})
        })
        .then(()=>{
            // 更新sourceData
            let newArr = sourceData.map(item=>{
                if ( item.attr_id === record.attr_id ) {
                    item[dataIndex] = values[dataIndex];
                } 
                return item;
            });
            setSourceData(newArr);
        })
        .catch(msg=>message.error(msg))
    }

    const mergedColumns = columns.map(col=>{
        if(!col.editable){
            return col;
        }
        return {
            ...col,
            onCell: record=>({
                record,
                editable:col.editable,
                dataIndex:col.dataIndex,
                title:col.title,
                handleSave
            })
        }
    });
    return (
        <Table
            bordered={true}
            columns={mergedColumns}
            dataSource={sourceData}
            components={{
                body:{
                    row:EditableRow,
                    cell:EditableCell
                }
            }}
            className={style['self-table-container']}
            rowKey='attr_id'
            scroll={{ x:1000 }}
            title={()=>{
                return (
                    <div style={{ display:'flex', justifyContent:'space-between'}}>
                        <div>{ `${info.type_name}填报设置`}</div>
                        <div>
                            <Button size="small" type="primary" onClick={()=>dispatch({type:'manually/toggleVisible', payload:true})}>导入模板</Button>
                            <Button size="small" type="primary" style={{marginLeft:'10px'}} onClick={()=>{
                                dispatch({type:'manually/export'});
                                message.info('模板生成中，请稍后...');
                            }}>导出模板</Button>
                        </div>
                    </div>
                )
            }} 
            pagination={{ current:pageNum, total, pageSize:pagesize, showSizeChanger:false }}
            onChange={pagination=>{
                dispatch({type:'manually/fetchInfo', payload:{ page:pagination.current }});

            }}
            loading={isLoading}
        />
    )
};

ManuallyTable.propTypes = {
};

export default ManuallyTable;