import { 
    getMonitorInfo, 
    getOutputRank, 
    getCoalRank, 
    getMeterMach, 
    getTodayEnergy, 
    getProjectList,
    getFinishTrend,
    getWarningRank,
    getWarningType, 
    getWarningMonitor, 
    getWarningStatus,
    getWarningTrend,
    getWarningPercent,
    getDataLoad,
    getDayActiveDevice
} from '../services/agentMonitorService';

const initialState = {
    // 服务商指标监控
    todayEnergy:{},
    monitorInfo:{},
    // currentProvince:{ name:'广东省', code:'440000'},
    currentProvince:{},
    currentCity:{},
    projects:{},
    activeDevice:{},
    rankInfo:{},
    meterInfo:{},
    finishTrendInfo:{},
    dataLoad:{},
    // 服务商告警监控
    warningPercent:{},
    warningMonitor:{},
    warningStatus:{},
    warningRank:[],
    warningTrend:{},
    // 自动模式：根据socket数据自动更新状态
    // 手动模式：响应用户操作
    autoMode:true
};

export default {
    namespace:'agentMonitor',
    state:initialState,
    subscriptions:{
        setup({ dispatch, history}) {
            history.listen(({ pathname })=>{
                if ( pathname === '/agentMonitor' || pathname === '/agentMonitor/monitor'){
                    dispatch({ type:'fetchTodayEnergy'});
                    dispatch({ type:'fetchMonitorInfo'});
                    dispatch({ type:'fetchEnergyRank'});
                    dispatch({ type:'fetchMeterMach'});
                    dispatch({ type:'fetchFinishTrend'});
                    dispatch({ type:'fetchActiveDevice'});
                    // 第二屏数据
                    // dispatch({ type:'fetchDataLoad'});
                    dispatch({ type:'fetchWarningPercent'});
                    dispatch({ type:'fetchWarningRank'});
                    dispatch({ type:'fetchWarningMonitor'});
                    dispatch({ type:'fetchWarningStatus'});
                } 
                if ( pathname === '/agentMonitor/entry') {
                    dispatch({ type:'fetchProjectList'});
                }
            })
        }
    },
    effects:{
        *fetchTodayEnergy(action, { call, put}){
            try{
                let { data } = yield call(getTodayEnergy);
                if ( data && data.code === '0') {
                    yield put({ type:'getTodayEnergy', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchDataLoad(action, { call, put}){
            try {
                let { data } = yield call(getDataLoad);
                if ( data && data.code === '0'){
                    yield put({ type:'getDataLoad', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchActiveDevice(action, { call, put, select }){
            try {
                let { data } = yield call(getDayActiveDevice);
                if ( data && data.code === '0'){
                    yield put({ type:'getActiveDevice', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchMonitorInfo(action, { call, put}){
            try{
                let { data } = yield call(getMonitorInfo);
                if ( data && data.code === '0') {
                    yield put({ type:'getMonitorInfo', payload:{ data:data.data }})
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchProjectList(action, { call, put}){
            try{
                let { data } = yield call(getProjectList);
                if ( data && data.code === '0'){
                    yield put({ type:'getProjectList', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchEnergyRank(action, { call, put}){
            try {
                let { resolve, reject, timeType } = action.payload || {};
                timeType = timeType || '1';
                let { data } = yield call(getCoalRank, { time_type:timeType });
                if ( data && data.code === '0'){
                    yield put({ type:'getRankResult', payload:{ data:data.data }});
                    if ( resolve && typeof resolve === 'function') resolve();
                } else {
                    if ( reject && typeof reject === 'function') reject();
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchOutputRank(action, { call, put}){
            try {
                let { resolve, reject, timeType } = action.payload || {};
                timeType = timeType || '1'
                let { data } = yield call(getOutputRank, { time_type:timeType });
                if ( data && data.code === '0'){
                    yield put({ type:'getRankResult', payload:{ data:data.data }});
                    if ( resolve && typeof resolve === 'function') resolve();
                } else {
                    if ( reject && typeof reject === 'function') reject();
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchFinishTrend(action, { call, put}){
            try{
                let { data } = yield call(getFinishTrend);
                if ( data && data.code === '0'){
                    yield put({ type:'getFinishTrend', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchMeterMach(action, { call, put}){
            try{
                let { data } = yield call(getMeterMach);
                if ( data && data.code === '0'){
                    yield put({ type:'getMeterResult', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchWarningPercent(action, { call, put}){
            try {
                let { data } = yield call(getWarningPercent);
                if ( data && data.code === '0'){
                    yield put({ type:'getWarningPercent', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchWarningRank(action, { call, put}){
            try {
                let { data } = yield call(getWarningRank);
                if ( data && data.code === '0'){
                    yield put({ type:'getWarningRank', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchWarningType(action, { call, put}){
            try{
                let { data } = yield call(getWarningType);
                if ( data && data.code === '0'){
                    yield put({ type:'getWarningType', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchWarningMonitor(action, { call, put}){
            try{
                let { data } = yield call(getWarningMonitor);
                if ( data && data.code === '0'){
                    yield put({type:'getWarningMonitor', payload:{ data:data.data }})
                }
            } catch(err){  
                console.log(err);
            }
        },
        // 分段请求
        // *fetchWarningStatus(action, { call, put}){
        //     try{
        //         let { cateCode, resolve, reject } = action.payload || {};
        //         cateCode = cateCode || '1';
        //         let { data } = yield call(getWarningStatus, { cate_code:cateCode });
        //         if ( data && data.code === '0'){
        //             yield put({ type:'getWarningStatus', payload:{ data:data.data }});
        //             if ( resolve && typeof resolve === 'function') resolve();
        //         } else {
        //             if ( reject && typeof reject === 'function') reject(data.msg);
        //         }
        //     } catch(err){
        //         console.log(err);
        //     }
        // },
        *fetchWarningStatus(action, { call, put, all}){
            try{
                let { resolve, reject } = action.payload || {};
                let [eleAlarm, overAlarm, linkAlarm, hesAlarm, fireAlarm] = yield all([
                    call(getWarningStatus, { cate_code:'1'}),
                    call(getWarningStatus, { cate_code:'2'}),
                    call(getWarningStatus, { cate_code:'3'}),
                    call(getWarningStatus, { cate_code:'4'}),
                    call(getWarningStatus, { cate_code:'5'})
                ]);
                if ( eleAlarm.data.code === '0' && overAlarm.data.code === '0' && linkAlarm.data.code === '0' && hesAlarm.data.code === '0' && fireAlarm.data.code === '0') {
                    let obj = { 'ele':eleAlarm.data.data, 'over':overAlarm.data.data, 'link':linkAlarm.data.data, 'hes':hesAlarm.data.data, 'fire':fireAlarm.data.data };
                    yield put({ type:'getWarningStatus', payload:{ data:obj } });
                    if ( resolve && typeof resolve === 'function' ) resolve();
                } else {
                    if ( reject && typeof reject === 'function' ) reject();
                }
            } catch(err){
                console.log(err);
            }
        },
        // *fetchWarningRank(action, { call, put}){
        //     try {
        //         let { data } = yield call(getWarningRank);
        //         if ( data && data.code === '0'){
        //             yield put({ type:'getWarningRank', payload:{ data:data.data }});
        //         }
        //     } catch(err){  
        //         console.log(err);
        //     }
        // },
        // *fetchWarningRank(action, { call, put}){
        //     try {
        //         let { timeType, resolve, reject } = action.payload || {};
        //         timeType = timeType || '1';
        //         let { data } = yield call(getWarningRank, { time_type:timeType });
        //         if ( data && data.code === '0'){
        //             if ( resolve && typeof resolve === 'function') resolve(data.data);
        //         } else {
        //             if ( reject && typeof reject === 'function') reject(data.msg);
        //         }
        //     } catch(err){
        //         console.log(err);
        //     }
        // },
        *fetchWarningTrend(action, { call, put}){
            try {
                let { timeType, resolve, reject } = action.payload || {};
                timeType = timeType || '1';
                let { data } = yield call(getWarningTrend, { time_type:timeType });
                if ( data && data.code === '0'){
                    if ( resolve && typeof resolve === 'function') resolve(data.data);
                } else {
                    if ( reject && typeof reject === 'function') reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        }
    },
    reducers:{
        getTodayEnergy(state, { payload:{ data }}){
            return { ...state, todayEnergy:data }  
        },
        getMonitorInfo(state, { payload:{ data }}){
            let infoList = [], provinProject = [];
            infoList.push({ text:'平台项目', value:data.companyCount, unit:'个'});
            infoList.push({ text:'累计标煤', value:data.coal, unit:'tce'});
            infoList.push({ text:'终端数', value:data.meterCount, unit:'个'});
            data.infoList = infoList;
            provinProject = Object.keys(data.provinProject).map(key=>({name:key, value:data.provinProject[key]})).sort((a,b)=>b.value - a.value );
            data.provinProject = provinProject;
            return { ...state, monitorInfo:data }
        },
        getProjectList(state, { payload:{ data }}){
            return { ...state, projects:data };
        },
        getRankResult(state, { payload:{ data }}){
            return { ...state, rankInfo:data }
        },
        getDataLoad(state, { payload:{ data }}){
            return { ...state, dataLoad:data };
        },
        getActiveDevice(state, { payload:{ data }}){
            return { ...state, activeDevice:data };
        },
        getWarningRank(state, { payload:{ data }}){
            return { ...state, warningRank:data }
        },
        getWarningPercent(state, { payload:{ data }}){
            return { ...state, warningPercent:data }
        },
        getFinishTrend(state, { payload:{ data }}){
            return { ...state, finishTrendInfo:data }
        },
        getMeterResult(state, { payload:{ data }}){
            return { ...state, meterInfo:data }
        },
        getWarningMonitor(state, { payload:{ data }}){
            return { ...state, warningMonitor:data }
        },
        getWarningStatus(state, { payload:{ data }}){
            console.log(data);
            return { ...state, warningStatus:data };
        },
        toggleRunning(state, { payload }){
            return { ...state, isRunning:payload };
        },
        setCurrentProvince(state, { payload:{ data }}){
            return { ...state, currentProvince:data }
        },
        setCurrentCity(state, { payload:{ data }}){
            return { ...state, currentCity:data }
        }
    }
}

