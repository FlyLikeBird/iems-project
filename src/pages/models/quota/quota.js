import { getEnergyType, getQuotaList, getQuotaTemplate, fillQuota, exportQuota, importQuota, importTpl } from '../../services/quotaService';
let date = new Date();

const initialState = {
    list:[],
    optionList:[],
    // 默认能源类型为电
    optionInfo:{},
    // 默认年份为今年
    year:date.getFullYear(),
    // 默认定额周期为年
    time_type:'1',
    is_calc_year:'1',
    total:0,
    pageNum:1,
    isLoading:true,
    visible:false,
};

export default {
    namespace:'quota',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *fetchInit(action, { call, select, put}){
            try {
                let { query } = action.payload;
                yield put.resolve({ type:'fetchEnergy'});
                yield put.resolve({ type:'fields/init'});        
                yield put({ type:'fetchQuota'});
            } catch(err){
                console.log(err);
            }
        },
        *fetchQuota(action, { call, put, select, all }){
            yield put({ type:'cancelQuota'});
            yield put.resolve({ type:'cancelable', task:fetchQuotaCancelable, action:'cancelQuota' });
            function* fetchQuotaCancelable(){
                try {
                    let { user:{ company_id, pagesize }, fields:{ currentAttr }, quota:{ pageNum, optionInfo, time_type, year }} = yield select();
                    if ( currentAttr.key ){
                        yield put({type:'toggleLoading' });
                        let { data } = yield call(getQuotaList, { company_id, attr_id:currentAttr.key, year, time_type, type_id:optionInfo.type_id, page:pageNum, pagesize });
                        if ( data && data.code === '0' ){
                            yield put({type:'get', payload:{ data:data.data, total:data.count }})
                        } 
                    } else {
                        yield put({ type:'get', payload:{ data:{ data:[] }}})
                    }
                } catch(err){
                    console.log(err);
                }
            }  
        },
        *fetchEnergy(action, { call, put}){
            let { data } = yield call(getEnergyType);
            if ( data && data.code === '0'){
                yield put({type:'getEnergy', payload:{data:data.data}});
            }
            return data.data;
        },
        *save(action, { call, put, select}){
            // 当编辑时把表单项传过来  删除时把一行记录传过来
            let { values, currentKey, dataIndex, forDelete, resolve, reject } = action.payload;
            let { fields:{ currentAttr }, quota : { optionInfo, time_type, year, is_calc_year }} = yield select();
            let finalValue;
            let obj = { type_id:optionInfo.type_id, attr_id: currentKey, time_type, year, is_calc_year:1 };
            if ( time_type === '1'){
                // 年定额
                finalValue = forDelete ? 0 : values['fill_value'];
                obj['month'] = 1;    
                obj['value'] = finalValue;
            } else {
                // 月定额
                finalValue = forDelete ? 0 : values[dataIndex];
                obj['month'] = dataIndex && ( dataIndex.length === 7 ) ? dataIndex.slice(-1) : dataIndex && ( dataIndex.length === 8 ) ? dataIndex.slice(-2) : '';
                obj['value'] = finalValue;
            }
            let { data } = yield call(fillQuota, obj);
            if ( data && data.code === '0') {
                if ( resolve && typeof resolve === 'function') resolve();
            } else if ( data && data.code === '1001'){
                yield put({ type:'user/loginOut'});
            } else {
                if ( reject && typeof reject === 'function') reject();
            }
        },
        *export(action, { call, put, select}){
            let { user:{ company_id }, fields : { currentAttr }, quota: { optionInfo, year }} = yield select();
            if ( localStorage.getItem('user_id')) {
                let url = yield call(exportQuota, { company_id, attr_id:currentAttr.key, year, type_id:optionInfo.type_id });
                window.location.href = url;
            } else {
                yield put({ type:'user/loginOut'});
            }
        },
        *import(action, { select, call, put}){
            let { file } = action.payload;
            let { user:{ company_id }} = yield select();
            let { data } = yield call(importQuota, { company_id, file });
            if ( data && data.code === '0' ) {
                yield put({type:'fetchQuota'});
                yield put({type:'toggleVisible', payload:false });
            } else if ( data && data.code === '1001') {
                yield put({ type:'user/loginOut'});
            }
        },
        *importTpl(action, { call, put, select}){
            let { user:{ company_id }, fields: { currentField }, quota:{ optionInfo }} = yield select();
            if ( localStorage.getItem('user_id')) {
                let url = yield call(importTpl, { company_id, field_id:currentField.field_id, type_id:optionInfo.type_id });
                window.location.href = url;
            } else {
                yield put({ type:'user/loginOut'});
            }
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getEnergy(state, { payload : { data }}){
            let optionInfo = data.filter(i=>i.type_code === 'ele')[0];
            return { ...state, optionList:data, optionInfo:optionInfo || {} };
        },
        get(state,{ payload:{ data, total }}){
            return { ...state, list:data.data, total, isLoading:false };
        },
        toggleOption(state, { payload}){
            return { ...state, optionInfo : payload } ;
        },
        toggleTimeType(state, { payload }){
            return { ...state, time_type:payload };
        },
        toggleYear(state, { payload }){
            return { ...state, year:payload };
        },
        setPageNum(state, { payload }){
            return { ...state, pageNum:payload };
        },
        toggleVisible(state, { payload }){
            return { ...state, visible:payload };
        },
        reset(state){
            return initialState;
        }
       
    }
}
