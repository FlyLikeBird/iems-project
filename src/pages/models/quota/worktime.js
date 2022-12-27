import { getWorktimeList, addWorktime, updateWorktime, delWorktime } from '../../services/worktimeService';

const initialState = {
    list:[],
    currentWorktime:{ id:0 },
    isLoading:true,
};

export default {
    namespace:'worktime',
    state:initialState,
    effects:{
        *fetchWorktimeList(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                yield put({ type:'toggleLoading'});
                let { data } = yield call(getWorktimeList, { company_id });
                if ( data && data.code === '0' ) {
                    yield put({type:'getWorktimeResult', payload:{ data:data.data }});
                } 
            } catch(err){
                console.log(err);
            }
        },
        *addWorktimeAsync(action, { select, call, put}){
            try {
                let { user:{ company_id }} = yield select();
                let { values, forEdit, resolve, reject } = action.payload || {};
                values.company_id = company_id;
                let { data } = yield call( forEdit ? updateWorktime : addWorktime, values);
                if ( data && data.code === '0'){
                    yield put({type:'fetchWorktimeList' });
                    if ( resolve && typeof resolve === 'function') resolve();
                } else {
                    if ( reject && typeof reject === 'function' ) reject(data.msg);
                }
            } catch(err){
                console.log(err);
            }   
        },
        *delWorktimeAsync(action, { call, put}){
            try {
                let { id, resolve, reject } = action.payload;
                let { data } = yield call(delWorktime, { id });
                if ( data && data.code === '0'){
                    yield put({ type:'fetchWorktimeList'});
                    if ( resolve ) resolve();
                } else {
                    if ( reject ) reject(data.msg);
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
        getWorktimeResult(state, { payload:{ data }}){
            return { ...state, list:data, currentWorktime:{ id:0 }, isLoading:false };
        },
        setCurrentWorktime(state, { payload }){
            return { ...state, currentWorktime:payload };
        }
    }
}
