import { getRuleList, getMachs, getRuleType, addRule, updateRule, deleteRule, getSceneInfo, getTodayInfo, getWarningChartInfo, getRegionChartInfo, getWarningDetail, getWarningAnalyze, getMachWarning, getFieldWarning, getRecordList, getRecordDetail, getExecuteType, executeRecord, confirmRecord, getHistoryLog, getProgressLog, setSceneInfo, uploadImg, fetchImg } from '../../services/alarmService';
import moment from 'moment';
let date = new Date();
const warningType = {
    '1':'电气安全',
    '2':'指标越限',
    '3':'通讯异常'
};
const machsMap = {
    'ele':'电表',
    'gateway':'网关',
    'water':'水表',
    'gas':'气表'
}

// auth_type 用户权限（0：普通用户；1：区域维护人员；2：区域负责人）
const initialState = {
    ruleList:[],
    ruleType:[],
    sceneInfo:{},
    alarmInfo:[],
    ruleMachs:[],
    warningChartInfo:{},
    regionChartInfo:[],
    // 诊断报告中的告警相关状态
    reportAlarmInfo:{},
    // 告警趋势状态
    sumInfo:{},
    sumList:[],
    warningTypeInfo:{},
    machWarning:{},
    fieldWarning:{},
    // 1-日  2-月 3-年
    timeType:'2',
    beginDate:moment(date).startOf('month'),
    endDate:moment(date).endOf('month'),
    // 告警列表执行----相关状态
    recordListInfo:{},
    executeType:[],
    recordHistory:[],
    recordProgress:[],
    isLoading:false,
    pageNum:1
};

export default {
    namespace:'alarm',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *cancelAll(action, { put }){
            yield put({ type:'reset'});
        },
        *initAlarmSetting(action, { call, put }){
            yield put({ type:'fetchRule'});
            yield put({ type:'fetchMachs'});
            yield put({ type:'fetchRuleType'});
        },
        // 安全设置相关code
        *fetchRule(action, { select, call, put }){
            try {
                let { user:{ company_id }} = yield select();
                let { data } = yield call(getRuleList, { company_id });
                if ( data && data.code === '0'){
                    yield put({type:'getRule', payload:{ data:data.data }});
                }
            } catch(err) {  
                console.log(err);
            }
        },
        *fetchMachs(action, { select, call, put}){
            try{
                let { user:{ company_id }} = yield select();
                let { data } = yield call(getMachs, { company_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getMachs', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchRuleType(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { data } = yield call(getRuleType, { company_id });
                if ( data && data.code === '0'){
                    yield put({type:'getRuleType', payload: { data:data.data }})
                }
            } catch(err){
                console.log(err);
            }
        },
        *addRule(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { values, resolve, reject } = action.payload;
                values.company_id = company_id;
                values.level = values.level == 1 ? 3 : values.level == 3 ? 1 : 2;
                let { data } = yield call(addRule, values);
                if ( data && data.code === '0'){
                    yield put({type:'fetchRule'});
                    if ( resolve ) resolve();
                } else {
                    if ( reject ) reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *updateRule(action, { call, put}){
            try {
                let { values, resolve, reject } = action.payload;
                let { data } = yield call(updateRule, values);
                if ( data && data.code === '0'){
                    yield put({type:'fetchRule'});
                    if ( resolve ) resolve();
                } else {
                    if ( reject ) reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *deleteRule(action , { call, put}){
            try {
                let rule_id = action.payload;
                let { data } = yield call(deleteRule, { rule_id });
                if ( data && data.code === '0'){
                    yield put({type:'fetchRule'});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchMonitorInfo(action, { all, call, put, select}){
            try {
                let { resolve, reject } = action.payload || {};
                yield all([
                    put.resolve({type:'fetchAlarmInfo'}),
                    put.resolve({type:'fetchChartInfo'})
                ]);
                if ( resolve && typeof resolve === 'function') resolve();    
            } catch(err){
                console.log(err);
            }
        },
        // 安全监控相关code
        *fetchSceneInfo(action, { select, call, put }){
            try {
                let { user:{ company_id }} = yield select();
                let { data } = yield call(getSceneInfo, { company_id });
                let imgURL = '';
                if ( data.data.scene && data.data.scene.bg_image_path ){
                    imgURL = yield call(fetchImg, { path:data.data.scene.bg_image_path} );
                }
                if ( data && data.code === '0' ){
                    if(imgURL){
                        data.data.scene.bg_image_path = imgURL;
                    }
                    yield put({type:'getScene', payload:{ data:data.data }});
                }
            } catch (err){
                console.log(err);
            }  
        },
        *fetchAlarmInfo(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { data } = yield call(getTodayInfo, { company_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getAlarmInfo', payload: { data:data.data }});
                }
            } catch (err) {
                console.log(err);
            }
        },
        *fetchChartInfo(action, { select, call, put, all}){
            try {
                let { user:{ company_id }} = yield select();
                let [warningChart, regionChart] = yield all([
                    call(getWarningChartInfo, { company_id }),
                    call(getRegionChartInfo, { company_id })
                ]);
                if ( warningChart && warningChart.data.code === '0' && regionChart && regionChart.data.code === '0') {
                    yield put({type:'getChartInfo', payload:{ warningChartInfo:warningChart.data.data, regionChartInfo:regionChart.data.data }})
                }
            } catch(err){
                console.log(err);
            }
        },
        // 告警详情页
        *fetchSumInfo(action, { call, put, select, all }){
            try {
                let { resolve, reject } = action.payload || {};
                let { user:{ company_id, startDate, endDate }} = yield select();
                let begin_date = startDate.format('YYYY-MM-DD');
                let end_date = endDate.format('YYYY-MM-DD');      
                let [ sumData, typeData, machData, fieldData ] = yield all([
                    call(getWarningDetail, { company_id, begin_date, end_date }),
                    call(getWarningAnalyze, { company_id, begin_date, end_date }),
                    call(getMachWarning, { company_id, begin_date, end_date }),
                    call(getFieldWarning, { company_id, begin_date, end_date })
                ]);
                if ( sumData.data.code === '0' && typeData.data.code === '0' && machData.data.code === '0' && fieldData.data.code === '0' ){
                    yield put({type:'getSumInfo', payload:{ sumInfo:sumData.data.data, typeInfo:typeData.data.data, machWarning:machData.data.data, fieldWarning:fieldData.data.data }});
                    if ( resolve && typeof resolve === 'function') resolve();    
                } else {
                    if ( reject && typeof reject === 'function') reject();    
                }       
            } catch(err){
                console.log(err);
            }
        },
        // 诊断报告内的告警详情页
        *fetchReportSumInfo(action, { call, put, select, all}){
            try {
                let { resolve, reject } = action.payload || {};
                let { user:{ company_id, startDate, endDate }} = yield select();
                let begin_date = startDate.format('YYYY-MM-DD');
                let end_date = endDate.format('YYYY-MM-DD');
                let [sumInfo, detailInfo] = yield all([
                    call(getWarningDetail, { company_id, begin_date, end_date }),
                    call(getWarningAnalyze, { company_id, begin_date, end_date })
                ]);
                if ( sumInfo.data.code === '0' && detailInfo.data.code === '0'){
                    yield put({ type:'getReportSumInfo', payload:{ sumInfo:sumInfo.data.data, detailInfo:detailInfo.data.data }});
                    if ( resolve && typeof resolve === 'function') resolve();
                } else {
                    if ( reject && typeof reject === 'function') reject();
                }
            } catch(err){
                console.log(err);
            }
        },
        // 
        // 告警列表页
        *fetchRecordList(action , { select, call, put}){
            try {
                let { user:{ company_id, pagesize }, alarm:{ pageNum }} = yield select();
                let { cate_code, keywords } = action.payload || {};
                cate_code = cate_code ? cate_code : '1';
                let params = { company_id, page:pageNum, pagesize, cate_code };
                if ( keywords ){
                    params['keywords'] = keywords;
                }
                yield put({type:'toggleLoading'});
                let { data } = yield call(getRecordList, params);
                if ( data && data.code === '0'){
                    yield put({type:'getRecord', payload:{ list:data.data, count:data.count }});
                }
            } catch(err){
                console.log(err);
                
            }
        },
        *fetchRecordDetail(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { data } = yield call(getRecordDetail, { company_id, record_id: action.payload });
            } catch(err){
                console.log(err);
            }
        },
        *fetchExecuteType(action, { call, put }){
            try {
                let { data } = yield call(getExecuteType);
                if ( data && data.code ==='0'){
                    yield put({type:'getExecuteType', payload:{ data: data.data }});
                }
            } catch(err){
                console.log(err);
            } 
        },
        *fetchRecordHistory(action, { call, put}){
            try {
                let { data } = yield call(getHistoryLog, { mach_id: action.payload });
                if ( data && data.code === '0'){
                    yield put({type:'getRecordHistory', payload:{ data:data.data }});
                }
                console.log(data);
            } catch(err){
                console.log(err);
            }
        },
        *fetchProgressInfo(action, { call, put}){
            try {
                let { data } = yield call(getProgressLog, { record_id:action.payload });
                if ( data && data.code ){
                    yield put({type:'getProgress', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *confirmRecord(action, { select, call, put, all }){
            try {
                let { user:{ company_id }} = yield select();
                let { record_id, oper_code, execute_type, execute_info, photos, resolve, reject } = action.payload;
                // photos字段是上传到upload接口返回的路径
                let uploadPaths;
                if ( photos && photos.length ) {
                    let imagePaths = yield all([
                        ...photos.map(file=>call(uploadImg, { file }))
                    ]);
                    uploadPaths = imagePaths.map(i=>i.data.data.filePath);
                } 
                let { data } = yield call(confirmRecord, { company_id, record_id, photos:uploadPaths, log_desc:execute_info, oper_code, type_id:execute_type });                 
                if ( data && data.code === '0'){
                    resolve();
                    yield put({type:'fetchProgressInfo', payload:record_id });
                    yield put({type:'fetchRecordList', payload:{} });
                } else {
                    reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *setSceneInfo(action, { select, call, put }){
            try{
                let { user:{ company_id }} = yield select();
                let { file, resolve, reject } = action.payload || {};
                let { data } = yield call(uploadImg, { file });
                if ( data && data.code === '0'){
                    let imgPath = data.data.filePath;
                    let sceneData = yield call(setSceneInfo, { company_id, image_path:imgPath });
                    if ( sceneData && sceneData.data.code === '0'){
                        yield put({ type:'fetchSceneInfo'});
                        if ( resolve && typeof resolve === 'function') resolve();
                    } else {
                        if ( reject && typeof reject === 'function') reject(sceneData.data.msg);
                    }
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
        getRule(state, { payload : { data }}){
            return { ...state, ruleList:data };
        },
        getRuleType(state, { payload:{data}}){
            return { ...state, ruleType:data };
        },
        getScene(state, { payload: { data }}){
            return { ...state, sceneInfo:data };
        },
        getAlarmInfo(state, { payload : { data }}){
            let alarmInfo = []; 
            data['1'].warning_type = warningType['1'];
            data['2'].warning_type = warningType['2'];
            data['3'].warning_type = warningType['3'];
            alarmInfo.push(data['1']);
            alarmInfo.push(data['2']);
            alarmInfo.push(data['3']);
            return { ...state, alarmInfo };
        },
        getMachs(state, { payload:{ data }}){
            return { ...state, ruleMachs:data };
        },
        getChartInfo(state, { payload : { warningChartInfo, regionChartInfo }}){
            return { ...state, warningChartInfo, regionChartInfo };
        },
        getSumInfo(state, { payload : { sumInfo, typeInfo, machWarning, fieldWarning }}){
            let sumList = [], machList=[];
            sumList.push({ type:'total', text:'总告警数' });
            sumList.push({ type:'ele', text:'电气安全告警'});
            sumList.push({ type:'limit', text:'指标越限告警'});
            sumList.push({ type:'link', text:'通讯异常告警'});
            Object.keys(machWarning).forEach(key=>{
                machList.push({ attr_name:machsMap[key], key, total:machWarning[key], type:[{ name:machsMap[key], count:machWarning[key]}]});
            })
            fieldWarning['mach'] = machList;
            return { ...state, sumInfo, sumList, warningTypeInfo:typeInfo, machWarning, fieldWarning };
        },
        getReportSumInfo(state, { payload:{ sumInfo, detailInfo }}){
            // console.log(sumInfo);
            // console.log(detailInfo);
            let sumList = [];
            sumList.push({ type:'total', count:detailInfo.codeCountArr.total });
            sumList.push({ type:'ele', count:detailInfo.codeCountArr.ele });
            sumList.push({ type:'limit', count:detailInfo.codeCountArr.quotaLimit });
            sumList.push({ type:'link', count:detailInfo.codeCountArr.link });
            detailInfo.detail = sumInfo.detail;
            detailInfo.sumList = sumList;
            return { ...state, reportAlarmInfo:detailInfo };
        },
        toggleTimeType(state, { payload:{ timeType }}){
            let beginDate, endDate;
            let date = new Date();
            if ( timeType === '1'){
                endDate = beginDate = moment(date);
            } else if ( timeType === '2'){
                beginDate = moment(date).startOf('month');
                endDate = moment(date).endOf('month');
            } else if( timeType === '3'){
                beginDate = moment(date).startOf('year');
                endDate = moment(date).endOf('year');
            }
            return { ...state, timeType, beginDate, endDate };
        },
        setDate(state, { payload : { beginDate, endDate } }){
            return { ...state, beginDate, endDate };
        },
        getRecord(state, { payload: { list, count }}){
            return { ...state, recordListInfo:{ list, count }, isLoading:false };
        },
        getExecuteType(state, { payload:{ data }}){
            console.log(data);
            return { ...state, executeType:data };
        },
        getRecordHistory(state, { payload: { data }}){
            return { ...state, recordHistory:data }
        },
        getProgress(state, { payload:{ data }}){
            return { ...state, recordProgress:data };
        },
        setPageNum(state, { payload }){
            return { ...state, pageNum:payload };
        },
        reset(state){
            return initialState;
        }
    }
}


