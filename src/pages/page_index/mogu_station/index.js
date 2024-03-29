import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { connect } from 'dva';

function MoguStation({ dispatch, user }){
    let { userInfo, authorized, companyList, moguPath, currentCompany, msg } = user;  
    useEffect(()=>{
        if ( authorized ){
            dispatch({ type:'user/fetchMoguToken'});
        }
    },[authorized])
    return (
        authorized && moguPath
        ?
        <iframe
            src={moguPath}
            width='100%'
            height='100%'
            style={{ border:'none' }}
        ></iframe>
        :
        null
    )
}

export default connect(({ user })=>({ user }))(MoguStation);