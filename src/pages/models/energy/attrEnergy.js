import { getAttrCost, getAttrQuota, getEnergyType, getEnergyQuota } from '../../services/energyService';
import { getDayAndMonthData } from '../../utils/translateDay.js';
import moment from 'moment';

const date = new Date();

const initialState = {
     // 0 成本   1 能耗
    showType:'0',
    attrData:[{ key:'month'}, { key:'day'}, { key:'hour'}],
    attrQuota:[],
    energyQuota:[],
    regionLoading:true,
    isLoading:true,
    currentDate:moment(date),
    timeType:'day'
};

export default {
    namespace:'attrEnergy',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *cancelAll(action, { put }){
            yield put({ type:'cancelCost'});
            yield put({ type:'cancelAttrQuota'});
            yield put({ type:'cancelEnergyQuota'});
            yield put({ type:'reset'});
        },
        *init(action, { call, put, select, all}){
            let { resolve, reject } = action.payload || {};
            let [a,b,c] = yield all([
                put.resolve({type:'fetchCost'}),
                put.resolve({type:'fetchAttrQuota'}),
                put.resolve({type:'fetchEnergyQuota'})
            ]);
            if ( resolve && typeof resolve === 'function' ) resolve();
        },
        *fetchCost(action, { call, put, select, all }){
            yield put.resolve({ type:'cancelCost'});
            yield put.resolve({ type:'cancelable', task:fetchCostCancelabe, action:'cancelCost' });
            function* fetchCostCancelabe(){
                try {
                    let { user:{ company_id }, fields:{ energyInfo }, attrEnergy : { currentDate }} = yield select();
                    let { resolve, reject } = action.payload ? action.payload : {};
                    let temp = currentDate.format('YYYY-MM-DD').split('-');
                    let year = temp[0], month = temp[1], day = temp[2];
                    yield put({ type:'toggleLoading'});
                    let [attrMonthData, attrDayData, attrHourData] = yield all([
                        call(getAttrCost, { company_id, type_id:energyInfo.type_id, time_type:'2', year, month, day }),
                        call(getAttrCost, { company_id, type_id:energyInfo.type_id, time_type:'3', year, month, day }),
                        call(getAttrCost, { company_id, type_id:energyInfo.type_id, time_type:'4', year, month, day }),
                    ]);
                    if ( attrMonthData && attrMonthData.data.code === '0' && attrDayData && attrDayData.data.code === '0' && attrHourData && attrHourData.data.code === '0'){
                        let obj = { attrMonthData:attrMonthData.data.data, attrDayData:attrDayData.data.data, attrHourData:attrHourData.data.data };
                        yield put({type:'get', payload:obj});
                        if ( resolve && typeof resolve === 'function') resolve();
                    }
                } catch(err){
                    console.log(err);
                }
            }  
        },
        *fetchAttrQuota(action, { select, call, put, all }){
            yield put.resolve({ type:'cancelAttrQuota'});
            yield put.resolve({ type:'cancelable', task:fetchAttrQuotaCancelable, action:'cancelAttrQuota' });
            function* fetchAttrQuotaCancelable(){
                try {
                    let { user:{ company_id }, fields:{ energyInfo }} = yield select();
                    yield put({ type:'toggleRegionLoading'});
                    let { data } = yield call(getAttrQuota, { company_id, type_id:energyInfo.type_id });
                    if ( data && data.code === '0'){
                        yield put({type:'getAttrQuota', payload:{ data : data.data }});
                    }
                } catch(err){
                    console.log(err);
                }
            }
        },
        *fetchEnergyQuota(action, { call, put, select }){
            yield put.resolve({ type:'cancelEnergyQuota' });
            yield put.resolve({ type:'cancelable', task:fetchEnergyQuotaCancelable, action:'cancelEnergyQuota'});
            function* fetchEnergyQuotaCancelable(){
                try {
                    let { user:{ company_id }} = yield select();
                    let timeType = action && action.payload || '2';
                    let { data } = yield call(getEnergyQuota, { company_id, time_type:timeType });
                    if ( data && data.code === '0'){
                        yield put({type:'getEnergyQuota', payload:{ data : data.data }});
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
        toggleRegionLoading(state){
            return { ...state, regionLoading:true };
        },
        get(state, { payload : { attrMonthData, attrDayData, attrHourData }}){
            attrMonthData['key'] = 'month';
            attrDayData['key'] = 'day';
            attrHourData['key'] = 'hour';
            return { ...state, attrData:[ attrMonthData, attrDayData, attrHourData ], isLoading:false };
        },
        getType(state, { payload : { data } }){
            data.unshift({ type_id : 0, type_name:'总', type_code:'total', unit:'kwh' });
            return { ...state, energyList:data };
        },
        getAttrQuota(state, { payload : {data}}){
            let attrQuota = data.sort((a,b)=>b.cost-a.cost);
            return { ...state, attrQuota, regionLoading:false };
        },
        getEnergyQuota(state, { payload: { data}}){
            let arr = Object.keys(data).map(key=>{
                data[key]['key'] = key;
                return data[key];
            });
            return { ...state, energyQuota:arr };
        },
        toggleShowType(state, { payload }){
            return { ...state, showType:payload };
        },
        toggleTimeType(state, { payload:{ data }}){
        
            return { ...state, timeType:data };
        },
        setDate(state, { payload }){
            return { ...state, currentDate:payload };
        },
        reset(state){
            return initialState;
        }
    }
}


