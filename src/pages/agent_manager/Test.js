import React from 'react';

let arr = [1,2,3,4,5];
let arr2 = [];
for( var i=0;i<=9;i++){
    arr2.push(i);
}
function Test(){
    return (
        <div style={{ height:'100%' }}>
            <div style={{ marginTop:'100px' }}>
            {
                arr.map((item)=>(
                    <div style={{
                        display:'inline-block',
                        width:'100px',
                        height:'100px',
                        lineHeight:'100px',
                        backgroundColor:'#000',
                        color:'#fff',
                        marginRight:'10px',
                        textAlign:'center'
                    }}>{ item }</div>
                ))
            }
            {
                arr.map((item)=>(
                    <div style={{
                        display:'inline-block',
                        width:'10%',
                        height:'10%',
                        backgroundColor:'blue',
                        color:'#fff',
                        marginRight:'10px',
                        textAlign:'center'
                    }}>{ item }</div>
                ))
            }
        </div>
        <div style={{ height:'4%'}}>
            {
                arr2.map((item)=>(
                    <div style={{
                        display:'inline-block',
                        width:'10%',
                        height:'100%',
                        backgroundColor:'blue',
                        color:'#fff',
                        paddingRight:'10px',
                        borderRight:'2px solid red',
                        textAlign:'center'
                    }}>{ item }</div>
                ))
            }
        </div>
        <div style={{ width:'1920px', height:'30px', lineHeight:'30px', color:'#000', backgroundColor:'yellow', textAlign:'center'}}>hello world</div>
        <div style={{ width:'3840px', height:'30px', lineHeight:'30px', color:'#000', backgroundColor:'red', textAlign:'center'}}>hello world</div>
        <div style={{ margin:'10px 0'}}>rem相对单位</div>
        <div style={{ width:'10rem', height:'10rem', lineHeight:'10rem', backgroundColor:'green', textAlign:'center'}}>hello world</div>
        <div style={{ margin:'10px 0'}}>百分比单位</div>
        <div style={{ width:'20%', height:'20%', backgroundColor:'#000', color:'#fff'}}>lalalala</div>
        </div>
    )
}

export default Test;