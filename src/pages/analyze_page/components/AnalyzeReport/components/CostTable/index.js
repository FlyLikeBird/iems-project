import React from 'react';
const tdStyle = {
    backgroundColor:'#f7f7f7',
    paddingLeft:'20px',
    border:'2px solid #fff'
}

function CostTable({ data }){
    const tableData = [];
    Object.keys(data).forEach(key=>{
        let value = data[key].cost;
        if ( data[key].cost ) {
            let text = key === 'tip' ? '尖' : key === 'top' ? '峰' : key === 'middle' ? '平' : key === 'bottom' ? '谷' : '';
            tableData.push({ ...data[key], type:text });
        }
    })
    console.log(tableData);
    return (
        <table style={{ width:'100%'}}>
            <thead>
                <tr>
                    <th style={{ ...tdStyle}}>时段</th>
                    <th style={{ ...tdStyle}}>电费(元)</th>
                    <th style={{ ...tdStyle}}>电量(kwh)</th>
                </tr>
            </thead>
            <tbody>
                {
                    tableData.map((item,index)=>(
                        <tr key={index}>
                            <td style={{ ...tdStyle }}>{ item.type }</td>
                            <td style={{ ...tdStyle }}>{ `${Math.floor(item.cost)} (${item.ratio}%)` }</td>
                            <td style={{ ...tdStyle }}>{ `${Math.floor(item.energy)} (${item.energyRatio}%)` }</td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    )
}

export default CostTable;