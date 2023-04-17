import { getMeterReport, getMeterReportDetail, getEnergyType  } from '../../services/costReportService';
let date = new Date();

const initialState = {
    // 抄表记录状态
    list:[],
    checkedKeys:[],
    startHour:0,
    isLoading:true
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
        *cancelAll(action, { put }){
            yield put({ type:'reset'});
        },
        *fetchEnergy(action, { call, put, all}){
            let { data } = yield call(getEnergyType);
            if ( data && data.code === '0'){
                yield put({type:'getEnergyType', payload:{ data:data.data }});
            }
        },
        *initMeterReport(action, { call, put, select }){
            yield put.resolve({ type:'fields/init'});
            yield put.resolve({ type:'fetchMeterReport'});  
        },
        *fetchMeterReport(action, { call, put, select }){
            try {
                let { user:{ company_id, startDate, endDate }, fields:{ currentAttr, energyInfo }, meterReport:{ startHour }} = yield select();
                let obj = { company_id, type_id:energyInfo.type_id, attr_id:currentAttr.key, begin_time:startDate.format('YYYY-MM-DD'), end_time:endDate.format('YYYY-MM-DD')};
                if ( startHour ) {
                    obj.day_start_hour = startHour;
                }
                if ( currentAttr.key ){
                    yield put({ type:'toggleLoading'});                
                    let { data } = yield call(getMeterReport, obj );
                    if ( data && data.code === '0'){
                        yield put({ type:'getMeterReport', payload:{ data:data.data }});
                    } 
                } else {
                    yield put({ type:'getMeterReport', payload:{ data:[] }});
                }                      
            } catch(err){
                console.log(err);
            }
        },
        *fetchMeterDetail(action, { call, put, select, all }){
            let { resolve, reject } = action.payload || {};
            let { user:{ company_id, startDate, endDate }, fields:{ currentAttr, energyInfo }} = yield select();
            let params = { company_id, type_id:energyInfo.type_id, attr_id:currentAttr.key, begin_time:startDate.format('YYYY-MM-DD'), end_time:endDate.format('YYYY-MM-DD') };
            let { data } = yield call(getMeterReportDetail, params);
            if ( data && data.code === '0'){
                let { page, total_page, info } =  data.data;
                let totalData = info || [];
                let pageArr = [];
                // 可能分页返回，同时请求完所有分页抄表记录
                if ( total_page > page ) {
                    for( let i = 2; i <= total_page; i++){
                        pageArr.push(i);
                    }
                }
                
                let [...arrayData] = yield all(
                    pageArr.map((page)=>{
                        return call(getMeterReportDetail, { ...params, page })
                    })
                )
                if ( arrayData && arrayData.length ) {
                    arrayData.forEach(pageData=>{
                        totalData.push( ...pageData.data.data.info );
                    })
                }
                if ( resolve ) resolve(totalData || []);
            } else {
                if ( reject ) reject(data.msg);
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
        select(state, { payload }){
            return { ...state, checkedKeys:payload };
        },
        setStartHour(state, { payload }){
            return { ...state, startHour:payload };
        },
        reset(){
            return initialState;
        }
    }
}

