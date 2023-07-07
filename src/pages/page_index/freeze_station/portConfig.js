let r = 0, strokeWidth = 10;
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
                        // magnet: true,
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
                        // magnet: true,
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
            { id:'port3', group:'in', args:{ x:'-200%', y:'60%' }},
            { id:'port4', group:'out', args:{ x:'300%', y:'60%' }}
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
export function getDefaultEdgeStyle(color) {
    return {
        connector:{ name:'rounded'}, 
        attrs:{ 
            line:{ 
                stroke:color, 
                strokeWidth,
                // targetMarker: {
                //     tagName: 'path',
                //     fill: 'yellow',  // 使用自定义填充色
                //     stroke: 'green', // 使用自定义边框色
                //     strokeWidth: 2,
                //     d: 'M 20 -10 0 0 20 10 Z',
                // },
                // strokeDasharray:'20,10', 
                targetMarker:{ name:'classic', width:10, height:14 },
            }
        } 
    }
    
};

export const allEdges = [
    // 1#冷却塔流向4#制冷主机
    {
        ...getDefaultEdgeStyle('#09eca8'),
        // 定义路径经过的锚点
        router:'orth',
        dots:[{ cell:1, port:'port3'}, { cell:4, port:'port3'}, { cell:8, port:'port5'}],
        source:{ cell:1, port:'port1' },
        target:{ cell:8, port:'port1' },
    },
    // 1#冷却塔流向4#冷却塔
    {
        ...getDefaultEdgeStyle('#09eca8'),
        // 定义路径经过的锚点
        router:'orth',
        dots:[{ cell:1, port:'port4'}, { cell:4, port:'port4'}],
        source:{ cell:1, port:'port2' },
        target:{ cell:4, port:'port2' },
    },
    // 4#制冷主机流向1#制冷主机
    {
        ...getDefaultEdgeStyle('#09eca8'),
        router:'orth',
        dots:[{ cell:8, port:'port6'}, { cell:12, port:'port2'}, { cell:12, port:'port3'}, { cell:9, port:'port3' }, { cell:1, port:'port4'}],
        source:{ cell:8, port:'port2'},
        target:{ cell:1, port:'port2'}
    },
    // 4#制冷主机流向1#水泵13
    {
        ...getDefaultEdgeStyle('#09eca8'),
        router:'orth',
        dots:[{ cell:12, port:'port4'}, { cell:9, port:'port4'}],
        source:{ cell:8, port:'port6'},
        target:{ cell:9, port:'port3'}
    },
    // 1#制冷主机流向4#制冷主机
    {
        ...getDefaultEdgeStyle('#09eca8'),
        router:'orth',
        dots:[{ cell:5, port:'port6'}],
        source:{ cell:5, port:'port2'},
        target:{ cell:8, port:'port6'}
    },
    {
        ...getDefaultEdgeStyle('#099eec'),
        router:'orth',
        dots:[{ cell:5, port:'port8'}],
        source:{ cell:5, port:'port4'},
        target:{ cell:8, port:'port8'}
    },
    // 4#制冷主机流向分水器
    {
        ...getDefaultEdgeStyle('#099eec'),
        router:'orth',
        dots:[{ cell:8, port:'port8'}, { cell:16, port:'port1'}, { cell:16, port:'port4'}, { cell:15, port:'port4'}, { cell:18, port:'port4' }],
        source:{ cell:8, port:'port4'},
        target:{ cell:18, port:'port2'}
    },
    // 8#水泵流向5#水泵
    {
        ...getDefaultEdgeStyle('#099eec'),
        router:'orth',
        dots:[{ cell:13, port:'port3'}, { cell:13, port:'port1'}],
        source:{ cell:16, port:'port3'},
        target:{ cell:13, port:'port4'}
    },
    // 集水器流向4#制冷主机
    {
        ...getDefaultEdgeStyle('#ae2afe'),
        router:'orth',
        dots:[{ cell:17, port:'port4'}, { cell:5, port:'port7'}, { cell:8, port:'port7'}],
        source:{ cell:17, port:'port2'},
        target:{ cell:8, port:'port3'}
    },
    // // 集水器流向1#制冷主机
    // {
    //     ...getDefaultEdgeStyle('#ae2afe'),
    //     // vertices:[{ x:1096, y:120 }],
    //     router:'orth',
    //     source:{ cell:17, port:'port1' },
    //     target:{ cell:5, port:'port7' }
    // },
    // // 5-8#水泵流向分水器
    // {
    //     ...getDefaultEdgeStyle('#099eec'),
    //     router:'orth',
    //     source:{ cell:13, port:'port4' },
    //     target:{ cell:18, port:'port1' },

    // }
]
