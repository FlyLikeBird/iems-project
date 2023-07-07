import { 
    getMonitorInfo, getScenes, getMachData,
    getFrozenStationInfo, getNitrogenStationInfo,
    getFrozenMachList, getFrozenChartInfo, getNitrogenMachList, getNitrogenChartInfo
} from '../services/monitorIndexService';

const initialState = {
    sceneList:[],
    currentScene:{},
    sceneLoading:true,
    monitorInfo:{},
    sceneIndex:1,
    // 制冷站和氮气站
    infoList:[],
    machList:[],
    isLoading:false,
    currentMach:{},
    chartInfo:{}
}

export default {
    namespace:'monitorIndex',
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
            yield put.resolve({ type:'reset'});
        },
        *init(action, { put }){
            yield put.resolve({ type:'fetchScenes'});
            yield put.resolve({ type:'fetchMonitorInfo'});
        },
        *fetchScenes(action, { call, select, put }){
            let { user:{ company_id }} = yield select();
            let { data } = yield call(getScenes, { company_id, scene_type:'1' });
            if ( data && data.code === '0'){
                yield put({ type:'getScenes', payload:{ data:data.data }});
            }
        },
        *fetchMonitorInfo(action, { call, put, select }){         
            try {
                let { user:{ company_id }, monitorIndex:{ currentScene }} = yield select();
                let { noLoading } = action.payload || {};
                if ( !noLoading ){
                    yield put({ type:'toggleSceneLoading', payload:true });
                }
                let { data } = yield call(getMonitorInfo, { company_id, scene_id:currentScene.scene_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getResult', payload:{ data:data.data }});
                } 
            } catch(err){
                console.log(err);
            }
        },   
        *fetchFrozenStationSumInfo(action, { call, put, select }){
            let { user:{ company_id }} = yield select();
            let cryometers = ['MEIYI7610HZVIS01'];
            let elemeters = ['042202000205'];
            let { data } = yield call(getFrozenStationInfo, { company_id, cryometers, elemeters });
            if ( data && data.code === '0'){
                yield put({ type:'getFrozenStationInfoResult', payload:{ data:data.data }})
            }
        },
        *fetchNitrogenStationSumInfo(action, { call, put, select }){
            let { user:{ company_id }} = yield select();
            let gasmeters = ['WEITAIHZVIS02'];
            let elemeters = ['209136460035'];
            let { data } = yield call(getNitrogenStationInfo, { company_id, gasmeters, elemeters });
            if ( data && data.code === '0'){
                yield put({ type:'getNitrogenStationInfoResult', payload:{ data:data.data }})
            }
        },
        *fetchMachData(action, { call, put, select }){         
            try {
                let { user:{ company_id }} = yield select();
                let { register_code, mach_type, resolve, reject  } = action.payload || {};
                mach_type = mach_type || 'ele';
                let { data } = yield call(getMachData, { company_id, register_code, mach_type });
                if ( data && data.code === '0'){
                    if ( resolve && typeof resolve === 'function' ) resolve(data.data);
                } else {
                    if ( reject && typeof reject === 'function' ) reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *initFrozenStation(action, { put }){
            yield put.resolve({ type:'fetchFrozenMachList', payload:{ type:'frozen' }});
            yield put({ type:'fetchFrozenChartInfo', payload:{ type:'frozen'}});
        },
        *initNitrogenStation(action, { put }){
            yield put.resolve({ type:'fetchFrozenMachList', payload:{ type:'nitrogen' }});
            yield put({ type:'fetchFrozenChartInfo', payload:{ type:'nitrogen'}})
        },
        *fetchFrozenMachList(action, { call, put, select }){
            let { user:{ company_id }} = yield select();
            let { type } = action.payload || {};
            let { data } = yield call( type === 'frozen' ? getFrozenMachList : getNitrogenMachList, { company_id });
            if ( data && data.code === '0'){
                yield put({ type:'getMachListResult', payload:{ data:data.data }});
            }
        },
        *fetchFrozenChartInfo(action, { call, put, select }){
            let { user:{ startDate, endDate, timeType }, monitorIndex:{ currentMach }} = yield select();
            let { type } = action.payload || {};
            yield put({ type:'toggleLoading'});
            let { data } = yield call( type === 'frozen' ? getFrozenChartInfo : getNitrogenChartInfo, { mach_id:currentMach.mach_id, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), time_type:timeType });
            if ( data && data.code === '0'){
                yield put({ type:'getChartInfoResult', payload:{ data:data.data } });
            }
        }     
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        toggleSceneLoading(state, { payload }){
            return { ...state, sceneLoading:payload };
        },
        getResult(state, { payload:{ data }}){
            let { realtime } = data;
            let totalInfoList = [], energyInfoList=[], envInfoList = [];
            totalInfoList.push({ title:'电压', value:Math.round(realtime.volt), unit:'v' });
            totalInfoList.push({ title:'变压器台数', value:realtime.transmerCnt, unit:'台' })
            totalInfoList.push({ title:'装机容量', value:realtime.kva, unit:'kva' })
            totalInfoList.push({ title:'负荷率', value:realtime.powerRatio, unit:'%' })
            totalInfoList.push({ title:'最大需量', value:realtime.maxDemand, unit:'kw' })
            totalInfoList.push({ title:'测控装置', value:realtime.collectCnt, unit:'个' })
            data['totalInfoList'] = totalInfoList;
            energyInfoList.push({ title:'有功功率', value:Math.round(realtime.power), unit:'kw' });
            energyInfoList.push({ title:'今日能耗', value:data.dayEnergy, unit:'kwh' })
            energyInfoList.push({ title:'功率因素', value:(+realtime.factor).toFixed(2), unit:'cosΦ' })
            energyInfoList.push({ title:'本月能耗', value:data.monthEnergy, unit:'kwh' })
            energyInfoList.push({ title:'无功功率', value:Math.round(realtime.uselessPower), unit:'kvar' })
            energyInfoList.push({ title:'本年能耗', value:data.yearEnergy, unit:'kwh' });
            data['energyInfoList'] = energyInfoList;
            // envInfoList.push({ title:'室内温度', value:30, unit:'℃' });
            // envInfoList.push({ title:'湿度', value:68.1, unit:'%' })
            // envInfoList.push({ title:'水浸', value:0.98, unit:'mm' })
            // envInfoList.push({ title:'烟雾感应', value:'正常', unit:'' })
            // envInfoList.push({ title:'门禁', value:'开', unit:'' })
            // envInfoList.push({ title:'空调', value:'开', unit:'' });
            // envInfoList.push({ title:'变压器温度', value:'60.2', unit:'℃' });
            // envInfoList.push({ title:'母排温度', value:'56.2', unit:'℃' });
            // data['envInfoList'] = envInfoList;
            return { ...state, monitorInfo:data, sceneLoading:false };
        },
        toggleCurrentScene(state, { payload:{ currentScene, sceneIndex } }){
            return { ...state, currentScene, sceneIndex };
        },
        getScenes(state, { payload:{ data }}){
            let currentScene = data && data.length ? data[0] : {};
            return { ...state, sceneList:data, currentScene };
        },
        getMachListResult(state, { payload:{ data }}){
            return { ...state, machList:data, currentMach:data && data.length ? data[0] : {} }
        },
        getChartInfoResult(state, { payload:{ data }}){
            return { ...state, chartInfo:data, isLoading:false };
        },
        getFrozenStationInfoResult(state, { payload:{ data }}){
            let infoList = [
                { title:'昨日用电', value:data.lastDayEle, unit:'kwh' },
                { title:'本月用电', value:data.monthEle, unit:'kwh'},
                { title:'本年用电', value:data.yearEle, unit:'kwh'},
                { title:'累计流量', value:data.cumulativeFlow, unit:'m³'},
                { title:'累计冷量', value:data.cumulativeCryo, unit:'GJ'},
            ];
            return { ...state, infoList };
        },
        getNitrogenStationInfoResult(state, { payload:{ data }}){
            let infoList = [
                { title:'昨日用电', value:data.lastDayEle, unit:'kwh' },
                { title:'本月用电', value:data.monthEle, unit:'kwh'},
                { title:'本年用电', value:data.yearEle, unit:'kwh'},
                { title:'累计流量', value:data.cumulative, unit:'m³'},
            ];
            return { ...state, infoList };
        },
        setCurrentMach(state, { payload }){
            return { ...state, currentMach:payload };
        },
        reset(state){
            return initialState;
        }
    }
}
