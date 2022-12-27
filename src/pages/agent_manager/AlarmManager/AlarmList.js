import React, { useEffect, useState } from 'react';
import { Table, Select, Button, Modal, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import CustomDatePicker from './CustomDatePicker';
import AlarmForm from './AlarmForm';
import style from './AlarmManager.css';

const { Option } = Select;

function getProvinceAndCitys(data){
    let provinces = [];
    Object.keys(data).forEach(province=>{
        let children = [];
        if ( Object.keys(data[province] )){
            Object.keys(data[province]).forEach(city=>{
                children.push({ title:city, key:city });
            });
        }
        provinces.push({ title:province, key:province, children });
    });
    return provinces;
}
let cateCodeList = [
    { title:'全部', key:0 }, { title:'电气安全', key:1 }, { title:'越限告警', key:2 }, { title:'通讯告警', key:3 }
];
let statusList = [
    { title:'全部', key:0 },
    { title:'未处理', key:1 },
    { title:'处理中', key:2 },
    { title:'处理完成', key:3 },
    { title:'挂起', key:4 }
];
let statusMaps = {
    1:'未处理',
    2:'处理中',
    3:'处理完成',
    4:'挂起'
}
function AlarmList({ dispatch, data, userInfo, currentPage, total, onProgress, info, logTypes, progressLog }){
    useEffect(()=>{
        dispatch({ type:'user/toggleTimeType', payload:'2' });
        dispatch({ type:'agentMonitor/fetchLogType'});
        dispatch({ type:'agentMonitor/fetchTotalAlarm', payload:{ province:currentProvince.key, city:currentCity.key, company_id:currentProject, status:currentStatus, cate_code:cateCode }});
    },[]);
    let provinceList = getProvinceAndCitys(userInfo.city || {} );
    let [currentProvince, setCurrentProvince] = useState(provinceList && provinceList.length ? provinceList[0] : {});
    let [currentCity, setCurrentCity] = useState( currentProvince.children && currentProvince.children.length ? currentProvince.children[0] : {});
    let [cityList, setCityList] = useState([]);
    let [projectList, setProjectList] = useState([]);
    let [currentProject, setCurrentProject] = useState(0);
    let [cateCode, setCateCode] = useState(0);
    let [currentStatus, setCurrentStatus] = useState(0);
    let [dateInfo, setDateInfo] = useState({ startDate:null, endDate:null });
    useEffect(()=>{
        let provinceChildren = provinceList.filter(i=>i.key === currentProvince.key )[0];
        let temp = provinceChildren && provinceChildren.children ? provinceChildren.children : [];
        // 切换省份重置市和当前省内的项目列表
        setCityList(temp);
        setCurrentCity(temp[0] || {});
    },[currentProvince]);
    useEffect(()=>{
        if ( userInfo.companys && currentCity.key ){
            let temp = userInfo.companys.filter(i=>i.city === currentCity.key );
            setProjectList(temp);
            setCurrentProject(0);
        }
    },[currentCity])
    let columns = [
        {
            title:'序号',
            width:'60px',
            fixed:'left',
            render:(text,record,index)=>{
                return (<span style={{ color:'rgba(255, 255, 255, 0.6)'}}>{ `${ ( currentPage - 1) * 12 + index + 1}` }</span>);
            }
        },
        { title:'项目名称', dataIndex:'company_name', ellipsis:true, render:value=>(<span style={{ color:'rgba(255, 255, 255, 0.6)'}}>{ value }</span>) },
        // { title:'项目类型', key:'project', render:()=>(<span style={{ color:'#23a3e6' }}>IEMS能源管理</span>)},
        { title:'位置', dataIndex:'position_name', ellipsis:true },
        {
            title:'告警类型',
            dataIndex:'type_name',
            render:(value)=>(<span className={style['tag']}>{ value }</span>)
        },
        {
            title:'告警详情',
            width:240,
            ellipsis:true,
            render:row=>{
                return (<span>{`${row.warning_value},${ row.warning_info }`}</span>)
            }
        },
        { title:'责任人', dataIndex:'executor_name', ellipsis:true, render:(value)=>(<span>{ value }</span>)},
        { title:'发生时间', dataIndex:'first_warning_time' },
        { 
            title:'处理进度', 
            dataIndex:'status', 
            render:value=>(<span>{ statusMaps[value] }</span>)
        },
        {
            title:'操作',
            render:row=>{          
                return (
                    row.status === 3 
                    ?
                    <div>
                        <span style={{ cursor:'pointer', backgroundColor:'#2797ff', padding:'2px 8px', fontSize:'0.8rem', borderRadius:'4px', marginRight:'0.5rem' }} onClick={()=>{
                            onProgress({ visible:true, current:row, action_code:'view' });
                            dispatch({ type:'agentMonitor/fetchProgressInfo', payload:row.record_id });
                            
                        }}>查看详情</span>
                    </div>
                    :
                    <div style={{ whiteSpace:'nowrap' }}>
                        {
                            row.status === 4 
                            ?
                            null
                            :
                            <span style={{ cursor:'pointer', backgroundColor:'#f1a717', padding:'2px 8px', fontSize:'0.8rem', borderRadius:'4px', marginRight:'0.5rem'}} onClick={()=>{
                            
                                onProgress({ visible:true, current:row, action_code:'1' });
                            }}>挂起</span>
                        }   
                        <span style={{ cursor:'pointer', backgroundColor:'#2797ff', padding:'2px 8px', fontSize:'0.8rem', borderRadius:'4px', marginRight:'0.5rem'}} onClick={()=>{
                            onProgress({ visible:true, current:row, action_code:'2' });
                            dispatch({ type:'agentMonitor/fetchProgressInfo', payload:row.record_id });
                        }}>添加进度</span>
                        <span style={{ cursor:'pointer', backgroundColor:'#16ea6b', padding:'2px 8px', fontSize:'0.8rem', borderRadius:'4px', marginRight:'0.5rem'}} onClick={()=>{
                            onProgress({ visible:true, current:row, action_code:'3' });
                        }}>结单</span>
                    </div>
                )
            }
        }
    ];
    return (
        <div>
            <div style={{ display:'flex', alignItems:'center', margin:'2rem 0', whiteSpace:'nowrap' }}>
                <span>省 : </span>
                <Select className={style['custom-select']} value={currentProvince.key} onSelect={value=>{
                    let temp = provinceList.filter(i=>i.key === value )[0];
                    setCurrentProvince(temp);
                }}>
                    {
                        provinceList.map((item,index)=>(
                            <Option key={item.key} value={item.key}>{ item.title }</Option>
                        ))
                    }
                </Select>
                <span>市 : </span>
                <Select className={style['custom-select']} value={currentCity.key} onSelect={value=>{
                    let temp = cityList.filter(i=>i.key === value)[0];
                    setCurrentCity(temp);
                }}>
                    {
                        cityList.map((item,index)=>(
                            <Option key={item.key} value={item.key}>{ item.title }</Option>
                        ))
                    }
                </Select>
                <span>项目名称 : </span>
                <Select style={{ width:'160px' }} className={style['custom-select']} value={currentProject} onSelect={value=>{
                    setCurrentProject(value);
                }}>
                    <Option key={0} value={0}>全部</Option>
                    {
                        projectList.map((item,index)=>(
                            <Option key={item.company_id} value={item.company_id}>{ item.company_name }</Option>
                        ))
                    }
                </Select>
                <span>告警类型 : </span>
                <Select className={style['custom-select']} value={cateCode} onSelect={value=>{
                    setCateCode(value);
                }}>
                    {
                        cateCodeList.map((item,index)=>(
                            <Option key={item.key} value={item.key} >{ item.title }</Option>
                        ))
                    }
                </Select>
                <span>处理进度 : </span>
                <Select className={style['custom-select']} value={currentStatus} onSelect={value=>{
                    setCurrentStatus(value);
                }}>
                    {
                        statusList.map((item,index)=>(
                            <Option key={item.key} value={item.key} >{ item.title }</Option>
                        ))
                    }
                </Select>
                <CustomDatePicker dateInfo={dateInfo} onUpdateDate={info=>setDateInfo(info)} />
                <Button style={{ marginLeft:'1rem' }} type='primary' icon={<SearchOutlined />} onClick={()=>{
                    dispatch({ type:'agentMonitor/fetchTotalAlarm', payload:{ province:currentProvince.key, city:currentCity.key, company_id:currentProject, status:currentStatus, cate_code:cateCode, startDate:dateInfo.startDate, endDate:dateInfo.endDate }});
                }}>查询</Button>
            </div>
            <Table
                rowKey='record_id'
                className={style['self-table-container']}
                columns={columns}
                dataSource={data}
                onChange={(pagination)=>{
                    dispatch({ type:'agentMonitor/fetchTotalAlarm', payload:{ startDate:dateInfo.startDate, endDate:dateInfo.endDate, currentPage:pagination.current, province:currentProvince.key, city:currentCity.key, company_id:currentProject, status:currentStatus, cate_code:cateCode }});
                }}
                pagination={{ 
                    total, 
                    current:currentPage,
                    pageSize:12,
                    showSizeChanger:false                
                }}
            />
            <Modal 
                visible={info.visible} 
                footer={null} 
                width='50%'
                destroyOnClose={true} 
                bodyStyle={{ padding:'40px' }}
                onCancel={()=>{
                    onProgress({ visible:false });
                    dispatch({ type:'agentMonitor/resetProgress'});
                }}
            >
                <AlarmForm 
                    info={info} 
                    logTypes={logTypes}
                    onClose={()=>onProgress({ visible:false })} 
                    onDispatch={(action)=>dispatch(action)}
                    // recordHistory={recordHistory}
                    onOk={()=>{
                        dispatch({ type:'agentMonitor/fetchTotalAlarm', payload:{ startDate:dateInfo.startDate, endDate:dateInfo.endDate, currentPage, province:currentProvince.key, city:currentCity.key, company_id:currentProject, status:currentStatus, cate_code:cateCode }});
                    }}
                    progressLog={progressLog}
                />
            </Modal>
            
        </div>
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.data !== nextProps.data || prevProps.userInfo !== nextProps.userInfo || prevProps.info !== nextProps.info || prevProps.progressLog !== nextProps.progressLog   ){
        return false;
    } else {
        return true;
    }
}
export default React.memo(AlarmList, areEqual);