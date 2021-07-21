import React, { useState, useContext, useRef, useEffect } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Card, Modal, Drawer, Tree, Select, Form, Popconfirm, Input, message } from 'antd';
import style from '../../../IndexPage.css';
import Loading from '@/pages/components/Loading';

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
            handleSave(values, record, dataIndex)
            .then(()=>setEditing(false))
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
            <Form.Item style={{ margin:'0' }} name={dataIndex} rules={[{ validator }]}>
                <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        )
        :
        (
            <div className={style['editable-cell-value-wrapper']} onClick={handleEdit}>
                { children }
            </div>
        )
    }
    return <td {...restProps}>{ childNode }</td>
}

function createMonthCols(row){
    let monthCols = [];
    if (row){     
        for(var i=1;i<13;i++){
            let key = `month_${i}`;
            let obj = { width:120, title:`${i}月`, dataIndex:key, key, editable:true, render:value=> value ? Math.floor(value) : '0' };
            monthCols.push(obj);
        }
    } 
    return monthCols;
}

function QuotaTable({ dispatch, data, year, timeType, pageNum, total, isLoading, pagesize }){
    let [editingKey, setEditingKey] = useState('');
    let [sourceData, setSourceData] = useState(data);
    useEffect(()=>{
        setSourceData(data);
    },[data])
    let yearMode = timeType === '1' ? true : false;
    let temp = yearMode
                ?
                [ { width:120, title:`${year}年`, dataIndex:'fill_value', key:'year', render:value=> value ? Math.floor(value) : '0', editable:true }]
                :
                createMonthCols(data.length && data[0]);
    const columns = [
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return `${ ( pageNum - 1) * pagesize + index + 1}`;
            }
        },
        { width:140, fixed:'left', title:'定额主体', dataIndex:'attr_name', key:'attr_name', ellipsis:true },
        {
            title:'定额类别',
            key:'type_name',
            width:120,
            fixed:'left',
            render:row=>`${row.type_name} (${row.type_unit})`
        },
        ...temp
    ];
    
    const handleSave = (values, record, dataIndex, forDelete)=>{
        // console.log(values);
        // console.log(dataIndex);
        return new Promise(( resolve, reject)=>{
            dispatch({ type:'quota/save', payload:{ values, currentKey:record.attr_id, dataIndex, forDelete, resolve, reject }})
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
        <div style={{ height:'100%', position:'relative' }}>
            {
                isLoading 
                ?
                <Loading />
                :
                null
            }
        <Table
            className={style['self-table-container']}
            bordered={true}
            columns={mergedColumns}
            dataSource={sourceData}
            components={{
                body:{
                    row:EditableRow,
                    cell:EditableCell
                }
            }}
            rowKey='attr_id'
            scroll={{ x:1000 }}
            title={()=>{
                return (
                    <div style={{ display:'flex', justifyContent:'space-between'}}>
                        <div>{ `${timeType === '1' ? '年定额' : '月定额'}设置`}</div>
                        <div>
                            <Button size="small" type="primary" onClick={()=>dispatch({type:'quota/toggleVisible', payload:true})}>导入模板</Button>
                            <Button size="small" type="primary" style={{marginLeft:'10px'}} onClick={()=>dispatch({type:'quota/export'})}>导出模板</Button>
                        </div>
                    </div>
                )
            }} 
            pagination={{ current:pageNum, total, pageSize:pagesize, showSizeChanger:false }}
            onChange={pagination=>{
                dispatch({ type:'quota/setPageNum', payload:pagination.current });
                dispatch({type:'quota/fetchQuota' });
            }}
        />
        </div>
    )
};

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.isLoading !== nextProps.isLoading || prevProps.pagesize !== nextProps.pagesize ) {
        return false;
    } else {
        return true;
    }
}
export default React.memo(QuotaTable, areEqual);