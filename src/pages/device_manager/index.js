import React from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Table, Button, Modal, Drawer, Popconfirm, Checkbox } from 'antd';
import MachManager from './MachManager';
import GatewayManager from './GatewayManager';

function DevicePage({ match}){
    return (
        <div>
            <Switch>
                <Route exact path={`${match.url}/gateway_manage`} component={GatewayManager}/>
                <Route exact path={`${match.url}/meter_manage`} component={MachManager}/>
                <Route exact path={`${match.url}`} component={MachManager}/>            
            </Switch>
        </div>
    )
};

DevicePage.propTypes = {
    
};

export default DevicePage;