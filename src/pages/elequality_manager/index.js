import React from 'react';
import { connect } from 'dva';
import { Link, Route, Switch, routerRedux } from 'dva/router';
import { Radio, Spin } from 'antd';
import EleBalanceManager from './EleBalanceManager';
import EleHarmonicManager from './EleHarmonicManager';
import EleQualityIndex from './EleQualityIndex';

function EleQualityManager({ match }) {
    return (  
        <Switch>               
            <Route exact path={`${match.url}/mutually`} component={EleBalanceManager}/> 
            <Route exact path={`${match.url}/harmonic`} component={EleHarmonicManager} />
            <Route exact path={match.url} component={EleQualityIndex} />
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

export default React.memo(EleQualityManager, areEqual);
