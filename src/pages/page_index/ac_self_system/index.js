import React, { useEffect } from 'react';
import { connect } from 'dva';

function ACStation({ dispatch, user }){
    let { userInfo, authorized, companyList, currentCompany, msg } = user;  
    let temp = window.location.host.split('-');
    let prefix = temp.length === 2 ? temp[1].split('.')[0] : '';
    let linkPath = ( prefix ? 'ac' + '-' + prefix : 'ac' ) + '.h1dt.com';
    
    return (
        authorized 
        ?
        <iframe
            src={`http://${linkPath}?pid=${Math.random()}&&userId=${userInfo.user_id}&&companyId=${currentCompany.company_id}&&mode=frame`}
            width='100%'
            height='100%'
            style={{ border:'none' }}
        ></iframe>
        :
        null
    )
}

export default connect(({ user })=>({ user }))(ACStation);