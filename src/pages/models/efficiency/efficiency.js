import { getEnergyFlow, getRank, getOutputCompare, getEnergyCostInfo, getOutputRatio, getAttrOutput, getRegionOutput } from '../../services/efficiencyService';

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
    outputInfo:{},
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
                yield put.resolve({ type:'fields/init'});
                yield all([
                    put({type:'fetchFlowChart', payload:forReport }),
                    put({type:'fetchRatio'}),
                    put({type:'fetchCost'}),
                    put({type:'fetchOutput'}),
                    put({ type:'fetchRank'})
                ]);
                if ( resolve && typeof resolve === 'function') resolve();
            } catch(err){
                console.log(err);
            }
        },
        *fetchRank(action, { select, put, call }){
            let { user:{ company_id }} = yield select();
            let { data } = yield call(getRank, { company_id });
            if ( data && data.code === '0'){
                yield put({ type:'getRankResult', payload:{ data:data.data }});
            }
        },
        *fetchFlowChart(action, { select, call, put, all }){
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
                } else {
                    yield put({ type:'getChart', payload:{ data:{ empty:true } }});
                }
            } catch(err){
                console.log(err);
            }
        },
        *fetchCost(action, { select, call, put}){
                try {
                    let { user:{ company_id }} = yield select();
                    let { data } = yield call(getEnergyCostInfo, { company_id });
                    if ( data && data.code === '0'){
                        yield put({type:'getCost', payload:{ data: data.data }});
                    }
                } catch(err){
                    console.log(err);
                }
        },
        *fetchOutput(action, { select, call, put}){
                try {
                    let { user:{ company_id }} = yield select();
                    let { data } = yield call(getOutputCompare, { company_id });
                    if ( data && data.code === '0'){
                        yield put({type:'getOutput', payload:{ data:data.data }});
                    }
                } catch(err){
                    console.log(err);
                }
        },
        *fetchRatio(action, { call, put, select}){
                let { user:{ company_id }, fields:{ energyInfo }} = yield select();
                let { resolve, reject } = action.payload ? action.payload : {};
                let { data } = yield call(getOutputRatio, { company_id, energy_type : energyInfo.type_id });
                if ( data && data.code === '0'){
                    yield put({ type:'getRatio', payload:{ data:data.data }})
                    if ( resolve && typeof resolve === 'function') resolve();
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
                yield put.resolve({ type:'fields/init'});
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
                try {
                    let { user:{ company_id }, fields:{ energyInfo, currentField }, efficiency : { currentDate }} = yield select();
                    let { resolve, reject } = action.payload ? action.payload : {};
                    let temp = currentDate.format('YYYY-MM-DD').split('-');
                    yield put({ type:'toggleLoading'});
                    let [attrMonthData, attrDayData, attrHourData] = yield all([
                        call(getAttrOutput, { company_id, field_id:currentField.field_id, type_id:energyInfo.type_id, time_type:2, year:temp[0], month:temp[1], day:temp[2] }),
                        call(getAttrOutput, { company_id, field_id:currentField.field_id, type_id:energyInfo.type_id, time_type:3, year:temp[0], month:temp[1], day:temp[2] }),
                        call(getAttrOutput, { company_id, field_id:currentField.field_id, type_id:energyInfo.type_id, time_type:4, year:temp[0], month:temp[1], day:temp[2] }),
                    ]);
                    if ( attrMonthData && attrMonthData.data.code === '0' && attrDayData && attrDayData.data.code === '0' && attrHourData && attrHourData.data.code === '0'){
                        let obj = { attrMonthData:attrMonthData.data.data, attrDayData:attrDayData.data.data, attrHourData:attrHourData.data.data };
                        yield put({type:'getAttrRatio', payload:obj});
                        if ( resolve && typeof resolve === 'function') resolve();
                    } 
                } catch(err){
                    console.log(err);
                } 
        },
        *fetchRegionRatio(action, { select, call, put}){
                try {
                    let { user:{ company_id }, fields:{ energyInfo, currentField }} = yield select();
                    yield put({ type:'toggleRegionLoading'});
                    let { data } = yield call(getRegionOutput, { company_id, type_id:energyInfo.type_id, field_id:currentField });
                    if ( data && data.code === '0'){
                        yield put({type:'getRegionRatio', payload:{ data:data.data }});
                    } 
                } catch(err){
                    console.log(err);
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
        getRankResult(state, { payload:{ data }}){
            return { ...state, rankInfo:data };
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
            return { ...state, chartInfo:temp, chartLoading:false };
        },
        getCost(state, { payload : { data }}){
            return { ...state, costChart:data, allCostChart:data };
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
            return { ...state, outputInfo:data };
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


