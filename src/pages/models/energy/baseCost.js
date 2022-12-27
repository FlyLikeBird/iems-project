import {  getTotalCost, getBaseCost, setMachKva, getAdjustCost, getMeasureCost, getCostAreaTrend, getCalendarInfo } from '../../services/energyService';
import moment from 'moment';

let date = new Date();
const initialState = {
    // 基本电费
    baseCostInfo:{},
    // 力调电费
    adjustCostInfo:{},
    measureCostInfo:{},
    measureInfoList:[],
    measureReferList:[],
    treeLoading:true,
    isLoading:true,
    // 成本日历模块
    calendarInfo:{},
    calendarLoading:true
};

export default {
    namespace:'baseCost',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        // 电费成本入口(基本电费、计量电费、力调电费)
        *initEleCost(action, { put, all }){
            yield all([
                put.resolve({ type:'fields/init'}),
                put.resolve({ type:'worktime/fetchWorktimeList'})
            ])
            yield put({ type:'fetchEleCost' });
        },
        *fetchEleCost(action, { call, put, select }){
            let { eleCostType } = action.payload || {};
            eleCostType = eleCostType || 'measure';
            if ( eleCostType === 'measure') {
                yield put( { type:'fetchMeasureCost'});
            } else if ( eleCostType === 'basecost') {
                yield put({ type:'fetchBaseCost'})
            } else if ( eleCostType === 'adjust') {
                yield put({ type:'fetchAdjustCost'})
            }
        },
        // 此接口提供给分析报告调用
        *fetchEleAnalyze(action, { call, put, all, select }){
            let { resolve, reject } = action.payload || {};
            yield all([
                put.resolve({ type:'fetchMeasureCost'}),
                put.resolve({ type:'fetchBaseCost'}),
                put.resolve({ type:'fetchAdjustCost'})
            ]);
            if ( resolve && typeof resolve === 'function') resolve();
        },
        *fetchBaseCost(action, { call, put, select}){
            try {
                let { user:{ company_id, startDate, endDate }, fields:{ currentAttr }, worktime:{ currentWorktime }} = yield select();
                yield put({ type:'toggleLoading', payload:true });        
                let { data } = yield call(getBaseCost, { company_id, attr_id:currentAttr.key, rostering_id:currentWorktime.id, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') });
                if ( data && data.code === '0'){
                    yield put({type:'getBaseInfo', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *setMachKva(action, { call, put, select}){
            try {
                let { baseCost : { currentMach }} = yield select();
                let { total_kva, resolve, reject } = action.payload;
                let { data } = yield call(setMachKva, { total_kva, mach_id:currentMach.key });
                if ( data && data.code === '0'){
                    resolve();
                } else {
                    reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchAdjustCost(action, { call, put, select }){
            try {
                let { user:{ company_id }, fields : { currentAttr }, worktime:{ currentWorktime }} = yield select();
                yield put({ type:'toggleLoading', payload:true });        
                let { data } = yield call(getAdjustCost, { company_id, attr_id:currentAttr.key, rostering_id:currentWorktime.id });
                if ( data && data.code === '0'){
                    yield put({type:'getAdjustInfo', payload:{ data:data.data }});
                } 
            } catch(err){
                console.log(err);
            }
        },
        *fetchMeasureCost(action, { call, put, select }){
            try {
                let { user:{ company_id, startDate, endDate, timeType }, fields:{ currentAttr }, worktime:{ currentWorktime }} = yield select(); 
                yield put({ type:'toggleLoading', payload:true });        
                // 1：按月；2：按年 
                timeType = timeType === '2' ? '1' : timeType === '3' ? '2' : timeType === '10' ? '1' : timeType ;
                let { data } = yield call(getMeasureCost, { company_id, attr_id:currentAttr.key, rostering_id:currentWorktime.id, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), time_type:timeType });
                if ( data && data.code === '0') {
                    yield put({ type:'getMeasureInfo', payload:{ data:data.data }});
                } 
            } catch(err){
                console.log(err);
            }
        },
        // 成本日历相关接口
        *initCalendar(action, { call, put }){
            let { mode, year, month } = action.payload || {};
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchCalendar', payload:{ mode, year, month }});
        },
        *fetchCalendar(action, { call, put, select }){
            let { user:{ company_id }, fields:{ currentAttr, energyInfo }} = yield select();
            let { mode, year, month } = action.payload || {};
            yield put({ type:'toggleLoading', payload:true });
            let { data } = yield call(getCalendarInfo, { company_id, attr_id:currentAttr.key, energy_type:energyInfo.type_id, year, month, time_type:mode === 'month' ? '2' : '3' });
            if ( data && data.code === '0'){
                yield put({ type:'getCalendarResult', payload:{ data:data.data }});
            } else {
                yield put({ type:'getCalendarResult', payload:{ data:{} }})
            }
            
        }
    },
    reducers:{
        getInit(state, { payload:{ energyList, machList }}) {
            energyList = energyList.filter(i=>i.type_code === 'ele');
            let energyInfo = energyList[0] ? energyList[0] : {};
            let currentMach = machList[0] ? machList[0] : {};
            return { ...state, energyList, machList, energyInfo, currentMach, treeLoading:false };
        },
        toggleLoading(state, { payload }){
            return { ...state, isLoading:payload };
        },
        getBaseInfo(state, { payload: { data }}){
            return { ...state, baseCostInfo:data, isLoading:false };
        },
        getAdjustInfo(state, { payload:{ data }}){
            return { ...state, adjustCostInfo:data, isLoading:false };
        },
        getMeasureInfo(state, { payload:{ data }}){
            let measureInfoList, measureReferList;
            // 将尖时段信息设为数组第一项
            let temp = data.base.detail.pop(), temp2 = data.referInfo.refer.pop();
            data.base.detail.unshift(temp);
            data.referInfo.refer.unshift(temp2);
            measureInfoList = data.base.detail;
            measureReferList = data.referInfo.refer;
            return { ...state, measureCostInfo:data, measureInfoList, measureReferList, isLoading:false };
        },
        getCalendarResult(state, { payload:{ data }}){
            return { ...state, calendarInfo:data, isLoading:false };
        },
        selectMach(state, { payload }){
            return { ...state, currentMach:payload };
        },
        reset(state){
            return initialState;
        }
        
    }
}



