import React from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Table, Button, Modal, Drawer, Popconfirm, Checkbox } from 'antd';
import ManualManager from './ManualManager';
import ManualInfoList from './ManualInfoList';

function ManuallyPage({ match}){
    return (       
        <Switch>
            <Route exact path={`${match.url}/operateInfo/:id`} component={ManualManager} />
            <Route exact path={`${match.url}/manualMeter/:id`} component={ManualManager} />
            <Route path="/" component={ManualInfoList}/>
        </Switch>       
    )
};

ManuallyPage.propTypes = {
};

export default ManuallyPage;