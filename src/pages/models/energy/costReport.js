import { getCostReport, getCostAnalyze, getMeterReport, getEnergyType, getEleDocument, getWaterDocument, getAnalyzeReport, getCompanyFeeRate, exportReport, translateImgToBase64, createDocument, fetchImg } from '../../services/costReportService';
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
    dataType:'1',
    reportInfo:{},
    analyzeInfo:[],
    chartInfo:{},
    checkedKeys:[],
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
            yield put({ type:'cancelCostReport'});
            yield put({ type:'cancelCostAnalyze'});
            yield put({ type:'reset'});
        },
        *initCostReport(action, { put }){
            yield put.resolve({ type:'fields/init'});
            yield put.resolve({ type:'fetchCostReport'});
        },
        *fetchCostReport(action, { call, put, select}){
            yield put.resolve({ type:'cancelCostReport'});
            yield put.resolve({ type:'cancelable', task:fetchCostReportCancelable, action:'cancelCostReport'});
            function* fetchCostReportCancelable(params){
                try {
                    let { user:{ company_id, timeType, startDate, endDate }, fields:{ currentAttr, energyInfo }, costReport:{ dataType } } = yield select();
                    timeType = timeType === '3' ? '1' : timeType === '1' ? '3' : '2';
                    yield put({type:'toggleLoading'});
                    let { data } = yield call(getCostReport, { data_type:dataType, company_id, time_type:timeType, type_id:energyInfo.type_id, attr_id:currentAttr.key, begin_time:startDate.format('YYYY-MM-DD'), end_time:endDate.format('YYYY-MM-DD') })
                    if ( data && data.code === '0'){
                        yield put({type:'get', payload:{ data:data.data }});
                    }   
                } catch(err){
                    console.log(err);
                }
            }
        },
        *initCostAnalyze(action, { put, select }){
            yield put.resolve({ type:'fields/init'});
            let { fields:{ allFields, energyInfo, currentAttr, fieldAttrs }} = yield select();
            let temp = [];
            if ( currentAttr.children && currentAttr.children.length ) {
                temp.push(currentAttr.key);
                currentAttr.children.map(i=>temp.push(i.key));
            } else {
                temp.push(node.key);
            }
            yield put.resolve({ type:'select', payload:temp });
            yield put.resolve({ type:'fetchCostAnalyze'});  
        },
        *fetchCostAnalyze(action, { call, put, select }){
            yield put.resolve({ type:'cancelCostAnalyze'});
            yield put.resolve({ type:'cancelable', task:fetchCostAnalyzeCancelable, action:'cancelCostAnalyze' });
            function* fetchCostAnalyzeCancelable(){
                try {
                    let { user:{ company_id, timeType, startDate, endDate }, fields:{ energyInfo }, costReport:{ checkedKeys } } = yield select();
                    timeType = timeType === '1' ? '3' : timeType === '3' ? '1' : '2'; 
                    let { data } = yield call(getCostAnalyze, { company_id, time_type:timeType, type_id:energyInfo.type_id, attr_ids:checkedKeys, begin_time:startDate.format('YYYY-MM-DD'), end_time:endDate.format('YYYY-MM-DD') });
                    if ( data && data.code === '0'){
                        yield put({type:'getAnalyze', payload:{ data:data.data }});
                    }
                } catch(err){
                    console.log(err);
                }
            }
            
        },
        *fetchDocument(action, { call, put, select, all}){
            let { user:{ company_id, currentCompany }, fields : { energyInfo, currentAttr, currentField }} = yield select();
            let { tip_price, high_price, middle_price, bottom_price, price, year, month } = action.payload.data;
            
            let [ documentData, bgData ] = yield all([
                energyInfo.type_code === 'ele' 
                ?
                call(getEleDocument, { company_id, attr_id:currentAttr.key, tip_price, high_price, middle_price, bottom_price, year, month })
                :
                call(getWaterDocument, { company_id, attr_id:currentAttr.key, price, year, month }),
                call(fetchImg, { path:currentCompany.logo_path })
            ]);
            if ( documentData && documentData.data.code === '0' && bgData ) {
                yield put({type:'getDocument', payload: { data:documentData.data.data, bgData }});
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
            data['bgData'] = bgData;
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
        toggleRatio(state, { payload }){
            return { ...state, curRatio:payload };
        },
        reset(){
            return initialState;
        }
    }
}

