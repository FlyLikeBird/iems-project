import React from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Radio, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
// import EnergyManager from './EnergyManager';
import CostReportManager from '../EnergyManagerPage/CostReportManager';
import ExtremeReport from './ExtremeReport/ExtremeReport';
import EleReport from './EleReport';
import SameRateReport from './SameRateReport';
import AdjoinRateReport from './AdjoinRateReport';
import TimeEnergyReport from './TimeEnergyReport';
// import CostAnalyze from './CostAnalyze';
// import EleCostManager from './EleCostManager';
// import CostTrendManager from './CostTrendManager';
import MeterReportManager from '../EnergyManagerPage/MeterReportManager';

function EnergyManagerPage({ match }) {
    return (  
        <Switch>               
            <Route exact path={`${match.url}/energy_cost_report`} component={CostReportManager}/> 
            <Route exact path={`${match.url}/extreme`} component={ExtremeReport}/> 
            <Route exact path={`${match.url}/ele_report`} component={EleReport} />
            <Route exact path={`${match.url}/sameReport`} component={SameRateReport} />
            <Route exact path={`${match.url}/adjoinReport`} component={AdjoinRateReport} />
            <Route exact path={`${match.url}/timereport`} component={TimeEnergyReport} />
            {/* <Route exact path={`${match.url}/cost_analyz`} component={CostAnalyze}/> 
            <Route exact path={`${match.url}/ele_cost`} component={EleCostManager} /> 
            <Route exact path={`${match.url}/cost_trend`} component={CostTrendManager}/>  */}
            <Route exact path={`${match.url}/energy_code_report`} component={MeterReportManager} />
            {/* <Route exact path={`${match.url}`} component={EnergyManager}/>  */}
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
