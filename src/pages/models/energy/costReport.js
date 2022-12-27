import { getCostReport, getCostAnalyze, setProductTarget, getMeterReport, getEnergyType, getEleDocument, getWaterDocument, getCombustDocument, getAnalyzeReport, getCompanyFeeRate, exportReport, translateImgToBase64, createDocument, fetchImg } from '../../services/costReportService';
import { flattern, getDeep } from '../../utils/array';
import moment from 'moment';
let date = new Date();
function getCurTime(){
    let date = new Date();
    let startTime = '00时';
    let temp = date.getHours();
    let endTime = temp < 10 ? '0'+temp+'时' : temp+'时';
    return { startTime, endTime };
}

function formatTime(timeType, startTime, endTime){
    if ( timeType === '3'){
        startTime = startTime.slice(0,startTime.length-1);
        endTime = endTime.slice(0, endTime.length-1);
    }
    if ( startTime._isAMomentObject && endTime._isAMomentObject ){
        if ( timeType === '1' ) {
            // 年维度
            startTime = startTime.format('YYYY-MM');
            endTime = endTime.format('YYYY-MM');
        } else if ( timeType === '2'){
            // 月维度
            startTime = startTime.format('YYYY-MM-DD');
            endTime = endTime.format('YYYY-MM-DD');
        }
    }
    return { startTime, endTime };
}

const initialState = {
    // 切换成本/能耗
    dataType:'2',
    reportInfo:{},
    showTimePeriod:false,
    analyzeInfo:[],
    chartLoading:false,
    chartInfo:{},
    checkedKeys:[],
    startHour:0,
    isDeep:false,
    isLoading:true,
    // 生成报告相关数据
    documentInfo:{},
    rateInfo:{},
    // 运行报告数据
    analyzeReport:{},
};

export default {
    namespace:'costReport',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *cancelAll(action, { put }){
            // yield put({ type:'cancelCostReport'});
            // yield put({ type:'cancelCostAnalyze'});
            yield put({ type:'reset'});
        },
        *initCostReport(action, { put, select, all }){
            yield all([
                put.resolve({ type:'fields/init'}),
                put.resolve({ type:'worktime/fetchWorktimeList'})
            ])
            yield put({ type:'setDeep', payload:false });
            yield put({ type:'setTimePeriod', payload:false });
            yield put({ type:'fetchCostReport'});
        },
        *setProduct(action, { put, call }){
            try {
                let { attr_id, time_type, target, year, month, day, resolve, reject } = action.payload || {};
                let { data } = yield call(setProductTarget, { attr_id, time_type, year, month, day, target  });
                if ( data && data.code === '0' ) {
                    if ( resolve && typeof resolve === 'function' ) resolve();
                } else if ( data && data.code === '1001'){
                    yield put({ type:'user/loginOut'});
                } else {
                    if ( reject && typeof reject === 'function' ) reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchCostReport(action, { call, put, select}){
            try {
                let { user:{ company_id, timeType, startDate, endDate }, fields:{ energyInfo, currentAttr }, worktime:{ currentWorktime }, costReport:{ dataType, isDeep, showTimePeriod, startHour  } } = yield select();
                timeType = timeType === '3' ? '1' : timeType === '1' ? '3' : timeType === '10' ? '2' : timeType;
                yield put({type:'toggleLoading'});
                let obj = { data_type:dataType, company_id,  rostering_id:currentWorktime.id, time_type:timeType, type_id:energyInfo.type_id, attr_id:currentAttr.key, is_display_time:showTimePeriod ? '1' : '0', is_show_detail:isDeep ? '1' : '0', begin_time:startDate.format('YYYY-MM-DD'), end_time:endDate.format('YYYY-MM-DD') };
                if ( startHour ) {
                    obj.day_start_hour = startHour;
                }
                let { data } = yield call(getCostReport, obj );
                if ( data && data.code === '0'){
                    yield put({type:'get', payload:{ data:data.data }});
                } 
            } catch(err){
                console.log(err);
            }       
        },
        *initCostAnalyze(action, { put, select }){
            yield put.resolve({ type:'fields/init'});
            yield put.resolve({ type:'worktime/fetchWorktimeList'});
            let { fields:{ allFields, energyInfo, currentAttr, fieldAttrs }} = yield select();
            let temp = [];
            if ( currentAttr.children && currentAttr.children.length ) {
                temp.push(currentAttr.key);
                currentAttr.children.map(i=>temp.push(i.key));
            } else {
                temp.push(currentAttr.key);
            }
            yield put.resolve({ type:'select', payload:temp });
            yield put.resolve({ type:'fetchCostAnalyze'});  
        },
        *fetchCostAnalyze(action, { call, put, select }){ 
            try {
                let { user:{ company_id, timeType, startDate, endDate }, fields:{ energyInfo }, worktime:{ currentWorktime }, costReport:{ checkedKeys } } = yield select();
                timeType = timeType === '1' ? '3' : timeType === '3' ? '1' : timeType === '10' ? '2' : timeType; 
                yield put({ type:'toggleChartLoading'});
                let { data } = yield call(getCostAnalyze, { 
                    company_id, 
                    time_type:timeType, 
                    type_id:energyInfo.type_id, 
                    attr_ids:checkedKeys, 
                    begin_time:startDate.format('YYYY-MM-DD'), 
                    end_time:endDate.format('YYYY-MM-DD'),
                    rostering_id:currentWorktime.id
                });
                if ( data && data.code === '0'){
                    yield put({type:'getAnalyze', payload:{ data:data.data }});
                } 
            } catch(err){
                console.log(err);
            }                
        },
        *fetchDocument(action, { call, put, select, all}){
            let { user:{ company_id, currentCompany }, fields : { energyInfo, currentAttr, currentField }} = yield select();
            let { tip_price, high_price, middle_price, bottom_price, price, year, month } = action.payload.data;
            let params ;
            if ( energyInfo.type_code === 'ele') {
                params = { company_id, attr_id:currentAttr.key, tip_price, high_price, middle_price, bottom_price, year, month };
            } else {
                params = { company_id, attr_id:currentAttr.key, price, year, month };
            }
            let { data } = yield call(
                energyInfo.type_code === 'ele' ? getEleDocument :
                energyInfo.type_code === 'water' ? getWaterDocument :
                energyInfo.type_code === 'combust' ? getCombustDocument : getCombustDocument,
                params);
            if ( data && data.code === '0' ) {
                yield put({type:'getDocument', payload: { data:data.data }});
                if ( action.payload.resolve ) action.payload.resolve();
            } 
        },
        *translateImg(action, { call, put, all}){
            let { resolve } = action.payload;
            let { data } = yield call(translateImgToBase64, { base64_img:action.payload.data });
            if ( data && data.code ==='0') {
                if ( resolve && typeof resolve === 'function') resolve(data.data);
            }
        },
        *fetchFeeRate(action, { select, call, put}){
            let { user:{ company_id }} = yield select();
            let { data } = yield call(getCompanyFeeRate, { company_id });
            if ( data && data.code === '0'){
                yield put({ type:'getFeeRate', payload:{ data:data.data }});                
            } 
        },
        *createDocument(action, { call, put}){
            let  { htmlStr, resolve, reject }  = action.payload;
            let finalStr = '<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns:m="http://schemas.microsoft.com/office/2004/12/omml" xmlns="http://www.w3.org/TR/REC-html40">'
                            + '<body>'
                            + '<div>'
                            + htmlStr
                            + '</div>'
                            + '</body></html>';
            // console.log(htmlStr);  
            let { data } = yield call(createDocument, { content:finalStr });
            if ( data && data.code === '0'){
                if ( resolve && typeof resolve === 'function') resolve();

                window.location.href = data.data;
            } else {
                if ( reject && typeof reject === 'function') reject();
            }
        },
        *export(action, { call, select }){
            let { user:{ company_id }, fields:{ currentAttr }, costReport:{ dataType, timeType, energyInfo, startTime, endTime } } = yield select();
            let format = formatTime(timeType, startTime, endTime );
            let url = yield call(exportReport, { company_id, time_type:timeType, type_id:energyInfo.type_id, data_type:dataType, attr_id:currentAttr.key, begin_time:format.startTime, end_time:format.endTime });
            window.location.href = url;
        },
        
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        toggleChartLoading(state){
            return { ...state, chartLoading:true };
        },
        toggleDataType(state, { payload }){
            return { ...state, dataType:payload };
        },
        get(state, { payload : { data }}){
            return { ...state, reportInfo:data, isLoading:false };
        },
        getFeeRate(state, { payload:{ data }}){
            return { ...state, rateInfo:data };
        },
        getDocument(state, { payload : { data, bgData }}){
            return { ...state, documentInfo:data };
        },
        getAnalyze(state, { payload: { data }}){
            let analyzeInfo = [];
            analyzeInfo.push({text:'本期成本', unit:'元', data:Math.floor(data.analyze.current) });
            analyzeInfo.push({text:'同期成本', unit:'元', data:Math.floor(data.analyze.link)});
            analyzeInfo.push({text:'同比增长率', unit:'%', data:(+data.analyze.same_period).toFixed(1)});
            analyzeInfo.push({text:'环比增长率', unit:'%', data:(+data.analyze.link_period).toFixed(1)});
            return { ...state, chartInfo:data, analyzeInfo, chartLoading:false };
        },
        getAnalyzeReportResult(state, { payload:{ data }}){
            return { ...state, analyzeReport:data };
        },
        setDate(state, { payload:{ startTime, endTime }}){
            return { ...state, startTime, endTime };
        },
        select(state, { payload }){
            return { ...state, checkedKeys:payload };
        },
        setDeep(state, { payload }){
            return { ...state, isDeep:payload };
        },
        setTimePeriod(state, { payload }){
            return { ...state, showTimePeriod:payload };
        },
        setStartHour(state, { payload }){
            return { ...state, startHour:payload };
        },
        toggleRatio(state, { payload }){
            return { ...state, curRatio:payload };
        },
        reset(){
            return initialState;
        }
    }
}


