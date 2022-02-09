import { getCostReport, getCostAnalyze, getMeterReport, getEnergyType, getDocumentInfo, getAnalyzeReport, getCompanyFeeRate, exportReport, translateImgToBase64, createDocument, fetchImg } from '../../services/costReportService';
import { flattern, getDeep } from '../../utils/array';
import moment from 'moment';
let date = new Date();

const initialState = {
    // 抄表记录状态
    list:[],
    loaded:false
};

export default {
    namespace:'meterReport',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *init(action, { put }) {
            yield put.resolve({ type:'fields/init'});
            yield put.resolve({ type:'fetchMeterReport'});
        },
        *cancelAll(action, { put }){
            yield put({ type:'cancelMeterReport'});
            yield put({ type:'reset'});
        },
        *fetchEnergy(action, { call, put, all}){
            let { data } = yield call(getEnergyType);
            if ( data && data.code === '0'){
                yield put({type:'getEnergyType', payload:{ data:data.data }});
            }
        },
        *fetchMeterReport(action, { call, put, select }){
            yield put.resolve({ type:'cancelMeterReport'});
            yield put.resolve({ type:'cancelable', task:fetchMeterReportCancelable, action:'cancelMeterReport'});
            function* fetchMeterReportCancelable(params){
                try {
                    let { startHour } = action.payload || {};
                    let { user:{ company_id, startDate, endDate }, fields:{ currentAttr, energyInfo }} = yield select();
                    let obj = { company_id, type_id:energyInfo.type_id, attr_id:currentAttr.key, begin_time:startDate.format('YYYY-MM-DD'), end_time:endDate.format('YYYY-MM-DD')};
                    if ( startHour ) {
                        obj.day_start_hour = startHour;
                    }
                    if ( currentAttr.key ){
                        yield put({ type:'toggleLoading'});                
                        let { data } = yield call(getMeterReport, obj );
                        if ( data && data.code === '0'){
                            yield put({ type:'getMeterReport', payload:{ data:data.data }});
                        } else if ( data && data.code === '1001') {
                            yield put({ type:'user/loginOut'});
                        }
                    } else {
                        yield put({ type:'getMeterReport', payload:{ data:[] }});
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
        toggleChartLoading(state){
            return { ...state, chartLoading:true };
        },
        getMeterReport(state, { payload:{ data }}){
            return { ...state, list:data, loaded:true, isLoading:false }
        },
        reset(){
            return initialState;
        }
    }
}

