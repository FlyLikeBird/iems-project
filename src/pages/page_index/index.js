import React from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Radio, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
// import MonitorIndex from './monitor_index';

import GlobalMonitor from './GlobalMonitor';
// import PowerRoomManager from './PowerRoomManager';
// import TerminalMach from './TerminalMach';
// import TransformerManager from './EleMonitor/transformer/TransformerManager';
// import HighVolManager from './EleMonitor/high_vol/HighVolManager';
// import EleMonitorManager from './EleMonitor/ele_monitor/EleMonitorManager';
// import LineMonitorManager from './EleMonitor/line_monitor/LineMonitor';
function GlobalMonitorPage({ match }) {
    return (  
        <Switch>
            {/* <Route path={`${match.url}/power_room`} component={PowerRoomManager} />    */}
            {/* <Route exact path={`${match.url}/meter_monitor`} component={TerminalMach} /> */}
            <Route exact path={`${match.url}`} component={GlobalMonitor}/>
        </Switch>       
    );
}
