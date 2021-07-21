import React from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Table, Button, Modal, Drawer, Popconfirm, Checkbox } from 'antd';
import FieldManager from './FieldManager';
import QuotaManager from './QuotaManager';
import ManuallyPage from './ManuallyPage';
import BillingManager from './BillingManager';
import IncomingLineManager from './IncomingLineManager';
import MainLineManager from './MainLineManager';

function FieldPage({ match}){
    return (       
        <Switch>
            <Route exact path={`${match.url}/field_manage`} component={FieldManager}/>
            <Route exact path={`${match.url}/quota_manage`} component={QuotaManager}/>
            <Route path={`${match.url}/manual_input`} component={ManuallyPage} />
            <Route path={`${match.url}/incoming_line`} component={IncomingLineManager} />
            <Route path={`${match.url}/main_line`} component={MainLineManager} />
            <Route exact path={`${match.url}/free_manage`} component={BillingManager} />
            <Route exact path={`${match.url}`} component={FieldManager}/>            
        </Switch>       
    )
};

FieldPage.propTypes = {
};

export default FieldPage;