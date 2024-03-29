import { getMonitorInfo, getMonitorScenes, getEleLines, getMachTypes, getMachList, getMachDetail } from '../services/powerRoomService';
import moment from 'moment';

const initialState = {
    monitorInfo:{},
    machTypes:{},
    machListInfo:{},
    machData:{},
    machDetail:{},
    total:0,
    currentPage:1,
    machScenes:{},
    machLoading:true
};

export default {
    namespace:'powerRoom',
    state:initialState,
    effects:{
        *fetchMonitorInfo(action, { select, call, put}){
            try{
                let { user:{ company_id }} = yield select();
                let { data } = yield call(getMonitorInfo, { company_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getMonitorInfo', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchMonitorScenes(action, { select, call, put}){
            try{
                let { user:{ company_id }} = yield select();
                let { data } = yield call(getMonitorScenes, { company_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getMachScenes', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchMachTypes(action, { call, put}){
            try{
                let { data } = yield call(getMachTypes);
                if ( data && data.code === '0') {
                    yield put({ type:'getMachTypes', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchMachList(action, { call, put, select }){
            try{
                let { user:{ company_id }, powerRoom :{ currentPage }} = yield select();
                let { type, pagesize, keyword } = action.payload || {};
                type = type || 'ele_meter';
                pagesize = pagesize || 16;
                keyword = keyword || '1';
                let { data } = yield call(getMachList, { page:currentPage, pagesize, type, keyword, company_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getMachList', payload:{ data:data.data, total:data.count }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchMachDetail(action, { select, call, put}){
            try{
                let { user:{ company_id }} = yield select();
                let { mach_id, date_time } = action.payload ;
                if ( date_time && date_time._isAMomentObject ){
                    date_time = date_time.format('YYYY-MM-DD');
                }
                yield put({ type:'toggleMachLoading'});
                let { data } = yield call(getMachDetail, { mach_id, date_time, company_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getMachDetail', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchEleLines(action, { select, put, call}){
            try{
                let { user:{ company_id }} = yield select();
                let { resolve, reject } = action.payload || {};
                let { data } = yield call(getEleLines, { company_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getEleLines', payload:{ data:data.data }});
                    // console.log(data.data);
                    if ( resolve && typeof resolve === 'function' ) resolve(data.data);
                }
            } catch(err){   
                console.log(err);
            }
        }
    },
    reducers:{
        toggleMachLoading(state){
            return { ...state, machLoading:true };
        },
        getMonitorInfo(state, { payload:{ data }}){
            let platformInfo = [], chartList = [];
            platformInfo.push({ title:'配电房数(个)', value:data.sceneCount });
            platformInfo.push({ title:'装机容量(KVA)', value:data.total_kva });
            platformInfo.push({ title:'变压器(个)', value:data.transformerCount });
            platformInfo.push({ title:'采集点数(个)', value:data.collectCount });
            platformInfo.push({ title:'总用电量(KWh)', value:data.totalEnergy });
            platformInfo.push({ title:'碳指标(tce)', value:Math.floor(data.coal)});
            data.platformInfo = platformInfo;
            chartList.push({ title:'进线负荷', value:data.power, maxValue:data.maxDemand, unit:'kw' });
            chartList.push({ title:'当前需量', value:data.currentDemand, maxValue:data.maxDemand, unit:'kw' });
            chartList.push({ title:'最大容量', value:data.total_kva, maxValue:data.total_kva, unit:'kva' });
            data.chartList = chartList;
            return { ...state, monitorInfo:data };
        },
        getMachTypes(state, { payload:{ data }}){
            return state;
        },
        getMachList(state, { payload:{ data, total }}){
            let infoList = [];
            infoList.push({ key:'1', title:'总设备数', value:data.total_meter });
            infoList.push({ key:'2', title:'在线设备数', value:Math.floor(data.total_meter - data.outline_meter) });
            infoList.push({ key:'3', title:'离线设备数', value:data.outline_meter});
            infoList.push({ key:'4', title:'告警设备数', value:data.warning_count });
            infoList.push({ key:'5', title:'未处理设备数', value:data.warning_unfinish });
            data.infoList = infoList;
            return { ...state, machListInfo:data, total }
        },
        getMachDetail(state, { payload:{ data }}){
            let infoList = [];
            let real_time = data.real_time || {};
            infoList.push({ title:'电流', value:Math.floor(real_time.Iavb), unit:'A'});
            infoList.push({ title:'线电压', value:Math.floor(real_time.Ullavg), unit:'V'});
            infoList.push({ title:'相电压', value:Math.floor(real_time.Uavg), unit:'V'});
            infoList.push({ title:'功率因素', value:(+real_time.PFavg).toFixed(2), unit:'COSΦ'});
            infoList.push({ title:'有功功率', value:Math.floor(real_time.P / 1000), unit:'kw'});
            infoList.push({ title:'状态', value:data['is_outline'] ? '离线' : '在线', unit:''})
            
            data.infoList = infoList;
            return { ...state, machDetail:data, machLoading:false };
        },
        getMachScenes(state, { payload:{ data }}){
            let temp = {};
            temp.data = data;
            return { ...state, machScenes:temp };
        },
        setCurrentPage(state, { payload }){
            return { ...state, currentPage:payload };
        },
        resetPage(state){
            return { ...state, currentPage:1 };
        },
        clearMachDetail(state){
            return { ...state, machDetail:{}};
        },
        reset(state){
            return initialState;
        }
    }
}

