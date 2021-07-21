import React, { useState } from 'react';
import { connect } from 'dva';
import { Button, Modal } from 'antd';
import AnalyzeReport from './components/AnalyzeReport';
import style from './components/AnalyzeReport/AnalyzeReport.css';

function AnalyzeReportManager({ dispatch, analyze }){
    return (
        <div className={style['container']}>     
            <AnalyzeReport  />
        </div>
    )
}

export default AnalyzeReportManager;

