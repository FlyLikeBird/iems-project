import { routerRedux } from 'dva/router';
import { login, userAuth, agentUserAuth, fetchSessionUser, getNewThirdAgent, setCompanyLogo, getWeather, getThirdAgentInfo, getCameraAccessToken } from '../services/userService';
import { uploadImg } from '../services/alarmService';
import { message } from 'antd';
import { md5, encryptBy, decryptBy } from '../utils/encryption';
import { getCompanyId } from '../utils/storage';
import moment from 'moment';

const reg = /\/info_manage_menu\/manual_input\/([^\/]+)\/(\d+)/;
const companyReg =  /\?pid\=0\.\d+&&userId=(\d+)&&companyId=(\d+)/;
const agentReg = /\?agent=(.*)/;
const agentReg2 = /iot-(.*)/;
const sessionReg = /\?sid=(.*)/;
let energyList = [
    { type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'},
    { type_name:'水', type_code:'water', type_id:'2', unit:'m³'},
    { type_name:'气', type_code:'gas', type_id:'3', unit:'m³' }
];
let date = new Date();
// 初始化socket对象，并且添加监听事件
function createWebSocket(url, data, companyId, fromAgent, dispatch){
    let ws = new WebSocket(url);
    // console.log(data);
    ws.onopen = function(){
        if ( data.agent_id && !fromAgent ){
            ws.send(`agent:${data.agent_id}`);
        } else {
            ws.send(`com:${companyId}`);
        }
    };
    // ws.onclose = function(){
    //     console.log('socket close...');
    //     reconnect(url, data, companyId, dispatch);
    // };
    ws.onerror = function(){
        console.log('socket error...');
        reconnect(url, data, companyId, dispatch);
    };
    ws.onmessage = (e)=>{
        if ( dispatch ) {   
            let data = JSON.parse(e.data); 
            // console.log(data);
            if ( data.type === 'company'){
                dispatch({ type:'setMsg', payload:{ data }});
            } else if ( data.type === 'agent'){
                dispatch({ type:'setAgentMsg', payload:{ data }})
            }                       
        }
    }
    return ws;
}
function reconnect(url, data, companyId, dispatch){
    if(reconnect.lock) return;
    reconnect.lock = true;
    setTimeout(()=>{
        createWebSocket(url, data, companyId, dispatch);
        reconnect.lock = false;
    },2000)
}
let socket = null;
const initialState = {
    userInfo:{},
    userMenu:[],
    companyList:[],
    currentProject:'',
    // 全局的公司id
    company_id:'',
    currentCompany:{},
    currentMenu:{},
    // 配置动态路由
    routePath:[],
    routeConfig:{},
    authorized:false,
    // socket实时告警消息
    msg:{},
    agentMsg:{},
    //  当前页面的location
    currentPath:'',
    prevPath:'',
    weatherInfo:'',
    // 全局告警消息
    alarmList:[],
    // 页面总宽度
    containerWidth:0,
    collapsed:false,
    pagesize:12,
    // 判断是否是中台打开的子窗口
    fromAgent:false,
    // 其他中台商ID，根据这个ID对登录页做特殊判断
    thirdAgent:{},
    newThirdAgent:{},
    // 浅色主题light 深色主题dark 
    theme:'dark',
    startDate:moment(date),
    endDate:moment(date),
    timeType:'1',
    // 打开用户音频权限
    audioAllowed:false
};

function checkIsLTUser(){
    let str = window.location.host.split('.');
    let matchResult = agentReg2.exec(str[0]);
    return ( matchResult && matchResult[1] === 'lt' ) ? true : false;
}

export default {
    namespace:'user',
    state:initialState,
    subscriptions:{
        setup({ dispatch, history}) {
            history.listen(( location )=>{
                let pathname = location.pathname;
                // 全屏窗口，不请求数据
                if ( pathname === '/login_spec' || pathname === 'login_mogu' || pathname === '/global_fullscreen' || pathname === '/privacy' || pathname === '/safety' ) return;
                // 新版第三方代理商特殊处理
                if ( location.pathname === '/login' ) {
                    let str = window.location.host.split('.');
                    let matchResult = agentReg2.exec(str[0]);
                    let temp = matchResult ? matchResult[1] : '';
                    dispatch({ type:'fetchNewThirdAgent', payload:temp });
                    return ;
                }
                // 旧版第三方代理商特殊处理
                if ( pathname.includes('/login')) {         
                    dispatch({ type:'thirdAgentAuth', payload:{ pathname, search:location.search }});
                    return ;
                } 
                // 联通账户验证sesseion,如果sessionId验证通过直接登录
                // console.log(location.search);
                // console.log(location.search.includes('sid'));
                if ( checkIsLTUser() && location.search.includes('sid') ){
                    let sessionResult = sessionReg.exec(location.search);
                    let temp = sessionResult ? sessionResult[1] : '';
                    if ( temp ){
                        dispatch({ type:'fetchSession', payload:{ sid:temp }});
                    }
                    return;
                }  
                if ( pathname !== '/login') {
                    new Promise((resolve, reject)=>{
                        dispatch({type:'userAuth', payload: { dispatch, query:location.search, resolve }})
                    })
                    .then(()=>{
                        // 设置当前页面路由的路径
                        dispatch({type:'setRoutePath', payload:location.pathname || '/' });       
                        // 能源成本页面
                        if ( pathname === '/energy/energy_manage' ){
                            dispatch({type:'energy/fetchSceneInfo'});
                            dispatch({type:'energy/fetchInit'});          
                            return;
                        } 
                        // 成本趋势页面
                        if ( pathname === '/energy/energy_manage/cost_trend'){
                            dispatch({ type:'attrEnergy/init'});
                            return ;
                        }
                        // 抄表记录
                        if ( pathname === '/energy/stat_report/energy_code_report') {                           
                            dispatch({type:'meterReport/initMeterReport'});
                            return;
                        }
                        // 成本报表和复合计费报表
                        if ( pathname === '/energy/stat_report/energy_cost_report' || pathname === '/energy/stat_report/timereport' ) {
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                      
                            dispatch({ type:'costReport/initCostReport'});
                        }
                        
                        // 成本透视页面
                        if ( pathname === '/energy/energy_manage/cost_analyz'){
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                      
                            dispatch({ type:'costReport/initCostAnalyze'});
                            return;
                        }
                        // 成本日历页面
                        if ( pathname === '/energy/energy_manage/cost_calendar'){
                            // dispatch({ type:'baseCost/'})
                        }
                        // 极值报表
                        if ( pathname === '/energy/stat_report/extreme') {     
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                      
                            dispatch({ type:'extremeReport/initExtremeReport'});                          
                            return;
                        }
                        // 电力报表
                        if ( pathname === '/energy/stat_report/ele_report') { 
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                       
                            dispatch({ type:'extremeReport/initEleReport'});                           
                            return;
                        }
                        // 同比报表
                        if ( pathname === '/energy/stat_report/sameReport') {     
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                                         
                            dispatch({ type:'extremeReport/initSameRate'});                          
                            return;
                        }
                        // 环比报表
                        if ( pathname === '/energy/stat_report/adjoinReport') {  
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                                      
                            dispatch({ type:'extremeReport/initAdjoinRate'});
                            return;
                        }
                        // 电费成本页面
                        if ( pathname === '/energy/energy_manage/ele_cost'){ 
                            dispatch({ type:'user/toggleTimeType', payload:'2' }); 
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                      
                            dispatch({ type:'baseCost/initEleCost'});                           
                            return;
                        }
                        // 水费成本页面
                        if ( pathname === '/energy/energy_manage/water_cost_menu' ) {
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'水', type_code:'water', type_id:'2', unit:'m³'}});   
                            dispatch({ type:'energy/initWaterCost'});                   
                        }
                        // 费用结算单页面
                        if ( pathname === '/energy/energy_manage/ele_statement'){
                            dispatch({ type:'energy/fetchEleStatement'});
                            dispatch({ type:'costReport/fetchFeeRate'});
                            return;
                        }
                        // 电能质量页面 --- 主页
                        if ( pathname === '/energy/ele_quality') {        
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                                                         
                            dispatch({ type:'eleQuality/initEleQualityIndex'});                            
                            return;
                        }
                        // 电能质量页面 --- 相平衡
                        if ( pathname === '/energy/ele_quality/mutually') { 
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                                                                   
                            dispatch({ type:'eleQuality/initEleBalance'});                          
                            return;
                        }
                        // 电能质量页面 --- 谐波监测
                        if ( pathname === '/energy/ele_quality/harmonic') {     
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                                                     
                            dispatch({ type:'eleQuality/initEleHarmonic'});                         
                            return;
                        }
                        // 能源效率能流图页面
                        if ( pathname === '/energy/energy_eff'){
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});
                            dispatch({type:'efficiency/fetchInit'});
                            return;
                        } 
                        // 能效趋势页面
                        if ( pathname === '/energy/energy_eff/eff_trend') {
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});
                            dispatch({ type:'efficiency/fetchEffTrend'});
                            return;
                        }
                        // 能耗定额页面
                        if ( pathname === '/energy/energy_eff/energy_eff_quota') {
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                                                     
                            dispatch({ type:'efficiencyQuota/fetchQuotaInit'});
                            return;
                        }
                        // 能效树图页面
                        if ( pathname === '/energy/energy_eff/energy_eff_chart'){
                            dispatch({ type:'efficiencyQuota/fetchTreeInit'});  
                            return;                  
                        }
                        // 无功监测页面
                        if ( pathname === '/energy/ele_monitor_menu/useless_manage') {
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                                                                            
                            dispatch({ type:'demand/initUseless'});                            
                            return;
                        }
                        // 需量管理页面
                        if ( pathname === '/energy/ele_monitor_menu/demand_manage') {  
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                                                                              
                            dispatch({ type:'demand/initDemand'});                                
                            return;
                        }
                        // 告警监控主页面
                        if ( pathname === '/energy/alarm_manage' ) {
                            dispatch({ type:'alarm/fetchSceneInfo'});
                            dispatch({ type:'alarm/fetchMonitorInfo'});                            
                            return;
                        }
                        // 告警趋势页面
                        if ( pathname === '/energy/alarm_manage/alarm_trend') {
                            dispatch({ type:'alarm/fetchSumInfo'});
                        }
                        // 告警监控 --- 电气安全监控
                        if ( pathname === '/energy/alarm_manage/ele_alarm'){ 
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                                         
                            dispatch({ type:'eleAlarm/init' });
                            return;
                        }
                        // 告警监控 --- 越限告警
                        if ( pathname === '/energy/alarm_manage/over_alarm'){   
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                                              
                            dispatch({ type:'overAlarm/init'});
                            return;
                        }
                        // 告警监控 --- 通讯监控
                        if ( pathname === '/energy/alarm_manage/link_alarm'){    
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                                             
                            dispatch({ type:'linkAlarm/init'});                         
                            return;
                        }
                        // 告警列表页面
                        if ( pathname === '/energy/alarm_manage/alarm_execute') {
                            let cate_code = '1';
                            if ( location.query && location.query.type ) {
                                cate_code = location.query.type === 'ele' ? '1' : location.query.type === 'limit' ? '2' : '3';
                            }                        
                            dispatch({type:'alarm/fetchRecordList', payload:{ cate_code }} );
                            dispatch({type:'alarm/fetchExecuteType'});
                            return;
                        }
                        // 告警规则设置页面
                        if ( pathname === '/energy/alarm_manage/alarm_setting' ) {
                            dispatch({ type:'alarm/initAlarmSetting'});
                            return;
                        } 
                        // 告警详情页面
                        if ( pathname === '/energy/alarm_manage/alarm_detail') {
                            dispatch({type:'alarm/fetchSumInfo'});
                            return;
                        }
                        // 分析中心---空载率页面
                        if ( pathname === '/energy/analyze_manage/mach_run_eff'){
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                      
                            dispatch({ type:'user/toggleTimeType', payload:'1'});
                            dispatch({ type:'analyze/initMachEff'});
                            return;
                        } 
                        // 分析中心 --- 能源趋势
                        if ( pathname === '/energy/analyze_manage/energy_phase'){
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                      
                            dispatch({ type:'demand/initEnergyPhase'});
                            return;
                        }
                        // 分析中心 --- 设备利用率
                        if ( pathname === '/energy/analyze_manage/mach_eff'){  
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                                               
                            dispatch({type:'demand/initMachEfficiency'});                            
                            return;
                        }
                        // 分析中心 --- 节能策略
                        if ( pathname === '/energy/analyze_manage/saveSpace') {
                            dispatch({ type:'user/toggleTimeType', payload:'2'});
                            dispatch({ type:'analyze/fetchBaseSaveSpace'});
                            return;
                        }
                        // 信息管理 --- 进线页面
                        if ( pathname === '/energy/info_manage_menu/incoming_line') {
                            dispatch({type:'incoming/fetchIncoming'});
                            return;
                        } 
                        // 信息管理 --- 定额管理页面
                        if ( pathname === '/energy/info_manage_menu/quota_manage') {
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                      
                            dispatch({type:'quota/fetchInit', payload:{ query:location.query } });
                            return;
                        }
                        // 信息管理 --- 手工填报页面                        
                        if ( pathname.includes('/energy/info_manage_menu/manual_input') ) {
                            let match = reg.exec(pathname);
                            dispatch({ type:'fields/toggleEnergyInfo', payload:{ type_name:'电', type_code:'ele', type_id:'1', unit:'kwh'}});                      
                            dispatch({type:'manually/fetchFillType'});
                            dispatch({type:'manually/fetchMeterType'});
                            if ( match ){
                                let page_type = match[1];
                                let type_id = match[2];
                                dispatch({type:'manually/togglePageType', payload:{ isMeterPage : page_type === 'manualMeter' ? true : false } });                       
                                dispatch({type:'manually/fetchInit', payload:type_id });
                            }
                            return;
                        }
                        //  信息管理 --- 计费管理
                        if ( pathname === '/energy/info_manage_menu/free_manage') {
                            dispatch({type:'billing/init'});
                            return;
                        }
                        // 信息管理 --- 维度管理
                        if ( pathname === '/energy/info_manage_menu/field_manage' ) {
                            let type = location.query.type;
                            let temp = energyList.filter(i=>i.type_code === type )[0];
                            if ( temp ){
                                dispatch({ type:'fields/toggleEnergyInfo', payload:temp });                      
                            }
                            dispatch({ type:'fields/fetchField'});
                            dispatch({ type:'fields/fetchFieldType'});
                            return;
                        }
                        // 系统配置 --- 用户管理
                        if ( pathname ==='/energy/system_config/user_manage'){
                            dispatch({type:'userList/fetchUserList'});
                            dispatch({type:'userList/fetchRoleList'});
                            return;                            
                        }
                        // 系统配置 --- 角色权限
                        if ( pathname === '/energy/system_config/role_manage'){
                            dispatch({type:'userList/fetchRoleList'});
                            return;
                        }
                        // 系统配置 --- 系统日志
                        if ( pathname === '/energy/system_config/system_log') {
                            dispatch({type:'log/fetchLog'});
                            return;
                        }
                        // 信息管理 --- 干线页面
                        // if ( pathname === '/info_manage_menu/main_line') {
                        //     dispatch({type:'fetchMainLine'});
                        //     dispatch({type:'fetchMach'});
                        // }
                        
                        // if ( pathname === '/analyze_manage/lineloss_eff') {
                        //     Promise.all([
                        //         dispatch({type:'fetchEnergy'}),
                        //         dispatch({type:'fetchMainLine'})
                        //     ])
                        //     .then(([energyType, mainLine])=>{
                        //         dispatch({type:'fetchLineLoss', payload:{} });
                        //     })
                        // }
                    })   
                }
            })
        }
    },
    effects:{
        *userAuth(action, {call, select, put, all}){ 
            try {
                let { user: { userInfo, authorized, newThirdAgent }} = yield select();
                let { dispatch, query, resolve, reject } = action.payload || {};
                // 如果是第三方服务商
                let thirdAgent;
                if ( localStorage.getItem('third_agent') ){
                    thirdAgent = JSON.parse(localStorage.getItem('third_agent'));
                    yield put({ type:'setThirdAgentInfo', payload:{ data:thirdAgent }});
                }
                // console.log(authorized);
                if ( !authorized ){
                    // 判断是否是服务商用户新开的公司标签页
                    let matchResult = companyReg.exec(query);
                    let company_id = matchResult ? matchResult[2] : null;
                    let user_id = matchResult ? matchResult[1] : null;
                    if ( user_id ){
                        localStorage.setItem('user_id', user_id);
                    }
                    let { data } = yield call( matchResult ? agentUserAuth : userAuth, matchResult ? { app_type:1, company_id } : { app_type:1 } );
                    if ( data && data.code === '0' ){
                        // 先判断是否是第三方代理商账户
                        if ( !Object.keys(newThirdAgent).length ) {
                            let str = window.location.host.split('.');
                            let matchResult = agentReg2.exec(str[0]);
                            let temp = matchResult ? matchResult[1] : '';
                            yield put({ type:'fetchNewThirdAgent', payload:temp });
                        }
                        yield put({type:'setUserInfo', payload:{ data:data.data, company_id, fromAgent:matchResult ? true : false, authorized:true } });
                        yield put({ type:'setContainerWidth' });
                        yield put({type:'weather'});
                        if ( resolve && typeof resolve === 'function') resolve();
                        // websocket 相关逻辑
                        if ( !WebSocket ) {
                            window.alert('当前浏览器不支持websocket,推荐使用chrome浏览器');
                            return ;
                        }
                        let config = window.g;
                        let socketCompanyId = company_id ? company_id : data.data.companys.length ? data.data.companys[0].company_id : null ;
                        socket = createWebSocket(`ws://${config.socketHost}:${config.socketPort}`, data.data, socketCompanyId, matchResult ? true : false, dispatch);
                        
                    } else {
                        // 登录状态过期，跳转到登录页重新登录(特殊账号跳转到特殊登录页)
                        yield put({ type:'loginOut'});
                    }
                } 
                if ( resolve && typeof resolve === 'function') resolve();
            } catch(err){
                console.log(err);
            }
        },
        // 中台用户登录时更新当前中台账号下所有企业用户的告警信息
        *updateAgentAlarm(action, { put, call, select }){
            let { data } = yield call(userAuth);
            if ( data && data.code === '0'){
                yield put({ type:'getAgentAlarm', payload:{ data:data.data }});
            }
        },
        *login(action,{ call, put, select }){
            try {
                let { user_name, password } = action.payload;
                let { user:{ thirdAgent} } = yield select();
                let { resolve, reject } = action;
                // if ( localStorage.getItem('user_id')){
                //     message.info('已有登录用户，请进入主页先退出再登录')
                //     return;
                // }
               
                password = md5(password, user_name);
                var { data }  = yield call(login, {user_name, password});
                if ( data && data.code === '0'){   
                    let { user_id, user_name, agent_id, companys } = data.data;
                    let companysMap = companys.map((item)=>{
                        return { [encodeURI(item.company_name)]:item.company_id };
                    })
                    let timestamp = parseInt(new Date().getTime()/1000);
                    //  保存登录的时间戳,用户id,公司id 
                    localStorage.setItem('timestamp', timestamp);
                    localStorage.setItem('user_id', user_id);
                    localStorage.setItem('user_name', user_name);
                    localStorage.setItem('companysMap', JSON.stringify(companysMap));
                    localStorage.setItem('agent_id', agent_id);
                    localStorage.setItem('third_agent', JSON.stringify(thirdAgent));
                    yield put({ type:'setAudioAllowed' });
                    //  登录后跳转到默认页面
                    // 如果是服务商用户则跳转到中台监控页
                    if ( agent_id ) {
                        yield put(routerRedux.push('/agentMonitor'));
                    } else {
                        // 跳转到项目列表页
                        yield put(routerRedux.push('/energy'));
                    }
                } else {
                    if (reject) reject( data && data.msg );
                }
            } catch(err){
                console.log(err);
            }
        },
        *weather(action,{call, put}){
            let { data } = yield call(getWeather);
            if ( data && data.code === '0' ) {
                yield put({type:'getWeather', payload:{data:data.data}});
            }
        },
        *loginOut(action, { call, put, select }){
            let { user:{ userInfo, thirdAgent }} = yield select();
            if ( localStorage.getItem('user_name') === 'feixundemo') {
                yield put({ type:'clearUserInfo'});
                yield put({ type:'fields/cancelAll'});
                yield put(routerRedux.push('/login_spec'));
                return;
            }
            if ( localStorage.getItem('user_name') === 'mogudemo') {
                yield put({ type:'clearUserInfo'});
                yield put({ type:'fields/cancelAll'});
                yield put(routerRedux.push('/login_mogu'));
                return ;
            }
            if ( Object.keys(thirdAgent).length ){
                yield put({ type:'clearUserInfo'});
                yield put({ type:'fields/cancelAll'});
                yield put(routerRedux.push(`/login?agent=${encryptBy(thirdAgent.agent_id)}`)); 
            } else {
                yield put({type:'clearUserInfo'});
                yield put({ type:'fields/cancelAll'});
                yield put(routerRedux.push('/login'));
            }
            let audio = document.getElementById('my-audio');
            if ( audio && audio.pause ){
                audio.pause();
            }
            if ( socket && socket.close ){
                socket.close();
                socket = null;
            }
        },
        *thirdAgentAuth(action, { call, put}){
            let { pathname, search } = action.payload || {};
            if ( search ){
                let match = agentReg.exec(search);
                if ( match && match.length ){
                    let param = match[1];
                    let agentId = decryptBy(param);
                    let { data } = yield call(getThirdAgentInfo, { agent_id:agentId });
                    if ( data && data.code === '0'){
                        yield put({ type:'setThirdAgentInfo', payload:{ data:data.data }});
                    }
                }
            }
        },
        *fetchNewThirdAgent(action, { put, select, call}){
            let { data } = yield call(getNewThirdAgent, { agent_code:action.payload });
            if ( data && data.code === '0'){
                yield put({ type:'getNewThirdAgent', payload:{ data:data.data }});
            } else {

            }
        },
        *upload(action, { select, call, put}){
            let { user:{ company_id }} = yield select();
            let { file, resolve, reject } = action.payload || {};
            let { data } = yield call(uploadImg, { file });
            if ( data && data.code === '0'){
                if ( resolve && typeof resolve === 'function' ) resolve(data.data);
            } else {
                if ( reject && typeof reject === 'function' ) reject();
            }
        },
        *changeCompanyLogo(action, { put, call, select }){
            try {
                let { user:{ company_id }} = yield select();
                let { logoData, thumbLogoData, resolve, reject } = action.payload || {};
                let { data } = yield call(setCompanyLogo, { company_id, head_logo_path:logoData.filePath, mini_logo_path:thumbLogoData.filePath });
                if ( data && data.code === '0'){
                    let { user:{ currentCompany }} = yield select();
                    yield put({ type:'updateLogo', payload:{ ...currentCompany, head_logo_path:logoData.url, mini_logo_path:thumbLogoData.url }});
                    if ( resolve && typeof resolve === 'function') resolve();
                } else {
                    if ( reject && typeof reject === 'function') reject(data.msg);
                }
            } catch(err){   
                console.log(err);
            }
        },
        *fetchSession(action, { put, call, select }){
            let { sid } = action.payload || {};
            let { data } = yield call(fetchSessionUser, { sid });
            if ( data && data.code === '0'){
                let { user:{ newThirdAgent }} = yield select();
                let { user_id, user_name, agent_id, companys } = data.data;
                let companysMap = companys.map((item)=>{
                    return { [encodeURI(item.company_name)]:item.company_id };
                })
                let timestamp = parseInt(new Date().getTime()/1000);
                //  保存登录的时间戳,用户id,公司id 
                localStorage.setItem('timestamp', timestamp);
                localStorage.setItem('user_id', user_id);
                localStorage.setItem('user_name', user_name);
                localStorage.setItem('companysMap', JSON.stringify(companysMap));
                localStorage.setItem('agent_id', agent_id);
                yield put({ type:'setUserInfo', payload:{ data:data.data, company_id:null, fromAgent:null, authorized:false }});
                yield put(routerRedux.push('/'));

            }
        }
    },
    reducers:{
        setUserInfo(state, { payload:{ data, company_id, fromAgent, authorized }}){
            let { menuData, companys } = data;
            let currentCompany = company_id ? companys.filter(i=>i.company_id == company_id)[0] : companys[0];
            let routeConfig = menuData.reduce((sum,menu)=>{
                sum[menu.menu_code] = {
                    menu_name:menu.menu_name,
                    menu_id:menu.menu_id,
                    path:menu.menu_code,
                    children:menu.child.map(i=>i.menu_id)
                }
                //  将菜单和子级菜单生成路由映射表
                if (menu.child && menu.child.length){
                    menu.child.map(subMenu=>{
                        sum[subMenu.menu_code] = {
                            menu_name:subMenu.menu_name,
                            menu_id:subMenu.menu_id,
                            path:subMenu.menu_code,
                            parent:menu.menu_id
                        }                       
                    })
                }
                return sum;
            },{});
            routeConfig.home = { menu_name:'首页', path:'/', linkable:true};
            // routeConfig['user_setting'] = { menu_name:'账号设置', path:'user_setting' };   
            return { ...state, userInfo:data, userMenu:menuData, companyList:companys || [], company_id: currentCompany && currentCompany.company_id, currentCompany:currentCompany || {}, routeConfig, fromAgent, authorized };
        },
        setRoutePath(state, { payload }){
            let routes = payload.split('/').filter(i=>i);
            let { routeConfig } = state;  
            // console.log(routeConfig);
            let currentMenu;
            // currentProject标识当前所在项目，默认进入能源管理项目;
            let currentProject = routes[0] || 'energy';
            if ( payload === '/') {
                currentMenu = routeConfig['global_monitor'];
            }
            if ( payload.includes('/energy')) {
                // 能源管理项目
                if ( payload === '/energy' || payload === '/energy/global_monitor'){
                    //  如果是首页(默认以监控页为首页)
                    currentMenu = routeConfig['global_monitor'];
                }  else if ( payload.includes('/energy/info_manage_menu/manual_input')){
                    // 如果是手工填报页多层级路由 ， 直接定位到手工填报的菜单项
                    currentMenu = routeConfig['manual_input'];
                } else if ( payload.includes('/energy/global_monitor/power_room')) {
                    currentMenu = routeConfig['power_room'];
                } else { 
                    //  根据当前url获取对应的菜单项
                    currentMenu = routeConfig[routes[routes.length-1]] ? routeConfig[routes[routes.length-1]] : {} ;
                }
            } 
            routes.unshift('home');
            routes = routes.map(route=>{
                return routeConfig[route]
            });
            return { ...state, routePath:routes, currentPath:payload, currentMenu : currentMenu || {}, currentProject, deviceWidth:window.innerWidth };
        },
        getAgentAlarm(state, { payload:{ data }}){
            return { ...state, userInfo:data };
        },
        getWeather(state, { payload :{data}}){
            return { ...state, weatherInfo:data }
        },
        setMsg(state, { payload : { data } }){
            // 根据count 字段判断是否需要更新告警信息
            if ( state.msg.count !== data.count ){
                return { ...state, msg:data };
            } else {
                return state;
            }
        },
        setAgentMsg(state, { payload:{ data }}){
            return { ...state, agentMsg:data.detail };
        },
        setContainerWidth(state){
            let containerWidth = window.innerWidth;
            let containerHeight = window.innerHeight;
            // let isSmallDevice = containerWidth < 1440 ? true : false;
            // // 内容区高度 = 页面总高度 - header高度 - nav高度
            // let contentHeight = Math.round(containerHeight - ( isSmallDevice ? 50 : 70 ));
            // // 内容区高度 - 内容区padding - 表格标题高度 - 表头的高度 - 分页符的高度
            // let tbodyHeight =  contentHeight  - 28 - 40 - 20 - 50 - 120 - 50;
            // let pagesize = Math.ceil( tbodyHeight / 40 );
            // console.log(tbodyHeight, pagesize);
            return { ...state, containerWidth };
        },
        toggleTheme(state, { payload }) {
            return { ...state, theme:payload };
        },
        toggleTimeType(state, { payload }){
            let start, end;
            var date = new Date();
            if ( payload === '3'){
                // 切换为年维度
                start = moment(date).startOf('year');
                end = moment(date).endOf('year');   
            } else if ( payload === '2'){
                // 切换为月维度
                start = moment(date).startOf('month');
                end = moment(date).endOf('month');
            } else {
                // 切换为日维度
                start = end = moment(date);
            }
            return { ...state, timeType:payload, startDate:start,  endDate:end };
        },
        setDate(state, { payload:{ startDate, endDate }}){
            return { ...state, startDate, endDate };
        },
        toggleCollapsed(state){
            return { ...state, collapsed:!state.collapsed };
        },
        setThirdAgentInfo(state, { payload:{ data }}){
            return { ...state, thirdAgent:data };
        },
        getNewThirdAgent(state, { payload:{ data }}){
            return { ...state, newThirdAgent:data };
        },
        updateLogo(state, { payload }){
            return { ...state, currentCompany:payload };
        },
        setFromWindow(state, { payload:{ timeType, beginDate, endDate }}) {
            return { ...state, timeType, startDate:moment(new Date(beginDate)), endDate:moment(new Date(endDate))};
        },
        setAudioAllowed(state){
            return { ...state, audioAllowed:true };
        },
        clearUserInfo(state){
            localStorage.clear();
            return initialState;
        }
    }
}

