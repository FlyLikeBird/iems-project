import React from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Radio, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import EnergyManager from './EnergyManager';
import CostReportManager from './CostReportManager';
import CostAnalyze from './CostAnalyze';
import EleCostManager from './EleCostManager';
import CostTrendManager from './CostTrendManager';
import MeterReportManager from './MeterReportManager';
import EleStatementManager from './EleStatementManager';

function EnergyManagerPage({ match }) {
    return (  
        <Switch>               
            <Route exact path={`${match.url}/energy_cost_report`} component={CostReportManager}/> 
            <Route exact path={`${match.url}/cost_analyz`} component={CostAnalyze}/> 
            <Route exact path={`${match.url}/ele_cost`} component={EleCostManager} /> 
            <Route exact path={`${match.url}/cost_trend`} component={CostTrendManager}/> 
            <Route exact path={`${match.url}/energy_code_report`} component={MeterReportManager} />
            <Route exact path={`${match.url}/ele_statement`} component={EleStatementManager} />
            <Route exact path={`${match.url}`} component={EnergyManager}/> 
            {/* <Route exact path={`${match.url}/measure_cost`} component={MeasureCostManager}/>
            <Route exact path={`${match.url}/base_cost`} component={BaseCostManager}/>   
            <Route exact path={`${match.url}/adjust_cost`} component={AdjustCostManager}/>    */}
        </Switch>       
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.location.pathname !== nextProps.location.pathname ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(EnergyManagerPage, areEqual);
