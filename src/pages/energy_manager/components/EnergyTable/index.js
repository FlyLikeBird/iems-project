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

let timePeriod = [{ key:'total', title:'汇总' }, { key:'tipArr', title:'尖' }, { key:'topArr', title:'峰'},  {key:'middleArr', title:'平' }, { key:'bottomArr', title:'谷' }];
let dateColumns = [];

function EnergyTable({ dispatch, data, dataType, energyInfo, isLoading, timeType, currentPage, total, startDate, theme, showTimePeriod, companyName }){
    let [sourceData, setSourceData] = useState(data.value || []);
    let [isPatching, togglePatching] = useState(false);
    let [value, setValue] = useState('');
    useEffect(()=>{
        // 获取不同时间维度下的列数据
        if ( data && data.date ){
            // 日时间周期
            dateColumns = data.date.map(time=>{
                // console.log(time);
                return {
                    title:time,
                    width:'140px',
                    dataIndex:time,
                    render:(text, row)=>{
                        const renderNode = 
                        showTimePeriod
                        ?
                        (
                            <div>
                                {
                                    timePeriod.map((period, i)=>{                      
                                        return (
                                            <div style={{ display:'flex', justifyContent:'space-between', borderBottom: i === timePeriod.length - 1 ? 'none' : `1px solid ${theme==='dark' ? '#272b5c' : '#f0f0f0'}` }} key={i}>
                                                <div >{ period.title }</div>
                                                <div style={{ color:'#1890ff' }}>{ period.key === 'total' ? (+row[time]).toFixed(1) : (+row[period.key][time]).toFixed(1) }</div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        )
                        :
                        (
                            <div>
                                <span style={{ color:'#1890ff', paddingLeft:'6px' }}>{ (+row[time]).toFixed(1) }</span>
                            </div>
                        );
                        let obj = {
                            children:renderNode,
                            props:{ className : 'multi-table-cell' }
                        }
                        return obj;
                    },
                }
            })
        };
        setSourceData(data.value);
    },[data])
    
    const columns = [
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return `${ ( currentPage - 1) * 12 + index + 1}`;
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
            width:'120px',
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
            rowKey='attr_id'
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
                            let fileTitle = `统计报表-${ dataType === '1' ? '成本' : '能耗' }报表`;
                            if ( isLoading ){
                                message.info('正在加载数据，请稍后');
                                return ;
                            } else {
                                if ( !data.value.length ){
                                    message.info('数据源为空');
                                } else {
                                    new Promise((resolve, reject)=>{
                                        dispatch({ type:'costReport/exportCostReport', payload:{ resolve, reject }})
                                    })
                                    .then((data)=>{
                                        let aoa = [];
                                        let thead = [];
                                        let colsStyle = [];
                                        
                                        thead.push('序号','属性','能源类型', '能源单位', '产量', '目标单耗','实际单耗','能耗汇总');                                    
                                        data.date.forEach(time=>{
                                            thead.push(time);
                                            if ( showTimePeriod ){
                                                thead.push(null);
                                            }
                                        });
                                        thead.push('注册码', '配电房', '相关属性', '相关属性2');
                                        thead.forEach(()=>{
                                            colsStyle.push({ wch:16 });
                                        })
                                        aoa.push(thead);
                                        if ( showTimePeriod ){
                                            // 按尖峰平谷时段展开
                                            data.value.forEach((row, i)=>{
                                                timePeriod.forEach((period, j)=>{
                                                    let temp = [];
                                                    if ( j === 0 ){
                                                        temp.push( i + 1);
                                                        temp.push(row.attr_name);
                                                        temp.push(row.energy_name);
                                                        temp.push(dataType === '1' ? '元' : energyInfo.unit );
                                                        temp.push(row.productNum || '--');
                                                        temp.push(row.target || '--');
                                                        temp.push(row.productNum ? (row.total / row.productNum).toFixed(3) : '--');
                                                        temp.push(row.total);
                                                    } else {
                                                        temp.push(null);
                                                        temp.push(null);
                                                        temp.push(null);
                                                        temp.push(null);
                                                        temp.push(null);
                                                        temp.push(null);
                                                        temp.push(null);
                                                        temp.push(null);
                                                    }
                                                    data.date.forEach(time=>{
                                                        temp.push(period.title);
                                                        temp.push(period.key === 'total' ? (+row[time]).toFixed(1) : (+row[period.key][time]).toFixed(1) );
                                                    });
                                                    temp.push(row.regcode || '--');
                                                    temp.push(row.ele_room || '--');
                                                    temp.push(row.other_attr || '--');
                                                    temp.push(row.other_attr2 || '--');
                                                    aoa.push(temp);
                                                })      
                                            })
                                        } else {
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
                                        }
                                        // console.log(aoa);
                                        var sheet = XLSX.utils.aoa_to_sheet(aoa);
                                        sheet['!cols'] = colsStyle;
                                        downloadExcel(sheet, fileTitle + '.xlsx' );
                                    })
                                    .catch(msg=>message.error(msg));
                                }
                               
                            }
                        }}>导出报表</Button>
                    </div>
                )
            }} 
            scroll={ { x:1000 }}
            onChange={(pagination)=>{
                dispatch({ type:'costReport/fetchCostReport', payload:{ currentPage:pagination.current }});
            }}
            pagination={{ 
                total:total, 
                current:currentPage,
                pageSize:12,
                showSizeChanger:false                
            }}
        />
    )
};

export default React.memo(EnergyTable);