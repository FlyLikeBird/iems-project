import React from 'react';
import MachContainer from './PowerRoomManager/PowerRoomMach';
import style from '../../../components/ColumnCollapse/ColumnCollapse.css';

function TerminalMach(){
    return (
        <div className={style['container']} style={{ padding:'0 20px'}}>
            <MachContainer />
        </div>
    )
}

export default TerminalMach;