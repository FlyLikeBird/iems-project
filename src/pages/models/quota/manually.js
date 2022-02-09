import { getInfoList, getInfoType, fillInfo, patchFillInfo, importTpl, importInfo, exportInfo } from '../../services/manuallyInfoService';
import { getMeterList, getMeterType, fillMeter, importMeter, importMeterTpl, exportMeter } from '../../services/manuallyMeterService';
import moment from 'moment';
let date = new Date();

const initialState = {
    //  手工填报--经营信息列表
    list:[],
    meterType:[],
    total:0,
    pageNum:1,
    // 默认填报类型为电
    current:'',
    // 填报类型列表 
    fillType:[],
    // 默认年份为今年
    fillDate:moment(date),
    // 默认定额周期为年
    time_type:'1',
    is_calc_year:'1',
    isLoading:true,
    visible:false,
    // 判断是企业经营信息 还是 人工抄表 页面
    isMeterPage:false,
};

export default {
    namespace:'manually',
    state:initialState,
    effects:{
        *fetchInit(action, { call, put, select }){      
            let type_id = action.payload ? action.payload : '1';
            yield put.resolve({ type:'fields/init' });
            yield put({ type:'toggleFillType', payload:type_id });
            yield put({ type:'fetchInfo'});
        },
        *fetchInfo(action, { call, put, select, all }){
            let { user:{ company_id, pagesize }, fields : { currentAttr }, manually : { current, pageNum, isMeterPage, fillDate, time_type } } = yield select();
            let { page } = action.payload || {};
            let temp = fillDate.format('YYYY-MM').split('-');
            pageNum = page || 1;
            yield put({type:'toggleLoading', payload:{ page }});
            let { data } = yield call( isMeterPage ? getMeterList : getInfoList, { company_id, attr_id:currentAttr.key, year:temp[0], month:temp[1], time_type, type_id:current, page:pageNum, pagesize });
            if ( data && data.code === '0' ){
                yield put({type:'get', payload:{ data:data.data, total:data.count }})
            } else if ( data && data.code === '1001') {
                yield put({ type:'user/loginOut'});
            }
        },
        *fetchFillType(action, { call, put}){
            let { data } = yield call(getInfoType);
            if ( data && data.code === '0'){
                yield put({type:'getFillType', payload:{data:data.data}});
            }
            return data.data;
        },
        *fetchMeterType(action, { call, put}){
            let { data } = yield call(getMeterType);
            if ( data && data.code === '0'){
                yield put({type:'getMeterType', payload:{data:data.data}});
            }
            return data.data;
        },
        *save(action, { call, put, select}){
            // 当编辑时把表单项传过来  删除时把一行记录传过来
            let { value, currentKey, attr_ids, type_id, dataIndex, time_type, fillDate, forDelete, forPatch, resolve, reject } = action.payload;
            let { manually : { isMeterPage, is_calc_year }} = yield select();
            let dateArr = fillDate.format('YYYY-MM-DD').split('-'); 
            let obj = { type_id, attr_id: currentKey, time_type, year:dateArr[0], is_calc_year:1 };
            if ( time_type === '1'){
                // 年定额
                obj['month'] = 1;    
            } else if ( time_type === '2'){            
                // 月定额
                // dataIndex格式为'month_XXX'
                obj['month'] = dataIndex && ( dataIndex.length === 7 ) ? dataIndex.slice(-1) : dataIndex && ( dataIndex.length === 8 ) ? dataIndex.slice(-2) : '';
            } else if ( time_type === '3'){
                obj['month'] = dateArr[1];
                obj['day'] = dataIndex && ( dataIndex.length === 5 ) ? dataIndex.slice(-1) : dataIndex && ( dataIndex.length === 6   ) ? dataIndex.slice(-2) : '';
            }
            obj['value'] = forDelete ? 0 : value;
            if ( forPatch ){
                obj['attr_ids'] = attr_ids;
            }
            let { data } = yield call( isMeterPage ? fillMeter : forPatch ? patchFillInfo : fillInfo, obj);
            if ( data && data.code === '0') {
                if ( resolve && typeof resolve === 'function') resolve();
            } else if ( data && data.code === '1001' ) {
                yield put({ type:'user/loginOut'});
            } else {
                if ( reject && typeof reject === 'function') reject();
            }
        },
        *export(action, { call, put, select}){
            let { user:{ company_id }, fields : { currentAttr}, manually: { isMeterPage, current, fillDate }} = yield select();
            if ( localStorage.getItem('user_id')) {
                let dateArr = fillDate.format('YYYY-MM-DD').split('-');
                let url = yield call( isMeterPage ? exportMeter : exportInfo, { company_id, attr_id:currentAttr.key, year:dateArr[0], type_id:current});
                window.location.href = url;
            } else {
                yield put({ type:'user/loginOut'});
            }
        },
        *import(action, { call, put, select}){
            let { file } = action.payload;
            let { user:{ company_id }, manually : { isMeterPage }} = yield select();
            let { data } = yield call( isMeterPage ? importMeter : importInfo, { company_id, file });
            if ( data && data.code === '0' ) {
                yield put({type:'fetchInfo'});
                yield put({type:'toggleVisible', payload:false });
            } else if ( data && data.code === '1001') {
                yield put({ type:'user/loginOut'});
            }
        },
        *importTpl(action, { call, put, select}){
            let { user:{ company_id }, fields: { currentField }, manually :{ isMeterPage, current }} = yield select();
            if ( localStorage.getItem('user_id')){
                let url = yield call( isMeterPage ? importMeterTpl : importTpl, { company_id, field_id:currentField.field_id, type_id:current });
                window.location.href = url;
            } else {
                yield put({ type:'user/loginOut'});
            }
        }
    },
    reducers:{
        toggleLoading(state, { payload: { page } }){
            return { ...state, isLoading:true, pageNum : page || state.pageNum };
        },
        togglePageType(state, { payload : { isMeterPage } }){
            return { ...state, isMeterPage };
        },
        getFillType(state, { payload : { data }}){
            return { ...state, fillType:data };
        },
        getMeterType(state, { payload: { data}}){
            return { ...state, meterType:data };
        },
        get(state,{ payload:{ data, total }}){
            return { ...state, list:data.data, total, isLoading:false };
        },
        toggleFillType(state, { payload}){
            return { ...state, current : payload } ;
        },
        toggleTimeType(state, { payload }){
            return { ...state, time_type:payload };
        },
        toggleFillDate(state, { payload }){
            console.log('a');
            return { ...state, fillDate:payload };
        },
        toggleVisible(state, { payload }){
            return { ...state, visible:payload };
        },
        reset(){
            return initialState;
        }
    }
}
