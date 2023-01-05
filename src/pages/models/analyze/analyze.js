import { 
    getEPChartInfo, getEPChartTrend,
    getReportInfo, getRankAndGrade, getEleHealth, getSaveSpaceText,
    getDeviceList, getMachList, getMachRunEff, getMachRefer, setMachRefer, 
    addDevice, copyDevice, deleteDevice, 
    getBaseSaveSpace, getMeterSaveSpace, getAdjustSaveSpace 
} from '../../services/analyzeMachService';
import { getSaveSpaceTrend } from '../../services/energyService';
import moment from 'moment';

let date = new Date();
const initialState = {
    machInfoList:[],
    deviceList:[],
    // 功率值是一个小时的累加平均值
    runEffInfo:{},
    machEffLoading:true,
    currentMach:{},
    machList:[], 
    // 节省空间
    fieldType:'2',
    baseSaveSpace:{},
    meterSaveSpace:{},
    adjustSaveSpace:{},
    saveSpaceLoading:true,
    saveSpaceTrend:{},
    saveTrendLoading:true,
    modalTimeType:'1',
    modalStartDate:moment(date),
    modalEndDate:moment(date),
    // 运行报告
    reportInfo:{},
    rankAndGrade:{},
    eleHealth:{},
    // EP分析图
    EPChartInfo:{},
    sumTable:[],
    checkedDates:[],
    EPTrendInfo:{},
    
};

export default {
    namespace:'analyze',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        
        *initMachEff(action, { put, select }){
            yield put.resolve({ type:'fields/init'});         
            yield put.resolve({ type:'fetchMachEff'});
        },
        *fetchMachList(action, { select, call, put}){
            try {
                let { user:{ company_id }, fields :{ currentAttr }} = yield select();
                let { resolve, reject } = action.payload ? action.payload : {};
                // console.log(currentAttr);               
                let { data } = yield call(getMachList, { company_id, attr_id:currentAttr.key });
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
        *fetchDeviceList(action, { call, put}){   
            try {
                let { data } = yield call(getDeviceList);
                if ( data && data.code === '0'){
                    yield put({ type:'getDeviceList', payload:{ data:data.data}});
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
                let { hasMach } = action.payload || {};
                if ( !hasMach ){
                    yield put.resolve({ type:'fetchMachList'});
                }
                let { user:{ company_id, startDate, endDate }, analyze:{ currentMach }} = yield select();
                yield put({ type:'toggleMachEffLoading'});
                let { data } = yield call(getMachRunEff, { company_id, begin_date:startDate.format('YYYY-MM-DD'), end_date:startDate.format('YYYY-MM-DD'), mach_id:currentMach.mach_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getMachRunEff', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);   
            }     
        },
        *setMachEff(action, { call, put, select }){
            try {
                let { user:{ company_id }, analyze:{ currentMach }} = yield select(); 
                let { off_power, empty_power, over_power } = action.payload.values;
                let { data } = yield call(setMachRefer, { company_id, mach_id:currentMach.mach_id, off_power, empty_power, over_power } );
                if ( data && data.code === '0'){
                    yield put({type:'fetchMachEff'});
                } 
            } catch(err){
                console.log(err);
            }
        },
        *fetchDevice(action, { call, put}){
            try {
                let { data } = yield call(getDeviceList);
                if ( data && data.code === '0'){
                    yield put ({type:'getDeviceList', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *addDevice(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { resolve, reject } = action.payload;
                let { data } = yield call(addDevice, { company_id, ...action.payload.values });
                if ( data && data.code === '0'){
                    yield put({type:'fetchDevice'});
                    if (resolve) resolve();
                } else {
                    reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *copyDevice(action, { call, put, select}){
            try {
                let { user:{ company_id }, analyze:{ currentMach }} = yield select();
                let { data } = yield call(copyDevice, { company_id, mach_id:currentMach.mach_id, device_id:action.payload });
                if ( data && data.code === '0'){
                    yield put({type:'fetchMachEff'});
                }
            } catch(err){
                console.log(err);
            }
        },
        *deleteDevice(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { data } = yield call(deleteDevice, { company_id, device_id: action.payload });
                if ( data && data.code === '0'){
                    yield put({type:'fetchDevice'});
                }
            } catch(err){
                console.log(err);
            }
        },
        // 节省空间接口
        *fetchBaseSaveSpace(action, { select, call, put}){
            try{
                let { user:{ company_id, startDate, endDate }, analyze:{ fieldType }} = yield select();
                let { resolve, reject } = action.payload || {};
                yield put({ type:'toggleSaveSpaceLoading'})
                let { data } = yield call(getBaseSaveSpace, { company_id, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), field_type:fieldType });
                if ( data && data.code === '0'){
                    yield put({ type:'baseSaveSpaceResult', payload:{ data:data.data } });
                    if ( resolve && typeof resolve === 'function') resolve();
                } else {
                    if ( reject && typeof reject === 'function' ) reject();
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchMeterSaveSpace(action, { select, call, put}){
            try{
                let { user:{ company_id, startDate, endDate }, analyze:{ fieldType }} = yield select();
                let { resolve, reject } = action.payload || {};
                yield put({ type:'toggleSaveSpaceLoading'})
                let { data } = yield call(getMeterSaveSpace, { company_id, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), field_type:fieldType });
                if ( data && data.code === '0'){
                    yield put({ type:'meterSaveSpaceResult', payload:{ data:data.data } });
                    if ( resolve && typeof resolve === 'function') resolve();
                } else if ( data && data.code === '1001' ) {

                } else {
                    if ( reject && typeof reject === 'function') reject();
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchAdjustSaveSpace(action, { select, call, put}){
            try{
                let { user:{ company_id, startDate, endDate }, analyze:{ fieldType }} = yield select();
                let { resolve, reject } = action.payload || {};
                yield put({ type:'toggleSaveSpaceLoading'})
                let { data } = yield call(getAdjustSaveSpace, { company_id, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), field_type:fieldType });
                if ( data && data.code === '0'){
                    yield put({ type:'adjustSaveSpaceResult', payload:{ data:data.data } });
                    if ( resolve && typeof resolve === 'function') resolve();
                } else if ( data && data.code === '1001') {

                } else {
                    if ( reject && typeof reject === 'function') reject();
                }
            } catch(err){
                console.log(err);
            }
        },
        // 节能策略-电度电费接口-请求面积区域图
        *fetchSaveSpaceTrend(action, { call, put, select}){
            try {
                let { user:{ company_id, startDate, endDate }, fields:{ currentAttr }} = yield select();
                yield put({ type:'toggleSaveTrendLoading'});
                let { data } = yield call(getSaveSpaceTrend, { company_id, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), attr_id:action.payload ? action.payload : currentAttr.key })
                if ( data && data.code === '0'){
                    yield put({ type:'getSaveSpaceTrend', payload:{ data:data.data }});
                } 
            } catch(err){
                console.log(err);
            }
        },
        // 诊断报告相关接口
        *fetchReportInfo(action, { all, call, put}){
            try{
                let { resolve, reject } = action.payload || {};
                yield all([
                    put.resolve({ type:'fetchAnalyzeText'}),
                    put.resolve({ type:'fetchRankAndGrade'}),
                    put.resolve({ type:'fetchEleHealth'})
                ]);
                if ( resolve && typeof resolve === 'function' ) resolve();
            } catch(err){
                console.log(err);
            }
        },
        *fetchAnalyzeText(action, { select, call, put}){
            try{
                let { user:{ company_id }} = yield select();
                let { data } = yield call(getReportInfo, { company_id });
                let temp = yield call(getSaveSpaceText, { time_type:'1' });
                if ( data && data.code === '0'){
                    data.data.baseCostText = temp.data.data.text;
                    yield put({ type:'getReportResult', payload:{ data:data.data }});
                } 
            } catch(err){
                console.log(err);
            }
        },
        *fetchRankAndGrade(action, { select, call, put}){
            try {
                let { user:{ startDate, endDate }} = yield select();
                let { timeType } = action.payload || {};
                timeType = timeType || '2';       
                let { data } = yield call(getRankAndGrade,{ begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), time_type:timeType })
                if ( data && data.code === '0'){
                    yield put({ type:'getRankResult', payload:{ data:data.data }})
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchEleHealth(action, { select, call, put}){
            try {
                let { user:{ startDate, endDate }} = yield select();
                let { timeType } = action.payload || {};
                timeType = timeType || '1';
                let { data } = yield call(getEleHealth, { time_type:timeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') });
                if ( data && data.code === '0' ){
                    yield put({ type:'getHealthResult', payload:{ data:data.data }})
                }
            } catch(err){
                console.log(err);
            }
        },
        *initEPChart(action, { call, put }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchEPChartInfo', payload:{ firstLoad:true }});
        },
        *fetchEPChartInfo(action, { call, put, all, select }){
            let { user:{ company_id, timeType, startDate, endDate }, fields:{ currentAttr }, analyze:{ checkedDates }} = yield select();
            if ( currentAttr.key ){
                yield put({ type:'toggleLoading'});  
                let [data1, data2] = yield all([
                    call(getEPChartInfo, { company_id, attr_id:currentAttr.key, check_date:checkedDates, time_type:timeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') }),
                    call(getEPChartInfo, { company_id, attr_id:currentAttr.key, check_date:[], time_type:timeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') })
                ]);
                if ( data1.data && data1.data.code === '0'){
                    yield put({ type:'getEPChartResult', payload:{ data:data1.data.data }});
                }
                if ( data2.data && data2.data.code === '0'){
                    yield put({ type:'getEPTable', payload:{ data:data2.data.data }});
                }
            }
        },
        *initEPTrend(action, { call, put }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchEPChartTrend'});
        },
        *fetchEPChartTrend(action, { put, select, call }){
            let { user:{ company_id, timeType, startDate, endDate }, fields:{ currentAttr }} = yield select();
            if ( currentAttr.key ) {
                yield put({ type:'toggleLoading' });
                let { data } = yield call(getEPChartTrend, { company_id, attr_id:currentAttr.key, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), time_type:timeType });
                if ( data && data.code === '0'){
                    yield put({ type:'getEPTrendResult', payload:{ data:data.data }});
                
                }
            }            
        }
        
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        toggleSaveSpaceLoading(state){
            return { ...state, saveSpaceLoading:true };
        },
        toggleSaveTrendLoading(state){
            return { ...state, saveTrendLoading:true };
        },
        toggleMachEffLoading(state){
            return { ...state, machEffLoading:true };
        },
        getEPChartResult(state, { payload:{ data }}){ 
            return { ...state, EPChartInfo:data, isLoading:false };
        },
        getEPTable(state, { payload:{ data }}){
            let { date, product, energy, ratio } = data;
            let list = [];
            date.forEach((item,index)=>{
                list.push({ date:item, product:product[index], energy:energy[index], ratio:ratio[index] });
            })
            return { ...state, sumTable:list };
        },
        setCheckedDates(state, { payload }){
            return { ...state, checkedDates:payload };
        },
        getEPTrendResult(state, { payload:{ data }}){
            return { ...state, EPTrendInfo:data, isLoading:false };
        },
        getMachResult(state, { payload:{ data }}){
            let currentMach = data && data.length ? data[0] : {};
            return { ...state, machList:data, currentMach };
        },
        getDeviceList(state, { payload:{ data }}){
            return { ...state, deviceList:data };
        },
        getMachRunEff(state, { payload:{ data }}){
            let machInfoList = [];
            machInfoList.push({ title:'开机', subInfo:[{ title:'持续时长', unit:'h', value:data.normalTime},{ title:'时间占比', unit:'%', value: data.totalTime ? Math.round(data.normalTime/data.totalTime*100).toFixed(1) : 0.0 }]});
            // console.log(JSON.stringify(data));
            machInfoList.push({ title:'关机', subInfo:[{ title:'持续时长', unit:'h', value:data.offTime},{ title:'时间占比', unit:'%', value:data.totalTime ? Math.round(data.offTime/data.totalTime*100).toFixed(1) : 0.0 }]});
            machInfoList.push({ title:'空载', subInfo:[{ title:'持续时长', unit:'h', value:data.emptyTime}, { title:'时间占比', unit:'%', value: data.totalTime ? Math.round(data.emptyTime/data.totalTime*100).toFixed(1) : 0.0 }]});
            machInfoList.push({ title:'重载', subInfo:[{ title:'持续时长', unit:'h', value:data.overTime}, { title:'时间占比', unit:'%', value: data.totalTime ? Math.round(data.overTime/data.totalTime*100).toFixed(1) : 0.0 }]});
            machInfoList.push({ title:'电流', subInfo:[{ title:'额定电流', unit:'A', value:Math.round(data.rated_power) }, { title:'平均电流', unit:'A', value:Math.round(data.avg_power) }]})
            return { ...state, runEffInfo:data, machInfoList, machEffLoading:false };
        },
        selectMach(state, { payload:{ data }}){
            return { ...state, currentMach:data }
        },
        setCurrentMach(state, { payload }){
            return { ...state, currentMach:payload };
        },
        setDate(state, { payload }){
            return { ...state, currentDate:payload };
        },
        baseSaveSpaceResult(state, { payload:{ data }}){
            let infoList = [];
            infoList.push({ text:'本月最大需量', value:Math.floor(data.maxDemand), unit:'kw' });
            infoList.push({ text:'需量环比', value:(+data.same).toFixed(1), unit:'%' });
            infoList.push({ text:'需量同比', value:(+data.adjust).toFixed(1), unit:'%' });
            infoList.push({ text:'需量节能潜力', value:Math.floor(data.save_space), unit:'kw' });
            infoList.push({ text:'节俭空间金额', value:Math.floor(data.save_cost), unit:'元' });
            data.info = infoList;
            return { ...state, baseSaveSpace:data, saveSpaceLoading:false };
        },
        meterSaveSpaceResult(state, { payload:{ data }}){
            let infoList = [];
            infoList.push({ text:'本月有功用量', value:Math.floor(data.energy), unit:'kwh' });
            infoList.push({ text:'尖时段用量', value:Math.floor(data.tip), unit:'kwh' });
            infoList.push({ text:'峰时段用量', value:Math.floor(data.top), unit:'kwh' });
            infoList.push({ text:'平时段用量', value:Math.floor(data.middle), unit:'kwh' });
            infoList.push({ text:'谷时段用量', value:Math.floor(data.bottom), unit:'kwh' });
            infoList.push({ text:'有功用量环比', value:(+data.adjust).toFixed(1), unit:'%' });
            infoList.push({ text:'节俭空间金额', value:Math.floor(data.save_cost), unit:'元' });
            data.info = infoList;
            return { ...state, meterSaveSpace:data, saveSpaceLoading:false };
        },
        adjustSaveSpaceResult(state, { payload:{ data }}){
            let infoList = [];
            infoList.push({ text:'本月功率因素', value:(+data.factor).toFixed(2), unit:'COSΦ' });
            infoList.push({ text:'功率因素环比', value:(+data.adjust).toFixed(2), unit:'%' });
            infoList.push({ text:'功率因素同比', value:(+data.same).toFixed(2), unit:'%' });
            infoList.push({ text:'无功节能潜力', value:Math.floor(data.useless), unit:'kVarh' });
            infoList.push({ text:'节俭空间金额', value:Math.floor(data.save_cost), unit:'元' });
            data.info = infoList;
            return { ...state, adjustSaveSpace:data, saveSpaceLoading:false };
        },
        toggleFieldType(state, { payload }){
            return { ...state, fieldType:payload };
        },
        getSaveSpaceTrend(state, { payload:{ data }}){
            connectPoint(data.tipArr, data.topArr, data.middleArr, data.bottomArr);
            let referArr = [];
            if ( data.tipReferArr ){
                data.tipReferArr.forEach((item,index)=>{ 
                    let value = item === 0 ? 0 : 
                        data.topReferArr[index] === 0 ? 0 : data.topReferArr[index] 
                        ? data.topReferArr[index] : data.middleArr[index] === 0 ? 0 : data.middleReferArr[index] 
                        ? data.middleReferArr[index] : data.bottomReferArr[index] === 0 ? 0 : data.bottomReferArr[index]
                        ? data.bottomReferArr[index] : null; 
                    // let value =  item || ( data.topReferArr[index]  ) || ( data.middleReferArr[index] || 0 ) || data.bottomReferArr[index];
                    referArr.push(value); 
                });
                
            };
            data.referArr = referArr;
            return { ...state, saveSpaceTrend:data, saveTrendLoading:false };
        },
        setSavespaceDate(state, { payload:{ startDate, endDate }}){
            return { ...state, startDate, endDate };
        },
        toggleModalTimeType(state, { payload }){
            let startDate, endDate;
            let date = new Date();
            if ( payload === '1'){
                endDate = startDate = moment(date);
            } else if ( payload === '2'){
                startDate = moment(date).startOf('month');
                endDate = moment(date).endOf('month');
            } else {
                startDate = moment(date).startOf('year');
                endDate = moment(date).endOf('year');
            }
            return { ...state, modalTimeType:payload, modalStartDate:startDate, modalEndDate:endDate };
        },
        setModalDate(state, { payload:{ modalStartDate, modalEndDate }}){
            return { ...state, modalStartDate, modalEndDate };
        },
        getReportResult(state, { payload:{ data }}){
            return { ...state, reportInfo:data }
        },
        getRankResult(state, { payload:{ data }}){
            return { ...state, rankAndGrade:data }
        },
        getHealthResult(state, { payload:{ data }}){
            return { ...state, eleHealth:data }
        },
        reset(state){
            return initialState;
        },
        resetSaveSpaceTrend(state){
            let date = new Date();
            return { ...state, saveSpaceTrend:{}, trendTimeType:'2', trendStartDate:moment(date).startOf('month'), trendEndDate:moment(date).endOf('month')  };
        }
    }
}

function connectPoint(tipCost, topCost, middleCost, bottomCost){
    let dataSource;
    let nextIndex = 0;
    for(var i=0,len=topCost.length ;i < len ;i++){
        // 判断当前时刻所在时间段
        ++nextIndex;
        let currentTimePeriod = tipCost[i] !== null ? 'tip' 
                        : topCost[i] !== null ? 'top' 
                        : middleCost[i] !== null ? 'middle'
                        : bottomCost[i] !== null ? 'bottom' : '';
        // 判断下一次时刻所在时间段
        let nextTimePeriod = tipCost[nextIndex] !== null ? 'tip' 
                        : topCost[nextIndex] !== null ? 'top' 
                        : middleCost[nextIndex] !== null ? 'middle'
                        : bottomCost[nextIndex] !== null ? 'bottom' : '';
        // 当处在连续时间段内则跳过此次循环
        if ( !currentTimePeriod || currentTimePeriod === nextTimePeriod ) continue;
        // 定位至断点处
        let currentData  = currentTimePeriod === 'tip' ? tipCost : currentTimePeriod === 'top' ? topCost : currentTimePeriod === 'middle' ? middleCost : currentTimePeriod === 'bottom' ? bottomCost : [];
        let nextData  = nextTimePeriod === 'tip' ? tipCost : nextTimePeriod === 'top' ? topCost : nextTimePeriod === 'middle' ? middleCost : nextTimePeriod === 'bottom' ? bottomCost : [];
        // 将两个时间段的断点连接起来，newAdd字段是为了tooltip的 formatter 控制不显示
        nextData[i] = {
            value:currentData[i],
            newAdd:true
        }

    }
}


