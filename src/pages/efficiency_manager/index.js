import React from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Radio, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import EfficiencyManager from './EfficiencyManager';
import EfficiencyTrendManager from './EfficiencyTrendManager';
import EfficiencyQuotaManager from './EfficiencyQuotaManager';
import EfficiencyTreeManager from './EfficiencyTreeManager';
import DemandManager from './DemandManager';
import UseLessManager from './UseLessManager';

function EfficiencyManagerPage({ match }) {
    return (  
        <Switch>
            <Route exact path={`${match.url}`} component={EfficiencyManager}/>
            <Route exact path={`${match.url}/energy_eff_quota`} component={EfficiencyQuotaManager}/>
            <Route exact path={`${match.url}/energy_eff_chart`} component={EfficiencyTreeManager}/>
            <Route exact path={`${match.url}/eff_trend`} component={EfficiencyTrendManager} />
            <Route exact path={`${match.url}/demand_manage`} component={DemandManager} />
            {/* <Route exact path={`${match.url}/demand_cost`} component={DemandCost} /> */}
            <Route exact path={`${match.url}/useless_manage`} component={UseLessManager} />
        </Switch>       
    );
}

function areEqual(prevProps, nextProps){
    if ( prevProps.location !== nextProps.location ){
        return false;
    } else {
        return true;
    }
}

export default React.memo(EfficiencyManagerPage, areEqual);
