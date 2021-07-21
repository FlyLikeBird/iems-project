import React from 'react';
import style from './expandCard.css';

function ExpandCard(a) {
    console.log(a);
    return (
        <div className={style.container}>
            <div className={style['img-container']}></div>
            <div className={style['info-container']}>
                <div>hello world</div>
                <div className={style.text}>
                    222
                    <span>条</span>
                </div>
            </div>
        </div>
        
    );
}

ExpandCard.propTypes = {
    
};

export default ExpandCard;

