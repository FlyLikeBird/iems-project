import { 
    getAirStation
} from '../../services/stationService';
import moment from 'moment';
import { apiToken, encryptBy } from '@/pages/utils/encryption';
const date = new Date();
const initialState = {
    data:{}
};

export default {
    namespace:'airStation',
    state:initialState,
    effects:{
        *cancelable({ task, payload, action }, { call, race, take}) {
            yield race({
                task:call(task, payload),
                cancel:take(action)
            })
        },
        *cancelAll(action, { put }){
            yield put.resolve({ type:'reset'});
        },
        *fetchAirStation(action, { put, select, call }){
            let { resolve, reject, userid } = action.payload || {};
            let { data } = yield call(getAirStation);
            if ( data && data.code === '0'){
                yield put({ type:'getAirStation', payload:{ data:data.data }});
                if ( resolve && typeof resolve === 'function' ) resolve(data.data);
            }
        }
    },
    reducers:{
        toggleAttrLoading(state){
            return { ...state, attrLoading:true };
        },
        getAirStation(state, { payload:{ data }}){
            let { record } = data;
            if ( record && ( record.length || Object.keys(record).length )) {
                let sourceData = [];
                // 空压站第一屏数据
                // 判断空压机是否故障，再判断是否运行;
                // 是否停止运行（1是停止，0是运行）
                // 是否运行 （ 1是运行，0是停止）
                let data1 = {
                    points:[
                        { name:'1#水塔', status: record['DB1_DBX360_5'] ? '2' : record['DB1_DBX360_0'] ? '0' : '1', top:'10.5', left:'40.9' },
                        { name:'2#水塔', status: record['DB1_DBX376_5'] ? '2' : record['DB1_DBX376_0'] ? '0' : '1', top:'10.5', left:'52.3' },
                        { name:'1#水泵', status: record['DB1_DBX294_5'] ? '2' : record['DB1_DBX294_0'] ? '0' : '1', top:'9.7', left:'63.7' },
                        { name:'2#水泵', status:record['DB1_DBX308_5'] ? '2' : record['DB1_DBX308_0'] ? '0' : '1', top:'12.6', left:'65.3' },
                        { name:'3#水泵', status:record['DB1_DBX322_5'] ? '2' : record['DB1_DBX322_0'] ? '0' : '1', top:'15.1', left:'66.8' },
                        { name:'4#水泵', status:record['DB1_DBX336_5'] ? '2' : record['DB1_DBX336_0'] ? '0' : '1', top:'17.8', left:'68.6' },
                        { name:'1#空压机', status: record['DB1_DBX92_6'] ? '2' : record['DB4_DBX0_0'] ? '1' : '0' , top:'36.4', left:'81.1' },
                        { name:'2#空压机', status: record['DB1_DBX108_6'] ? '2' : record['DB4_DBX166_3'] ? '1' : '0', top:'53.6', left:'81.1' },
                        { name:'3#空压机', status: record['DB1_DBX124_6'] ? '2' : record['DB4_DBX332_3'] ? '1' : '0', top:'68.5', left:'81.1' },
                        { name:'4#空压机', status: record['DB1_DBX140_6'] ? '2' : record['DB4_DBX764_3'] ? '1' : '0', top:'84.4', left:'81.1' },
                        { name:'1#冷干机', status:record['DB4_DBX511_2'] ? '1' : '0', top:'41.4', left:'26.9' },
                        { name:'2#冷干机', status:record['DB4_DBX596_3'] ? '1' : '0', top:'64', left:'26.9' },
                        { name:'3#冷干机', status:record['DB4_DBX680_3'] ? '1' : '0', top:'86.2', left:'26.9' },
                    ],
                    infoList : [
                        { name:'总管压力', direc:'right', top:'4.2', left:'9.0',  value:record['DB2_DBD60'], unit:'bar' },
                        { name:'总管露点', direc:'right', top:'8.2', left:'9.0',  value:record['DB2_DBD390'], unit:'℃ td'},
                        { name:'总管温度', direc:'right', top:'12.2', left:'9.0',  value:record['DB2_DBD300'], unit:'℃'},
                        { name:'总管流量', direc:'right', top:'16.2', left:'9.0',  value:record['DB1_DBD392'], unit:'m³/h'},
                        { name:'总管累积流量', direc:'right', top:'20.2', left:'9.0',  value:record['DB1_DBD530'], unit:'m³'},
                        { name:'1#冷干机容器A压力', direc:'left', top:'35.9', right:'74.7', value:record['DB4_DBD514'], unit:'' },
                        { name:'1#冷干机容器B压力', direc:'right', top:'35.9', left:'27.9', value:record['DB4_DBD518'], unit:'' },
                        { name:'2#冷干机容器A压力', direc:'left', top:'58.7', right:'74.7', value:record['DB4_DBD598'], unit:'' },
                        { name:'2#冷干机容器B压力', direc:'right', top:'58.7', left:'27.9', value:record['DB4_DBD602'], unit:'' },
                        { name:'1#冷干机容器A压力', direc:'left', top:'81.1', right:'74.9', value:record['DB4_DBD682'], unit:'' },
                        { name:'1#冷干机容器B压力', direc:'right', top:'81.1', left:'27.9', value:record['DB4_DBD686'], unit:'' }, 
                                    
                        { name:'1#空压机主机电流', direc:'right', top:'34.4', left:'73.6', value:record['DB4_DBD66'], unit:'A' },
                        { name:'2#空压机主机电流', direc:'right', top:'51.6', left:'73.6', value:record['DB4_DBD232'], unit:'A' },
                        { name:'4#空压机主机电流', direc:'right', top:'68.1', left:'73.6', value:record['DB4_DBD830'], unit:'A' },
                    ],
                    chartList : [
                        { top:'29.9', left:'87.3', width:'11.5', height:'16.7', category:['IGV%', 'BOV%'], value:[record['DB4_DBD108'], record['DB4_DBD112']]},
                        { top:'48.2', left:'87.3', width:'11.5', height:'16.7', category:['IGV%', 'BOV%'], value:[record['DB4_DBD274'], record['DB4_DBD278']]},
                        { top:'63.9', left:'87.3', width:'11.5', height:'16.7', category:['IGV%', 'BOV%'], value:[record['DB4_DBD872'], record['DB4_DBD876']]},
                        // { top:'83.0', left:'84.3', width:'11.5', height:'16', category:['空压机负荷'], value:[record['DB4_DBD414']]}
                    ]
                };
                // A-F6数据
                let data2 = {
                    points:[
                        { name:'A-F6-3#阀开到位', status:record['DB31_DBX4_6'] ? '0' : '1', top:'41.5', left:'20.4' },
                        { name:'A-F6-1#阀开到位', status:record['DB31_DBX4_4'] ? '0' : '1', top:'41.5', left:'71.9' },
                        { name:'A-F6-2#阀开到位', status:record['DB31_DBX4_5'] ? '0' : '1', top:'57.7', left:'59.5' },
                    ],
                    infoList : [
                        { name:'A-F6露点显示', direc:'middle', top:'39.2', left:'31.8',  value:record['DB31_DBD90'], unit:'℃tb' },
                        { name:'A-F6瞬时流量显示', direc:'middle', top:'41.5', left:'43.7',  value:record['DB31_DBD98'], unit:'m³/h' },
                        { name:'A-F6累计流量显示', direc:'middle', top:'46.1', left:'43.7',  value:record['DB31_DBD102'], unit:'m³' },
                        { name:'A-F6压力显示', direc:'middle', top:'39.2', left:'54.5',  value:record['DB31_DBD86'], unit:'bar' },
                        { name:'A-F6温度显示', direc:'middle', top:'39.2', left:'63.6',  value:record['DB31_DBD94'], unit:'℃' },
                    ]
                }
                // A-F5F4数据
                let data3 = {
                    points:[
                        { name:'A-F5-3#阀开到位', status:record['DB31_DBX3_6'] ? '0' : '1', top:'27.8', left:'20.3' },
                        { name:'A-F5-1#阀开到位', status:record['DB31_DBX3_4'] ? '0' : '1', top:'27.8', left:'71.8' },
                        { name:'A-F5-2#阀开到位', status:record['DB31_DBX3_5'] ? '0' : '1', top:'43.7', left:'59.5' },
                        { name:'A-F4-3#阀开到位', status:record['DB31_DBX2_6'] ? '0' : '1', top:'66.8', left:'20.3' },
                        { name:'A-F4-1#阀开到位', status:record['DB31_DBX2_4'] ? '0' : '1', top:'66.8', left:'71.8' },
                        { name:'A-F4-2#阀开到位', status:record['DB31_DBX2_5'] ? '0' : '1', top:'82.9', left:'59.5' },
                    ],
                    infoList : [
                        { name:'A-F5露点显示', direc:'middle', top:'25.2', left:'31.7',  value:record['DB31_DBD70'], unit:'℃tb' },
                        { name:'A-F5瞬时流量显示', direc:'middle', top:'27.8', left:'43.7',  value:record['DB31_DBD78'], unit:'m³/h' },
                        { name:'A-F5累计流量显示', direc:'middle', top:'32.1', left:'43.7',  value:record['DB31_DBD82'], unit:'m³' },
                        { name:'A-F5压力显示', direc:'middle', top:'25.2', left:'54.5',  value:record['DB31_DBD66'], unit:'bar' },
                        { name:'A-F5温度显示', direc:'middle', top:'25.2', left:'63.4',  value:record['DB31_DBD74'], unit:'℃' },
                        { name:'A-F4露点显示', direc:'middle', top:'64.6', left:'31.7',  value:record['DB31_DBD50'], unit:'℃tb' },
                        { name:'A-F4瞬时流量显示', direc:'middle', top:'67.4', left:'43.7',  value:record['DB31_DBD58'], unit:'m³/h' },
                        { name:'A-F4累计流量显示', direc:'middle', top:'71.4', left:'43.7',  value:record['DB31_DBD62'], unit:'m³' },
                        { name:'A-F4压力显示', direc:'middle', top:'64.6', left:'54.5',  value:record['DB31_DBD66'], unit:'bar' },
                        { name:'A-F4温度显示', direc:'middle', top:'64.6', left:'63.4',  value:record['DB31_DBD74'], unit:'℃' },
                    ]
                }
                // A-F3F2数据
                let data4 = {
                    points:[
                        { name:'A-F3-3#阀开到位', status:record['DB31_DBX1_6'] ? '0' : '1', top:'27.8', left:'20.3' },
                        { name:'A-F3-1#阀开到位', status:record['DB31_DBX1_4'] ? '0' : '1', top:'27.8', left:'71.8' },
                        { name:'A-F3-2#阀开到位', status:record['DB31_DBX1_5'] ? '0' : '1', top:'43.7', left:'59.5' },
                        { name:'A-F2-3#阀开到位', status:record['DB31_DBX0_6'] ? '0' : '1', top:'66.8', left:'20.3' },
                        { name:'A-F2-1#阀开到位', status:record['DB31_DBX0_4'] ? '0' : '1', top:'66.8', left:'71.8' },
                        { name:'A-F2-2#阀开到位', status:record['DB31_DBX0_5'] ? '0' : '1', top:'82.9', left:'59.5' },
                    ],
                    infoList : [
                        { name:'A-F3露点显示', direc:'middle', top:'25.2', left:'31.7',  value:record['DB31_DBD30'], unit:'℃tb' },
                        { name:'A-F3瞬时流量显示', direc:'middle', top:'27.8', left:'43.7',  value:record['DB31_DBD38'], unit:'m³/h' },
                        { name:'A-F3累计流量显示', direc:'middle', top:'32.1', left:'43.7',  value:record['DB31_DBD42'], unit:'m³' },
                        { name:'A-F3压力显示', direc:'middle', top:'25.2', left:'54.5',  value:record['DB31_DBD26'], unit:'bar' },
                        { name:'A-F3温度显示', direc:'middle', top:'25.2', left:'63.4',  value:record['DB31_DBD34'], unit:'℃' },
                        { name:'A-F2露点显示', direc:'middle', top:'64.6', left:'31.7',  value:record['DB31_DBD10'], unit:'℃tb' },
                        { name:'A-F2瞬时流量显示', direc:'middle', top:'67.4', left:'43.7',  value:record['DB31_DBD18'], unit:'m³/h' },
                        { name:'A-F2累计流量显示', direc:'middle', top:'71.4', left:'43.7',  value:record['DB31_DBD22'], unit:'m³' },
                        { name:'A-F2压力显示', direc:'middle', top:'64.6', left:'54.5',  value:record['DB31_DBD6'], unit:'bar' },
                        { name:'A-F2温度显示', direc:'middle', top:'64.6', left:'63.4',  value:record['DB31_DBD14'], unit:'℃' },
                    ]
                }
                // B-F6数据
                let data5 = {
                    points:[
                        { name:'B-F6-3#阀开到位', status:record['DB32_DBX4_6'] ? '0' : '1', top:'41.5', left:'20.4' },
                        { name:'B-F6-1#阀开到位', status:record['DB32_DBX4_4'] ? '0' : '1', top:'41.5', left:'71.9' },
                        { name:'B-F6-2#阀开到位', status:record['DB32_DBX4_5'] ? '0' : '1', top:'57.7', left:'59.5' },
                    ], 
                    infoList : [
                        { name:'B-F6露点显示', direc:'middle', top:'39.2', left:'31.8',  value:record['DB32_DBD90'], unit:'℃tb' },
                        { name:'B-F6瞬时流量显示', direc:'middle', top:'41.5', left:'43.7',  value:record['DB32_DBD98'], unit:'m³/h' },
                        { name:'B-F6累计流量显示', direc:'middle', top:'46.1', left:'43.7',  value:record['DB32_DBD102'], unit:'m³' },
                        { name:'B-F6压力显示', direc:'middle', top:'39.2', left:'54.5',  value:record['DB32_DBD86'], unit:'bar' },
                        { name:'B-F6温度显示', direc:'middle', top:'39.2', left:'63.6',  value:record['DB32_DBD94'], unit:'℃' },
                    ]
                }
                // B-F5F4数据
                let data6 = {
                    points:[
                        { name:'B-F5-3#阀开到位', status:record['DB32_DBX3_6'] ? '0' : '1', top:'27.8', left:'20.3' },
                        { name:'B-F5-1#阀开到位', status:record['DB32_DBX3_4'] ? '0' : '1', top:'27.8', left:'71.8' },
                        { name:'B-F5-2#阀开到位', status:record['DB32_DBX3_5'] ? '0' : '1', top:'43.7', left:'59.5' },
                        { name:'B-F4-3#阀开到位', status:record['DB32_DBX2_6'] ? '0' : '1', top:'66.8', left:'20.3' },
                        { name:'B-F4-1#阀开到位', status:record['DB32_DBX2_4'] ? '0' : '1', top:'66.8', left:'71.8' },
                        { name:'B-F4-2#阀开到位', status:record['DB32_DBX2_5'] ? '0' : '1', top:'82.9', left:'59.5' },
                    ],
                    infoList : [
                        { name:'B-F5露点显示', direc:'middle', top:'25.2', left:'31.7',  value:record['DB32_DBD70'], unit:'℃tb' },
                        { name:'B-F5瞬时流量显示', direc:'middle', top:'27.8', left:'43.7',  value:record['DB32_DBD78'], unit:'m³/h' },
                        { name:'B-F5累计流量显示', direc:'middle', top:'32.1', left:'43.7',  value:record['DB32_DBD82'], unit:'m³' },
                        { name:'B-F5压力显示', direc:'middle', top:'25.2', left:'54.5',  value:record['DB32_DBD66'], unit:'bar' },
                        { name:'B-F5温度显示', direc:'middle', top:'25.2', left:'63.4',  value:record['DB32_DBD74'], unit:'℃' },
                        { name:'B-F4露点显示', direc:'middle', top:'64.6', left:'31.7',  value:record['DB32_DBD50'], unit:'℃tb' },
                        { name:'B-F4瞬时流量显示', direc:'middle', top:'67.4', left:'43.7',  value:record['DB32_DBD58'], unit:'m³/h' },
                        { name:'B-F4累计流量显示', direc:'middle', top:'71.4', left:'43.7',  value:record['DB32_DBD62'], unit:'m³' },
                        { name:'B-F4压力显示', direc:'middle', top:'64.6', left:'54.5',  value:record['DB32_DBD46'], unit:'bar' },
                        { name:'B-F4温度显示', direc:'middle', top:'64.6', left:'63.4',  value:record['DB32_DBD54'], unit:'℃' },
                    ]
                }
                // B-F3F2数据
                let data7 = {
                    points:[
                        { name:'B-F3-3#阀开到位', status:record['DB32_DBX1_6'] ? '0' : '1', top:'27.8', left:'20.3' },
                        { name:'B-F3-1#阀开到位', status:record['DB32_DBX1_4'] ? '0' : '1', top:'27.8', left:'71.8' },
                        { name:'B-F3-2#阀开到位', status:record['DB32_DBX1_5'] ? '0' : '1', top:'43.7', left:'59.5' },
                        { name:'B-F2-3#阀开到位', status:record['DB32_DBX0_6'] ? '0' : '1', top:'66.8', left:'20.3' },
                        { name:'B-F2-1#阀开到位', status:record['DB32_DBX0_4'] ? '0' : '1', top:'66.8', left:'71.8' },
                        { name:'B-F2-2#阀开到位', status:record['DB32_DBX0_5'] ? '0' : '1', top:'82.9', left:'59.5' },
                    ],
                    infoList : [
                        { name:'B-F3露点显示', direc:'middle', top:'25.2', left:'31.7',  value:record['DB32_DBD30'], unit:'℃tb' },
                        { name:'B-F3瞬时流量显示', direc:'middle', top:'27.8', left:'43.7',  value:record['DB32_DBD38'], unit:'m³/h' },
                        { name:'B-F3累计流量显示', direc:'middle', top:'32.1', left:'43.7',  value:record['DB32_DBD42'], unit:'m³' },
                        { name:'B-F3压力显示', direc:'middle', top:'25.2', left:'54.5',  value:record['DB32_DBD26'], unit:'bar' },
                        { name:'B-F3温度显示', direc:'middle', top:'25.2', left:'63.4',  value:record['DB32_DBD54'], unit:'℃' },
                        { name:'B-F2露点显示', direc:'middle', top:'64.6', left:'31.7',  value:record['DB32_DBD10'], unit:'℃tb' },
                        { name:'B-F2瞬时流量显示', direc:'middle', top:'67.4', left:'43.7',  value:record['DB32_DBD18'], unit:'m³/h' },
                        { name:'B-F2累计流量显示', direc:'middle', top:'71.4', left:'43.7',  value:record['DB32_DBD22'], unit:'m³' },
                        { name:'B-F2压力显示', direc:'middle', top:'64.6', left:'54.5',  value:record['DB32_DBD6'], unit:'bar' },
                        { name:'B-F2温度显示', direc:'middle', top:'64.6', left:'63.4',  value:record['DB32_DBD14'], unit:'℃' },
                    ]
                }
                sourceData.push(data1);
                sourceData.push(data2);
                sourceData.push(data3);
                sourceData.push(data4);
                sourceData.push(data5);
                sourceData.push(data6);
                sourceData.push(data7);
                data.sourceData = sourceData;
            }
            
            return { ...state, data };
        },
        reset(state){
            return initialState;
        } 
    }
}


