import { getExtremeReport, getEleReport, getSameRate, getAdjoinRate } from '../../services/costReportService';
import moment from 'moment';
let date = new Date();

const initialState = {
    // 1:年周期   2:月周期  3:日周期
    eleType:'1',
    sourceData:[],
    isLoading:true,
};

export default {
    namespace:'extremeReport',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *cancelAll(action, { put }){
            // yield put({ type:'cancelExtremeReport'});
            // yield put({ type:'cancelEleReport'});
            // yield put({ type:'cancelSameRate'});
            // yield put({ type:'cancelAdjoinRate'});
            yield put({ type:'reset'});
        },
        *initExtremeReport(action, { put }){
            yield put.resolve({ type:'fields/init'});
            yield put.resolve({ type:'fetchExtremeReport'});
        },
        *fetchExtremeReport(action, { call, put, select}){
            yield put.resolve({ type:'cancelExtremeReport'});
            yield put.resolve({ type:'cancelable', task:fetchExtremeReportCancelable, action:'cancelExtremeReport'});
            function* fetchExtremeReportCancelable(params){
                try {
                    let { user:{ company_id, timeType, startDate, endDate }, fields:{ currentAttr }, extremeReport:{ eleType } } = yield select();
                    yield put({type:'toggleLoading'});
                    let { data } = yield call(getExtremeReport, { company_id, time_type:timeType, attr_id:currentAttr.key, energy_type:eleType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') })
                    if ( data && data.code === '0'){
                        yield put({type:'getReport', payload:{ data:data.data }});
                    }           
                } catch(err){
                    console.log(err);
                }
            }
        },
        *initEleReport(action, { put }){
            yield put.resolve({ type:'fields/init'});
            yield put.resolve({ type:'fetchEleReport'});
        },
        *fetchEleReport(action, { call, put, select}){
            yield put.resolve({ type:'cancelEleReport'});
            yield put.resolve({ type:'cancelable', task:fetchEleReportCancelable, action:'cancelEleReport'});
            function* fetchEleReportCancelable(params){
                try {
                    let { user:{ company_id, timeType, startDate, endDate }, fields:{ currentAttr }} = yield select();
                    yield put({type:'toggleLoading'});
                    let { data } = yield call(getEleReport, { company_id, time_type:timeType, attr_id:currentAttr.key, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), energy_type:'1' })
                    if ( data && data.code === '0'){
                        yield put({type:'getReport', payload:{ data:data.data }});
                    }                         
                } catch(err){
                    console.log(err);
                }
            }
        },
        *initSameRate(action, { put }){
            yield put.resolve({ type:'fields/init'});
            yield put.resolve({ type:'fetchSameRate'});
        },
        *fetchSameRate(action, { call, put, select}){
            yield put.resolve({ type:'cancelSameRate'});
            yield put.resolve({ type:'cancelable', task:fetchSameRateCancelable, action:'cancelSameRate'});
            function* fetchSameRateCancelable(params){
                try {
                    let { user:{ company_id, timeType, startDate, endDate }, fields:{ currentAttr }} = yield select();
                    yield put({type:'toggleLoading'});
                    let { data } = yield call(getSameRate, { company_id, time_type:timeType, attr_id:currentAttr.key, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') })
                    if ( data && data.code === '0'){
                        yield put({type:'getReport', payload:{ data:data.data }});
                    }                 
                } catch(err){
                    console.log(err);
                }
            }
        },
        *initAdjoinRate(action, { put }){
            yield put.resolve({ type:'fields/init'});
            yield put.resolve({ type:'fetchAdjoinRate'});
        },
        *fetchAdjoinRate(action, { call, put, select}){
            yield put.resolve({ type:'cancelAdjoinRate'});
            yield put.resolve({ type:'cancelable', task:fetchAdjoinRateCancelable, action:'cancelAdjoinRate'});
            function* fetchAdjoinRateCancelable(params){
                try {
                    let { user:{ company_id, timeType, startDate, endDate }, fields:{ currentAttr } } = yield select();
                    yield put({type:'toggleLoading'});
                    let { data } = yield call(getAdjoinRate, { company_id, time_type:timeType, attr_id:currentAttr.key, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') })
                    if ( data && data.code === '0'){
                        yield put({type:'getReport', payload:{ data:data.data }});
                    }
                     
                } catch(err){
                    console.log(err);
                }
            }
        },
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getReport(state, { payload:{ data }}){
            return { ...state, sourceData:data, isLoading:false };
        },
        toggleTimeType(state, { payload }){
            let start, end;
            var date = new Date();
            if ( payload === '3'){
                // 切换为年维度
                start = moment(date).startOf('year');
                end = moment(date).endOf('year');   
            } else if ( payload === '2'){
                // 切换为月维度
                start = moment(date).startOf('month');
                end = moment(date).endOf('month');
            } else {
                // 切换为日维度
                start = end = moment(date);
            }
            return { ...state, timeType:payload, startDate:start, endDate:end };
        },
        toggleEnergyType(state, { payload }){
            let energyInfo = state.energyList.filter(i=>i.type_id === payload )[0];
            return { ...state, energyInfo };
        },
        toggleEleType(state, { payload }){
            return { ...state, eleType:payload };
        },
        setDate(state, { payload:{ startDate, endDate }}){
            return { ...state, startDate, endDate };
        },
        select(state, { payload }){
            return { ...state, checkedKeys:payload };
        },
        toggleRatio(state, { payload }){
            return { ...state, curRatio:payload };
        },
        reset(){
            return initialState;
        }
    }
}

