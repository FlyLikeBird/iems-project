import { getDevice, getAddForm, getEditForm, addDevice, editDevice, deleteDevice } from '../../services/deviceService';

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
    currentRadio:1
};

export default {
    namespace:'device',
    state:initialState,
    subscriptions:{
        setup({ dispatch, history}) {
            history.listen(({pathname})=>{
                if ( pathname === '/system_config/meter_manage' ) {
                    dispatch({type:'fetch'});
                }
            })
        }
    },
    effects:{
        *fetch(action, { call, put }){
            let { pageNum, pagesize } = action.payload || {};
            let company_id = localStorage.getItem('company_id');
            pageNum = pageNum || 1;
            pagesize = pagesize || 15;
            yield put({type:'toggleLoading'});
            let { data } = yield call(getDevice, { company_id, page:pageNum, pagesize });
            if ( data && data.code === '0'){
                data.pageNum = pageNum;
                yield put({type:'get', payload:{data}});
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
            let { device : { form, prevForm }} = yield select();
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
            // console.log(values);
            if ( forEdit ) {
                //  编辑状态
                values['mach_id'] = prevForm.mach_id;
                let { data } = yield call(editDevice, values);
                if ( data && data.code === '0'){
                    yield put({type:'fetch', payload:{}});
                }
            } else {
                let { data } = yield call(addDevice, values);
                if ( data && data.code === '0'){
                    yield put({type:'fetch', payload:{}});
                }
            }           
        },
        *delete(action, { call, put, select }){
            let { device : { selectedRowKeys }} = yield select();
            let { data } = yield call(deleteDevice, { mach_id: selectedRowKeys });
            if ( data && data.code === '0'){
                yield put({type:'fetch', payload:{}});
            }
        }
    },
    reducers:{
        toggleLoading(state){
            return { ...initialState, isLoading:true };
        },
        get(state,{ payload:{data}}){
            console.log(data);
            let { count, pageNum } = data;
            return { ...state, list:data.data, total:count, pageNum, isLoading:false };
        },
        getAddForm(state, { payload:{data}}){
            return { ...state, form:data };
        },
        select(state, { payload }){
            return { ...state, selectedRowKeys:payload };
        },
        toggleVisible(state, { payload}){
            let { visible, forEdit, prevForm } = payload;
            return { ...state, visible, forEdit, prevForm:prevForm || {} };
        },
        toggleRadio(state, { payload }){
            return { ...state, currentRadio : payload };
        }
    }
}