import { 
    deleteField, addField, editField, 
    addFieldAttr, deleteFieldAttr, editFieldAttr, 
    getAttrDevice, getAllDevice, addAttrDevice, deleteAttrDevice, 
    getCalcRule, addCalcRule, editCalcRule, deleteCalcRule,
    saveField, getSavedField, getSavedFieldAttrs, getSavedFieldMachs, restoreField, delSavedField
} from '../../services/fieldsService';

const initialState = {
    deviceList:[],
    allDevice:[],
    selectedField:{},
    selectedAttr:{},
    //  切换添加设备状态
    forAddStatus:false,
    selectedRowKeys:[],
    isLoading:false,
    // 添加维度模态弹窗visible
    addModal:false,
    //  维度分组的visible
    setModal:false,
    //  维度属性的visible
    attrModal:false,
    //  判断是否是根属性节点
    isRootAttr:false,
    // 添加子级属性
    forSub:false,
    //  编辑属性
    editAttr:false,
    calcRuleList:[]
};

export default {
    namespace:'fieldDevice',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *fetchAttrDevice(action, { call, put, select }){
            yield put({type:'toggleLoading'});
            let { fieldDevice:{ selectedField, selectedAttr }} = yield select();
            let { data } = yield call(getAttrDevice, { attr_id:selectedAttr.key});
            if ( data && data.code == 0 ){
                yield put({type:'getDevice', payload:{data:data.data}});
            } else if ( data && data.code === '1001') {
                yield put({ type:'user/loginOut'});
            }   
        },
        *fetchAll(action, { call, put, select }){
            yield put({type:'toggleStatus', payload:true});
            let { meter_name } = action.payload || {};
            let { fieldDevice:{ selectedAttr }} = yield select();
            let obj = {
                attr_id:selectedAttr.key
            };
            if ( meter_name ){
                obj['meter_name'] = meter_name;
            }
            let { data } = yield call(getAllDevice, obj);
            if ( data && data.code == 0 ){
                yield put({type:'getAll', payload: { data:data.data}});
            }
        },
        *add(action, { call, put, select }){
            let { values, resolve, reject } = action.payload || {};
            let { user:{ company_id }, fields:{ energyInfo }} = yield select();          
            let { data } = yield call(addField, { field_name:values.field_name, field_type:values.field_type, company_id, energy_type:energyInfo.type_id });
            if ( data && data.code ==0 ) {
                yield put({type:'fields/fetchField', payload:{ needsUpdate:true }});
                if ( resolve && typeof resolve === 'function' ) resolve();
            } else if ( data && data.code === '1001') {
                yield put({ type:'user/loginOut'});
            } else {
                if ( reject && typeof reject === 'function') reject(data.msg);
            }
        },
        *edit(action, { call, put, select }){
            let { field_name, field_id, field_type, resolve, reject } = action.payload || {};
            let { user :{ company_id }} = yield select();
            let { data } = yield call(editField, { field_id, company_id, field_name, field_type });
            if ( data && data.code == 0 ){
                yield put({type:'fields/fetchField', payload:{ needsUpdate:true }});
                if ( resolve && typeof resolve === 'function' ) resolve();
            } else if ( data && data.code === '1001' ){
                yield put({ type:'user/loginOut'});
            } else {
                if ( reject && typeof reject === 'function') reject(data.msg);
            }
        },
        *delete(action, { call, put, select }){
            let { field_id, resolve, reject } = action.payload;
            let { data } = yield call(deleteField,{ field_id });
            if (data && data.code ==0){
                yield put({type:'fields/fetchField', payload:{ needsUpdate:true }});
                if ( resolve && typeof resolve === 'function' ) resolve();
            } else if ( data && data.code === '1001'){
                yield put({ type:'user/loginOut'});
            } else {
                if ( reject && typeof reject === 'function') reject(data.msg);
            }
        },
        *addAttr(action, { call, put, select }){
            let { field_attr, resolve, reject } = action.payload || {};
            let { fieldDevice:{ selectedField, selectedAttr, forSub } } = yield select();
            let parent_id;
            if (forSub){
                //  添加下级
                parent_id = selectedAttr.key;
            } else {
                //  添加同级
                parent_id = selectedAttr.parent_id;
            }
            let { data } = yield call(addFieldAttr, { attr_name:field_attr, field_id:selectedField.field_id, parent_id});            
            if ( data && data.code == 0 ){               
                yield put({type:'fields/fetchFieldAttrs', needsUpdate:true, passField:selectedField });  
                if ( resolve && typeof resolve === 'function' ) resolve();
            } else if ( data && data.code === '1001') {
                yield put({ type:'user/loginOut'});
            } else {
                if ( reject && typeof reject === 'function') reject(data.msg);
            }
        },
        *editAttr(action, { call, put, select }){
            let { field_attr, resolve, reject } = action.payload || {};
            let { fieldDevice:{ selectedField, selectedAttr }} = yield select();
            let { data } = yield call(editFieldAttr, { attr_name:field_attr, attr_id:selectedAttr.key, field_id:selectedField.field_id})
            if ( data && data.code == 0){
                yield put({type:'fields/fetchFieldAttrs', needsUpdate:true, passField:selectedField });
                if ( resolve && typeof resolve === 'function' ) resolve();
            } else if ( data && data.code === '1001') {
                yield put({ type:'user/loginOut'});
            } else {
                if ( reject && typeof reject === 'function') reject(data.msg);
            }
        },
        *deleteAttr(action, { call, put, select }){
            let { fieldDevice:{ selectedAttr, selectedField }} = yield select();
            let { data } = yield call(deleteFieldAttr, { attr_id:selectedAttr.key });
            if ( data && data.code == 0 ){
                yield put({type:'fields/fetchFieldAttrs', needsUpdate:true, passField:selectedField });
            } else if ( data && data.code === '1001') {
                yield put({ type:'user/loginOut'});
            }
        },
        *addDevice(action, { call, put, select}){
            let { fieldDevice: { selectedAttr, selectedRowKeys }} = yield select();
            let { resolve, reject } = action.payload || {};
            let { data } = yield call(addAttrDevice, { attr_id:selectedAttr.key, attrmeters:selectedRowKeys});
            if ( data && data.code == 0 ){
                yield put({ type:'fetchAttrDevice' });
                if ( resolve && typeof resolve === 'function') resolve();
            } else if ( data && data.code === '1001'){
                yield put({ type:'user/loginOut'});
            } else {
                if ( reject && typeof reject === 'function') reject(data.msg);
            }
        },
        *deleteDevice(action, { call, put, select }){
            let { fieldDevice: { selectedAttr, selectedRowKeys }} = yield select();
            let { data } = yield call(deleteAttrDevice, { attr_id:selectedAttr.key, details:selectedRowKeys});
            let { resolve, reject } = action.payload || {};
            if ( data && data.code == 0 ){
                yield put({ type:'fetchAttrDevice' });
                if ( resolve && typeof resolve === 'function') resolve();
            } else if ( data && data.code ==='1001') {
                yield put({ type:'user/loginOut'});
            } else {
                if ( reject && typeof reject === 'function') reject(data.msg);
            }
        },
        *fetchCalcRule(action, { call, put, select }){
            let { fieldDevice:{ selectedAttr }} = yield select();
            let { data } = yield call(getCalcRule, { attr_id:selectedAttr.key });
            if ( data && data.code === '0'){
                yield put({ type:'getRuleList', payload:{ data:data.data }});
            }
        },
        *addCalc(action, { all, call, put, select }){
            let { resolve, reject, rules } = action.payload || {};
            if ( rules && rules.length ){
                let data = yield all(
                    rules.map((item)=>{
                        if ( item.id ) {
                            return call(editCalcRule, { id:item.id, calc_attr_id:item.calc_attr_id, calc_type:item.calc_type, calc_ratio:item.calc_ratio, begin_date: item.begin_date ? Object.prototype.toString.call(item.begin_date) === '[object String]' ? item.begin_date : item.begin_date.format('YYYY-MM-DD') : null, end_date: item.end_date ? Object.prototype.toString.call(item.end_date) === '[object String]' ? item.end_date : item.end_date.format('YYYY-MM-DD') : null })
                        } else {
                            return call(addCalcRule, { attr_id:item.attr_id, calc_attr_id:item.calc_attr_id, calc_type:item.calc_type, calc_ratio:item.calc_ratio, begin_date: item.begin_date ? Object.prototype.toString.call(item.begin_date) === '[object String]' ? item.begin_date : item.begin_date.format('YYYY-MM-DD') : null, end_date: item.end_date ? Object.prototype.toString.call(item.end_date) === '[object String]' ? item.end_date : item.end_date.format('YYYY-MM-DD') : null })
                        }
                    })
                );
                if ( data[0].data.code === '0' ) {
                    if ( resolve && typeof resolve === 'function') resolve();
                    yield put({ type:'fetchCalcRule' });
                } else {
                    if ( reject && typeof reject === 'function' ) reject(data[0].data.msg);
                }
            }
        },
        *deleteCalc(action, { put, call }){
            let { resolve, reject, id } = action.payload || {};
            let { data } = yield call(deleteCalcRule, { id });
            if ( data && data.code === '0' ){
                yield put({ type:'fetchCalcRule'});
                if ( resolve && typeof resolve === 'function') resolve();
            } else {
                if ( reject && typeof reject === 'function' ) reject(data.msg);
            }
        },
        // 备份维度树
        *saveFieldAsync(action, { put, call, select }){
            let { user:{ company_id }, fieldDevice:{ selectedField }} = yield select();
            let { resolve, reject, image_name } = action.payload || {};
            let { data } = yield call(saveField, { company_id, field_id:selectedField.field_id, image_name });
            if ( data && data.code === '0'){
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.msg);
            }
        },
        *fetchSavedField(action, { put, call, select }){
            let { user:{ company_id }} = yield select();
            let { resolve, reject, field_id } = action.payload || {};
            let { data } = yield call(getSavedField, { company_id, field_id });
            if ( data && data.code === '0'){ 
                if ( resolve ) resolve(data.data);
            } else {
                if ( reject ) reject(data.msg);
            }
        },
        *fetchSavedFieldAttrs(action, { put, call, select }){
            let { resolve, reject, image_id } = action.payload || {};
            let { data } = yield call(getSavedFieldAttrs, { image_id });
            if ( data && data.code === '0'){
                if ( resolve ) resolve(data.data);
            } else {
                if ( reject ) reject(data.msg);
            }
        },
        *fetchSavedFieldMachs(action, { put, call, select }){
            let { resolve, reject, image_id, attr_id, meter_name } = action.payload || {};
            let { data } = yield call(getSavedFieldMachs, { image_id, attr_id, meter_name });
            if ( data && data.code === '0'){
                if ( resolve ) resolve(data.data);
            } else {
                if ( reject ) reject(data.msg);
            }
        },
        *restoreFieldAsync(action, { put, call, select }){
            let { user:{ company_id }} = yield select();
            let { resolve, reject, image_id } = action.payload || {};
            let { data } = yield call(restoreField, { company_id, image_id });
            if ( data && data.code === '0'){
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.msg);
            }
        },
        *delSavedFieldAsync(action, { put, select, call }){
            let { user:{ company_id }} = yield select();
            let { resolve, reject, image_id } = action.payload || {};
            let { data } = yield call(delSavedField, { company_id, image_id });
            if ( data && data.code === '0'){
                if ( resolve ) resolve();
            } else {
                if ( reject ) reject(data.msg);
            }
        }
        
    },
    reducers:{
        toggleLoading(state){
            return { ...state, isLoading: true };
        },
        getDevice(state, { payload : {data} }){
            return { ...state, deviceList:data, isLoading:false };
        },
        getAll(state, { payload: { data }}){
            return { ...state, allDevice:data  };
        },
        toggleField(state, { payload:{ visible, field }}){
            return { ...state, setModal:visible, selectedField:field };
        },
        toggleAttr(state, { payload }){
            return { ...state, selectedAttr:payload, isRootAttr:Boolean(payload.parent_id) ? false : true };
        },
        toggleStatus(state, { payload}){
            return { ...state, forAddStatus:payload, selectedRowKeys:[] };
        },
        toggleAddModal(state, { payload }){
            return { ...state, addModal:payload };
        },
        toggleAttrModal(state, { payload }){
            let { visible, forSub, editAttr } = payload;
            return { ...state, attrModal:visible, forSub, editAttr };
        },
        select(state, { payload }){
            return { ...state, selectedRowKeys:payload };
        },
        getRuleList(state, { payload:{ data }}){
            return { ...state, calcRuleList:data };
        },
        reset(state){
            return initialState;
        }
        
    }
}
