import { getEnergyType, getFields, deleteField, editField, getFieldType, addField, getFieldAttrs, addFieldAttr, deleteFieldAttr, editFieldAttr, getAttrDevice, getAllDevice, addAttrDevice, deleteAttrDevice } from '../../services/fieldsService';
const initialState = {
    // 能源类型
    // energyList:[
    //     { type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'},
    //     { type_name:'水', type_code:'water', type_id:'2', unit:'m³'},
    //     { type_name:'气', type_code:'gas', type_id:'3', unit:'m³' },
    //     { type_name:'燃气', type_code:'combust', type_id:'7', unit:'m³'},
    //     { type_name:'压缩空气', type_code:'compressed', type_id:'8', unit:'m³'},
    //     { type_name:'热', type_code:'hot', type_id:'4', unit:'GJ' },
    // ],
    energyList:[],
    energyInfo: { type_name:'电', type_code:'ele', type_id:'1', unit:'kwh' },
    energyMaps:{},
    // {
    //     'ele':{
    //         fieldList:[],
    //         fieldAttrs:{ '支路':[], '区域':[] }
    //     },
    //     'water':{
    //         fieldList:[],
    //         fieldAttrs:{}
    //     }
    // }
    fieldType:[],
    allFields:{},
    //  当前维度
    currentField:{},
    //  当前维度属性
    currentAttr:{},
    expandedKeys:[],
    isLoading:false,
    loaded:false,
    //  属性树加载状态
    treeLoading:false
    //  可选的维度类型
    
    
};

export default {
    namespace:'fields',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *cancelAll(action, { put }){
            yield put({ type:'cancelField'});
            yield put({ type:'cancelFieldAttrs'} );
            yield put({ type:'reset'});
        },
        *init(action, { call, put, select }){
            let { needsUpdate, resolve, reject } = action.payload || {};
            yield put.resolve({ type:'fetchEnergy'});
            yield put.resolve({ type:'fetchField', payload:{ needsUpdate }});
            yield put.resolve({ type:'fetchFieldAttrs', payload:{ needsUpdate }});
            if ( resolve && typeof resolve === 'function' ) {
                // 切换能源类型时，将更新后的当前节点状态传递给promise;
                let { fields:{ currentAttr }} = yield select();
                if ( resolve && typeof resolve === 'function' ) resolve(currentAttr);
            }
        },
        *fetchEnergy(action, { call, put, select }){
            try {
                let { fields:{ energyList }} = yield select();
                if ( !energyList.length ) {
                    let { data } = yield call(getEnergyType);
                    if ( data && data.code === '0'){
                        yield put({type:'getEnergyTypeResult', payload:{ data:data.data }});
                    }
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchFieldType(action, { call, put}){
            let { data } = yield call(getFieldType);
            if ( data&& data.code ==0){
                yield put({type:'getFieldType', payload:{data:data.data}});
            }
        },
        *fetchField(action, { call, put, select}){     
            try {
                let { user:{ company_id }, fields:{ energyInfo, allFields }} = yield select();
                let { resolve, reject, needsUpdate } = action.payload || {};
                //  初始化维度列表
                // needsUpdate字段是维度源数据变化时强制更新, 否则从缓存中读取维度属性和属性树状态不变
                if ( !allFields[energyInfo.type_code] || needsUpdate ) {            
                    yield put({type:'toggleLoading'}); 
                    let { data } = yield call(getFields, { company_id, energy_type:energyInfo.type_id });
                    if ( data && data.code == 0 ){
                        yield put({type:'getFields', payload:{ data:data.data, energyInfo }}); 
                        //  默认以第一个维度为当前维度
                        if ( resolve && typeof resolve === 'function') resolve();
                    } 
                } else {
                    yield put({ type:'updateField'});
                    if ( resolve && typeof resolve === 'function') resolve();
                }
            } catch(err){
                console.log(err);
            }         
        },      
        *fetchFieldAttrs(action, { call, put, select}){    
            try {
                // resolve 用于定额管理 确保先获取fieldAttrs的异步控制
                let { needsUpdate, resolve, reject, passField } = action;
                let { fields: { currentField, allFields, energyInfo } } = yield select();
                // 如果维度列表为空
                let finalField = passField || currentField;
                if ( !finalField.field_id ) {
                    if ( resolve && typeof resolve === 'function' ) resolve();
                    return ;
                }
                if ( needsUpdate || !(allFields[energyInfo.type_code] && allFields[energyInfo.type_code]['fieldAttrs'] && allFields[energyInfo.type_code]['fieldAttrs'][finalField.field_name] )) {
                    // console.log('b'); 
                    if ( !needsUpdate ) {
                        yield put({type:'toggleTreeLoading'});
                    }
                    let { data } = yield call(getFieldAttrs, { field_id : finalField.field_id });           
                    if ( data && data.code == 0 ){
                        //  以维度属性树的第一个节点为当前属性节点 
                        yield put({type:'getFieldAttrs', payload:{ data:data.data, energyInfo, finalField }});         
                        // 如果是维度管理传递来的field，要同时更新fieldDevice里的selectedAttr;
                        if ( passField ) {
                            let { list } = data.data;
                            yield put({ type:'fieldDevice/toggleAttr', payload:list && list.length ? list[0] : {}});
                        }
                        if ( resolve ) resolve(data.data.list);
                    } else {
                        if ( reject ) reject(data.msg);
                    }
                } else {
                    // console.log('c');
                    // 如果某个维度属性树已经存在，则当前节点更新为树的根节点
                    let fieldAttrs = allFields[energyInfo.type_code]['fieldAttrs'][finalField.field_name];
                    let attr = fieldAttrs && fieldAttrs.length ? fieldAttrs[0] : {}; 
                    let result = [], deep = 0;
                   
                    yield put({ type:'toggleAttr', payload:attr });
                    getExpendKeys( fieldAttrs && fieldAttrs.length ? fieldAttrs : [], result, deep);
                    yield put({ type:'setExpandedKeys', payload:result });
                    if ( passField ) {
                        yield put({ type:'fieldDevice/toggleAttr', payload:attr });
                    }
                    if ( resolve && typeof resolve === 'function') resolve(fieldAttrs);
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
        toggleTreeLoading(state){
            return { ...state, treeLoading:true };
        },
        getEnergyTypeResult(state, { payload:{ data }}){
            let arr = data.map(i=>{
                i.type_id = i.type_id + '';
                return i;
            });
            let obj = data.reduce((sum, cur)=>{
                sum[cur.type_code] = cur;
                return sum;
            },{});
            if ( obj.combust ) {
                obj['gas'] = obj.combust;
            }
            obj['total'] = { type_id:0, type_name:'总', type_code:'total', unit:'tce' }
            return { ...state, energyList:arr, energyMaps:obj  };
        },
        getFields(state, { payload:{ data, energyInfo }} ){
            let { fields } = data;
            let allFields = state.allFields;
            allFields[energyInfo.type_code] = {
                fieldList:fields
            }  
            return { ...state, currentField:fields && fields.length ? fields[0] : {}, allFields, currentAttr:fields.length ? state.currentAttr : {}, isLoading:false, loaded:true };
        },
        updateField(state){
            let temp = state.allFields[state.energyInfo.type_code];
            let currentField = temp.fieldList && temp.fieldList.length ? temp.fieldList[0] : {};
            let currentAttr = temp.fieldAttrs && temp.fieldAttrs[currentField.field_name] ? temp.fieldAttrs[currentField.field_name][0] : {};
            // 当维度为空时，维度相关的属性树也为空
            let result = [], deep = 0;  
            getExpendKeys( temp.fieldAttrs && temp.fieldAttrs[currentField.field_name] ? temp.fieldAttrs[currentField.field_name] : [], result, deep); 
            return { ...state, currentField, currentAttr:Object.keys(currentField).length ? currentAttr : {}, expandedKeys:result };
        },
        getFieldType(state, { payload:{data} }){
            let { types } = data;
            types.push({ field_type:'0', code_name:'其他' });
            return { ...state, fieldType:types };
        },
        getFieldAttrs(state, { payload:{ data, energyInfo, finalField }}){
            let { list } = data;
            let temp = state.allFields;
            temp[energyInfo.type_code] = { 
                fieldList:[...temp[energyInfo.type_code].fieldList], 
                fieldAttrs:temp[energyInfo.type_code].fieldAttrs ? { ...temp[energyInfo.type_code].fieldAttrs, [finalField.field_name]:list } : {[finalField.field_name]:list }
            };
            let result = [], deep = 0;
            getExpendKeys(list, result, deep);
            return { ...state, currentAttr:list && list.length ? list[0] : {}, allFields:temp, expandedKeys:result, attrModal:false, treeLoading:false };
        },
        toggleField(state, { payload }){
            let { visible, field } = payload;
            return { ...state, currentField:field };
        },
        toggleAttr(state, { payload }){
            let { parent_id } = payload;
            return { ...state, currentAttr:payload, isRootAttr:Boolean(parent_id) ? false : true };
        },
        toggleEnergyInfo(state, { payload }){
            return { ...state, energyInfo:payload };
        },
        setFromWindow(state, { payload:{ allFields, energyInfo, currentField, currentAttr }}){
            return { ...state, allFields, energyInfo, currentField, currentAttr };
        },
        setExpandedKeys(state, { payload }){
            return { ...state, expandedKeys:payload };
        },
        reset(state){
            return { ...initialState, allFields:{}, currentField:{}, currentAttr:{}, expandedKeys:[] };
        }
    }
}

function getExpendKeys(data, result, deep){
    ++deep;
    if ( deep === 2 ){
        return ;
    }
    data.forEach(item=>{
        if ( item.children && item.children.length ){
            result.push(item.key);
            getExpendKeys(item.children, result, deep);
        }
    })
}
