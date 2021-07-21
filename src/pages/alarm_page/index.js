import React from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import AlarmTrend from './AlarmTrend';
import AlarmMonitor from './AlarmMonitor';
import AlarmSetting from  './AlarmSetting';
import AlarmDetail from './AlarmDetail';
import AlarmExecute from './AlarmExecute';
import EleAlarmManager from './EleAlarmManager';
import LinkAlarmManager from './LinkAlarmManager';
import OverAlarmManager from './OverAlarmManager';

function AlarmPage({ match}){
    return (
        <Switch>
            <Route exact path={`${match.url}/alarm_trend`} component={AlarmTrend}/>
            <Route exact path={`${match.url}/alarm_setting`} component={AlarmSetting}/>
            <Route exact path={`${match.url}/alarm_detail`} component={AlarmDetail}/>
            <Route exact path={`${match.url}/alarm_execute`} component={AlarmExecute}/>
            <Route exact path={`${match.url}/ele_alarm`} component={EleAlarmManager}/>
            <Route exact path={`${match.url}/link_alarm`} component={LinkAlarmManager}/>
            <Route exact path={`${match.url}/over_alarm`} component={OverAlarmManager}/>

            <Route exact path={`${match.url}`} component={AlarmMonitor}/>            
        </Switch>
    )
};

function areEqual(prevProps, nextProps){
    if ( prevProps.location.pathname !== nextProps.location.pathname  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(AlarmPage, areEqual);