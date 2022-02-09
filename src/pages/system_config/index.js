import React from 'react';
import { connect } from 'dva';
import { Link, Route, Switch } from 'dva/router';
import { Table, Button, Modal, Drawer, Popconfirm, Checkbox } from 'antd';
import SystemLog from './SystemLog';
import AdminManager from './AdminManager';
import RoleManager from './RoleManager';
import MachManager from '../DeviceManagerPage/MachManager';
import GatewayManager from '../DeviceManagerPage/GatewayManager';
import UpdatePassword from './UpdatePassword';
function SystemConfig({ match }){
    return (       
        <Switch>
            <Route exact path={`${match.url}/system_log`} component={SystemLog}/>
            <Route exact path={`${match.url}/user_manage`} component={AdminManager}/>
            <Route exact path={`${match.url}/role_manage`} component={RoleManager}/>
            <Route exact path={`${match.url}/gateway_manage`} component={GatewayManager}/>
            <Route exact path={`${match.url}/meter_manage`} component={MachManager}/>
            <Route exact path={`${match.url}/update_password`} component={UpdatePassword} />
        </Switch>       
    )
};

SystemConfig.propTypes = {
};

export default SystemConfig;