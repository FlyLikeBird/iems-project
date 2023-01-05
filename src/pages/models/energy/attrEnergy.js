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
            yield put.resolve({ type:'fields/init'});
            let [a,b,c] = yield all([
                put.resolve({type:'fetchCost'}),
                put.resolve({type:'fetchAttrQuota'}),
                put.resolve({type:'fetchEnergyQuota'})
            ]);
            if ( resolve && typeof resolve === 'function' ) resolve();
        },
        *fetchCost(action, { call, put, select, all }){
           
            try {
                let { user:{ company_id }, fields:{ energyInfo, currentField }, attrEnergy : { currentDate }} = yield select();
                let { resolve, reject } = action.payload ? action.payload : {};
                let temp = currentDate.format('YYYY-MM-DD').split('-');
                let year = temp[0], month = temp[1], day = temp[2];
                yield put({ type:'toggleLoading'});
                let [attrMonthData, attrDayData, attrHourData] = yield all([
                    call(getAttrCost, { company_id, field_id:currentField.field_id, type_id:energyInfo.type_id, time_type:'2', year, month, day }),
                    call(getAttrCost, { company_id, field_id:currentField.field_id, type_id:energyInfo.type_id, time_type:'3', year, month, day }),
                    call(getAttrCost, { company_id, field_id:currentField.field_id, type_id:energyInfo.type_id, time_type:'4', year, month, day }),
                ]);
                if ( attrMonthData && attrMonthData.data.code === '0' && attrDayData && attrDayData.data.code === '0' && attrHourData && attrHourData.data.code === '0'){
                    let obj = { attrMonthData:attrMonthData.data.data, attrDayData:attrDayData.data.data, attrHourData:attrHourData.data.data };
                    yield put({type:'get', payload:obj});
                    if ( resolve && typeof resolve === 'function') resolve();
                } 
            } catch(err){
                console.log(err);
            }        
        },
        *fetchAttrQuota(action, { select, call, put, all }){    
            try {
                let { resolve, reject, forReport } = action.payload || {};
                let { user:{ company_id, startDate, endDate }, energy, fields:{ currentField, energyInfo }} = yield select();
                if ( currentField.field_id ){
                    let finalEnergyInfo = forReport ? energy.energyInfo.type_id === 0 ? { type_name:'电', type_code:'ele', type_id:'1', unit:'kwh' } : energy.energyInfo : energyInfo;
                    let params = 
                        forReport 
                        ? 
                        { company_id, type_id:finalEnergyInfo.type_id, field_id:currentField.field_id, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD')}
                        :
                        { company_id, type_id:finalEnergyInfo.type_id, field_id:currentField.field_id }
                    yield put({ type:'toggleRegionLoading'});
                    let { data } = yield call(getAttrQuota, params);
                    if ( data && data.code === '0'){
                        yield put({type:'getAttrQuota', payload:{ data : data.data }});
                        if ( resolve ) resolve();
                    } else {
                        if ( reject ) reject();
                    }
                }  
            } catch(err){
                console.log(err);
            }       
        },
        *fetchEnergyQuota(action, { call, put, select }){       
            try {
                let { resolve, reject, forReport, timeType } = action.payload || {};
                timeType = timeType || '2';
                let { user:{ company_id, startDate, endDate }} = yield select();
                let params = forReport ? { company_id, timeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') } : { company_id, timeType };
                let { data } = yield call(getEnergyQuota, params);
                if ( data && data.code === '0'){
                    yield put({type:'getEnergyQuota', payload:{ data : data.data }});
                    if ( resolve ) resolve();
                } else {
                    if ( reject ) reject();
                }
            } catch(err){
                console.log(err);
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


