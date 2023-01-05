import React, { useRef, useEffect, useState } from 'react';
import ReactEcharts from 'echarts-for-react';
import { Radio, Form, Input, Button, Modal, message, Tag } from 'antd';
import { PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import { findMaxAndMin, downloadExcel } from '@/pages/utils/array';
import style from '@/pages/IndexPage.css';
import html2canvas  from 'html2canvas';
import XLSX from 'xlsx';

function EffLineChart({ data, info, currentAttr, typeRule, startDate, timeType, theme, dispatch }){
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const seriesData = [];
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let echartsRef = useRef();
    seriesData.push({
        type:'bar',
        barWidth:14,
        name:info.tab,
        data:data.value,
        itemStyle:{
            color:'#0d9bfe'
        },
        symbolSize:0,
    });
    seriesData.push({
        type:'bar',
        barWidth:14,
        name:'同比',
        data:data.sameValue,
        itemStyle:{ color:'#71bef4'},
        symbolSize:0
    });
    seriesData.push({
        type:'bar',
        barWidth:14,
        name:'环比',
        data:data.lastValue,
        itemStyle:{ color:'#67ed9a'},
        symbolSize:0
    });
    if ( typeRule && typeRule.warning_min ){
        seriesData.push({
            type:'line',
            symbol:'none',
            itemStyle:{
                color:'#6ec71e'
            },
            data:data.date.map(i=>typeRule.warning_min),
            markPoint:{
                symbol:'rect',
                symbolSize:[100,20],
                data:[ { value:'下限值: '+ typeRule.warning_min, xAxis:data.date.length-2, yAxis:typeRule.warning_min } ],
            },
            lineStyle:{
                type:'dashed'
            },
            tooltip:{ show:false }
        });
    }
    if ( typeRule && typeRule.warning_max ){
        seriesData.push({
            type:'line',
            symbol:'none',
            itemStyle:{
                color:'#ff2d2e'
            },
            data:data.date.map(i=>typeRule.warning_max),
            markPoint:{
                symbol:'rect',
                symbolSize:[100,20],
                data:[ { value:'上限值: '+ typeRule.warning_max, xAxis:data.date.length-2, yAxis:typeRule.warning_max } ],
            },
            lineStyle:{
                type:'dashed'
            },
            tooltip:{ show:false }
        });
    }
    useEffect(()=>{
        if ( visible ){
            form.setFieldsValue({
                warning_min:typeRule && typeRule.warning_min ? typeRule.warning_min : null,
                warning_max:typeRule && typeRule.warning_max ? typeRule.warning_max : null
            })
        }
    },[visible])
    return (
        <div style={{ height:'100%', position:'relative' }}>
            <div style={{ position:'absolute', right:'90px', top:'6px' }} className={style['custom-btn']} onClick={()=>setVisible(true)} >告警设置</div>   
            <Modal
                visible={visible}
                bodyStyle={{ padding:'2rem 4rem' }}
                footer={null}
                onCancel={()=>setVisible(false)}
            >
                <Form
                    form={form}
                    labelCol={{
                      span: 6,
                    }}
                    wrapperCol={{
                      span: 18,
                    }}
                    onFinish={values=>{
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'carbon/setRule', payload:{ resolve, reject, warning_min:values.warning_min, warning_max:values.warning_max, warning_type:info.warning_type }})
                        })
                        .then(()=>{
                            setVisible(false);
                            form.resetFields();
                        })
                        .catch(msg=>message.error(msg))
                    }}
                >
                    <Form.Item label='当前节点' name='attr_id'>
                        <Tag>{ currentAttr.title }</Tag>
                    </Form.Item>
                    <Form.Item label='当前属性' name='type_code'>
                        <Tag>{ info.tab }</Tag>
                    </Form.Item>
                    <Form.Item label='告警下限值' name='warning_min' rules={[{ type:'number', message:'请输入数值类型', transform(value){ if(value) return Number(value) } }]}>
                        <Input style={{ width:'100%' }} addonAfter={info.unit} />
                    </Form.Item> 
                    <Form.Item label='告警上限值' name='warning_max' rules={[{ type:'number', message:'请输入数值类型', transform(value){ if(value) return Number(value) } }]}>
                        <Input style={{ width:'100%' }} addonAfter={info.unit} />
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                        <Button onClick={()=>setVisible(false)} style={{ marginRight:'0.5rem' }}>取消</Button>
                        <Button type="primary" htmlType="submit">设置</Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-button']} value='data' onChange={e=>{
                let value = e.target.value;
                let fileTitle = `能效竞争力-${info.tab}`;
                if ( value === 'download' && echartsRef.current ){
                    html2canvas(echartsRef.current.ele, { allowTaint:false, useCORS:false, backgroundColor: theme === 'dark' ? '#191932' : '#fff' })
                    .then(canvas=>{
                        let MIME_TYPE = "image/png";
                        let url = canvas.toDataURL(MIME_TYPE);
                        let linkBtn = document.createElement('a');
                        linkBtn.download = fileTitle ;          
                        linkBtn.href = url;
                        let event;
                        if( window.MouseEvent) {
                            event = new MouseEvent('click');
                        } else {
                            event = document.createEvent('MouseEvents');
                            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                        }
                        linkBtn.dispatchEvent(event);
                    })
                    return ;
                }
                if ( value === 'excel' ) {
                    var aoa = [], thead = ['对比项', '单位'];
                    let dateArr = startDate.format('YYYY-MM-DD').split('-');
                    let prefix = timeType === '1' ? `${dateArr[0]}-${dateArr[1]}-${dateArr[2]} ` : timeType === '2' ? `${dateArr[0]}-${dateArr[1]}-` : `${dateArr[0]}-`;
                    data.date.forEach(i=>{
                        thead.push(prefix + i);
                    });
                    aoa.push(thead);
                    seriesData.forEach(i=>{
                        let temp = [];
                        temp.push(i.name);
                        temp.push(info.unit);
                        temp.push(...i.data);
                        aoa.push(temp);
                    });
                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                    downloadExcel(sheet, fileTitle + '.xlsx' );
                    return ;
                }
            }}>
                
                <Radio.Button value='download'><PictureOutlined /></Radio.Button>
                <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button>
            </Radio.Group>
            <ReactEcharts
                ref={echartsRef}
                notMerge={true}
                style={{ width:'100%', height:'100%' }}
                option={{
                    grid:{
                        top:60,
                        bottom:20,
                        left:20,
                        right:20,
                        containLabel:true
                    },
                    tooltip:{
                        trigger:'axis'
                    },
                    legend:{
                        top:10,
                        data:[info.tab, '同比', '环比'],
                        textStyle:{ color:textColor }
                    },
                    xAxis:{
                        type:'category',
                        axisTick:{ show:false },
                        axisLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        },
                        axisLabel:{
                            color:textColor
                        },
                        data:data.date
                    },
                    yAxis:{
                        type:'value',
                        name:info.unit,
                        nameTextStyle:{
                            color:textColor
                        },
                        axisTick:{ show:false },
                        splitLine:{
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        },
                        axisLine:{
                            show:false
                        },
                        axisLabel:{
                            color:textColor
                        },
                    },
                    series:seriesData
                }}
            />
        </div>
        
    )
}
function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.typeRule !== nextProps.typeRule || prevProps.theme !== nextProps.theme  ) {
        return false;
    } else {
        return true;
    }
}
export default EffLineChart;