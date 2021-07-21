import { getEleMonitorInfo, getEleLines, getEleLinesDetail } from '../../services/eleMonitorService';
import moment from 'moment';
let date = new Date();
const initialState = {
    optionType:'1',
    startDate:moment(date),
    endDate:moment(date),
    timeType:'1',
    isLoading:true,
    chartInfo:{},
    eleScenes:[],
    currentScene:{},
    eleLoading:true,
    eleDetail:{},
    detailLoading:true,
}

export default {
    namespace:'eleMonitor',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        // 统一取消所有action
        *cancelAll(action, { put }){
            yield put({ type:'cancelChartInfo'});
            yield put({ type:'reset'});
        },

        *fetchChartInfo(action, { call, put, select }){
            yield put({ type:'cancelChartInfo'});
            yield put.resolve({ type:'cancelable', task:fetchChartInfoCancelable, action:'cancelChartInfo' });
            function* fetchChartInfoCancelable(params){
                try {
                    yield put({ type:'toggleLoading'});
                    let { user:{ company_id }, fields:{ currentAttr } ,eleMonitor:{ optionType, startDate, endDate, timeType }} = yield select();
                    if ( Object.keys(currentAttr).length ){
                        let { data } = yield call(getEleMonitorInfo, { company_id, attr_id:currentAttr.key, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), time_type:timeType, energy_type:optionType });
                        if ( data && data.code === '0'){
                            yield put({ type:'getChartInfo', payload:{ data:data.data }});
                        } 
                    } else {
                        yield put.resolve({ type:'fields/init'});
                        let { fields:{ currentAttr }} = yield select();
                        let { data } = yield call(getEleMonitorInfo, { company_id, attr_id:currentAttr.key, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), time_type:timeType, energy_type:optionType });
                        if ( data && data.code === '0'){
                            yield put({ type:'getChartInfo', payload:{ data:data.data }});
                        } 
                    } 
                } catch(err){
                    console.log(err);
                }
            }
        },
        *fetchEleLines(action, { call, put, select }){
            yield put.resolve({ type:'cancelable', task:fetchEleLinesCancelable, action:'cancelEleLines'});
            function* fetchEleLinesCancelable(params){
                try {
                    yield put({ type:'toggleEleLoading' });
                    let { user:{ company_id }} = yield select();
                    let { data } = yield call(getEleLines, { company_id });
                    if ( data && data.code === '0'){
                        yield put({ type:'getEleScenes', payload:{ data:data.data }})
                    }
                } catch(err){
                    console.log(err);
                }
            }
        },
        *resetDetail(action, { put }){
            yield put({ type:'cancelEleLinesDetail'});
            yield put({ type:'resetDetailInfo'});
        },
        *fetchEleLinesDetail(action, { call, put, select }){
            yield put.resolve({ type:'cancelable', task:fetchEleLinesDetailCancelable, action:'cancelEleLinesDetail'});
            function* fetchEleLinesDetailCancelable(params){
                try {
                    yield put({ type:'toggleDetailLoading'});
                    let { user:{ company_id }, eleMonitor:{ startDate, endDate, timeType }} = yield select();
                    let { mach_id, optionType } = action.payload || {};
                    let { data } = yield call(getEleLinesDetail, { company_id, mach_id, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), time_type:timeType, energy_type:optionType });
                    if ( data && data.code === '0'){
                        yield put({ type:'getEleLinesDetail', payload:{ data:data.data }});
                    }
                } catch(err){
                    console.log(err);
                }
            }
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        toggleDetailLoading(state){
            return { ...state, detailLoading:true };
        },
        toggleEleLoading(state){
            return { ...state, eleLoading:true };
        },
        getChartInfo(state, { payload:{ data }}){
            return { ...state, chartInfo:data, isLoading:false };
        },
        toggleOptionType(state, { payload }){
            return { ...state, optionType:payload };
        },
        toggleTimeType(state, { payload }){
            let startDate, endDate;
            let date = new Date();
            if ( payload === '1'){
                startDate = endDate = moment(date);
            }
            if ( payload === '2'){
                startDate = moment(date).startOf('month');
                endDate = moment(date).endOf('month');
            } else if ( payload === '3'){
                startDate = moment(date).startOf('year');
                endDate = moment(date).endOf('year');
            }
            return { ...state, timeType:payload, startDate, endDate };
        },
        setDate(state, { payload:{ startDate, endDate }}){
            return { ...state, startDate, endDate };
        },
        getEleScenes(state, { payload:{ data }}){
            let temp = data.length ? data[0] : {};
            return { ...state, eleScenes:data, currentScene:temp, eleLoading:false };
        },
        getEleLinesDetail(state, { payload:{ data }}){
            return { ...state, eleDetail:data, detailLoading:false };
        },
        toggleCurrentScene(state, { payload }){
            return { ...state, currentScene:payload };
        },
        resetDetailInfo(state){
            return { ...state, eleDetail:{}, detailLoading:true };
        },
        
        reset(state){
            return initialState;
        }
    }
}