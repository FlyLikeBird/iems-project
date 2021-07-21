import { getEleQualityIndex, getEleBalance, getEleHarmonic } from '../../services/eleQualityService';
import moment from 'moment';
let date = new Date();

const initialState = {
    eleIndex:{},
    isLoading:true,
    eleBalance:{},
    eleHarmonic:{}
};

export default {
    namespace:'eleQuality',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *resetQualityIndex(action, { put }){
            yield put.resolve({ type:'cancelEleQualityIndex'});
            yield put.resolve({ type:'reset'});
        },
        *resetEleBalance(action, { put }){
            yield put.resolve({ type:'cancelEleBalance'});
            yield put.resolve({ type:'reset'});
        },
        *resetHarmonic(action,{ put }){
            yield put.resolve({ type:'cancelEleHarmonic'});
            yield put.resolve({ type:'reset'});
        },
        *initEleQualityIndex(action, { put }){
            yield put.resolve({ type:'fields/init'});
            yield put.resolve({ type:'fetchEleQualityIndex'});
        },
        *fetchEleQualityIndex(action, { put, select, call }){
            yield put.resolve({ type:'cancelEleQualityIndex'});
            yield put.resolve({ type:'cancelable', task:fetchEleQualityIndexCancelable, action:'cancelEleQualityIndex'});
            function* fetchEleQualityIndexCancelable(params){
                let { user:{ company_id, startDate, endDate }, fields:{ currentAttr }} = yield select();
                yield put({ type:'toggleLoading'});
                let { data } = yield call(getEleQualityIndex, { company_id, attr_id:currentAttr.key, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD')});
                if ( data && data.code === '0'){
                    yield put({ type:'getEleQualityIndex', payload:{ data:data.data }});              
                }
                
            }
        },
        *initEleBalance(action, { put }){
            yield put.resolve({ type:'fields/init'});
            yield put.resolve({ type:'fetchEleBalance'});
        },
        *fetchEleBalance(action, { select, call, put }){
            yield put.resolve({ type:'cancelEleBalance'});
            yield put.resolve({ type:'cancelable', task:fetchEleBalanceCancelable, action:'cancelEleBalance' });
            function* fetchEleBalanceCancelable(params){
                let { user:{ company_id, timeType, startDate, endDate }, fields:{ currentAttr }} = yield select();
                let { data } = yield call(getEleBalance, { company_id, attr_id:currentAttr.key, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD'), time_type:timeType });
                if ( data && data.code === '0'){
                    yield put({ type:'getEleBalance', payload:{ data:data.data }});
                }             
            }
        },
        *initEleHarmonic(action, { put }){
            yield put.resolve({ type:'fields/init'});
            yield put.resolve({ type:'fetchEleHarmonic'});
        },
        *fetchEleHarmonic(action, { select, call, put}){
            yield put.resolve({ type:'cancelEleHarmonic'});
            yield put.resolve({ type:'cancelable', task:fetchEleHarmonicCancelable, action:'cancelEleHarmonic'});
            function* fetchEleHarmonicCancelable(params){
                let { user:{ company_id, startDate, endDate }, fields:{ currentAttr}} = yield select();
                let { data } = yield call(getEleHarmonic, { company_id, attr_id:currentAttr.key, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD')});
                if ( data && data.code === '0'){
                    yield put({ type:'getEleHarmonic', payload:{ data:data.data }});
                }             
            }
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        getEleQualityIndex(state, { payload:{ data }}){
            // console.log(data);
            let obj = {};
            Object.keys(data).forEach((key,index)=>{
                if ( key === 'factor'){
                    obj[key] = [
                        { key:'1', title:'功率因素', value:data.factor.value, is_pass:data.factor.is_pass, refer:data.factor.refer, standard:data.factor.standard }
                    ];
                    return ;
                }
                if ( key === 'banlance'){
                    obj[key] = 
                    data.banlance.volt 
                    ?
                    [
                        { key:'1', title:'三相电压不平衡', max:data.banlance.volt.max, min:data.banlance.volt.min, avg:data.banlance.volt.avg, fail:data.banlance.volt.fail, pass_rate:data.banlance.volt.pass_rate, is_pass:data.banlance.volt.is_pass },
                        { key:'2', title:'三相电流不平衡', max:data.banlance.current.max, min:data.banlance.current.min, avg:data.banlance.current.avg, fail:data.banlance.current.fail, pass_rate:data.banlance.current.pass_rate, is_pass:data.banlance.current.is_pass }
                    ]
                    :
                    [
                        { key:'1', title:'三相电压不平衡', max:data.banlance.max, min:data.banlance.min, avg:data.banlance.avg, fail:data.banlance.fail, pass_rate:data.banlance.pass_rate, is_pass:data.banlance.is_pass },
                    ]
                    return ;
                }
                if ( key === 'volt' || key === 'ele'){
                    obj[key] = [];
                    let prefix = key === 'volt' ? '电压' : '电流';
                    Object.keys(data[key]).forEach((phase,subIndex)=>{
                        obj[key].push({
                            key:subIndex,
                            title:phase === 'a' ? `A相${prefix}谐波畸变率` : phase === 'b' ? `B相${prefix}谐波畸变率` : `C相${prefix}谐波畸变率`,
                            max:data[key][phase].max,
                            min:data[key][phase].min,
                            avg:data[key][phase].avg,
                            fail:data[key][phase].fail,
                            pass_rate:data[key][phase].pass_rate,
                            is_pass:data[key][phase].is_pass      
                        })
                    })
                }
            });
            return { ...state, eleIndex:obj, isLoading:false };
        },
        getEleBalance(state, { payload :{ data }}){
            return { ...state, eleBalance:data };  
        },
        getEleHarmonic(state, { payload:{ data }}){
            // console.log(data);
            data.ele = formatData(data.ele.values);
            data.volt = formatData(data.volt.values);
            return { ...state, eleHarmonic:data };
        },
        reset(){
            return initialState;
        }
    }
}

function formatData(data){
    let phaseA = [], phaseB = [], phaseC = [], category = [], offset = 1;
    if ( data && data.length ){
        for(var i=0;i<data.length;i++){
            let split = i % 3;
            if ( split === 0 ){
                phaseA.push(data[i]);
                // 构建类目轴数据
                if ( i > 3 ){
                    offset += 2
                }
                category.push( i === 0 ? '总谐波' : i === 3 ? '奇次谐波' : offset + '次' )
            } else if ( split === 1 ) {
                phaseB.push(data[i]);
            } else if ( split === 2 ){
                phaseC.push(data[i]);
            }
        }
    }
    return {
        phaseA,
        phaseB,
        phaseC,
        category
    }
}

