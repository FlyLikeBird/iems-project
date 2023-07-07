let r = 0, strokeWidth = 10;
let smallPadding = 0.2, middlePadding = 0.3, largePadding = 1;
// 空压机
export function createAirMachPort(){
    return {
        groups: {
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
            { id:'port1', group:'out', args:{ x:'50%', y:'0%' } },
            { id:'port2', group:'out', args:{ x:'50%', y:'-60' } },
            { id:'port3', group:'out', args:{ x:'50%', y:'-120' }},
        ]
    }
}
// 冷干机
export function createDryingMachPort(){
    return {
        groups: {
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
            { id:'port1', group:'out', args:{ x:'25%', y:'0%' } },
            { id:'port2', group:'out', args:{ x:'75%', y:'0%' }},
            { id:'port3', group:'out', args:{ x:'25%', y:'-184' }},
            { id:'port4', group:'out', args:{ x:'75%', y:'-184' }}
        ]
    }
}
// 空气储气罐
export function createAirTankPort(){
    return {
        groups: {
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
            }
        },
        items:[
            { id:'port1', group:'out', args:{ x:'50%', y:'0%' } },
            { id:'port2', group:'out', args:{ x:'50%', y:'-124' }},
            { id:'port3', group:'out', args:{ x:'50%', y:'-184' }},
            { id:'port4', group:'out', args:{ x:'100%', y:'50%' }},
            { id:'port5', group:'out', args:{ x:'149', y:'50%' }},
            { id:'port6', group:'out', args:{ x:'149', y:'-38' }}
        ]
    }
}
// 制氮机
export function createNitrogenProducerPort(){
    return {
        groups: {          
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
            { id:'port1', group:'out', args:{ x:'50', y:'50%' } },
            { id:'port2', group:'out', args:{ x:'298', y:'50%' }},
            { id:'port3', group:'out', args:{ x:'0', y:'50%'}},
            { id:'port4', group:'out', args:{ x:'348', y:'50%' }},
            { id:'port5', group:'out', args:{ x:'348', y:'-40' }}
        ]
    }
}
// 氮气储气罐
export function createNitrogenTankPort(){
    return {
        groups: {          
            out: {
                position: 'absolute',
                label:{
                    position:'top'
                },
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
            { id:'port1', group:'out', args:{ x:'50%', y:'0' } },
            { id:'port2', group:'out', args:{ x:'50%', y:'-40' }},
            { id:'port3', group:'out', args:{ x:'100%', y:'50%'}},
            { id:'port4', group:'out', args:{ x:'300', y:'50%' }},
            { id:'port5', group:'out', args:{ x:'300', y:'-20'}, attrs:{ text:{ text:'氮气出口', fill:'#fff' }}}
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
    // 空压机流向空气储气罐
    {
        ...getDefaultEdgeStyle('#099eec'),
        // 定义路径经过的锚点
        router:'orth',
        dots:[{ cell:1, port:'port3'}, { cell:3, port:'port3'}],
        source:{ cell:1, port:'port1' },
        target:{ cell:3, port:'port1' },
    },
    {
        ...getDefaultEdgeStyle('#099eec'),
        // 定义路径经过的锚点
        router:'orth',
        dots:[{ cell:1, port:'port2'}],
        source:{ cell:1, port:'port1' },
        target:{ cell:3, port:'port2' },
    },
    // 空气储气罐流向制氮机
    {
        ...getDefaultEdgeStyle('#099eec'),
        // 定义路径经过的锚点
        router:'orth',
        dots:[{ cell:3, port:'port5'}, { cell:3, port:'port6'}, { cell:4, port:'port3'} ],
        source:{ cell:3, port:'port4' },
        target:{ cell:4, port:'port1' },
    },
    // 制氮机流向氮气储气罐
    {
        ...getDefaultEdgeStyle('#ae2afe'),
        // 定义路径经过的锚点
        router:'orth',
        dots:[{ cell:4, port:'port4'}, { cell:4, port:'port5', }, { cell:5, port:'port2'} ],
        source:{ cell:4, port:'port2' },
        target:{ cell:5, port:'port1' },
    },
    // 氮气储气罐流向氮气出口
    {
        ...getDefaultEdgeStyle('#ae2afe'),
        // 定义路径经过的锚点
        router:'orth',
        dots:[{ cell:5, port:'port4'}],
        source:{ cell:5, port:'port3' },
        target:{ cell:5, port:'port5' },
    },
]
