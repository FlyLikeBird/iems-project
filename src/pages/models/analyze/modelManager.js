import { getCompareModel } from '../../services/modelManagerService.js';
import { getMachList, getMachRunEff } from '../../services/analyzeMachService';

import moment from 'moment';

let date = new Date();
const initialState = {
    compareModel:[],
    isLoading:true,
    runEffInfo:{},
    machEffLoading:true,
    currentDate:moment(new Date()),
    currentMach:{},
    machList:[], 
};

export default {
    namespace:'modelManager',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *initCompareModel(action, { put, select }){
            yield put({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                      
            yield put.resolve({ type:'fields/fetchField'}); 
            let { fields:{ allFields, energyInfo }} = yield select();
            let modelField;
            if ( allFields[energyInfo.type_code] ) {
                let fieldList = allFields[energyInfo.type_code].fieldList;
                if ( fieldList && fieldList.length ) {
                    let result = fieldList.filter(i=>i.is_model_cate)[0];
                    if ( result ){
                        modelField = result;
                    }
                }
            }
            if ( modelField ){
                // 如果匹配到空压机相关维度，则更改默认支路维度和属性树
                yield put({ type:'fields/toggleField', payload:{ visible:false, field:modelField }});
                yield put.resolve({ type:'fields/fetchFieldAttrs'});
                let { fields:{ currentAttr }} = yield select();
                if ( currentAttr.children && currentAttr.children.length ) {
                    yield put({ type:'fields/toggleAttr', payload:currentAttr.children[0] });
                }
            }
            yield put({ type:'fetchCompareModel'});
        },
        *fetchCompareModel(action, { select, call, put}){
            try {
                let { user:{ company_id, startDate, endDate }, fields :{ currentAttr }} = yield select();
                yield put({ type:'toggleLoading'});
                let { data } = yield call(getCompareModel, { company_id, attr_id:currentAttr.key, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') });
                if ( data && data.code === '0'){
                    yield put({type:'getCompareModelResult', payload:{ data:data.data }});
                } else {
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchMachList(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { resolve, reject, attr_id } = action.payload ? action.payload : {};
                let { data } = yield call(getMachList, { company_id, attr_id });
                if ( data && data.code === '0'){
                    yield put({type:'getMachResult', payload:{ data:data.data }});
                    if ( resolve && typeof resolve === 'function' ) resolve();
                } else {
                    if ( reject && typeof reject === 'function') reject();
                }
            } catch(err){
                console.log(err);
            }
        },
        *resetMachEff(action, { put }){
            yield put.resolve({ type:'cancelMachEff'});
            yield put.resolve({ type:'reset'});
        },
        *fetchMachEff(action, { call, put, select }){       
            try {
                let { user:{ company_id }, modelManager:{ currentMach, currentDate }} = yield select();
                yield put({ type:'toggleMachEffLoading'});
                let { data } = yield call(getMachRunEff, { company_id, begin_date:currentDate.format('YYYY-MM-DD'), end_date:currentDate.format('YYYY-MM-DD'), mach_id:currentMach.mach_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getMachRunEff', payload:{ data:data.data }});
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
        toggleMachEffLoading(state){
            return { ...state, machEffLoading:true };
        },
        getCompareModelResult(state, { payload:{ data }}){
            return { ...state, compareModel:data, isLoading:false };
        },
        getMachResult(state, { payload:{ data }}){
            let currentMach = data && data.length ? data[0] : {};
            return { ...state, machList:data, currentMach };
        },
        getMachRunEff(state, { payload:{ data }}){
            return { ...state, runEffInfo:data, machEffLoading:false };
        },
        selectMach(state, { payload:{ data }}){
            return { ...state, currentMach:data }
        },
        resetChart(state){
            return { ...state, machList:[], currentMach:{}, machEffLoading:true, runEffInfo:{} };
        },
        setCurrentMach(state, { payload }){
            return { ...state, currentMach:payload };
        },
        setDate(state, { payload }){
            return { ...state, currentDate:payload };
        },
        reset(state){
            return initialState;
        },
        
    }
}


