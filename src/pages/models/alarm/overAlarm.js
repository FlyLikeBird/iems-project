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
    regionAlarmInfo:{},
};

export default {
    namespace:'overAlarm',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *cancelAll(action, { put }){
            // yield put.resolve({ type:'cancelAttrAlarm'});
            // yield put.resolve({ type:'cancelMachOffline'});
            yield put({ type:'reset'});
        },
        *init(action,{ select, call, put}){
            yield put.resolve({ type:'fields/init' });
            yield put({ type:'fetchAttrAlarm'});
            yield put({ type:'fetchMachOffline'});
        },
        *fetchAttrAlarm(action,{ select, call, put}){
            try {
                let { user:{ company_id, timeType, startDate, endDate  }, fields:{ currentAttr }} = yield select();
                timeType = timeType === '10' ? '2' : timeType;
                yield put({ type:'toggleChartLoading'});
                let { data } = yield call(getAttrWarning, { company_id, cate_code:'2', time_type:timeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), attr_id:currentAttr.key } );
                if ( data && data.code === '0'){
                    yield put({ type:'getAttrWarning', payload:{ data:data.data }});
                }
                
            } catch(err){  
                console.log(err);                 
            }     
        },
        *fetchMachOffline(action, { call, put, select }){
            try {
                let { user:{ company_id, timeType, startDate, endDate  }, fields:{ currentAttr }} = yield select();    
                timeType = timeType === '10' ? '2' : timeType;              
                let { data } = yield call(getLinkAlarmRank, { company_id, cate_code:'2', time_type:timeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), attr_id:currentAttr.key } );
                if ( data && data.code === '0'){
                    yield put({ type:'getMachOfflineInfo', payload:{ data:data.data }});
                }               
            } catch(err){  
                console.log(err);                 
            }        
        }
    },
    reducers:{
        toggleChartLoading(state){
            return { ...state, chartLoading:true };
        },
        getAttrWarning(state, { payload:{ data }}){
            return { ...state, warningInfo:data, chartLoading:false };
        },
        getMachOfflineInfo(state, { payload:{ data }}){
            return { ...state, regionAlarmInfo:data }
        },
        reset(state){
            return initialState;
        }
    }
}


