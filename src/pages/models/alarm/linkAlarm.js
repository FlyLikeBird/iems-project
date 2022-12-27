import { 
    getAttrWarning,
    getRealTimeWarning ,
    getLinkAlarmRank,
    getMachTypeRatio,

} from '../../services/attrAlarmService';
import moment from 'moment';
const date = new Date();
const initialState = {
    warningInfo:{},
    // 1=>日周期 2=>月周期 3=》年周期

    chartLoading:true,
    machAlarmInfo:{},
    machOfflineInfo:{}
};

export default {
    namespace:'linkAlarm',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *cancelAll(action, { put }){
            // yield put({ type:'cancelInit'});
            // yield put({ type:'cancelAttrAlarm'});
            // yield put({ type:'cancelMachTypeAlarm'})
            // yield put({ type:'cancelMachOffline'});
            yield put({ type:'reset'});
        },
        *init(action,{ select, call, put, all }){       
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchAll'});      
        },
        *fetchAll(action, { put, select }){
            let { user:{ company_id, timeType, startDate, endDate }, fields:{ currentAttr }} = yield select();
            timeType = timeType === '10' ? '2' : timeType;
            let params = { attr_id:currentAttr.key, cate_code:'3', company_id, time_type:timeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') };
            yield put({ type:'toggleChartLoading'});
            yield put({ type:'fetchMachTypeAlarm', payload:params });
            yield put({ type:'fetchAttrAlarm', payload:params });
            yield put({ type:'fetchMachOffline', payload:params });
        },
        *fetchAttrAlarm(action,{ select, call, put}){  
            let { data } = yield call(getAttrWarning, action.payload );
            if ( data && data.code === '0'){
                yield put({ type:'getAttrWarning', payload:{ data:data.data }});
            }          
        },
        *fetchMachTypeAlarm(action, { select, call, put}){  
            let { data } = yield call(getMachTypeRatio, action.payload);
            if ( data && data.code === '0'){
                yield put({ type:'getMachAlarmInfo', payload:{ data:data.data }});
            }        
        },
        *fetchMachOffline(action, { call, put}){ 
            let { data } = yield call(getLinkAlarmRank, action.payload);
            if ( data && data.code === '0'){
                yield put({ type:'getMachOfflineInfo', payload:{ data:data.data }});
            }       
        }
    },
    reducers:{
        
        toggleChartLoading(state){
            return { ...state, chartLoading:true };
        },
        getAttrWarning(state, { payload:{ data }}){
            return { ...state, warningInfo:data };
        },
        getMachAlarmInfo(state, { payload:{ data }}){
            return { ...state, machAlarmInfo:data };
        },
        getMachOfflineInfo(state, { payload:{ data }}){
            return { ...state, machOfflineInfo:data, chartLoading:false }
        },
        reset(state){
            return initialState;
        }
    }
}


