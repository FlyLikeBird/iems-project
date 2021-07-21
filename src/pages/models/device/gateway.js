import { getGateway, getAddForm, getEditForm, addGateway, editGateway, deleteGateway } from '../../services/gatewayService';

const initialState = {
    list:[],
    selectedRowKeys:[],
    pageNum:1,
    total:0,
    visible:false,
    isLoading:false,
    form:{},
    prevForm:{},
    forEdit:false,
};

export default {
    namespace:'gateway',
    state:initialState,
    subscriptions:{
        setup({ dispatch, history}) {
            history.listen(({pathname})=>{
                if ( pathname === '/system_config/gateway_manage' ) {
                    dispatch({type:'fetch', payload:{}});
                }
            })
        }
    },
    effects:{
        *fetch(action, { call, put }){
            let { payload } = action;
            let { company_id, pageNum, pagesize } = payload;
            if ( company_id ){
                //  切换公司id，并更新缓存中的公司id
                yield put({type:'user/changeCompany', payload:company_id});
                company_id = localStorage.getItem('company_id');
            } else {
                //  默认公司id
                company_id = localStorage.getItem('company_id');
            }
            pageNum = pageNum || 1;
            pagesize = pagesize || 10;
            yield put({type:'toggleLoading'});
            let { data } = yield call(getGateway, { company_id, page:pageNum, pagesize });
            if ( data && data.code === '0'){
                data.pageNum = pageNum;
                yield put({type:'get', payload:{ data:data.data, total:data.count }});
            } 
        },
        *fetchAddForm(action, { call, put}){
            let company_id = localStorage.getItem('company_id');
            yield put({type:'toggleVisible', payload:{ visible:true, forEdit:false }});
            let { data } = yield call(getAddForm, { company_id });
            if ( data && data.code === '0'){
                yield put({type:'getAddForm', payload:{ data : data.data }});
            }
        },
        *fetchEditForm(action, { call, put}){
            let { payload } = action;
            yield put({type:'toggleVisible', payload:{ visible:true, forEdit:true, prevForm:payload }});
            let { data } = yield call(getEditForm, { mach_id:payload.mach_id });
            if ( data && data.code === '0'){
                yield put({type:'getAddForm', payload:{ data : data.data }});
            }
        },
        *add(action, { call, put, select }){
            let { values, forEdit } = action.payload;
            let { gateway : { form, prevForm }} = yield select();
            let company_id = localStorage.getItem('company_id');
            values.is_able = values.is_able === true ? '1' : '0';
            values.company_id = company_id;
            let fieldattr ={};
            Object.keys(form.fieldArr).map(key=>{
                if (values[key]) {
                    fieldattr[key] = values[key];
                }
            });
            values.fieldattr = fieldattr;
            if ( forEdit ) {
                //  编辑状态
                values['mach_id'] = prevForm.mach_id;                
                let { data } = yield call(editGateway, values);
                if ( data && data.code === '0'){
                    yield put({type:'fetch', payload:{}});
                }
            } else {
                let { data } = yield call(addGateway, values);
                if ( data && data.code === '0'){
                    yield put({type:'fetch', payload:{}});
                }
            }           
        },
        *delete(action, { call, put, select }){
            let { gateway : { selectedRowKeys }} = yield select();
            let { data } = yield call(deleteGateway, { mach_id: selectedRowKeys });
            if ( data && data.code === '0'){
                yield put({type:'fetch', payload:{}});
            }
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...initialState, isLoading:true };
        },
        get(state,{ payload:{ data, count }}){
            return { ...state, list:data.gateways, total:count,  isLoading:false };
        },
        getAddForm(state, { payload:{data}}){
            console.log(data);
            return { ...state, form:data };
        },
        select(state, { payload }){
            return { ...state, selectedRowKeys:payload };
        },
        toggleVisible(state, { payload}){
            let { visible, forEdit, prevForm } = payload;
            return { ...state, visible, forEdit, prevForm:prevForm || {} };
        }
    }
}