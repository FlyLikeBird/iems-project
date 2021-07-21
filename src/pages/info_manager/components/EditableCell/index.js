import React from 'react';
import { Form, InputNumber } from 'antd';

function validator(a,value){
    
    if ( typeof +value === 'number' && +value >= 0 ) {
        return Promise.resolve();
    } else {
        return Promise.reject('请填入>=0的定额值');
    }
}

const EditableCell = (a) => {
    console.log(a);
    return (
        <div style={{ display:'inline-block'}}>
            hello world
        </div>
    )
}

export default EditableCell;