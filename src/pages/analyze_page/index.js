import React from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import AnalyzeMachManager from './AnalyzeMachManager';
import EnergyPhaseManager from '../EfficiencyManagerPage/EnergyPhaseManager';
import EfficiencyMach from '../EfficiencyManagerPage/EfficiencyMach';
import SaveSpaceManager from './SaveSpaceManager';
import AnalyzeReportManager from './AnalyzeReportManager';
import LineLossManager from '../EfficiencyManagerPage/LineLossManager';

function AnalyzePage({ match}){
    return (
        <Switch>
            <Route exact path={`${match.url}/mach_run_eff`} component={AnalyzeMachManager}/>
            <Route exact path={`${match.url}/energy_phase`} component={EnergyPhaseManager}/>
            <Route exact path={`${match.url}/mach_eff`} component={EfficiencyMach}/>
            <Route exact path={`${match.url}/lineloss_eff`} component={LineLossManager}/>
            <Route exact path={`${match.url}/saveSpace`} component={SaveSpaceManager}/>
            <Route exact path={`${match.url}/analyzeReport`} component={AnalyzeReportManager}/>
        </Switch>
    )
};

export default AnalyzePage;