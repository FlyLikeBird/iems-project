import { getMonitorInfo, getCoalTrend, getEnergyScene, getEfficiencyScene, getAlarmScene, getTplInfo, getTplRank, fetchImg, getSaveSpace } from '../services/monitorService';
import { getEnergyType } from '../services/energyService';

const initialState = {
    sceneList:[],
    monitorInfo:{},
    energyInfoList:[],
    energyList:[],
    energyInfo:{},
    coalInfo:{},
    tplInfo:{},
    // 节省空间
    saveSpace:{}
};

export default {
    namespace:'monitor',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *cancelAll(action, { put }){
            yield put({ type:'cancelMonitorInfo'});
            yield put({ type:'cancelTplInfo'});
            yield put({ type:'cancelSaveSpace'});
            yield put({ type:'reset'});
        },
        *init(action, { put }){
            yield put({ type:'fetchMonitorInfo'});
            yield put({ type:'fetchEnergyType'});
            yield put({ type:'fetchTplInfo'});
            yield put({ type:'fetchSaveSpace'});
            yield put({ type:'fetchCoalTrend'});
        },
        *fetchMonitorInfo(action, { select, call, put}){
            yield put.resolve({ type:'cancelMonitorInfo'});
            yield put.resolve({ type:'cancelable', task:fetchMonitorInfoCancelabl, action:'cancelMonitorInfo' });
            function* fetchMonitorInfoCancelabl(){
                try {
                    let { user:{ company_id }} = yield select();
                    let { data } = yield call(getMonitorInfo, { company_id });
                    if ( data && data.code === '0') {
                        yield put({ type:'getInfo', payload:{ data : data.data }});
                    } 
                } catch(err){        
                    console.log(err);
                }
            }
        },
        *fetchCoalTrend(action, { select, call, put }){
            try {
                let { user:{ company_id }} = yield select();
                let { data } = yield call(getCoalTrend, { company_id });
                if ( data && data.code === '0' ) {
                    yield put({ type:'getCoal', payload:{ data:data.data } });
                }
            } catch(err){   
                console.log(err);
            }
        },
        *fetchEnergyType(action, { call, put}){
            try {
                let { data } = yield call(getEnergyType);
                if ( data && data.code === '0'){
                    yield put({ type:'getEnergy', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchTplInfo(action, { select, call, put, all }){
            yield put.resolve({ type:'cancelTplInfo'});
            yield put.resolve({ type:'cancelable', task:fetchTplInfoCancelable, action:'cancelTplInfo' });
            function* fetchTplInfoCancelable(){
                try {
                    let { user:{ company_id }} = yield select();
                    let [infoData, rankData] = yield all([
                        call(getTplInfo, { company_id }),
                        call(getTplRank, { company_id})
                    ]);
                    if ( infoData.data && infoData.data.code === '0' && rankData.data && rankData.data.code === '0'){
                        infoData.data.data['rank'] = rankData.data.data.rank;
                        yield put({ type:'getTplInfo', payload:{ data: infoData.data.data }})
                    }
                } catch(err){
                    console.log(err);
                }
            } 
        },
        *fetchSaveSpace(action, { call, put, select }){
            yield put.resolve({ type:'cancelSaveSpace'});
            yield put.resolve({ type:'cancelable', task:fetchSaveSpaceCancelable, action:'cancelSaveSpace'});
            function* fetchSaveSpaceCancelable(){
                try{
                    let { user:{ company_id }} = yield select();
                    let { resolve, reject } = action.payload || {};
                    let { data } = yield call(getSaveSpace, { company_id });
                    if ( data && data.code === '0'){
                        yield put({type:'getSaveResult', payload:{ data:data.data }});
                        if ( resolve && typeof resolve === 'function' ) resolve();
                    } else {
                        if ( reject && typeof reject === 'function' ) reject(data && data.msg);
                    }
                } catch(err){
                    console.log(err);
                }
            }   
        },
        // *fetchScenes(action, { call, put, all, select }){
        //     try {
        //         let company_id = localStorage.getItem('company_id');
        //         let [energyScene, efficiencyScene, alarmScene] = yield all([
        //             call(getEnergyScene, { company_id }),
        //             call(getEfficiencyScene, { company_id, time_type:2 }),
        //             call(getAlarmScene, { company_id }),
        //         ]);
        //         // 单独请求图片，解析成base64位字符串
        //         let [energyImg, alarmImg] = yield all([
        //             call(fetchImg, { path:energyScene.data.data.scene.bg_image_path }),
        //             call(fetchImg, { path:alarmScene.data.data.scene.bg_image_path }),
        //         ]);
        //         energyScene.data.data.scene.bg_image_path = energyImg;
        //         alarmScene.data.data.scene.bg_image_path = alarmImg;
        //         if ( energyScene && energyScene.data.code === '0' 
        //             && efficiencyScene && efficiencyScene.data.code === '0' 
        //             && alarmScene && alarmScene.data.code === '0'
        //         ) {
        //             yield put({ type:'getScenes', payload:{ sceneList: [energyScene.data.data, efficiencyScene.data.data, alarmScene.data.data] }});
        //         }  
        //     } catch(err){
        //         console.log(err);
        //     }
        // }
    },
    reducers:{
        toggleChartLoading(state){
            return { ...state, chartLoading:true }
        },
        getInfo(state, { payload: { data }}){
            let { energyInfo, quota, demand } = data;
            let energyInfoList = Object.keys(energyInfo).map(key=>{
                energyInfo[key]['key'] = key;
                energyInfo[key]['quota'] = quota[key];
                energyInfo[key]['demand'] = demand[key].predDmand;
                energyInfo[key]['demandRatio'] = demand[key].ratio;
                energyInfo[key]['percent'] = energyInfo[key].energy ? quota[key] ? energyInfo[key].energy / quota[key] >= 1 ? 100 : Math.round(energyInfo[key].energy/quota[key]*100) : 100 : 0;
                return energyInfo[key];                
            });
            return { ...state, monitorInfo:data, energyInfoList };
        },
        getTplInfo(state, { payload:{ data }}){
            return { ...state, tplInfo:data } ;
        },
        getCoal(state, { payload:{ data }}){
            return { ...state, coalInfo:data };
        },
        getScenes(state, { payload :{ sceneList }}){
            return { ...state, sceneList, chartLoading:false };
        },
        getEnergy(state, { payload:{ data }}){
            let energyInfo = data.filter(i=>i.type_code === 'ele')[0];
            return { ...state, energyList:data, energyInfo:energyInfo || {} };
        },
        getSaveResult(state, { payload:{ data }}){
            return { ...state, saveSpace:data };
        },
        toggleEnergy(state, { payload }){
            return { ...state, energyInfo:payload };
        },
        reset(state){
            return initialState;
        }
    }
}
