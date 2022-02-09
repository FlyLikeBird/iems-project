import React from 'react';
import safeTxt from './safety.txt';

function SafeManager(){
    return (
        <div style={{ width:'1200px', margin:'0 auto' }}>
            <h2 style={{ textAlign:'center' }}>APP软件许可协议</h2>
            <pre>{ safeTxt }</pre>
        </div>
    )
}

export default SafeManager;