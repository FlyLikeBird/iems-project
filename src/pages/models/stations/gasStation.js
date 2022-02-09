import { 
    getGasStationInfo,
    getAirMachData
} from '../../services/stationService';
import moment from 'moment';
import { apiToken, encryptBy } from '@/pages/utils/encryption';
const date = new Date();
const initialState = {
    data:{},
    sceneLoading:true
};

export default {
    namespace:'gasStation',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *cancelAll(action, { put }){
            yield put({ type:'reset'});
        },
        *fetchGasStationInfo(action, { put, select, call }){
            let { user:{ company_id }} = yield select();
            yield put({ type:'toggleSceneLoading', payload:true });
            let { data } = yield call(getGasStationInfo, { company_id });
            if ( data && data.code === '0'){
                yield put({ type:'getGasStation', payload:{ data:data.data }});
            }
        },
        *fetchAirMachData(action, { put, select, call}){
            // yield put({ type:'cancelAirMachData' });
            // yield put({ type:'cancelable', task:fetchAirMachDataCancelable, action:'cancelAirMachData' });
            // function *fetchAirMachDataCancelable(params){
                try {
                    let { user:{ company_id }} = yield select();
                    let { resolve, reject, register_code, mach_type } = action.payload;
                    let { data } = yield call(getAirMachData, { company_id, mach_type, register_code });
                    if ( data && data.code === '0'){
                        if ( resolve && typeof resolve === 'function') resolve(data.data);
                    } else {
                        if ( reject && typeof reject === 'function' ) reject(data.msg);
                    }
                } catch(err){
                    console.log(err);
                }
            }
        // }
    },
    reducers:{
        toggleSceneLoading(state, { payload }){
            return { ...state, sceneLoading:payload };
        },
        getGasStation(state, { payload:{ data }}){
            let infoList = [];
            infoList.push({ title:'空压机数量', value:data.totalAir ? data.totalAir : 0 });
            infoList.push({ title:'采集终端数', value:data.total_meter });
            infoList.push({ title:'最大产气量(m³/min)', value:data.maxAirNum });
            data.infoList = infoList;
            return { ...state, data, sceneLoading:false };
        },
        reset(state){
            return initialState;
        } 
    }
}


