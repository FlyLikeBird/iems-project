import { 
    getAttrWarning,
    getRealTimeWarning ,
    getLinkAlarmRank,
    getMachTypeRatio
} from '../../services/attrAlarmService';
import moment from 'moment';
const date = new Date();
const initialState = {
    warningInfo:{},
    // 1=>日周期 2=>月周期 3=》年周期
    realTimeInfo:{},
    attrLoading:true,
    isLoading:true,
    // TC：温度；IR：剩余电流；ele_exceed：电流；vol_exceed：电压；power_factor：功率因素；
    typeCode:'ele_exceed',
    dayTimeType:'3',
};

export default {
    namespace:'eleAlarm',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *cancelAll(action, { put }){
            yield put.resolve({ type:'reset'});
        },
        *init(action, { put, select }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchAttrAlarm'});
            yield put({ type:'fetchRealTimeAlarm'});
        },
        *fetchAttrAlarm(action,{ select, call, put}){ 
            try {
                let { user:{ company_id, timeType, startDate, endDate }, fields:{ currentAttr }} = yield select();
                yield put({ type:'toggleAttrLoading'});
                timeType = timeType === '10' ? '2' :  timeType;
                let { data } = yield call(getAttrWarning, { company_id, cate_code:'1', time_type:timeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), attr_id:currentAttr.key })
                if ( data && data.code === '0'){
                    yield put({ type:'getAttrWarning', payload:{ data:data.data }});
                }              
            } catch(err){
                console.log(err);
            }           
        },
        *fetchRealTimeAlarm(action, { select, call, put}){
            try {
                let { user:{ company_id }, eleAlarm:{ typeCode, dayTimeType }, fields:{ currentAttr }} = yield select();
                let { nofresh } = action.payload || {};
                if ( !nofresh ) {
                    yield put({ type:'toggleLoading'});
                }
                let { data } = yield call(getRealTimeWarning, { company_id, type_code:typeCode, day_time_type:dayTimeType, attr_id:currentAttr.key });
                if ( data && data.code === '0'){
                    yield put({ type:'getRealTimeAlarm', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }   
        }
    },
    reducers:{
        toggleAttrLoading(state){
            return { ...state, attrLoading:true };
        },
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getAttrWarning(state, { payload:{ data }}){
            return { ...state, warningInfo:data, attrLoading:false };
        },
        getRealTimeAlarm(state, { payload:{ data }}){
            return { ...state, realTimeInfo:data, isLoading:false };
        },
        toggleDayTimeType(state, { payload:{ dayTimeType }}){
            return { ...state, dayTimeType }
        },
        toggleTypeCode(state, { payload:{ typeCode }}){
            return { ...state, typeCode };
        },
        reset(state){
            return initialState;
        } 
    }
}

function delay(ms){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve();
        },ms)
    })
}


