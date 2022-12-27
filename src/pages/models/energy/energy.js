import { getTotalCost, getCurrentCost, getEnergyType, getSceneInfo, getRank, getElectricCostAnalysis, getAttrWaterCost, getAttrGasCost, getTotalCostAnalysis, fetchImg } from '../../services/energyService';
import { setSceneInfo, uploadImg } from '../../services/alarmService';
import { getMachs } from '../../services/demandService';
import { getSaveSpace } from '../../services/monitorService';


const initialState = {
    energyInfo:{},
    energyList:[],
    //  时间维度，切换小时/日/月，默认以小时为单位
    chartLoading:true,
    timeType:'3',
    chartInfo:{},
    //  拟态图片信息
    sceneInfo:{},
    // 右上角当前时间段内的成本信息
    costInfo:[],
    costAnalysis:{},
    isLoading:true,
    // rateInfo:{},
    // 0 成本   1 能耗
    showType:'0',
    // 遮罩层状态
    maskVisible:false,
    waterCost:{},
    waterLoading:true
};

export default {
    namespace:'energy',
    state:initialState,
    effects:{
        *fetchInit(action, { call, put, all}){
            try {
                let { resolve, reject } = action.payload ? action.payload : {};       
                yield put.resolve({ type:'fetchEnergy'}),
                yield put.resolve({ type:'fetchCost'}),
                yield put.resolve({ type:'fetchCostByTime'})        
                if ( resolve && typeof resolve === 'function') resolve();               
            } catch(err){
                console.log(err);
            }
        },
        *fetchCost(action, { call, put, all, select }){
            try {
                let { resolve, reject } = action.payload || {};
                let { user:{ company_id }, energy : { energyInfo }} = yield select(); 
                let [ currentCost, costAnalysis ] = yield all([
                    call(getCurrentCost, { company_id, type_id : energyInfo.type_id }),
                    call(
                        energyInfo.type_id === 1 ?
                        getElectricCostAnalysis : 
                        getTotalCostAnalysis,
                        { company_id, type_id:energyInfo.type_id }
                    )   
                ]);           
                if ( currentCost && currentCost.data.code === '0' && costAnalysis && costAnalysis.data.code === '0'){
                    let payload = { currentCost : currentCost.data.data,  costAnalysis : costAnalysis.data.data, energyType: energyInfo.type_id };
                    yield put({type:'get', payload});
                    if ( resolve && typeof resolve === 'function') resolve();
                } 
            } catch (err){
                console.log(err);
            }
        },
        *fetchCostByTime(action, { call, put, select } ){
            try {
                let { user:{ company_id }, energy : { energyInfo, timeType }} = yield select();
                let { resolve, reject } = action.payload || {};
                yield put({ type:'toggleChartLoading'});
                let { data } = yield call(getTotalCost, { company_id, type_id:energyInfo.type_id, time_type:timeType })
                if ( data && data.code === '0'){
                    yield put({type:'getCostByTime', payload:{ data:data.data, timeType, energyType:energyInfo.type_id }});
                    if ( resolve && typeof resolve === 'function' ) resolve();
                }
            } catch(err){
                console.log(err);
            }
        },
        *initWaterCost(action, { call, select, put, all }) {
            try {
                let { type } = action.payload;
                yield all([
                    put.resolve({ type:'fields/init'}),
                    put.resolve({ type:'worktime/fetchWorktimeList'})
                ])
                yield put({ type:'fetchWaterCost', payload:{ type }});
            } catch(err){
                console.log(err);
            }
        },
        *fetchWaterCost(action, { call, select, put }){
            try {
                let { user:{ company_id, timeType, startDate, endDate }, fields:{ currentAttr }, worktime:{ currentWorktime }} = yield select();
                let { type } = action.payload || {} ;
                if ( !currentAttr.key ) {
                    yield put({ type:'getWaterCost', payload:{ data:{ a:'1' } }});
                    return ;
                }
                timeType = timeType === '10' ? '2' : timeType;
                yield put({ type:'toggleWaterLoading', payload:true });
                let { data } = yield call( type === 'water' ? getAttrWaterCost : type === 'combust' ? getAttrGasCost : getAttrWaterCost, { company_id, attr_id:currentAttr.key, rostering_id:currentWorktime.id, time_type:timeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') });
                if ( data && data.code === '0'){
                    yield put({ type:'getWaterCost', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        
        *fetchEnergy(action, { call, put, all}){
            try {
                let { data } = yield call(getEnergyType);
                if ( data && data.code === '0'){
                    yield put({type:'getType', payload:{ data:data.data }});
                    return data.data;
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchEleStatement(action, { call, put, select }){
            try {
                let { fields:{ currentAttr }} = yield select();
                if ( !Object.keys(currentAttr).length ){
                    yield put.resolve({ type:'fields/init'});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchSceneInfo(action, { select, call, put, all }){
            try {
                let { user : { company_id }} = yield select();
                let [sceneData, rankData, saveData] = yield all([
                    call(getSceneInfo, { company_id}),
                    call(getRank, { company_id}),
                    call(getSaveSpace, { company_id })
                ]);
                let imgURL = '';
                let temp = sceneData.data.data;
                if ( temp.scene && temp.scene.bg_image_path ){
                    imgURL = yield call(fetchImg, { path:temp.scene.bg_image_path} );
                }
                if ( sceneData.data.code === '0' && rankData.data.code === '0' && saveData.data.code === '0' ){
                    sceneData.data.data.saveSpace = saveData.data.data.costInfo;
                    sceneData.data.data.rank = rankData.data.data.rank;
                    if ( imgURL ){
                        sceneData.data.data.scene.bg_image_path = imgURL;
                    }
                    yield put({type:'getScene', payload:{ data: sceneData.data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *setSceneInfo(action, { select, call, put }){
            try{
                let { user : { company_id }} = yield select();
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
        toggleMaskVisible(state, { payload }){
            return { ...state, maskVisible:payload };
        },
        toggleWaterLoading(state, { payload }){
            return { ...state, waterLoading:payload };
        },
        get(state, { payload : { currentCost, costAnalysis, energyType }}){
            let costInfo=[];
            costInfo.push({ key:'day', ...currentCost['day']});
            costInfo.push({ key:'month',  ...currentCost['month']});
            costInfo.push({ key:'year', ...currentCost['year']});
            return { ...state, costInfo, costAnalysis, isLoading:false };
        },
        getCostByTime(state, { payload : { data, timeType, energyType }}){
            let chartInfo = data;
            if ( energyType === 0 ){
                // 总能源数据结构
                chartInfo['valueData'] = { '0': data.cost, '1': data.energy };
            } else if ( energyType === 1 ){
                // 电能源数据结构
                connectPoint(chartInfo.tipCost, chartInfo.topCost, chartInfo.middleCost, chartInfo.bottomCost);
            } else {
                // 其他能源数据处理
                 
            }
            chartInfo['lastValueData'] = {'0': data.lastCost, '1':data.lastEnergy };
            chartInfo['sameValueData'] = { '0':data.sameCost, '1':data.sameEnergy };
            return { ...state, chartInfo, chartLoading:false };
        },
        getWaterCost(state, { payload:{ data }}){
            let costInfo = [], chartInfo = {};
            costInfo.push({ key:'month',  ...data['month']});
            costInfo.push({ key:'year', ...data['year']});
            data['costInfo'] = costInfo;
            data['cost'] = data.value;
            data['lastValueData'] = { '0':data.lastValue,'1':[] };
            return { ...state, waterCost:data, waterLoading:false };
        },
        getScene(state, { payload : { data }}){
            return { ...state, sceneInfo:data };
        },
        getType(state, { payload : { data } }){
            // let energyInfo = data.filter(i=>i.type_code === 'ele')[0];
            let energyInfo = { type_id : 0, type_name:'总', type_code:'total', unit:'kgce' };
            data.unshift(energyInfo);
            return { ...state, energyList:data, energyInfo:energyInfo };
        },
        toggleChartLoading(state){
            return { ...state, chartLoading:true };
        },
        toggleEnergyType(state, { payload }){
            return { ...state, energyInfo:payload };
        },
        toggleShowType(state, { payload }){
            return { ...state, showType:payload };
        },
        toggleTimeType(state, { payload }){
            return { ...state, timeType:payload }
        },
        reset(state){
            return initialState;
        }
    }
}


function connectPoint(tipCost, topCost, middleCost, bottomCost){
    let dataSource;
    let nextIndex = 0;
    for(var i=0,len=topCost.length ;i < len ;i++){
        // 判断当前时刻所在时间段
        ++nextIndex;
        let currentTimePeriod = tipCost[i]  ? 'tip' 
                        : topCost[i]   ? 'top' 
                        : middleCost[i]  ? 'middle'
                        : bottomCost[i]  ? 'bottom' : '';
        // 判断下一次时刻所在时间段
        let nextTimePeriod = tipCost[nextIndex]  ? 'tip' 
                        : topCost[nextIndex]  ? 'top' 
                        : middleCost[nextIndex]  ? 'middle'
                        : bottomCost[nextIndex]  ? 'bottom' : '';
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


