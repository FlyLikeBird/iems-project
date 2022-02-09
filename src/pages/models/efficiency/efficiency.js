import { getEnergyFlow, getRank, getOutputCompare, getEnergyCostInfo, getOutputRatio, getAttrOutput, getRegionOutput } from '../../services/efficiencyService';
import { getEnergyType } from '../../services/energyService';
import { getFields, getFieldAttrs } from '../../services/fieldsService';

import moment from 'moment';
import { message } from 'antd';

const date = new Date();
const initialState = {
    
    // 能流图数据
    chartInfo:{},
    // 能流图层级关系
    parentNodes:[{ attr_name:'能流图入口', attr_id:'' }],
    // 能流图维度切换
    rankInfo:{},
    ratioInfo:[],
    outputInfo:[],
    costChart:{},
    allCostChart:{},
    attrData:[{ key:'month'}, { key:'day'}, { key:'hour' }],
    regionData:[],
    regionLoading:true,
    loaded:false,
    maskVisible:false,
    chartLoading:true,
    timeType:'day',
    currentDate:moment(date),
    isLoading:true
};

export default {
    namespace:'efficiency',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *cancelAll(action, { put }){
            yield put({ type:'cancelFlowChart'});
            yield put({ type:'cancelCost'});
            yield put({ type:'cancelOutput'});
            yield put({ type:'cancelRatio'});
            yield put({ type:'reset'});
        },
        *cancelInit(action, { put }){
            yield put({ type:'cancelFlowChart'});
            yield put({ type:'cancelCost'});
            yield put({ type:'reset'});
        },
        *fetchInit(action, { call, select, put, all}){
            try{
                let { resolve, reject, forReport } = action.payload || {};
                yield all([
                    put.resolve({type:'fetchEnergy'}),
                    put.resolve({type:'fetchFlowInit', payload:forReport }),
                    put.resolve({type:'fetchRatio'}),
                    put.resolve({type:'fetchCost'}),
                    put.resolve({type:'fetchOutput'}),
                ]);
                if ( resolve && typeof resolve === 'function') resolve();
            } catch(err){
                console.log(err);
            }
        },
        *fetchFlowInit(action, { select, call, put, all }){
            try{
                let { user:{ company_id }, fields:{ currentAttr }} = yield select();
                if ( !action.payload ) {
                    yield put.resolve({ type:'fields/init'});
                }
                let [rankData, fieldData] = yield all([
                    call(getRank, { company_id }),
                    put.resolve({ type:'fetchFlowChart'})
                ]);
                if ( rankData.data.code === '0'){
                    yield put({ type:'getRankInfo', payload:{ rankInfo:rankData.data.data }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchFlowChart(action, { select, call, put, all }){
            yield put.resolve({ type:'cancelFlowChart'});
            yield put.resolve({ type:'cancelable', task:fetchFlowChartCancelable, action:'cancelFlowChart' });
            function* fetchFlowChartCancelable(){
                try {
                    let { user:{ company_id, startDate, endDate }, fields:{ currentAttr, energyInfo }, efficiency:{ chartInfo } } = yield select();
                    // yield put({ type:'toggleChartLoading', payload:true });
                    let { clickNode } = action.payload || {};
                    let finalAttr = clickNode || currentAttr;
                    // console.log(clickNode);
                    let { data } = yield call(getEnergyFlow, { company_id, attr_id:finalAttr.key, type_id:energyInfo.type_id, begin_date:startDate.format('YYYY-MM-DD'), end_date:endDate.format('YYYY-MM-DD') });
                    if ( data && data.code === '0'){
                        if ( data.data.children && data.data.children.length && data.data.cost ) {
                            yield put({ type:'getChart', payload:{ data:data.data, parentChart:chartInfo, clickNode }});
                        } else {
                            if ( clickNode ){
                                message.info('没有下一级节点');
                            } else {
                                yield put({ type:'getChart', payload:{ data:{ empty:true } }});
                            }
                        }
                    } else if ( data && data.code === '1001') {
                        yield put({ type:'user/loginOut'});
                    } else {
                        yield put({ type:'getChart', payload:{ data:{ empty:true } }});
                    }
                } catch(err){
                    console.log(err);
                }
            }
        },
        *fetchCost(action, { select, call, put}){
            yield put.resolve({ type:'cancelCost'});
            yield put.resolve({ type:'cancelable', task:fetchCostCancelable, action:'cancelCost' });
            function* fetchCostCancelable(){
                try {
                    let { user:{ company_id }} = yield select();
                    let { data } = yield call(getEnergyCostInfo, { company_id });
                    if ( data && data.code === '0'){
                        yield put({type:'getCost', payload:{ data: data.data }});
                    }
                } catch(err){
                    console.log(err);
                }
            }
        },
        *fetchEnergy(action, { call, put, all}){
            let { data } = yield call(getEnergyType);
            if ( data && data.code === '0'){
                yield put({type:'getType', payload:{ data:data.data }});
            }
        },
        *fetchOutput(action, { select, call, put}){
            yield put.resolve({ type:'cancelable', task:fetchOutputCancelable, action:'cancelOutput'});
            function* fetchOutputCancelable(){
                try {
                    let { user:{ company_id }} = yield select();
                    let { data } = yield call(getOutputCompare, { company_id });
                    if ( data && data.code === '0'){
                        yield put({type:'getOutput', payload:{ data:data.data }});
                    }
                } catch(err){
                    console.log(err);
                }
            }  
        },
        *fetchRatio(action, { call, put, select}){
            yield put.resolve({ type:'cancelable', task:fetchRatioCancelable, action:'cancelRatio'});
            function* fetchRatioCancelable(){
                let { user:{ company_id }, fields:{ energyInfo }} = yield select();
                let { resolve, reject } = action.payload ? action.payload : {};
                let { data } = yield call(getOutputRatio, { company_id, energy_type : energyInfo.type_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getRatio', payload:{ data:data.data }})
                    if ( resolve && typeof resolve === 'function') resolve();
                }
            } 
        }, 
        *cancelEffTrend(action, { put }){
            yield put({ type:'cancelAttrRatio'});
            yield put({ type:'cancelRegionRatio'});
            yield put({ type:'reset'});
        },
        *fetchEffTrend(action, { call, put, select, all}){
            try {
                let { resolve, reject } = action.payload || {};
                yield all([
                    put.resolve({type:'fetchAttrRatio'}),
                    put.resolve({type:'fetchRegionRatio'}),
                ]);
                if ( resolve && typeof resolve === 'function') resolve();
                
            } catch(err){
                console.log(err);
            }
        },
        *fetchAttrRatio(action, { call, put, select, all }){
            yield put.resolve({ type:'cancelAttrRatio'});
            yield put.resolve({ type:'cancelable', task:fetchAttrRatioCancelable, action:'cancelAttrRatio' });
            function* fetchAttrRatioCancelable(){
                try {
                    let { user:{ company_id }, fields:{ energyInfo }, efficiency : { currentDate }} = yield select();
                    let { resolve, reject } = action.payload ? action.payload : {};
                    let temp = currentDate.format('YYYY-MM-DD').split('-');
                    yield put({ type:'toggleLoading'});
                    let [attrMonthData, attrDayData, attrHourData] = yield all([
                        call(getAttrOutput, { company_id, type_id:energyInfo.type_id, time_type:2, year:temp[0], month:temp[1], day:temp[2] }),
                        call(getAttrOutput, { company_id, type_id:energyInfo.type_id, time_type:3, year:temp[0], month:temp[1], day:temp[2] }),
                        call(getAttrOutput, { company_id, type_id:energyInfo.type_id, time_type:4, year:temp[0], month:temp[1], day:temp[2] }),
                    ]);
                    if ( attrMonthData && attrMonthData.data.code === '0' && attrDayData && attrDayData.data.code === '0' && attrHourData && attrHourData.data.code === '0'){
                        let obj = { attrMonthData:attrMonthData.data.data, attrDayData:attrDayData.data.data, attrHourData:attrHourData.data.data };
                        yield put({type:'getAttrRatio', payload:obj});
                        if ( resolve && typeof resolve === 'function') resolve();
                    } else if ( attrMonthData.data.code === '1001' ) {
                        yield put({ type:'user/loginOut'});
                    }
                } catch(err){
                    console.log(err);
                }
            }
            
        },
        *fetchRegionRatio(action, { select, call, put}){
            yield put.resolve({ type:'cancelRegionRatio'});
            yield put.resolve({ type:'cancelable', task:fetchRegionRatioCancelable, action:'cancelRegionRatio' });
            function* fetchRegionRatioCancelable(){
                try {
                    let { user:{ company_id }, fields:{ energyInfo }} = yield select();
                    yield put({ type:'toggleRegionLoading'});
                    let { data } = yield call(getRegionOutput, { company_id, type_id:energyInfo.type_id });
                    if ( data && data.code === '0'){
                        yield put({type:'getRegionRatio', payload:{ data:data.data }});
                    } else if ( data && data.code === '1001') {
                        yield put({ type:'user/loginOut'});
                    }
                } catch(err){
                    console.log(err);
                }
            }
        }
    },
    reducers:{
        toggleLoaded(state){
            return { ...state, loaded:true };
        },
        toggleLoading(state){
            return { ...state, isLoading:true };
        },
        toggleChartLoading(state, { payload }){
            return { ...state, chartLoading:payload };
        },
        toggleRegionLoading(state){
            return { ...state, regionLoading:true };
        },
        getRankInfo(state, { payload:{ rankInfo }}){
            return { ...state, rankInfo }
        },   
        // 用于打开新窗口时传递状态
        setFlowChartInfo(state, { payload:{ chartInfo, rankInfo }}){
            return { ...state, chartInfo, rankInfo, chartLoading:false };
        },
        getChart(state, { payload: { data, parentChart, clickNode }}){
            let temp = data;
            if ( clickNode ){
                addNewNode(parentChart, clickNode, data);
                temp = { ...parentChart };
            }
            // console.log(data);
            console.log(temp);
            
            return { ...state, chartInfo:temp, chartLoading:false };
        },
        getCost(state, { payload : { data }}){
            return { ...state, costChart:data, allCostChart:data };
        },
        getType(state, { payload : { data } }){
            data.unshift({ type_id : 0, type_name:'总', type_code:'total', unit:'kwh' });
            return { ...state, energyList:data, energyInfo: data.length && data[0] };
        },
        getRatio(state, { payload : { data }}){
            let ratioInfo = [];
            ratioInfo.push({ key:'output', text:'能耗产值比', value:{ year:data[1].yearRatio, month:data[1].monthRatio }, unit:'元/万元'});
            ratioInfo.push({ key:'person', text:'人均能耗', value:{ year:data[0].yearRatio, month:data[0].monthRatio }, unit:data[0].unit });
            ratioInfo.push({ key:'area', text:'面积能耗', value:{ year:data[2].yearRatio, month:data[2].monthRatio}, unit:data[2].unit });
            ratioInfo.push({ key:'amount', text:'台当能耗', value:{ year:data[3].yearRatio, month:data[3].monthRatio}, unit:data[3].unit });
            return { ...state, ratioInfo };
        },
        getOutput(state, { payload:{ data }}){
            let outputInfo = Object.keys(data).map(key=>{
                let text = key === 'ele' ? '电' : 
                    key === 'water' ? '水' :
                    key === 'gas' ? '气' : 
                    key === 'hot' ? '燃' : '';
                return { type:key, value:data[key], text };
            });
            return { ...state, outputInfo };
        },
        getAttrRatio(state, { payload : { attrMonthData, attrDayData, attrHourData }}){
            attrMonthData['key'] = 'month';
            attrDayData['key'] = 'day';
            attrHourData['key'] = 'hour';
            return { ...state, attrData:[ attrMonthData, attrDayData, attrHourData ], isLoading:false };
        },
        getRegionRatio(state, { payload: { data }}){
            let regionData = data.sort((a,b)=>b.output_ratio-a.output_ratio);
            return { ...state, regionData:data, regionLoading:false };  
        },
        setDate(state, { payload }){
            return { ...state, currentDate:payload };
        },
        toggleTimeType(state, { payload:{ data }}){
            return { ...state, timeType:data };
        },
        toggleMaskVisible(state, { payload }){
            return { ...state, maskVisible:payload }
        },
        setLevelInfo(state, { payload }){
            return { ...state, parentNodes:payload };
        },
        reset(state){
            return initialState;
        }
    }
}


function addNewNode(node, checkNode, newNode, deep = 0){
    let isExist = { value:false };
    checkIsExist(node, checkNode, isExist);
    // console.log(node.attr_name + ':' + isExist.value);
    if ( deep !== 0 && isExist.value ) {
        // 点击节点的所有祖先节点都保留children
        if ( deep === checkNode.depth ){
            node.children = newNode.children;
            return ;
        } 
    } else {
        // 点击节点祖先节点以外的其他节点都清空children
        if ( deep !== 0 ){
            node.children = null;
        }
    } 
    if ( node.children && node.children.length ){
        node.children.forEach((item)=>{
            let temp = deep;
            ++temp;
            addNewNode(item, checkNode, newNode, temp);
        })
        
    }
}

function checkIsExist(tree, checkNode, isExist){
    if ( tree.attr_name === checkNode.title ) {
        isExist.value = true;
        return ;
    }
    if ( tree.children && tree.children.length ){
        tree.children.map(item=>{
            checkIsExist(item, checkNode, isExist);
        })
    }
}


