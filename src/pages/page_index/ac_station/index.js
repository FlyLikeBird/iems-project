import React, { useEffect } from 'react';
import { connect } from 'dva';

function ACStation({ dispatch, user }){
    let { userInfo, authorized, companyList, currentCompany, msg } = user;  
    let temp = window.location.host.split('-');
    let prefix = temp.length === 2 ? temp[1].split('.')[0] : '';
    let linkPath = ( prefix ? 'acs' + '-' + prefix : 'acs' ) + '.h1dt.com'; 
    return (
        authorized 
        ?
        <iframe
            src='https://epc.cie-tech.cn/?TOKEN=5d24042b-669b-4798-a0b3-9802cc2e1e01'
            width='100%'
            height='100%'
            style={{ border:'none' }}
        ></iframe>
        :
        null
    )
}

export default connect(({ user })=>({ user }))(ACStation);