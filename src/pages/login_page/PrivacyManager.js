import React from 'react';
import privacyTxt from './privacy.txt';

function PrivacyManager(){
    return (
        <div style={{ width:'1200px', margin:'0 auto' }}>
            <h2 style={{ textAlign:'center' }}>APP隐私政策</h2>
            <pre>{ privacyTxt }</pre>
        </div>
    )
}

export default PrivacyManager;