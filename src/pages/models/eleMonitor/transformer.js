import { getMachs, getTransformerInfo, getMachChart } from '../../services/eleMonitorService';
import moment from 'moment';
let date = new Date();
const initialState = {
    transformerInfo:{},
    mashList:[],
    currentMach:{},
    isLoading:true,
    chartInfo:{}
}

export default {
    namespace:'transformer',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        // 统一管理所有action
        *initTransformer(action, { put }){
            yield put.resolve({ type:'fetchMachs'});
            yield put.resolve({ type:'fetchTransformerInfo'});
            yield put.resolve({ type:'fetchMachChartInfo'});
        },
        // 统一取消所有action
        *cancelAll(action, { put }){
            yield put({ type:'cancelMachs'});
            yield put({ type:'cancelTransformerInfo'});
            yield put({ type:'cancelMachChartInfo'});
            yield put({ type:'reset'});
        },
        *fetchMachs(action, { call, put, select }){
            yield put.resolve({ type:'cancelable', task:fetchMachsCancelable, action:'cancelMachs'});
            function* fetchMachsCancelable(params){
                try{
                    let { user:{ company_id }} = yield select();
                    let { data } = yield call(getMachs, { company_id });
                    if ( data && data.code === '0'){
                        yield put({ type:'getMachs', payload:{ data:data.data }});
                    } 
                } catch(err){
                    console.log(err);
                }
            }
        },
        *fetchTransformerInfo(action, { call, put, select }){
            yield put.resolve({ type:'cancelable', task:fetchTransformerCancelable, action:'cancelTransformerInfo' });
            function* fetchTransformerCancelable(params){
                try {
                    let { user:{ company_id }, transformer:{ currentMach }} = yield select();
                    let { data } = yield call(getTransformerInfo, { company_id, mach_id:currentMach.key });
                    if ( data && data.code === '0'){
                        yield put({ type:'getTransformerInfo', payload:{ data:data.data }});
                    } else if ( data && data.code === '1001' ) {
                        yield put({ type:'user/loginOut'});
                    }
                } catch(err){
                    console.log(err);
                }
            }
        },
        *fetchMachChartInfo(action, { call, put, select }){
            yield put.resolve({ type:'cancelMachChartInfo'});
            yield put.resolve({ type:'cancelable', task:fetchMachChartInfoCancelable, action:'cancelMachChartInfo'});
            function* fetchMachChartInfoCancelable(params){
                try {
                    yield put({ type:'toggleLoading'});
                    let { user:{ company_id }, eleMonitor:{ startDate, endDate, timeType }, transformer:{ currentMach}} = yield select();
                    let { data } = yield call(getMachChart, { company_id, mach_id:currentMach.key, time_type:timeType, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') });
                    if ( data && data.code === '0'){
                        yield put({ type:'getMachChart', payload:{ data:data.data }});
                    }
                } catch(err){
                    console.log(err);
                }
            }
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getMachs(state, { payload:{ data }}){
            // 只能选中进线层级下的设备，不能选总进线
            let rootNode = data && data.length ? data[0] : {};
            // let currentMach = rootNode.children && rootNode.children.length
            // if ( data && data.length ){
            //     data.forEach(item=>{
            //         item.disabled = true;
            //     })
            // }
            return { ...state, machList:data, currentMach: data && data.length ? data[0] : {} };
        },
        getTransformerInfo(state, { payload:{ data }}){
            let infoList = [];
            infoList.push({ title:'负荷', child:[{ title:'额定容量', value:data.total_kva , unit:'kva' }, { title:'视在功率', value:data.viewPower , unit:'kw'}, { title:'负荷率', value:data.load_rate , unit:'%' }]});
            infoList.push({ title:'功率', child:[{ title:'有功功率', value:data.usePower , unit:'kw'}, { title:'无功功率', value:data.uselessPower , unit:'kvar'}, { title:'功率因素', value:data.factor , unit:'cosΦ'}, { title:'本月最大需量', value:data.maxDemand , unit:'kw'}]});
            infoList.push({ title:'电流/电压', child:[{ title:'A相电流', value:data.I1 , unit:'A', type:'A' }, { title:'B相电流', value:data.I2 , unit:'A', type:'B'}, { title:'C相电流', value:data.I3 , unit:'A', type:'C' }, { title:'AB线电压', value:data.U12 , unit:'v', type:'A' }, { title:'BC线电压', value:data.U23 , unit:'v', type:'B' }, { title:'CA线电压', value:data.U31 , unit:'v', type:'C' }]})
            data.infoList = infoList;
            // console.log(infoList);
            return { ...state, transformerInfo:data };
        },
        getMachChart(state, { payload:{ data }}){
            return { ...state, chartInfo:data, isLoading:false };
        },
        toggleMach(state, { payload }){
            return { ...state, currentMach:payload };
        },
        reset(state){
            return initialState;
        }
    }
}