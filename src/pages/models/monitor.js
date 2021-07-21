import { getMonitorInfo, getEnergyScene, getEfficiencyScene, getAlarmScene, getTplInfo, getTplRank, fetchImg, getSaveSpace } from '../services/monitorService';
import { getEnergyType } from '../services/energyService';

const initialState = {
    sceneList:[],
    monitorInfo:{},
    energyInfoList:[],
    energyList:[],
    energyInfo:{},
    // 能流图层级关系
    parentNodes:[{ attr_name:'能流图入口', attr_id:'' }],
    chartLoading:true,
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
        // },
        // *fetchFlowChart(action, { select, call, put}){
        //     try {
        //         let company_id = localStorage.getItem('company_id');
        //         let { timeType, attr_id, resolve, reject } = action.payload ? action.payload : {};
        //         let { data } = yield call(getEfficiencyScene, { company_id, attr_id, time_type:timeType });
        //         if ( data && data.code === '0' ){
        //             let { monitor : { sceneList } } = yield select();
        //             if ( data && data.data.length ) {
        //                 // 请求新的能流图数据,更新sceneList
        //                 yield put({type:'toggleChartLoading'});
        //                 sceneList[1] = data.data;
        //                 yield put({type:'getScenes', payload:{ sceneList }});
        //                 if ( resolve && typeof resolve === 'function') resolve();
        //             } else {
        //                 // 如果返回为空数组，则不更新state
        //                 if ( reject && typeof reject === 'function' ) reject('下一层级为空');
                        
        //             }
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
            let energyInfoList = Object.keys(data.energyInfo).map(key=>{
                data.energyInfo[key]['key'] = key;
                data.energyInfo[key]['quota'] = data.quota[key];
                data.energyInfo[key]['demand'] = data.demand[key].predDmand;
                data.energyInfo[key]['demandRatio'] = data.demand[key].ratio;
                return data.energyInfo[key];                
            });
            return { ...state, monitorInfo:data, energyInfoList };
        },
        getTplInfo(state, { payload:{ data }}){
            return { ...state, tplInfo:data } ;
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
        setLevelInfo(state, { payload }){
            return { ...state, parentNodes:payload };
        },
        reset(state){
            return initialState;
        }
    }
}
