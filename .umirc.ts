import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  dva:{},
  antd:{},
  dynamicImport:{
  },
  metas: [
    {
      httpEquiv: 'Cache-Control',
      content: 'no-cache',
    },
    {
      httpEquiv: 'Pragma',
      content: 'no-cache',
    },
    {
      httpEquiv: 'Expires',
      content: '0',
    },
  ],
  hash:true,
  routes: [
    { path:'/privacy', component:'@/pages/login_page/PrivacyManager'},
    { path:'/safety', component:'@/pages/login_page/SafeManager'},
    { path:'/login', component:'@/pages/login_page' },
    { path:'/login_spec', component:'@/pages/login_spec_page'},
    { path:'/login_mogu', component:'@/pages/login_mogu_page'},
    // 代理商路由匹配
    {
        path:'/agentMonitor',
        component:'@/pages/agent_manager/index',
        routes:[
            { path:'/agentMonitor', component:'@/pages/agent_manager/AgentMonitor'},
            { path:'/agentMonitor/entry', component:'@/pages/agent_manager/SceneEntry'},
            { path:'/agentMonitor/project', component:'@/pages/agent_manager/ProjectList'},
            { path:'/agentMonitor/alarm', component:'@/pages/agent_manager/AlarmManager'}
        ]
    },
    // 监控主页及各个监控子站
    {
        path:'/energy/global_monitor',
        component:'@/pages/index',
        routes:[
            { path:'/energy/global_monitor', component:'@/pages/page_index/GlobalMonitor'},
            { path:'/energy/global_monitor/power_room', component:'@/pages/page_index/powerroom_station' },
            { path:'/energy/global_monitor/air_scene', component:'@/pages/page_index/air_station' },
            { path:'/energy/global_monitor/ai_gas_station', component:'@/pages/page_index/smart_gas_station'}
        ]
    },
    // 匹配全屏子窗口
    {
        path:'/global_fullscreen',
        component:'@/pages/global_fullscreen/index'
    },
    // 电气监控模块
    {
        path:'/energy/ele_monitor_menu',
        component:'@/pages/index',
        routes:[
            { path:'/energy/ele_monitor_menu/trans_monitor_menu', component:'@/pages/elemonitor_manager/transformer/TransformerManager'},
            { path:'/energy/ele_monitor_menu/height_voltage_monitor', component:'@/pages/elemonitor_manager/high_vol/HighVolManager'},
            { path:'/energy/ele_monitor_menu/ele_son_monitor', component:'@/pages/elemonitor_manager/ele_monitor/EleMonitorManager'},
            { path:'/energy/ele_monitor_menu/ele_line_monitor', component:'@/pages/elemonitor_manager/line_monitor/LineMonitor'},
            { path:'/energy/ele_monitor_menu/mach_monitor_menu', component:'@/pages/elemonitor_manager/terminal_mach/TerminalMach'},
            { path:'/energy/ele_monitor_menu/useless_manage', component:'@/pages/efficiency_manager/UseLessManager'},
            { path:'/energy/ele_monitor_menu/demand_manage', component:'@/pages/efficiency_manager/DemandManager'}
        ]
    },
    // 能源成本模块
    {
        path:'/energy/energy_manage',
        component:'@/pages/index',
        routes:[
            { path:'/energy/energy_manage', component:'@/pages/energy_manager/EnergyManager'},
            { path:'/energy/energy_manage/cost_trend', component:'@/pages/energy_manager/CostTrendManager'},
            { path:'/energy/energy_manage/cost_analyz', component:'@/pages/energy_manager/CostAnalyze'},
            { path:'/energy/energy_manage/ele_cost', component:'@/pages/energy_manager/EleCostManager'},
            { path:'/energy/energy_manage/water_cost_menu', component:'@/pages/energy_manager/WaterCostManager'},
            { path:'/energy/energy_manage/ele_statement', component:'@/pages/energy_manager/EleStatementManager'}
        ]
    },
    // 能源效率模块
    {
        path:'/energy/energy_eff',
        component:'@/pages/index',
        routes:[
            { path:'/energy/energy_eff', component:'@/pages/efficiency_manager/EfficiencyManager'},
            { path:'/energy/energy_eff/eff_trend', component:'@/pages/efficiency_manager/EfficiencyTrendManager'},
            { path:'/energy/energy_eff/energy_eff_quota', component:'@/pages/efficiency_manager/EfficiencyQuotaManager'},
            { path:'/energy/energy_eff/energy_eff_ratio', component:'@/pages/coal_manager/RatioRank'},
            { path:'/energy/energy_eff/energy_eff_person', component:'@/pages/coal_manager/PersonRank'},
            { path:'/energy/energy_eff/energy_eff_area', component:'@/pages/coal_manager/AreaRank'},
            { path:'/energy/energy_eff/energy_eff_output', component:'@/pages/coal_manager/OutputRank'},
            // { path:'/energy/energy_eff/useless_manage', component:'@/pages/efficiency_manager/UseLessManager'},
            // { path:'/energy/energy_eff/demand_manage', component:'@/pages/efficiency_manager/DemandManager'},
            // { path:'/energy/energy_eff/energy_eff_power', component:'@/pages/coal_manager/EffRank'},
            // { path:'/energy/energy_eff/coal_trend', component:'@/pages/coal_manager/CoalTrend'},
            // { path:'/energy/energy_eff/coal_esay_managy', component:'@/pages/coal_manager/CoalManager'},
        ]
    },
    // 碳指标模块
    {
        path:'/energy/coal_manage',
        component:'@/pages/index',
        routes:[
            { path:'/energy/coal_manage/coal_manage_deal', component:'@/pages/coal_manager/CoalManager'},
            { path:'/energy/coal_manage/coal_manage_trend', component:'@/pages/coal_manager/CoalTrend' }
        ]
    },
    // 电能质量模块
    {
        path:'/energy/ele_quality',
        component:'@/pages/index',
        routes:[
            { path:'/energy/ele_quality', component:'@/pages/elequality_manager/EleQualityIndex'},
            { path:'/energy/ele_quality/harmonic', component:'@/pages/elequality_manager/EleHarmonicManager'},
            { path:'/energy/ele_quality/mutually', component:'@/pages/elequality_manager/EleBalanceManager'}
        ]
    },
    // 报警监控模块
    {
        path:'/energy/alarm_manage',
        component:'@/pages/index',
        routes:[
            { path:'/energy/alarm_manage', component:'@/pages/alarm_page/AlarmMonitor'},
            { path:'/energy/alarm_manage/alarm_trend', component:'@/pages/alarm_page/AlarmTrend'},
            { path:'/energy/alarm_manage/alarm_execute', component:'@/pages/alarm_page/AlarmExecute'},
            { path:'/energy/alarm_manage/ele_alarm', component:'@/pages/alarm_page/EleAlarmManager/index'},
            { path:'/energy/alarm_manage/over_alarm', component:'@/pages/alarm_page/OverAlarmManager/index'},
            { path:'/energy/alarm_manage/link_alarm', component:'@/pages/alarm_page/LinkAlarmManager/index'},
            { path:'/energy/alarm_manage/alarm_setting', component:'@/pages/alarm_page/AlarmSetting'}
        ]
    },
    // 分析中心模块
    {
        path:'/energy/analyze_manage',
        component:'@/pages/index',
        routes:[
            { path:'/energy/analyze_manage/mach_run_eff', component:'@/pages/analyze_page/AnalyzeMachManager'},
            { path:'/energy/analyze_manage/energy_phase', component:'@/pages/efficiency_manager/EnergyPhaseManager'},
            { path:'/energy/analyze_manage/mach_eff', component:'@/pages/efficiency_manager/EfficiencyMach'},
            { path:'/energy/analyze_manage/saveSpace', component:'@/pages/analyze_page/SaveSpaceManager'},
            { path:'/energy/analyze_manage/analyzeReport', component:'@/pages/analyze_page/AnalyzeReportManager'},
        ]
    },
    // 统计报表模块
    {
        path:'/energy/stat_report',
        component:'@/pages/index',
        routes:[
            { path:'/energy/stat_report/energy_code_report', component:'@/pages/energy_manager/MeterReportManager'},
            { path:'/energy/stat_report/energy_cost_report', component:'@/pages/energy_manager/CostReportManager'},
            { path:'/energy/stat_report/extreme', component:'@/pages/stat_report/ExtremeReport/ExtremeReport'},
            { path:'/energy/stat_report/ele_report', component:'@/pages/stat_report/EleReport/index'},
            { path:'/energy/stat_report/sameReport', component:'@/pages/stat_report/SameRateReport/index'},
            { path:'/energy/stat_report/adjoinReport', component:'@/pages/stat_report/AdjoinRateReport/index'},
            { path:'/energy/stat_report/timereport', component:'@/pages/stat_report/TimeEnergyReport/index'},
        ]
    },
    // 信息管理
    {
        path:'/energy/info_manage_menu',
        component:'@/pages/index',
        routes:[
            { path:'/energy/info_manage_menu/incoming_line', component:'@/pages/info_manager/IncomingLineManager'},
            { path:'/energy/info_manage_menu/quota_manage', component:'@/pages/info_manager/QuotaManager'},
            { path:'/energy/info_manage_menu/manual_input', component:'@/pages/info_manager/ManuallyPage/ManualInfoList'},
            { path:'/energy/info_manage_menu/manual_input/operateInfo/:id', component:'@/pages/info_manager/ManuallyPage/ManualManager'},
            { path:'/energy/info_manage_menu/manual_input/manualMeter/:id', component:'@/pages/info_manager/ManuallyPage/ManualManager'},
            { path:'/energy/info_manage_menu/free_manage', component:'@/pages/info_manager/BillingManager'},
            { path:'/energy/info_manage_menu/field_manage', component:'@/pages/info_manager/FieldManager'},
        ]
    },
    // 系统配置
    {
        path:'/energy/system_config',
        component:'@/pages/index',
        routes:[
            { path:'/energy/system_config/role_manage', component:'@/pages/system_config/RoleManager'},
            { path:'/energy/system_config/user_manage', component:'@/pages/system_config/AdminManager'},
            { path:'/energy/system_config/system_log', component:'@/pages/system_config/SystemLog'},
            { path:'/energy/system_config/update_password', component:'@/pages/system_config/UpdatePassword'}
        ]
    },
    {
        path:'/energy',
        component:'@/pages/index',
        routes:[
            // 监控主页和各个子站
            { path:'/energy', component:'@/pages/page_index/GlobalMonitor' }
        ]
    },
    {
        path:'/',
        component:'@/pages/index',
        routes:[
            { path:'/', component:'@/pages/page_index/GlobalMonitor' }
        ]
    }
  ],
  fastRefresh: {},
});
