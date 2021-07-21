import React,{ useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import transImg from '../../../../../public/icons/transformer.png';

const btnStyle = {
    position:'absolute',
    width:'20px',
    height:'40px',
    lineHeight:'40px',
    backgroundColor:'rgba(5,107,182,0.5)',
    border:'1px solid #056bb6',
    top:'50%',
    transform:'translateY(-50%)',
    cursor:'pointer',
    zIndex:'2'
}

// const data = ['变压器A','变压器B', '变压器C'];
// const data=['变压器A','变压器B']
function ScrollCom({ data }){
    const [scrollIndex, setIndex] = useState(0);
    function handleScroll(direc){
        if ( direc === 'left'){
            if ( scrollIndex === 0 ) return;
            setIndex(scrollIndex + 1);
        } else {
            let rest = Math.ceil(data.length / 2 ) ;
            if ( Math.abs(scrollIndex) >= rest ) return ;
            setIndex(scrollIndex - 1);
        }
    }

    return (
        <div style={{ height:'100%', position:'relative', whiteSpace:'nowrap', textAlign:'center', overflow:'hidden' }}>
            {
                data.length > 2 
                ?
                <div style={{ ...btnStyle, left:'0' }} onClick={()=>handleScroll('left')}><LeftOutlined /></div>
                :
                null
            }
            {
                data.length > 2
                ?
                <div style={{ ...btnStyle, right:'0' }} onClick={()=>handleScroll('right')}><RightOutlined /></div>
                :
                null
            }

            {
                data.map((item,index)=>(
                    <div key={index} style={{ 
                        transform:`translateX(${scrollIndex === 0 ? 0 : scrollIndex * 100 + '%'})`, 
                        transition:'all 1s', 
                        color:'#fff', 
                        width:'50%', 
                        display:'inline-block', 
                        verticalAlign:'top', 
                        height:'100%', 
                        // backgroundColor:'rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ height:'14%'}}>{ item.meter_name }</div>
                        <div style={{ height:'72%'}}><img src={transImg} style={{ height:'100%' }} /></div>
                        <div style={{ height:'14%', color:'#0676cb', fontSize:'1.2rem', fontWeight:'bold' }}>{ item.load_rate + '%' }</div>
                    </div>
                ))
            }
        </div>
    )
}

export default ScrollCom;