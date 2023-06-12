let r = 6, strokeWidth = 5;
let smallPadding = 0.2, middlePadding = 0.3, largePadding = 1;
// 冷却塔
export function createFrozenTowerPort(){
    return {
        groups: {
            // 输入链接桩群组定义
            in: {
                position: 'absolute',
                attrs: {
                    circle: {
                        r,                     
                        magnet: true,
                        fill: '#fff',
                    }
                },
            },
            // 输出链接桩群组定义
            out: {
                position: 'absolute',
                attrs: {
                    circle: {
                        r,                
                        magnet: true,
                        fill: '#fff',
                    },
              },
            },
        },
        items:[
            { id:'port1', group:'in', args:{ x:'50%', y:'0%' } },
            { id:'port2', group:'out', args:{ x:'50%', y:'100%' } },
            { id:'port3', group:'in', args:{ x:'50%', y:( -middlePadding) * 100 + '%' }},
            { id:'port4', group:'out', args:{ x:'50%', y:( 1 + middlePadding ) * 100 + '%' } }
        ]
    }
}
// 水泵
export function createWaterPumpPort(){
    return {
        groups: {
            // 输入链接桩群组定义
            in: {
                position: 'absolute',
                attrs: {
                    circle: {
                        r,
                        magnet: true,                
                        fill: '#fff',
                    }
                },
            },
            // 输出链接桩群组定义
            out: {
                position: 'absolute',
                attrs: {
                    circle: {
                        r,
                        magnet: true,                                            
                        fill: '#fff',
                    },
              },
            },
        },
        items:[
            { id:'port1', group:'in', args:{ x:'0%', y:'60%' } },
            { id:'port2', group:'out', args:{ x:'100%', y:'60%'}},
            { id:'port3', group:'in', args:{ x:( -largePadding ) * 100 + '%', y:'60%' }},
            { id:'port4', group:'out', args:{ x:( 1 + largePadding ) * 100 + '%', y:'60%' }}
        ]
    }
}
// 制冷主机
export function createFrozenMachPort(){
    return {
        groups: {
            // 输入链接桩群组定义
            in: {
                position: 'absolute',
                attrs: {
                    circle: {
                        r,
                        magnet: true,                                            
                        fill: '#fff',
                    }
                },
            },
            // 输出链接桩群组定义
            out: {
                position: 'absolute',
                attrs: {
                    circle: {
                        r,
                        magnet: true,                                            
                        fill: '#fff',
                    },
              },
            },
        },
        items:[
            { id:'port1', group:'in', args:{ x:'0%', y:'60%' }}, 
            { id:'port2', group:'in', args:{ x:'0%', y:'80%' }},
            { id:'port3', group:'out', args:{ x:'100%', y:'60%' }},
            { id:'port4', group:'out', args:{ x:'100%', y:'80%' }},
            { id:'port5', group:'in', args:{ x:(-smallPadding) * 100 + '%', y:'60%' }},
            { id:'port6', group:'in', args:{ x:(-smallPadding * 2 ) * 100 + '%', y:'80%' }},
            { id:'port7', group:'out', args:{ x:( 1 + smallPadding ) * 100 + '%', y:'60%' }},
            { id:'port8', group:'out', args:{ x:( 1 + smallPadding * 2 ) * 100 + '%', y:'80%' }}            
        ]
    }
}

// 定义所有的Edges节点
export const defaultEdgeStyle = {
    connector:{ name:'rounded'}, 
    attrs:{ 
        line:{ 
            stroke:'#09eca8', 
            strokeWidth,
            strokeDasharray:5, 
            targetMarker:'classic', 
            style:{ 
                animation:'ant-line 30s infinite linear'
            }
        }
    } 
};

export const allEdges = [
    // 1#冷却塔流向4#冷却塔
    {
        ...defaultEdgeStyle,
        source:{ cell:1, port:'port3' },
        target:{ cell:4, port:'port3' }
    },
    {
        ...defaultEdgeStyle,
        source:{ cell:1, port:'port4' },
        target:{ cell:4, port:'port4' }
    },
    // 1-4#水泵流向冷却塔1#
    {
        ...defaultEdgeStyle,
        source:{ cell:9, port:'port3' }, 
        target:{ cell:1, port:'port4' }, 
    }
]
