import { getEleMonitorInfo, getEleLines, getLinesData, getEleLinesDetail } from '../../services/eleMonitorService';
import { getTypeRule, setTypeRule } from '../../services/userService';
import moment from 'moment';
let date = new Date();

const buttons = [
    { title:'有功功率', code:'1', unit:'kw', key:'power' },
    { title:'电流', code:'2', unit:'A', key:'electric_current' },
    { title:'相电压', code:'3', unit:'V', key:'phase_voltage' },
    { title:'线电压', code:'4', unit:'V', key:'line_voltage' },
    { title:'功率因素', code:'5', unit:'cosΦ', key:'power_factor' },
    { title:'无功功率', code:'6', unit:'kvar', key:'reactive_power' },
    { title:'视在功率', code:'7', unit:'kw', key:'apparent_power' },
    { title:'温度', code:'8', unit:'℃', key:'temperature' }
    // { title:'三相不平衡', code:'8', unit:'' },
];
const initialState = {
    optionList:buttons,
    currentOption:buttons[0],
    startDate:moment(date),
    endDate:moment(date),
    timeType:'1',
    isLoading:true,
    chartInfo:{},
    typeRule:{},
    eleScenes:[],
    currentScene:{},
    linePoints:[],
    eleDetail:{},
    eleLoading:true,
}

export default {
    namespace:'eleMonitor',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        // 统一取消所有action
        *cancelAll(action, { put }){
            yield put({ type:'cancelChartInfo'});
            yield put({ type:'reset'});
        },
        *init(action, { put }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchChartInfo'});
            yield put({ type:'fetchTypeRule'});
        },
        *fetchChartInfo(action, { call, put, select }){
            try {
                yield put({ type:'toggleLoading'});
                let { user:{ company_id, startDate, endDate, timeType }, fields:{ currentAttr } ,eleMonitor:{ currentOption }} = yield select();
                timeType = timeType === '10' ? '2' : timeType;
                let { data } = yield call(getEleMonitorInfo, { company_id, attr_id:currentAttr.key, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), time_type:timeType, energy_type:currentOption.code });
                if ( data && data.code === '0'){
                    yield put({ type:'getChartInfo', payload:{ data:data.data }});
                } 
            } catch(err){
                console.log(err);
            }
        },
        *fetchTypeRule(action, { call, put, select }) {
            let { user:{ company_id }, fields:{ currentAttr }, eleMonitor:{ currentOption }} = yield select();
            let { data } = yield call(getTypeRule, { company_id, attr_id:currentAttr.key, type_code:currentOption.key });
            if ( data && data.code === '0'){
                yield put({ type:'getTypeRuleResult', payload:{ data:data.data }});
            }
        },
        *setRule(action, { call, put, select }){
            let { user:{ company_id }, fields:{ currentAttr }, eleMonitor:{ currentOption, typeRule }} = yield select();
            let { warning_min, warning_max, resolve, reject } = action.payload || {};
            let object = { company_id, attr_id:currentAttr.key, type_code:currentOption.key };
            if ( typeRule && typeRule.rule_id ) {
                object.rule_id = typeRule.rule_id;
            }
            if ( warning_min ) {
                object.warning_min = warning_min;
            }
            if ( warning_max ){
                object.warning_max = warning_max;
            }
            let { data } = yield call(setTypeRule, object);
            if ( data && data.code === '0'){
                if ( resolve ) resolve();
                yield put({ type:'fetchTypeRule'});
            } else {
                if ( reject ) reject(data.msg);
            }
        },
        *fetchEleLines(action, { call, put, select, all }){      
            try {
                let { user:{ company_id }} = yield select();
                let { data } = yield call(getEleLines, { company_id, scene_type:'2' });
                if ( data && data.code === '0'){
                    yield put({ type:'getEleScenes', payload:{ data:data.data }});
                    yield put({ type:'fetchLinesData'});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchLinesData(action, { call, put, select }){
            try {
                // yield put({ type:'toggleEleLoading' });
                let { user:{ company_id }, eleMonitor:{ currentScene }} = yield select();
                let { data } = yield call(getLinesData, { company_id, scene_id:currentScene.scene_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getLinesData', payload:{ data:data.data } });
                }
            } catch(err){
                console.log(err);
            }
        },
        *resetDetail(action, { put }){
            yield put({ type:'cancelEleLinesDetail'});
            yield put({ type:'resetDetailInfo'});
        },
        *fetchEleLinesDetail(action, { call, put, select }){
            try {
                yield put({ type:'toggleDetailLoading'});
                let { user:{ company_id, startDate, endDate, timeType }} = yield select();
                let { mach_id, optionType } = action.payload || {};
                timeType = timeType === '10' ? '2' : timeType;
                let { data } = yield call(getEleLinesDetail, { company_id, mach_id, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), time_type:timeType, energy_type:optionType });
                if ( data && data.code === '0'){
                    yield put({ type:'getEleLinesDetail', payload:{ data:data.data }});
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
        toggleDetailLoading(state){
            return { ...state, detailLoading:true };
        },
        toggleEleLoading(state){
            return { ...state, eleLoading:true };
        },
        getChartInfo(state, { payload:{ data }}){
            return { ...state, chartInfo:data, isLoading:false };
        },
        toggleCurrentOption(state, { payload }){
            return { ...state, currentOption:payload };
        },
        getTypeRuleResult(state, { payload:{ data }}){
            return { ...state, typeRule:data };
        },
        toggleTimeType(state, { payload }){
            let startDate, endDate;
            let date = new Date();
            if ( payload === '1'){
                // 小时维度
                startDate = endDate = moment(date);
            }
            if ( payload === '2'){
                // 日维度
                startDate = moment(date).startOf('month');
                endDate = moment(date).endOf('month');
            }
            if ( payload === '3'){
                // 月维度
                startDate = moment(date).startOf('year');
                endDate = moment(date).endOf('year');
            }
            if ( payload === '4' ){
                // 年维度
                startDate = moment(date);
                endDate = moment(date);
            }
            if ( payload === '10' ){
                // 周维度  ，调整周的起始日从周日为周一
                startDate = moment(date).startOf('week').add(1, 'days');
                endDate = moment(date).endOf('week').add(1, 'days');
            }
            return { ...state, timeType:payload, startDate, endDate };
        },
        setDate(state, { payload:{ startDate, endDate }}){
            return { ...state, startDate, endDate };
        },
        getEleScenes(state, { payload:{ data }}){
            let temp = data.length ? data[0] : {};
            return { ...state, eleScenes:data, currentScene:temp, eleLoading:false };
        },
        getLinesData(state, { payload:{ data }}){
            return { ...state, linePoints:data, eleLoading:false };
        },
        getEleLinesDetail(state, { payload:{ data }}){
            return { ...state, eleDetail:data, detailLoading:false };
        },
        toggleCurrentScene(state, { payload }){
            return { ...state, currentScene:payload };
        },
        resetDetailInfo(state){
            return { ...state, eleDetail:{}, detailLoading:true };
        },
        
        reset(state){
            return initialState;
        }
    }
}