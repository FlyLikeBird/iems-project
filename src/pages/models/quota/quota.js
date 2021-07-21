import { getEnergyType, getQuotaList, getQuotaTemplate, fillQuota, exportQuota, importQuota, importTpl } from '../../services/quotaService';
let date = new Date();

const initialState = {
    list:[],
    energyList:[],
    // 默认能源类型为电
    energyInfo:{},
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
                // let { quota:{ energyList }} = yield select();             
                // if ( query ){
                //     let temp = energyList.filter(i=>i.type_id == query )[0];
                //     yield put({ type:'quota/toggleEnergy', payload:temp });
                // }          
                yield put({ type:'fetchQuota'});
            } catch(err){
                console.log(err);
            }
        },
        *fetchQuota(action, { call, put, select, all }){
            yield put({ type:'cancelQuota'});
            yield put({ type:'cancelable', task:fetchQuotaCancelable, action:'cancelQuota' });
            function* fetchQuotaCancelable(){
                try {
                    let { user:{ company_id, pagesize }, fields:{ currentAttr }, quota:{ pageNum, energyInfo, time_type, year }} = yield select();
                    yield put({type:'toggleLoading' });
                    let { data } = yield call(getQuotaList, { company_id, attr_id:currentAttr.key, year, time_type, type_id:energyInfo.type_id, page:pageNum, pagesize });
                    if ( data && data.code === '0' ){
                        yield put({type:'get', payload:{ data:data.data, total:data.count }})
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
            let { quota : { currentEnergy, time_type, year, is_calc_year }} = yield select();
            let finalValue;
            let obj = { type_id:currentEnergy, attr_id: currentKey, time_type, year, is_calc_year:1 };
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
                
            } else {
                if ( reject && typeof reject === 'function') reject();
            }
        },
        *export(action, { call, put, select}){
            let { user:{ company_id }, fields : { currentAttr}, quota: { currentEnergy, year }} = yield select();
            let url = yield call(exportQuota, { company_id, attr_id:currentAttr.key, year, type_id:currentEnergy});
            window.location.href = url;
        },
        *import(action, { select, call, put}){
            let { file } = action.payload;
            let { user:{ company_id }} = yield select();
            let { data } = yield call(importQuota, { company_id, file });
            if ( data && data.code === '0' ) {
                yield put({type:'fetchQuota'});
                yield put({type:'toggleVisible', payload:false });
            }
        },
        *importTpl(action, { call, put, select}){
            let { user:{ company_id }, fields: { currentField }, quota:{ currentEnergy}} = yield select();
            let url = yield call(importTpl, { company_id, field_id:currentField.field_id, type_id:currentEnergy});
            window.location.href = url;
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getEnergy(state, { payload : { data }}){
            let energyInfo = data.filter(i=>i.type_code === 'ele')[0];
            return { ...state, energyList:data, energyInfo:energyInfo || {} };
        },
        get(state,{ payload:{ data, total }}){
            return { ...state, list:data.data, total, isLoading:false };
        },
        toggleEnergy(state, { payload}){
            return { ...state, energyInfo : payload } ;
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
