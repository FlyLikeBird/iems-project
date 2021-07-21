import { getIncomingLine, addIncomingLine, editIncomingLine, deleteIncomingLine, addMainLine, editMainLine, getMainLine, deleteMainLine, getMachs } from '../../services/incomingLineService';

const initialState = {
    incomingList:[],
    mainLineList:[],
    machList:[]
};

export default {
    namespace:'incoming',
    state:initialState,
    effects:{
        // 进线
        *fetchIncoming(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { data } = yield call(getIncomingLine, { company_id });
                if ( data && data.code === '0' ) {
                    yield put({type:'getIncoming', payload:{ data:data.data }});
                } 
            } catch(err){
                console.log(err);
            }
        },
        *addIncoming(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { name, value, resolve, reject } = action.payload || {};
                let { data } = yield call(addIncomingLine, { company_id, name, total_kva:value });
                if ( data && data.code === '0'){
                    yield put({type:'fetchIncoming' });
                    if ( resolve && typeof resolve === 'function') resolve();
                } else {
                    if ( reject && typeof reject === 'function') reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }   
        },
        *editIncoming(action, { call, put}){
            try {
                let { in_id, name, total_kva, resolve, reject } = action.payload || {};
                let { data } = yield call(editIncomingLine, { in_id, name, total_kva });
                if ( data && data.code === '0'){
                    yield put({type:'fetchIncoming'});
                    if ( resolve && typeof resolve === 'function') resolve();
                } else {
                    if ( reject && typeof reject === 'function') reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }
        },
        *deleteIncoming(action, { call, put}){
            try {
                let { data } = yield call(deleteIncomingLine, { in_id:action.payload.in_id });
                if ( data && data.code === '0'){
                    yield put({type:'fetchIncoming'});
                }
            } catch(err){
                console.log(err);
            }
        },
        // 干线
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
        *fetchMach(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { data } = yield call(getMachs, { company_id });
                if ( data && data.code ==='0'){
                    yield put({type:'getMach', payload:{ data:data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *addMain(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { in_mach, out_mach, main_name } = action.payload;
                let { data } = yield call(addMainLine, { company_id, in_mach, out_mach, main_name });
                if ( data && data.code === '0'){
                    yield put({type:'fetchMainLine'});
                }
            } catch(err){
                console.log(err);
            }
        },
        *editMain(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { in_mach, out_mach, main_name, main_id } = action.payload;
                let { data } = yield call(editMainLine, { company_id, in_mach, out_mach, main_id, main_name });
                if ( data && data.code === '0'){
                    yield put({type:'fetchMainLine'});
                }
            } catch(err){
                console.log(err);
            }
        },
        *deleteMain(action, { call, put}){
            try {
                let { data } = yield call(deleteMainLine, { main_id:action.payload });
                if ( data && data.code === '0'){
                    yield put({type:'fetchMainLine'});
                }
            } catch(err){
                console.log(err);
            }
        }
    },
    reducers:{
        getIncoming(state, { payload : { data }}){
            let incomingList = data.map(item=>{
                item.total_kva = Math.floor(item.total_kva);
                return item;
            });
            return { ...state, incomingList }
        },
        getMain(state, { payload:{ data }}){
            return { ...state, mainLineList:data }
        },
        getMach(state, { payload:{ data }}){
            return { ...state, machList:data };
        },
        toggleVisible(state, { payload}){
            let { visible, forEdit, prevItem } = payload;
            return { ...state, visible, forEdit, prevItem : prevItem ? prevItem : {} };
        },
        toggleActive(state){
            return { ...state, is_actived:!state.is_actived};
        }
    }
}
