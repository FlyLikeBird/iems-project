import React, { useState, useEffect, useRef, useContext } from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Row, Col, Table, Button, Input, Skeleton, Form, message } from 'antd';
import style from '@/pages/IndexPage.css';
import { downloadExcel } from '@/pages/utils/array';
import XLSX from 'xlsx';

const EditableContext = React.createContext();
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
            .then(()=>{
                setEditing(false);
            })
            
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
            <Form.Item style={{ margin:'0' }} name={dataIndex}>
                <Input style={{ whiteSpace:'nowrap' }} ref={inputRef} onPressEnter={save} onBlur={save} />
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

function EnergyTable({ dispatch, data, dataType, energyInfo, isLoading, timeType, pagesize, startDate, companyName }){
    const [currentPage, setCurrentPage] = useState(1);
    let [sourceData, setSourceData] = useState(data.value);
    let [isPatching, togglePatching] = useState(false);
    let [value, setValue] = useState('');
    useEffect(()=>{
        setSourceData(data.value);
        setCurrentPage(1);
    },[data])
    let dateColumns = [];
    // console.log(energyInfo);
    // 获取不同时间维度下的列数据
    if ( !isLoading && data && data.date ){
        // 日时间周期
        dateColumns = data.date.map(time=>{
            return {
                title:time,
                width:'140px',
                render:(text)=>(<span style={{color:'#1890ff'}}>{ (+text).toFixed(1) } </span>),
                dataIndex:time
            }
        })
    };
    const columns = [
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return `${ ( currentPage - 1) * pagesize + index + 1}`;
            }
        },
        {
            title:'属性',
            key:'attr_name',
            width:'180px',
            fixed:'left',
            dataIndex:'attr_name',
            ellipsis: true,
        },
        {
            title:'能源类型',
            width:'80px',
            key:'energy_name',
            dataIndex:'energy_name'
        },
        {
            title:'能源单位',
            width:'80px',
            key:'unit',
            render:(row)=>{
                return <span>{ dataType === '1' ? '元' : energyInfo.unit }</span>;
            }
        },
        {
            title:'产量',
            width:'100px',
            dataIndex:'productNum',
            editable:true,
            render:value=>(<span>{ value || '-- --'}</span>)
        },
        {
            title:'目标单耗',
            width:'100px',
            dataIndex:'target',
            editable:true,
            render:value=>(<span>{ value || '-- --'}</span>)
        },
        {
            title:'实际单耗',
            width:'100px',
            key:'single_cost',
            render:(row)=>{
                let result = +row.productNum ? (row.total / row.productNum ).toFixed(3) : '-- --';
                return <span>{ result }</span>
            }
        },
        {
            title: dataType === '1' ? '费用汇总' : '能耗汇总',
            key:'total',
            width:'100px',
            dataIndex:'total',
            render:(text)=>(<span style={{color:'#1890ff'}}>{ (+text).toFixed(1) } </span>)
        },
        // {
        //     title:'尖',
        //     key:'tip',
        //     width:'100px',
        //     dataIndex:'tip',
        //     render:(text)=>(<span style={{color:'#1890ff'}}>{ text ? (+text).toFixed(1) : '--' } </span>)

        // },
        // {
        //     title:'峰',
        //     key:'top',
        //     width:'100px',
        //     dataIndex:'top',
        //     render:(text)=>(<span style={{color:'#1890ff'}}>{ text ? (+text).toFixed(1) : '--' } </span>)
        // },
        // {
        //     title:'平',
        //     key:'middle',
        //     width:'100px',
        //     dataIndex:'middle',
        //     render:(text)=>(<span style={{color:'#1890ff'}}>{ text ? (+text).toFixed(1) : '--' } </span>)
        // },
        // {
        //     title:'谷',
        //     key:'bottom',
        //     width:'100px',
        //     dataIndex:'bottom',
        //     render:(text)=>(<span style={{color:'#1890ff'}}>{ text ? (+text).toFixed(1) : '--' } </span>)
        // },
        ...dateColumns,
        {
            title:'注册码',
            width:'120px',
            key:'regcode',
            dataIndex:'regcode',
            ellipsis:true
        },
        energyInfo.type_code === 'ele'
        ?
        {
            title:'配电房',
            width:'120px',
            key:'ele_room',
            dataIndex:'ele_room'
        }
        :
        {}
        ,
        {
            title:'相关属性',
            key:'related',
            width:'120px',
            dataIndex:'other_attr',
            ellipsis: true,
        },
        {
            title:'相关属性2',
            key:'related',
            width:'120px',
            dataIndex:'other_attr2',
            ellipsis: true
        }
    ];
    function handleSave(values, record, dataIndex ){
        // console.log(values, record, dataIndex);
        let time_type = timeType === '1' ? '3' : timeType === '3' ? '1' : '2';
        let dateArr = startDate.format('YYYY-MM-DD').split('-');
        let key = timeType === '2' ? `month_${dateArr[1]}` : timeType === '1' ? `day_${dateArr[2]}` : '';
        // console.log(key);
        if ( dataIndex === 'productNum') {
            return new Promise(( resolve, reject)=>{
                dispatch({ type:'manually/save', payload:{ value:values[dataIndex], currentKey:record.attr_id, type_id:5, dataIndex:key, time_type, fillDate:startDate, resolve, reject }})
            })
            .then(()=>{
                let newArr = sourceData.map(item=>{
                    if ( item.attr_id === record.attr_id ) {
                        item[dataIndex] = values[dataIndex];
                    } 
                    return item;
                });
                setSourceData(newArr);
            })
            .catch(msg=>message.info(msg))
        } else if ( dataIndex === 'target' ) {
            return new Promise((resolve, reject)=>{
                dispatch({ type:'costReport/setProduct', payload:{ attr_id:record.attr_id, time_type, target:values[dataIndex], year:dateArr[0], month:dateArr[1], day:dateArr[2], resolve, reject }})
            })
            .then(()=>{
                let newArr = sourceData.map(item=>{
                    if ( item.attr_id === record.attr_id ) {
                        item[dataIndex] = values[dataIndex];
                    } 
                    return item;
                });
                setSourceData(newArr);
            })
            .catch(msg=>message.info(msg))
        }
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
            columns={mergedColumns}
            dataSource={sourceData}
            rowKey={(text,record)=>text.attr_name}
            className={style['self-table-container']}
            bordered={true}
            components={{
                body:{
                    row:EditableRow,
                    cell:EditableCell
                }
            }}
            title={()=>{
                return (
                    <div style={{ display:'flex', justifyContent:'space-between'}}>
                        <div>
                            <span>{ `${companyName}能源${ dataType === '1' ? '成本' : '能耗' }报表`}</span>
                            {
                                isPatching 
                                ?
                                <span style={{ margin:'0 10px'}}>
                                    <Input size='small' style={{ width:'120px', marginRight:'6px' }} value={value} onChange={e=>setValue(e.target.value)} />
                                    <Button size='small' type='primary' style={{ marginRight:'6px' }} onClick={()=>{
                                        let time_type = timeType === '1' ? '3' : timeType === '3' ? '1' : '2';
                                        let dateArr = startDate.format('YYYY-MM-DD').split('-');
                                        let key = timeType === '2' ? `month_${dateArr[1]}` : timeType === '1' ? `day_${dateArr[2]}` : '';
                                        new Promise(( resolve, reject)=>{
                                            dispatch({ type:'manually/save', payload:{ forPatch:true, value:value, attr_ids:sourceData.map(i=>i.attr_id), type_id:5, dataIndex:key, time_type, fillDate:startDate, resolve, reject }})
                                        })
                                        .then(()=>{
                                            let newArr = sourceData.map(item=>{
                                                item['productNum'] = value;
                                                return item;
                                            });
                                            setSourceData(newArr);
                                            togglePatching(false);
                                        })
                                        .catch(msg=>message.info(msg))
                                                                     
                                    }}>录入</Button>
                                    <Button size='small' onClick={()=>{
                                        togglePatching(false);
                                    }}>取消</Button>
                                </span>
                                :
                                <Button style={{ margin:'0 10px' }} size='small' type='primary' onClick={()=>togglePatching(true)}>批量录入产量</Button>
                            }
                        </div>
                        <Button size="small" type="primary" onClick={()=>{
                            if ( isLoading ){
                                message.info('正在加载数据，请稍后');
                                return ;
                            } else {
                                if ( !data.value.length ){
                                    message.info('数据源为空');
                                } else {
                                    let fileTitle = `统计报表-${ dataType === '1' ? '成本' : '能耗' }报表`;
                                    let aoa = [];
                                    let thead = [];
                                    let colsStyle = [];
                                    columns.forEach(col=>{
                                        thead.push(col.title);
                                        colsStyle.push({ wch:16 });
                                    });
                                    aoa.push(thead);
                                    data.value.forEach((item,index)=>{
                                        let temp = [];
                                        temp.push(index + 1);
                                        columns.forEach((col,j)=>{
                                            if ( col.dataIndex ){                                              
                                               temp.push(item[col.dataIndex] || '-- --');                                   
                                            } else if ( col.key === 'unit') {
                                                temp.push(dataType === '1' ? '元' : energyInfo.unit )
                                            } else if ( col.key === 'single_cost') {
                                                let result = item.productNum ? (item.total / item.productNum).toFixed(3) : '-- --';
                                                temp.push(result);
                                            }
                                        })
                                        aoa.push(temp);
                                    });
                                    // console.log(aoa);
                                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                                    sheet['!cols'] = colsStyle;
                                    downloadExcel(sheet, fileTitle + '.xlsx' );
                                }
                               
                            }
                        }}>导出报表</Button>
                    </div>
                )
            }} 
            scroll={ { x:1000 }}
            onChange={(pagination)=>{
                setCurrentPage(pagination.current);
            }}
            pagination={{ 
                total:data.value ? data.value.length : 0, 
                current:currentPage,
                pageSize:pagesize,
                showSizeChanger:false                
            }}
        />
    )
};

EnergyTable.propTypes = {
};

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(EnergyTable, areEqual);