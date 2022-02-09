import { getMachs, getAttrsTree, getDemandInfo, getDemandAnalyz, getDemandCost, getUselessInfo, getMachEfficiency, setMachPower, getLineLoss, getEnergyPhase } from '../../services/demandService';
import { getMainLine } from '../../services/incomingLineService'
import { getEnergyType } from '../../services/energyService';

import moment from 'moment';
moment.suppressDeprecationWarnings = true;
let date = new Date();

const initialState = {
    energyInfo:{},
    energyList:[],
    machList:[],
    currentMach:{},
    demandInfo:{},
    analyzInfo:{},
    costInfo:{},
    uselessInfo:{},
    uselessLoading:true,
    // 可选时间区间：过去一周，过去一个月，过去三个月
    demandLoading:true,
    treeLoading:true,
    loaded:false,
    referTime:moment().subtract(1,'days'),
    modalStartDate:moment(date),
    // 设备运行效率
    machEffInfo:{},
    machRatioList:[],
    machLoading:true,
    // 线损
    lineLossInfo:{},
    mainLineList:[],
    currentMainLine:{},
    lineLossList:[],
    lineLossLoading:true,
    rated_power:0,
    // 视在功率 = 有功功率 + 无功功率,
    // 视在功率等级 ： 按达到额定功率的百分比计算 视在功率 等级
    
    // 能源三相数据监控字段
    // 时间周期（1：日周期；2：月周期；3：年周期）
    // （仅日周期时）时间格式类型(1:按小时分组；2：按30分钟分组；3：按15分钟分组；4：按5分钟分组；5：按1分钟分组)
    phaseDayTimeType:'1',
    // 参数类型(1：有功电量；2：无功电量；3：有功功率；4：无功功率；5：功率因素；6：最大需量；7：电流；8：电压：9：四象限无功电能)
    phaseOptionType:'1',
    phaseInfo:{},
    phaseValueList:[],
    phaseLoading:true
};

export default {
    namespace:'demand',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *fetchEnergy(action, { call, put }){
            try {
                let { data } = yield call(getEnergyType);
                if ( data && data.code === '0'){
                    yield put({type:'getEnergyList', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        // 这个接口提供给分析中心的报告调用
        *fetchDemandEntry(action, { call, put, all, select }){
            try {
                let { resolve, reject } = action.payload || {};
                yield all([
                    put.resolve({ type:'fetchDemand'}),
                    put.resolve({ type:'fetchAnalyz'}),
                    put.resolve({ type:'fetchUseless'})
                ])
                if ( resolve && typeof resolve === 'function' ) resolve();
            } catch(err){
                console.log(err);
            }
        },
        *resetDemand(action, { put }){
            yield put.resolve({ type:'cancelDemand'});
            yield put.resolve({ type:'cancelAnalyz'});
            yield put.resolve({ type:'reset'});
        },
        *initDemand(action, { put }){
            yield put.resolve({ type:'fields/init'});
            yield put.resolve({ type:'fetchDemand'});
        },
        *fetchDemand(action, { call, put, select }){
            yield put.resolve({ type:'cancelDemand'});
            yield put.resolve({ type:'cancelable', task:fetchDemandCancelable, action:'cancelDemand'});
            function* fetchDemandCancelable(){
                let { user:{ company_id }, demand:{ referTime }, fields:{ currentAttr }} = yield select();
                let refer_time = referTime.format('YYYY-MM-DD');
                let { data } = yield call(getDemandInfo, { company_id, attr_id:currentAttr.key, refer_time });
                if ( data && data.code === '0'){
                    yield put({type:'getDemand', payload:{ data:data.data }});
                } else if ( data && data.code === '1001' ) {
                    yield put({ type:'user/loginOut'});
                }          
            }
            
        },
        *fetchAnalyz(action, { call, put, select }){
            yield put.resolve({ type:'cancelAnalyz'});
            yield put.resolve({ type:'cancelable', task:fetchAnalyzCancelable, action:'cancelAnalyz'});
            function* fetchAnalyzCancelable(){
                try {
                    let { user:{ company_id, startDate, endDate }, analyze:{ modalStartDate, modalEndDate }, fields:{ currentAttr }} = yield select();
                    // 节能策略传的时间参数
                    let finalAttr = currentAttr;
                    if ( action.payload ) {
                        startDate = modalStartDate;
                        endDate = modalEndDate;
                        finalAttr = action.payload;
                    }
                    yield put({ type:'toggleDemandLoading'});
                    let { data } = yield call(getDemandAnalyz, { company_id, attr_id:finalAttr.key, begin_time:startDate.format('YYYY-MM-DD'), end_time:endDate.format('YYYY-MM-DD') });
                    if ( data && data.code === '0'){
                        yield put({type:'getAnalyz', payload:{ data:data.data }});
                    } else if ( data && data.code === '1001') {
                        yield put({ type:'user/loginOut'});
                    }
                } catch(err){
                    console.log(err);
                }
            }  
        },
        *resetUseless(action, { put }){
            yield put.resolve({ type:'cancelUseless'});
            yield put.resolve({ type:'reset'});
        },
        *initUseless(action, { put }){
            yield put.resolve({ type:'fields/init' });
            yield put.resolve({ type:'fetchUseless'});
        },
        *fetchUseless(action, { call, select, put}){
            yield put.resolve({ type:'cancelUseless'});
            yield put.resolve({ type:'cancelable', task:fetchUselessCancelable, action:'cancelUseless'});
            function* fetchUselessCancelable(){
                try {
                    let { user:{ company_id, startDate, endDate }, analyze:{ modalStartDate, modalEndDate }, fields:{ currentAttr }} = yield select();
                    // 节能策略传的时间参数
                    let finalAttr = currentAttr;
                    if ( action.payload ) {
                        startDate = modalStartDate;
                        endDate = modalEndDate;
                        finalAttr = action.payload;
                    }
                    yield put({ type:'toggleUselessLoading'});
                    let { data } = yield call(getUselessInfo, { company_id, attr_id:finalAttr.key, time_date:startDate.format('YYYY-MM-DD'), end_time_date:endDate.format('YYYY-MM-DD')  });
                    if ( data && data.code === '0'){
                        yield put({type:'getUseless', payload:{ data:data.data }});
                    } else if ( data && data.code === '1001') {
                        yield put({ type:'user/loginOut'});
                    }
                    
                } catch(err){
                    console.log(err);
                }
            }  
        },
        *initMachEfficiency(action, { put }){
            yield put.resolve({ type:'fields/init'});
            yield put.resolve({ type:'fetchMachEfficiency'});
        },
        *fetchMachEfficiency(action, { call, put, select }){
            try {
                let { user:{ company_id, startDate, endDate }, fields:{ currentAttr}} = yield select();
                yield put({ type:'toggleMachLoading'});
                let { data } = yield call(getMachEfficiency, { company_id, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), attr_id:currentAttr.key });
                if ( data && data.code === '0'){
                    yield put({ type:'getMachEfficiency', payload: { data:data.data }});
                } else if ( data && data.code === '1001') {
                    yield put({ type:'user/loginOut'});
                }
            } catch(err){
                console.log(err);
            }
        },
        *setMachPower(action, { call, put, select}){
            try {
                let { demand : { currentMach }} = yield select();
                let { rated_power, resolve, reject } = action.payload;
                let { data } = yield call(setMachPower, { rated_power, mach_id:currentMach.key });
                if ( data && data.code === '0') {
                    resolve();
                } else {
                    reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *initEnergyPhase(action, { put }){
            yield put.resolve({ type:'fields/init'});
            yield put.resolve({ type:'fetchEnergyPhase'});
        },
        *fetchEnergyPhase(action, { call, put, select}){
            try {
                let { user:{ company_id, timeType, startDate, endDate }, fields:{ currentAttr }, demand : { phaseDayTimeType, phaseOptionType }} = yield select();
                yield put({ type:'togglePhaseLoading'});
                let { data } = yield call(getEnergyPhase, { company_id, attr_id:currentAttr.key, time_type:timeType, option_type:phaseOptionType, day_time_type:phaseDayTimeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') });
                if ( data && data.code ==='0'){
                    yield put({type:'getPhase', payload:{ data:data.data }});
                } else if ( data && data.code === '1001') {
                    yield put({ type:'user/loginOut'});
                }
                
            } catch(err){
                console.log(err);
            }
        },
        *fetchMainLine(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { data } = yield call(getMainLine, { company_id });
                if ( data && data.code === '0'){
                    yield put({type:'getMain', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchLineLoss(action, { call, put, select}){
            try {
                let { user:{ company_id }, demand : { currentMainLine, startDate, endDate }} = yield select();
                let { resolve, reject } = action.payload;
                yield put({type:'toggleLineLossLoading', payload:true });
                let begin_date = startDate.format('YYYY-MM-DD');
                let end_date = endDate.format('YYYY-MM-DD');
                let { data } = yield call(getLineLoss, { company_id, begin_date, end_date, main_id:currentMainLine.main_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getLineLoss', payload:{ data:data.data }});
                } else {
                    yield put({type:'toggleLineLossLoading', payload:false });
                    if ( reject && ( typeof reject === 'function' ) ) reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
    },
    reducers:{
        getInit(state, { payload }){
            return { ...state, energyList:[], machList:[],  currentMach:{}, treeLoading:false, loaded:true };
        },
        toggleDemandLoading(state){
            return { ...state, demandLoading:true };
        },
        getEnergyList(state, { payload:{ data }}){
            return { ...state, energyList:data };
        },
        toggleMachLoading(state){
            return { ...state, machLoading:true };
        },
        togglePhaseLoading(state){
            return { ...state, phaseLoading:true };
        },
        toggleLineLossLoading(state, { payload }){
            return { ...state, lineLossLoading:payload }
        },
        toggleUselessLoading(state){
            return { ...state, uselessLoading:true };
        },
        getDemand(state, { payload : { data }}){
            return { ...state, demandInfo:data };
        },
        getAnalyz(state, { payload: { data }}){
            return { ...state, analyzInfo:data, demandLoading:false };
        },
        getCost(state, { payload : { data }}){
            return { ...state, costInfo:data };
        },
        getUseless(state, { payload : { data }}){
            return { ...state, uselessInfo:data, uselessLoading:false };
        },
        getMachEfficiency(state, { payload : { data }}){
            let machRatioList = [];
            machRatioList.push({ text:'当前负荷率', unit:'%', value:data.ratio, lastValue:0 });
            machRatioList.push({ text:'当前视在功率', unit:'kw', value:data.viewpower, lastValue:0});
            machRatioList.push({ text:'当前有功功率', unit:'kw', value:data.usepower, lastValue:0});
            machRatioList.push({ text:'当前无功功率', unit:'kw', value:data.uselesspower, lastValue:0});
            return { ...state, machEffInfo:data, machRatioList, machLoading:false };
        },
        getLineLoss(state, { payload : { data }}){
            let lineLossList = [];
            lineLossList.push({ text:'线损率', unit:'%', value:data.loseRate, lastValue:data.loseRateCont });
            lineLossList.push({ text:'输入总电量', unit:'kwh', value:data.in, lastValue:data.inCont});
            lineLossList.push({ text:'输出电量', unit:'kwh', value:data.out, lastValue:data.outCont });
            lineLossList.push({ text:'线损', unit:'kwh', value:data.lose, lastValue:data.loseCont });
            return { ...state, lineLossInfo:data, lineLossList, lineLossLoading:false };
        },
        getPhase(state, { payload:{ data }}){
            let phaseValueList = [];
            let isFactor = state.phaseOptionType === '5' ? true : false;
            phaseValueList.push({ text:'最大值', value: (+data.max).toFixed( isFactor ? 2 : 0), unit:data.unit});
            phaseValueList.push({ text:'最小值', value:(+data.min).toFixed( isFactor ? 2 : 0), unit:data.unit});
            phaseValueList.push({ text:'谷峰差', value:(+data.different).toFixed( isFactor ? 2 : 0), unit:data.unit});
            phaseValueList.push({ text:'平均负荷', value:(+data.avgLoad).toFixed( isFactor ? 2 : 0), unit:data.unit });
            phaseValueList.push({ text:'负荷系数', value:(+data.avgLoadRatio * 100).toFixed(1), unit:'%'});
            phaseValueList.push({ text:'最小负荷率', value:(+data.minLoadRatio * 100).toFixed(1), unit:'%'});
            return { ...state, phaseInfo:data, phaseValueList, phaseLoading:false };
        },
        selectMach(state, { payload }){
            return { ...state, currentMach:payload ? payload:{} };
        },
        toggleEnergyType(state, { payload }){
            let energyInfo = state.energyList.filter(i=>i.type_id === payload )[0];
            return { ...state, energyInfo };
        },
        setDate(state, { payload }){
            return { ...state, referTime:payload };
        },
        setTimePeriod(state, { payload:{ beginTime, endTime } }){
            return { ...state, beginTime, endTime };
        },
        setUselessDate(state, { payload:{ uselessTime, endUselessTime } }){
            return { ...state, uselessTime, endUselessTime };
        },
        setMachAndLineDate(state, { payload: { startDate, endDate }}){
            return { ...state, startDate, endDate };
        },
        // 能源三相数据
        setPhaseOptionType(state, { payload }){
            return { ...state, phaseOptionType:payload };
        },
        togglePhaseTimeType(state, { payload }){
            let phaseStartDate, phaseEndDate;
            let date = new Date();
            if ( payload === '1') {
                // 年时间维度下
                phaseStartDate = phaseEndDate = moment(date);
            } else if ( payload === '2'){
                // 月和日时间维度下
                phaseStartDate = moment(date).startOf('month');
                phaseEndDate = moment(date).endOf('month');
            } else if ( payload === '3'){
                phaseStartDate = moment(date).startOf('year');
                phaseEndDate = moment(date).endOf('year');
            }
            return { ...state, phaseTimeType:payload, phaseStartDate, phaseEndDate };
        },
        togglePhaseDayTimeType(state, { payload }){
            return { ...state, phaseDayTimeType:payload };
        },
        setPhaseDate(state, { payload:{ phaseStartDate, phaseEndDate }}){
            return { ...state, phaseStartDate, phaseEndDate };
        },
        setMachDate(state, { payload:{ startDate, endDate}}){
            return { ...state, startDate, endDate };
        },
        getMain(state, { payload:{ data }}){
            let currentMainLine = data && data.length ? data[0] : {};
            return { ...state, mainLineList:data, currentMainLine };
        },
        setMainLine(state, { payload }){
            return { ...state, currentMainLine:payload };
        },
        reset(state){
            return initialState;
        }
    }
}

function delay(ms){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve();
        },ms)
    })
}



