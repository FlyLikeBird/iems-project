import { 
    getMonitorInfo, getTotalAlarm, getOutputRank, 
    getLogType, confirmRecord, getProgressLog,
    uploadImg,
    getTodayCo2, getCo2Rank,
    getSumTrend,
    getProjectTrend,
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
    todayCo2:{},
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
    autoMode:true,
    
    currentPage:1,
    total:0,
    warningLoading:true,
    warningList:[],
    // 告警处理状态
    logTypes:[],
    progressLog:[],
    historyLog:[],
    chartInfo:{},
    chartLoading:true
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
                    // dispatch({ type:'fetchEnergyRank'});
                    dispatch({ type:'fetchMeterMach'});
                    dispatch({ type:'fetchCo2Rank'});
                    dispatch({ type:'fetchTodayCo2'});
                    // dispatch({ type:'fetchFinishTrend'});
                    dispatch({ type:'fetchActiveDevice'});
                    // 第二屏数据
                    // dispatch({ type:'fetchDataLoad'});
                    dispatch({ type:'fetchWarningPercent'});
                    dispatch({ type:'fetchWarningRank'});
                    // dispatch({ type:'fetchWarningMonitor'});
                    // dispatch({ type:'fetchWarningStatus'});
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
        *fetchTodayCo2(action, { call, put}){
            try{
                let { data } = yield call(getTodayCo2);
                if ( data && data.code === '0') {
                    yield put({ type:'getTodayCo2Result', payload:{ data:data.data }});
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
        *fetchCo2Rank(action, { call, put}){
            try {
                let { resolve, reject, timeType } = action.payload || {};
                timeType = timeType || '1';
                let { data } = yield call(getCo2Rank, { time_type:timeType });
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
        },
        // 中台告警列表和分析功能页面
        *fetchTotalAlarm(action, { call, put, select }){
            try {
                let { province, city, company_id, status, cate_code, startDate, endDate, currentPage } = action.payload || {};
                let { user:{ userInfo }} = yield select();
                currentPage = currentPage || 1;
                let obj = { agent_id:userInfo.agent_id, province, city, page:currentPage, pagesize:12 };
                if ( company_id ){
                    obj.company_id = company_id;
                }
                if ( status ){
                    obj.status = status;
                }
                if ( cate_code ){
                    obj.cate_code = cate_code;
                }
                if ( startDate && startDate._isAMomentObject ) {
                    obj.begin_date = startDate.format('YYYY-MM-DD');
                }
                if ( endDate && endDate._isAMomentObject ){
                    obj.end_date = endDate.format('YYYY-MM-DD');
                }
                yield put({ type:'toggleAlarmLoading'});
                let { data } = yield call(getTotalAlarm, obj);
                if ( data && data.code === '0'){
                    yield put({ type:'getTotalAlarmResult', payload:{ data:data.data, currentPage, total:data.count }})
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchLogType(action, { put, call }){
            let { data } = yield call(getLogType);
            if ( data && data.code === '0'){
                yield put({ type:'getLogType', payload:{ data:data.data }});
            }
        },
        *fetchProgressInfo(action, { call, put}){
            try {
                let { data } = yield call(getProgressLog, { record_id:action.payload });
                if ( data && data.code === '0' ){
                    yield put({type:'getProgress', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *confirmRecord(action, { select, call, put, all }){
            try {
                let { user:{ company_id }} = yield select();
                let { resolve, reject, values } = action.payload;
                // photos字段是上传到upload接口返回的路径
                let uploadPaths;
                if ( values.photos && values.photos.length ) {
                    let imagePaths = yield all([
                        ...values.photos.map(file=>call(uploadImg, { file }))
                    ]);
                    uploadPaths = imagePaths.map(i=>i.data.data.filePath);
                } 
                let { data } = yield call(confirmRecord, { company_id, record_id:values.record_id, photos:uploadPaths, log_desc:values.log_desc, oper_code:values.oper_code, type_id:values.type_id });                 
                if ( data && data.code === '0'){
                    resolve();
                } else {
                    reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        
        *fetchSumTrend(action, { put, select, call, all }){
            try {
                let { user:{ userInfo, timeType, startDate, endDate }} = yield select();
                let obj = { agent_id:userInfo.agent_id, time_type:timeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') };
                yield put({ type:'toggleChartLoading'});
                let [sumData, trendData] = yield all([
                    call(getSumTrend, obj),
                    call(getProjectTrend, obj)
                ]);
                if ( sumData.data.code === '0' && trendData.data.code === '0'){
                    yield put({ type:'getSumTrendResult', payload:{ data:{ sumInfo:sumData.data.data, trendInfo:trendData.data.data }}})
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
        getTodayCo2Result(state, { payload:{ data }}){
            return { ...state, todayCo2:data };
        },
        getMonitorInfo(state, { payload:{ data }}){
            let infoList = [], provinProject = [];
            infoList.push({ text:'平台项目', value:data.companyCount, unit:'个'});
            infoList.push({ text:'累计标煤', value:data.coal, unit:'tce'});
            infoList.push({ text:'碳排放', value:data.co2, unit:'t'});
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
        },
        toggleAlarmLoading(state){
            return { ...state, alarmLoading:true };
        },
        getTotalAlarmResult(state, { payload:{ data, currentPage, total }}){
            return { ...state, warningList:data, currentPage, total, alarmLoading:false };
        },
        getLogType(state, { payload:{ data }}){
            return { ...state, logTypes:data };
        },
        getProgress(state, { payload :{ data }}){
            return { ...state, progressLog:data };
        },
        resetProgress(state){
            return { ...state, progressLog:[] };
        },
        toggleChartLoading(state){
            return { ...state, chartLoading:true };
        },
        getSumTrendResult(state, { payload:{ data }}){
            return { ...state, chartInfo:data, chartLoading:false };
        }
    }
}

