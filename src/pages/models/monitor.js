import { getMonitorInfo, getCoalTrend, getEnergyScene, getEfficiencyScene, getAlarmScene, getTplInfo, getTplRank, fetchImg, getSaveSpace } from '../services/monitorService';
import { getEnergyType } from '../services/fieldsService';

const initialState = {
    sceneList:[],
    monitorInfo:{},
    energyInfoList:[],
    energyInfo:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh' },
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
            yield put({ type:'reset'});
        },
        *init(action, { put }){
            yield put.resolve({ type:'fields/fetchEnergy'});
            yield put({ type:'fetchMonitorInfo'});
            yield put({ type:'fetchTplInfo'});
            yield put({ type:'fetchSaveSpace'});
            yield put({ type:'fetchCoalTrend'});
        },
        *fetchMonitorInfo(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { data } = yield call(getMonitorInfo, { company_id });
                if ( data && data.code === '0') {
                    yield put({ type:'getInfo', payload:{ data : data.data }});
                } 
            } catch(err){        
                console.log(err);
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
        *fetchTplInfo(action, { select, call, put, all }){
          
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
        },
        *fetchSaveSpace(action, { call, put, select }){
            
                try{
                    let { user:{ company_id, startDate, endDate }} = yield select();
                    let { resolve, reject } = action.payload || {};
                    let { data } = yield call(getSaveSpace, { company_id, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') });
                    if ( data && data.code === '0'){
                        yield put({type:'getSaveResult', payload:{ data:data.data }});
                        if ( resolve && typeof resolve === 'function' ) resolve();
                    } else {
                        if ( reject && typeof reject === 'function' ) reject(data && data.msg);
                    }
                } catch(err){
                    console.log(err);
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
