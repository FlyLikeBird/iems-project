import { getCarbonIndex, getCarbonTrend, getCarbonAttrInfo, getCarbonRegionRank, getCarbonEff } from '../../services/coalManagerService';
import { getTypeRule, setTypeRule } from '../../services/userService';
import moment from 'moment';
moment.suppressDeprecationWarnings = true;
let date = new Date();

const initialState = {
    trendInfoList:[
        { key:'day', value:0, unit:'吨', sameRate:'', adjoinRate:''},
        { key:'month', value:0, unit:'吨', sameRate:'', adjoinRate:''},
        { key:'year', value:0, unit:'吨', sameRate:'', adjoinRate:''}
    ],
    carbonInfoList:[
        { key:'day', quota:0, value:0, unit:'吨'},
        { key:'month', quota:0, value:0, unit:'吨'},
        { key:'year', quota:0, value:0, unit:'吨'},
    ],
    carbonData:{},
    carbonLoading:true,
    carbonTrend:{},
    regionRank:[],
    effLoading:true,
    carbonEff:{},
    activeKey:'2',
    typeRule:{}
};

export default {
    namespace:'carbon',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *fetchCarbonIndex(action, { select, put, call }){
            try{
                let { user:{ company_id, timeType, startDate, endDate }} = yield select();
                yield put({ type:'toggleCarbonLoading'});
                timeType = timeType === '10' ? '2' : timeType;
                let { data } = yield call(getCarbonIndex, { company_id, time_type:timeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD')})
                if ( data && data.code === '0'){
                    yield put({ type:'getCarbon', payload:{ data:data.data }});
                } else if ( data && data.code === '1001') {
                    yield put({ type:'user/loginOut'});
                }
            } catch(err){
                console.log(err);
            }
        },
        *initEffRank(action, { put }){
            yield put.resolve({ type:'fields/init'});
            // yield put.resolve({ type:'fetchDemand'});
        },
        // 碳排放趋势
        *initCarbonTrend(action, { put }){
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchAttrInfoList' });
            yield put({ type:'fetchCarbonTrend'});
            yield put({ type:'fetchCarbonRegionRank'});
        },
        *fetchAttrInfoList(action, { put, call, select }){
            let { user:{ company_id }, fields:{ currentAttr }} = yield select();
            let { data } = yield call(getCarbonAttrInfo, { company_id, attr_id:currentAttr.key });
            if ( data && data.code === '0'){
                yield put({ type:'getAttrInfoList', payload:{ data:data.data }});
            }
        },
        *fetchCarbonTrend(action, { put, call, select }){
            let { user:{ company_id, startDate, endDate, timeType }, fields:{ currentAttr }} = yield select();
            timeType = timeType === '10' ? '2' : timeType;
            let { data } = yield call(getCarbonTrend, { company_id, attr_id:currentAttr.key, time_type:timeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD')});
            if ( data && data.code === '0'){
                yield put({ type:'getCarbonTrend', payload:{ data:data.data }})
            }
        },
        *fetchCarbonRegionRank(action, { put, call, select }){
            let { user:{ company_id, startDate, endDate, timeType }} = yield select();
            timeType = timeType === '10' ? '2' : timeType;
            yield put({ type:'toggleCarbonLoading'});
            let { data } = yield call(getCarbonRegionRank, { company_id, time_type:timeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') });
            if ( data && data.code === '0'){
                yield put({ type:'getRegionRank', payload:{ data:data.data }});
            }
        },
        // 能效竞争力
        *initCarbonEff(action, { put, call, select }){
            let { type, warning_type } = action.payload || {};
            yield put.resolve({ type:'fields/init'});
            yield put({ type:'fetchCarbonEff', payload:{ type }});
            yield put({ type:'fetchTypeRule' , payload:{ warning_type }});
        },
        *fetchCarbonEff(action, { call, select, put }){
            let { type } = action.payload || {};
            type = type || '2';
            let { user:{ company_id, timeType, startDate, endDate }, fields:{ currentAttr }} = yield select();
            timeType = timeType === '10' ? '2' : timeType;
            yield put({ type:'toggleEffLoading'});
            let { data } = yield call(getCarbonEff, { company_id, type_id:type, attr_id:currentAttr.key, time_type:timeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') });
            if ( data && data.code === '0'){
                yield put({ type:'getCarbonEff', payload:{ data:data.data }});
            }
        },
        *fetchTypeRule(action, { call, put, select }) {
            let { user:{ company_id, timeType }, fields:{ currentAttr }} = yield select();
            let { warning_type } = action.payload;
            timeType = timeType === '10' ? '2' : timeType;
            let { data } = yield call(getTypeRule, { company_id, attr_id:currentAttr.key, type_code:warning_type, time_type:timeType });
            if ( data && data.code === '0'){
                yield put({ type:'getTypeRuleResult', payload:{ data:data.data }});
            }
        },
        *setRule(action, { call, put, select }){
            let { user:{ company_id, timeType }, fields:{ currentAttr }, carbon:{ typeRule }} = yield select();
            let { warning_min, warning_max, resolve, reject, warning_type } = action.payload || {};
            timeType = timeType === '10' ? '2' : timeType;
            let object = { company_id, attr_id:currentAttr.key, type_code:warning_type, time_type:timeType };
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
                yield put({ type:'fetchTypeRule', payload:{ warning_type }});
            } else {
                if ( reject ) reject(data.msg);
            }
        },
    },
    reducers:{
        toggleCarbonLoading(state, {}){
            return { ...state, carbonLoading:true };
        },
        toggleEffLoading(state){
            return { ...state, effLoading:true };
        },
        getCarbon(state, { payload:{ data }}){
            let { day, month, year } = data;
            let carbonInfoList = [
                { key:'day', quota:Math.round(day.quota), value:Math.round(day.carbon), unit:'吨'},
                { key:'month', quota:Math.round(month.quota), value:Math.round(month.carbon), unit:'吨'},
                { key:'year', quota:Math.round(year.quota), value:Math.round(year.carbon), unit:'吨'},
            ];
            return { ...state, carbonInfoList, carbonData:data, carbonLoading:false };
        },
        getCarbonTrend(state, { payload:{ data }}){
            return { ...state, carbonTrend:data };
        },
        getTypeRuleResult(state, { payload:{ data }}){
            return { ...state, typeRule:data };
        },
        getRegionRank(state, { payload:{ data }}){
            return { ...state, regionRank:data, carbonLoading:false };
        },
        getAttrInfoList(state, { payload:{ data }}){
            let temp = state.trendInfoList.concat().map(item=>{
                let obj = { ...item };
                obj.value = item.key === 'day' ? (+data.dayCarbon).toFixed(1) : item.key === 'month' ? (+data.monthCarbon).toFixed(1) : (+data.yearCarbon).toFixed(1);
                obj.sameRate = item.key === 'day' ? data.sameDayRatio : item.key === 'month' ? data.sameMonthRatio : data.sameYearRatio;
                obj.adjoinRate = item.key === 'day' ? data.lastDayRatio : item.key === 'month' ? data.lastMonthRatio : data.lastYearRatio;
                return obj;
            });
            return { ...state, trendInfoList:temp };
        },
        getCarbonEff(state, { payload:{ data }}){
            return { ...state, carbonEff:data, effLoading:false };
        },
        toggleActiveKey(state, { payload }){
            return { ...state, activeKey:payload };
        },
        reset(state){
            return initialState;
        }
    }
}




