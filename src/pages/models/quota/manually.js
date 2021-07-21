import { getInfoList, getInfoType, fillInfo, importTpl, importInfo, exportInfo } from '../../services/manuallyInfoService';
import { getMeterList, getMeterType, fillMeter, importMeter, importMeterTpl, exportMeter } from '../../services/manuallyMeterService';
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
    year:date.getFullYear(),
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
            let { user:{ company_id, pagesize }, fields : { currentAttr }, manually : { current, pageNum, isMeterPage, year, time_type } } = yield select();
            let { page } = action.payload || {};
            yield put({type:'toggleLoading', payload:{ page }});
            let { data } = yield call( isMeterPage ? getMeterList : getInfoList, { company_id, attr_id:currentAttr.key, year, time_type, type_id:current, page:pageNum, pagesize });
            if ( data && data.code === '0' ){
                yield put({type:'get', payload:{ data:data.data, total:data.count }})
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
            let { values, currentKey, dataIndex, forDelete, resolve, reject } = action.payload;
            let { manually : { isMeterPage, current, time_type, year, is_calc_year }} = yield select();
            let finalValue;
            let obj = { type_id:current, attr_id: currentKey, time_type, year, is_calc_year:1 };
            if ( time_type === '1'){
                // 年定额
                finalValue = forDelete ? 0 : values['fill_value'];
                obj['month'] = 1;    
                obj['value'] = finalValue;
            } else {            
                // 月定额
                finalValue = forDelete ? 0 : values[dataIndex];
                obj['month'] = dataIndex && ( dataIndex.length === 7 ) ? dataIndex.slice(-1) : dataIndex && ( dataIndex.length === 8 ) ? dataIndex.slice(-2) : '';
                obj['value'] = finalValue;
            }
            let { data } = yield call( isMeterPage ? fillMeter : fillInfo, obj);
            if ( data && data.code === '0') {
                if ( resolve && typeof resolve === 'function') resolve();
                
            } else {
                if ( reject && typeof reject === 'function') reject();
            }
            
        },
        *export(action, { call, put, select}){
            let { user:{ company_id }, fields : { currentAttr}, manually: { isMeterPage, current, year }} = yield select();
            let url = yield call( isMeterPage ? exportMeter : exportInfo, { company_id, attr_id:currentAttr.key, year, type_id:current});
            window.location.href = url;
        },
        *import(action, { call, put, select}){
            let { file } = action.payload;
            let { user:{ company_id }, manually : { isMeterPage }} = yield select();
            let { data } = yield call( isMeterPage ? importMeter : importInfo, { company_id, file });
            if ( data && data.code === '0' ) {
                yield put({type:'fetch'});
                yield put({type:'toggleVisible', payload:false });
            }
        },
        *importTpl(action, { call, put, select}){
            let { user:{ company_id }, fields: { currentField }, manually :{ isMeterPage, current }} = yield select();
            let url = yield call( isMeterPage ? importMeterTpl : importTpl, { company_id, field_id:currentField.field_id, type_id:current });
            // console.log(url);
            window.location.href = url;
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
        toggleYear(state, { payload }){
            return { ...state, year:payload };
        },
        toggleVisible(state, { payload }){
            return { ...state, visible:payload };
        },
        reset(){
            return initialState;
        }
    }
}
