import { 
    getRateInfo, getFeeRate, setWaterRate, getBilling, getCity,
    addRate, updateRate, delRate,
    addQuarter, editQuarter, delQuarter, 
    isActive, isUnActive, editRate,
    getTpl, applyTpl
} from '../../services/billingService';

const initialState = {
    rateList:[],
    is_actived:false,
    rateInfo:{},
    feeRate:{},
    tplList:[],
    // 公司可配置多个计费方案，尖峰平谷时段跟温度相关联
    isLoading:false
};

export default {
    namespace:'billing',
    state:initialState,
    effects:{
        *init(action, { select, call, put, all }){
            yield put({ type:'fetchEleBilling'});
            yield put({ type:'fetchFeeRate'});
            yield put({ type:'fetchRateInfo'});
        },
        *fetchCity(action, { call, put }){
            let { keyword, resolve, reject } = action.payload;
            let { data } = yield call(getCity, { keyword });
            if ( data && data.code === '0'){
                if ( resolve ) resolve(data.data);
            }
        },
        *fetchRateInfo(action, { select, call, put }){
            let { user:{ company_id }} = yield select();
            let { data } = yield call(getRateInfo, { company_id });
            if ( data && data.code === '0'){
                yield put({ type:'getRateInfoResult', payload:{ data:data.data }});
            }
        },
        *setRateInfo(action, { call, put, select }){
            let { user:{ company_id }} = yield select();
            let { values, resolve, reject } = action.payload || {};
            values['company_id'] = company_id;
            let { data } = yield call(editRate, values);
            if ( data && data.code === '0'){
                yield put({ type:'fetchRateInfo'});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.msg);
            }
        },
        // 获取电力计费方案
        *fetchEleBilling(action, { select, call, put }){
            let { user:{ company_id }} = yield select();
            yield put({ type:'toggleLoading'});
            let { data } = yield call(getBilling, { company_id });
            if ( data && data.code === '0' ) {
                yield put({type:'get', payload:{ data:data.data }});
            }
        },
        *addRateAsync(action, { select, call, put }){
            let { user:{ company_id }} = yield select();
            let { values, forEdit, resolve, reject } = action.payload || {};
            values['company_id'] = company_id;
            let { data } = yield call(forEdit ? updateRate : addRate, values);
            if ( data && data.code === '0'){
                yield put({ type:'fetchEleBilling'});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.msg);
            }
        },
        *delRateAsync(action, { select, call, put }){
            let { rate_id, resolve, reject }= action.payload || {};
            let { data } = yield call(delRate, { rate_id });
            if ( data && data.code === '0'){
                yield put({ type:'fetchEleBilling'});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.msg);
            } 
        },
        *addQuarterAsync(action, { call, put, select}){
            let { user:{ company_id }} = yield select();
            let { values, forEdit, resolve, reject } = action.payload || {};
            values['company_id'] = company_id;
            values.begin_month = values.begin_month.month() + 1;
            values.end_month = values.end_month.month() + 1;
            let { data } = yield call(forEdit ? editQuarter : addQuarter, values);
            if ( data && data.code === '0'){
                yield put({ type:'fetchEleBilling'});
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.msg);
            }      
        },
        *delQuarterAsync(action, { call, put }){
            let { resolve, reject, quarter_id } = action.payload || { };
            let { data } = yield call(delQuarter, { quarter_id });
            if ( data && data.code === '0' ) {
                yield put({ type:'fetchEleBilling' });
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.msg);
            }
        },
        *active(action, { call, put, select}){
            let { resolve, reject } = action.payload;
            let { user:{ company_id }, billing : { is_actived }} = yield select();
            if ( is_actived ) {
                // 取消激活
                let { data } = yield call(isUnActive, { company_id });
                if ( data && data.code === '0'){
                    if ( resolve ) resolve();
                } else {
                    if ( reject ) reject(data.msg);
                }
            } else {
                // 激活
                let { data } = yield call(isActive, { company_id });
                if ( data && data.code === '0') {
                    if ( resolve ) resolve();
                } else {
                    if (reject) reject(data.msg);
                }
            }
        },
        
        *fetchFeeRate(action, { select, call, put}){
            let { user:{ company_id }} = yield select();
            let { data } = yield call(getFeeRate, { company_id });
            if ( data && data.code === '0'){
                yield put({ type:'getFeeRate', payload:{ data:data.data }});                
            } 
        },
        *setFeeRate(action, { select, call, put }){
            let { user:{ company_id }} = yield select();
            let { resolve, reject, water_rate } = action.payload || {};
            let { data } = yield call(setWaterRate, { company_id, water_rate });
            if ( data && data.code === '0'){
                yield put({ type:'fetchFeeRate'});
                if ( resolve && typeof resolve === 'function' ) resolve();
            } else {
                if ( reject && typeof reject === 'function' ) reject(data.msg);
            }
        },
        *getTplAsync(action, { select, call, put }){
            let { rate_id } = action.payload || {};
            let { data } = yield call(getTpl, { rate_id });
            if ( data && data.code === '0'){
                yield put({ type:'getTplResult', payload:{ data:data.data }});
            }
        },
        *applyTplAsync(action, { select, call, put }){
            let { rate_id, tpl_id, resolve, reject } = action.payload || {};
            let { data } = yield call(applyTpl, { rate_id, tpl_id });
            if ( data && data.code === '0'){
                // console.log(data.data);
                if ( resolve && typeof resolve === 'function' ) resolve();
                yield put({ type:'fetchEleBilling'});
            } else {
                if ( reject && typeof reject === 'function') reject(data.msg);
            }
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        get(state, { payload : {data} }){
            let { rate } = data;
            let is_actived = rate.is_actived === 0 ? false : true;
            return { ...state, rateList:rate, isLoading:false };
        },
        getRateInfoResult(state, { payload:{ data }}){
            return { ...state, rateInfo:data };
        },
        toggleActive(state){
            return { ...state, is_actived:!state.is_actived};
        },
        getFeeRate(state, { payload:{ data }}){
            return { ...state, feeRate:data };
        },
        getTplResult(state, { payload:{ data }}){
            let { tplRecord } = data;
            return { ...state, tplList:tplRecord || [] };
        },
        reset(){
            return initialState;
        }
    }
}
