import { getLoginLog, getActionLog } from '../../services/systemLogService';

const initialState = {
    logData:{},
    logType:'',
    isLoading:false,  
};

export default {
    namespace:'log',
    state:initialState,
    effects:{
        *fetchLog(action, {call, select, all, put}){ 
            try {
                let { user:{ company_id, pagesize }} = yield select();
                let agent_id = localStorage.getItem('agent_id');
                let { page, logType } = action.payload || {};
                logType = logType || 'login'
                yield put({type:'toggleLoading'});
                let { data } = yield call(
                    logType === 'login' ? getLoginLog : getActionLog,
                    { company_id, agent_id, page, pagesize } 
                );
                if ( data && data.code === '0'){
                    let logData = {
                        count:data.count,
                        logs:data.data.logs,
                    };
                    yield put({type:'getLoginLog', payload:{ data: logData }});
                } else if ( data && data.code === '1001') {
                    yield put({ type:'user/loginOut'});
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
        getLoginLog(state, { payload:{ data }}){
            return { ...state, logData:data, isLoading:false };
        },
        reset(){
            return initialState;
        }
    }
}
