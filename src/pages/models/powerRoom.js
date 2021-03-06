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
            platformInfo.push({ title:'????????????(???)', value:data.sceneCount });
            platformInfo.push({ title:'????????????(KVA)', value:data.total_kva });
            platformInfo.push({ title:'?????????(???)', value:data.transformerCount });
            platformInfo.push({ title:'????????????(???)', value:data.collectCount });
            platformInfo.push({ title:'????????????(KWh)', value:data.totalEnergy });
            platformInfo.push({ title:'?????????(tce)', value:Math.floor(data.coal)});
            data.platformInfo = platformInfo;
            chartList.push({ title:'????????????', value:data.power, maxValue:data.maxDemand, unit:'kw' });
            chartList.push({ title:'????????????', value:data.currentDemand, maxValue:data.maxDemand, unit:'kw' });
            chartList.push({ title:'????????????', value:data.total_kva, maxValue:data.total_kva, unit:'kva' });
            data.chartList = chartList;
            return { ...state, monitorInfo:data };
        },
        getMachTypes(state, { payload:{ data }}){
            return state;
        },
        getMachList(state, { payload:{ data, total }}){
            let infoList = [];
            infoList.push({ key:'1', title:'????????????', value:data.total_meter });
            infoList.push({ key:'2', title:'???????????????', value:Math.floor(data.total_meter - data.outline_meter) });
            infoList.push({ key:'3', title:'???????????????', value:data.outline_meter});
            infoList.push({ key:'4', title:'???????????????', value:data.warning_count });
            infoList.push({ key:'5', title:'??????????????????', value:data.warning_unfinish });
            data.infoList = infoList;
            return { ...state, machListInfo:data, total }
        },
        getMachDetail(state, { payload:{ data }}){
            let infoList = [];
            let real_time = data.real_time || {};
            infoList.push({ title:'??????', value:Math.floor(real_time.Iavb), unit:'A'});
            infoList.push({ title:'?????????', value:Math.floor(real_time.Ullavg), unit:'V'});
            infoList.push({ title:'?????????', value:Math.floor(real_time.Uavg), unit:'V'});
            infoList.push({ title:'????????????', value:(+real_time.PFavg).toFixed(2), unit:'COS??'});
            infoList.push({ title:'????????????', value:Math.floor(real_time.P / 1000), unit:'kw'});
            infoList.push({ title:'??????', value:data['is_outline'] ? '??????' : '??????', unit:''})
            
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

