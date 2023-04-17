import { getEfficiencyQuota, getEfficiencyTree } from '../../services/efficiencyService';
import { getEnergyType } from '../../services/energyService';

const date = new Date();

const initialState = {
    // 1:年定额   2:月定额 
    timeType:'1',
    energyInfo:{ type_id : 1, type_name:'电', type_code:'ele', unit:'kwh' },
    energyList:[],
    quotaInfo:{},
    quotaTree:{},
    chartLoading:true,
    year:date.getFullYear()
};
//  年度定额执行率  标红的柱状数量和全部柱状数量的占比
export default {
    namespace:'efficiencyQuota',
    state:initialState,
    effects:{
        *fetchQuotaInit(action, { select, call, put, all}){
            try{
                let { resolve, reject, forReport } = action.payload || {};
                if ( !forReport ){
                    yield put.resolve({ type:'fields/init'});
                }
                yield put.resolve({ type:'fetchQuota'});
                if ( resolve && typeof resolve === 'function' ) resolve();
            } catch(err){
                console.log(err);
            }
        },
        *fetchQuota(action, { call, put, select}){
            let { user:{ company_id }, fields:{ currentAttr }, efficiencyQuota :{ timeType, energyInfo, year, month  } } = yield select();       
            let { data } = yield call(getEfficiencyQuota, { company_id, time_type:timeType, energy_type:energyInfo.type_id, attr_id:currentAttr.key, year, month })
            if ( data && data.code === '0'){
                yield put({type:'getQuota', payload:{ data:data.data }});
            } 
            
        },
        *fetchEnergy(action ,{ call, put}){
            try{
                let { data } = yield call(getEnergyType);
                if ( data && data.code === '0'){
                    yield put({type:'getEnergy', payload : { data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchTreeInit(action, { call, put, all}){
            try{
                let { resolve, reject } = action.payload || {};
                yield all([
                    put.resolve({ type:'fetchEnergy'}),
                    put.resolve({ type:'fields/fetchField'})
                ]);
                yield put.resolve({ type:'fields/fetchFieldAttrs'});
                yield put.resolve({ type:'fetchTree'});
                if ( resolve && typeof resolve === 'function' ) resolve();
            } catch(err){
                console.log(err);
            }
        },
        *fetchTree(action, { call, put, select }){
            let { user:{ company_id }, fields : { currentAttr }, efficiencyQuota : { energyInfo }} = yield select();
            yield put({ type:'toggleChartLoading'});
            let { data } = yield call(getEfficiencyTree, { company_id, attr_id:currentAttr.key, energy_type:energyInfo.type_id });
            if ( data && data.code === '0'){
                yield put({type:'getTree', payload:{ data:data.data }});
            }
        }  
    },
    reducers:{
        toggleChartLoading(state){
            return { ...state, chartLoading:true };
        },
        getEnergy(state, { payload : { data }}){
            return { ...state, energyList:data };
        },
        getQuota(state, { payload : { data }}){
            return { ...state, quotaInfo:data };
        },
        resetQuota(state){
            return { ...state, quotaInfo:{} };
        },
        getTree(state, { payload: { data }}){
            return { ...state, quotaTree:data, chartLoading:false };
        },
        toggleEnergyType(state, { payload }){
            let energyInfo = state.energyList.filter(i=>i.type_id === payload )[0];
            return { ...state, energyInfo };
        },
        toggleTimeType(state, { payload }){
            return { ...state, timeType:payload };
        },
        toggleYear(state, { payload }){
            return { ...state, year:payload };
        },
        resetYear(state){
            return { ...state, year:new Date().getFullYear() };
        },
        reset(state){
            return initialState;
        }
    }
}

