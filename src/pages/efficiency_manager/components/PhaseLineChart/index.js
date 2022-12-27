import React, { useState, useRef, useEffect } from 'react';
import ReactEcharts from 'echarts-for-react';
import html2canvas  from 'html2canvas';
import { Radio, Modal, Form, Input, Button, Tag, message } from 'antd';
import { PictureOutlined, FileExcelOutlined } from '@ant-design/icons';
import { downloadExcel } from '@/pages/utils/array';
import style from '../../../IndexPage.css';
import XLSX from 'xlsx';

function PhaseLineChart({ data, currentOption, typeRule, timeType, currentAttr, theme, dispatch }) {
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const seriesData = [];
    const echartsRef = useRef();
    let textColor = theme === 'dark' ? '#b0b0b0' : '#000';
    let isFourPhase = currentOption.title === '四象限无功电能' ? true : false;
    let isMaxDemand = currentOption.title === '最大需量' ? true : false;
    let isLineVoltage = currentOption.title === '线电压' ? true : false;
    let isAvg = currentOption.title === '相电流' || currentOption.title === '相电压' || currentOption.title === '线电压' ? true : false; 
    if ( !isFourPhase ){
        seriesData.push({
            type:'line',
            symbol:'none',
            name: isAvg ? `平均${currentOption.title}` : `总${currentOption.title}`,
            data:data.energy,
            itemStyle:{
                color:'#142e60'
            },
        });
    } 
    if ( isLineVoltage ){
        seriesData.push({
            type:'line',
            name:`AB线`,
            symbol:'none',
            data:data.energyAB,
            itemStyle:{
                color:'#5386f1'
            },
        });
        seriesData.push({
            type:'line',
            name:`BC线`,
            symbol:'none',
            data:data.energyBC,
            itemStyle:{
                color:'#71c822'
            },
        });
        seriesData.push({
            type:'line',
            name:`CA线`,
            symbol:'none',
            data:data.energyCA,
            itemStyle:{
                color:'#fba123'
            },
        });
    } else {
        seriesData.push({
            type:'line',
            name: isFourPhase ? '第一象限':'A相',
            symbol:'none',
            data: isFourPhase ? data.energy1 : data.energyA,
            itemStyle:{
                color:'#5386f1',
            },
        });
        seriesData.push({
            type:'line',
            name:isFourPhase ? '第二象限':'B相',
            symbol:'none',
            data: isFourPhase ? data.energy2 : data.energyB,
            itemStyle:{
                color:'#71c822'
            }
        });
        seriesData.push({
            type:'line',
            name:isFourPhase ? '第三象限':'C相',
            symbol:'none',
            data: isFourPhase ? data.energy3 : data.energyC,
            itemStyle:{
                color:'#fba123'
            }
        });
        if ( isFourPhase ){
            seriesData.push({
                type:'line',
                name:'第四象限',
                symbol:'none',
                data:data.energy4,
                itemStyle:{
                    color:'#f0de1a'
                }
            });
        }
    }
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
    },[visible]);
    
    return (  
        <div style={{ height:'100%', position:'relative' }}>
            {
                currentOption.type 
                ?
                <div style={{ position:'absolute', right:'90px', top:'6px' }} className={style['custom-btn']} onClick={()=>setVisible(true)} >告警设置</div>   
                :
                null
            }
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
                            dispatch({ type:'demand/setRule', payload:{ resolve, reject, warning_min:values.warning_min, warning_max:values.warning_max }})
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
                        <Tag>{ currentOption.title }</Tag>
                    </Form.Item>
                    <Form.Item label='告警上限值' name='warning_max' rules={[{ type:'number', message:'请输入数值类型', transform(value){ if(value) return Number(value) } }]}>
                        <Input style={{ width:'100%' }} addonAfter={data.unit} />
                    </Form.Item>
                    <Form.Item label='告警下限值' name='warning_min' rules={[{ type:'number', message:'请输入数值类型', transform(value){ if(value) return Number(value) } }]}>
                        <Input style={{ width:'100%' }} addonAfter={data.unit} />
                    </Form.Item> 
                    
                    <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                        <Button onClick={()=>setVisible(false)} style={{ marginRight:'0.5rem' }}>取消</Button>
                        <Button type="primary" htmlType="submit">设置</Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Radio.Group size='small' className={style['float-button-group'] + ' ' + style['custom-button']} onChange={e=>{
                let value = e.target.value;
                let fileTitle = `能源趋势-${currentOption.title}`;
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
                    var aoa = [], thead = ['对比项','属性','单位'];
                    data.date.forEach(i=>{
                        thead.push(i);
                    });
                    aoa.push(thead);
                    seriesData.forEach(i=>{
                        let temp = [];
                        temp.push(i.name);
                        temp.push(currentAttr.title);
                        temp.push(data.unit);
                        temp.push(...i.data);
                        aoa.push(temp);
                    })
                                              
                    var sheet = XLSX.utils.aoa_to_sheet(aoa);
                    sheet['!cols'] = thead.map(i=>({ wch:16 }));
                    downloadExcel(sheet, fileTitle + '.xlsx' );
                }
            }}>
                <Radio.Button value='download'><PictureOutlined /></Radio.Button>
                <Radio.Button value='excel'><FileExcelOutlined /></Radio.Button>
            </Radio.Group>
            <ReactEcharts
                notMerge={true}
                ref={echartsRef}
                style={{width:'100%', height:'100%'}}
                option={{
                    tooltip:{
                        trigger:'axis'
                    },
                    legend:{
                        top:6,
                        textStyle:{ color:textColor },
                        data: isFourPhase ? ['第一象限','第二象限','第三象限','第四象限'] : isMaxDemand ? [`总${currentOption.title}`] : isLineVoltage ? [isAvg ? `平均${currentOption.title}` : `总${currentOption.title}`,'AB线','BC线','CA线'] : [isAvg ? `平均${currentOption.title}` : `总${currentOption.title}`,'A相','B相','C相']
                    },
                    grid:{
                        top:60,
                        left:30,
                        right:30,
                        bottom:40,
                        containLabel:true
                    },
                    dataZoom: [
                        {
                            show:true,
                            bottom:10,
                            textStyle:{ color:textColor }
                        }
                    ],
                    
                    xAxis: {
                        type:'category',
                        data: data.date,
                        silent: false,
                        splitLine: {
                            show: false
                        },
                        axisTick:{ show:false },
                        axisLabel:{
                            show:true,
                            color:textColor,
                            formatter:(value)=>{
                                let strArr = value.split('-');
                                if (timeType === '3' ) {
                                    return value;
                                } else {
                                    return strArr[1] + '-' + strArr[2] + '\n' + strArr[0];
                                }   
                            }
                        },
                        splitArea: {
                            show: false
                        }
                    },
                    yAxis:{
                        name:data.unit,
                        nameTextStyle:{
                            align:'left',
                            color:textColor
                            // fontSize:20,
                            // fontWeigth:'bolder'
                        },
                        type:'value',
                        splitArea: {
                            show: false
                        },
                        axisLabel:{ color:textColor },
                        axisLine:{
                            show:false,
                        },
                        axisTick:{
                            show:false
                        },
                        splitLine:{
                            show:true,
                            lineStyle:{
                                color: theme === 'dark' ? '#22264b' : '#f0f0f0'
                            }
                        }  
                    },
                        
                    series: seriesData 
                }}
            />
        </div>
                
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.typeRule !== nextProps.typeRule ||  prevProps.theme !== nextProps.theme  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(PhaseLineChart, areEqual);
