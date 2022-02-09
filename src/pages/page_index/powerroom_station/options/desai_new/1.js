import * as THREE from 'three';
export var loadModels = [
    { path:'transformer_mini.gltf'}, 
    { path:'capBox_mini.gltf'},
    { path:'inlineBox_mini.gltf'}, 
    { path:'feedbackBox_mini.gltf'},
    { path:'eleBox_mini.gltf'},
    { path:'connectBox_mini.gltf'}
];
export var modelList = [
    [
        { path:'transformer_mini.gltf', type:'transformer', name:'4#变压器', mach_id:'H1_DS_DI_R1B1_1G06', marginRight:50 }, 
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'4P01进线柜' }, 
        { path:'capBox_mini.gltf', type:'capBox', name:'4P02电容柜' }, 
        { path:'capBox_mini.gltf', type:'capBox', name:'4P03电容柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'4P04出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'4P05出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'4P06出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'4P07出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'4P08出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'4P09出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'4P10出线柜' }
    ],
    [
        { path:'transformer_mini.gltf', type:'transformer', name:'3#变压器', mach_id:'H1_DS_DI_R1B1_1G05', marginRight:50 }, 
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'3P01进线柜' }, 
        { path:'capBox_mini.gltf', type:'capBox', name:'3P02电容柜' }, 
        { path:'capBox_mini.gltf', type:'capBox', name:'3P03电容柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'3P04出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'3P05出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'3P06出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'3P07出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'3P08出线柜' }, 
        { path:'connectBox_mini.gltf', type:'connectBox', name:'3P09联络柜' }
    ],
    [
        { path:'transformer_mini.gltf', type:'transformer', name:'1#变压器', mach_id:'H1_DS_DI_R1B1_1G03', marginRight:50 }, 
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'1P01进线柜' }, 
        { path:'capBox_mini.gltf', type:'capBox', name:'1P02电容柜' }, 
        { path:'capBox_mini.gltf', type:'capBox', name:'1P03电容柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1P04出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1P05出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1P06出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1P07出线柜' }, 
        { path:'eleBox_mini.gltf', type:'eleBox', name:'1P08考核柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1P09出线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'2P08出线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'2P07出线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'2P06出线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'2P05出线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'2P04出线柜' },
        { path:'capBox_mini.gltf', type:'capBox', name:'2P03电容柜' },
        { path:'capBox_mini.gltf', type:'capBox', name:'2P02电容柜' },
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'2P01进线柜', marginRight:50 },
        { path:'transformer_mini.gltf', type:'transformer', name:'2#变压器', mach_id:'H1_DS_DI_R1B1_1G04' }
    ],
    [
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G13出线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G12出线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G11出线柜' },
        { path:'eleBox_mini.gltf', type:'eleBox', name:'1G10计量柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G09出线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G08出线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G07出线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G06出线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G05出线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G04出线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G03出线柜' },
        { path:'eleBox_mini.gltf', type:'eleBox', name:'1G02计量柜' },
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'1G01进线柜', marginRight:100 },
        
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G24出线柜', key:'8G11', mach_id:'H1_DS_DI_R1B2_8G11' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G23出线柜', key:'8G10', mach_id:'H1_DS_DI_R1B2_8G10' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G22出线柜', key:'8G09', mach_id:'H1_DS_DI_R1B2_8G09' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G21出线柜', key:'8G08', mach_id:'H1_DS_DI_R1B2_8G08' },
        { path:'eleBox_mini.gltf', type:'eleBox', name:'1G20计量柜', key:'8G07' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G19出线柜', key:'8G06', mach_id:'H1_DS_DI_R1B2_8G06' },
        { path:'eleBox_mini.gltf', type:'eleBox', name:'1G18计量柜', key:'8G05' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G17出线柜', key:'8G04', mach_id:'H1_DS_DI_R1B2_8G04' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G16出线柜', key:'8G03', mach_id:'H1_DS_DI_R1B2_8G03' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G15出线柜', key:'8G02', mach_id:'H1_DS_DI_R1B2_8G02' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'1G14出线柜', key:'8G01', mach_id:'H1_DS_DI_R1B2_8G01' },
    ],
    [
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'4G01进线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'4G02出线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'4G03出线柜', marginRight:100 },
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'5G01进线柜'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'5G02出线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'5G03出线柜' },
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'6G01进线柜'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'6G02出线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'6G03出线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'6G04出线柜' },
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'7G01进线柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'7G02出线柜' },

    ]
];

export function layout(cacheModels, group, clickMeshs){
    modelList.forEach((row, i)=>{
        let distance = 0;
        row.forEach((item,j)=>{
            let model = cacheModels[item.path].clone();
            model.name = item.name;
            model.mach_id = item.mach_id;
            // console.log(model);
            // 获取每个模型的空间大小
            let box = new THREE.Box3();
            box.expandByObject(model);
            // console.log(box);
            var mWidth = box.max.x - box.min.x;
            var mDeep = box.max.z - box.min.z;
            var mHeight = box.max.y - box.min.y;
            model.height = mHeight;
            model.rotateY(Math.PI);
            model.position.set(distance, mHeight/2, i * -200);
            distance += mWidth + ( item.marginRight ? item.marginRight : 0);
            group.add(model);
            // 将group里的所有子Mesh都添加到clickMeshs，射线判定只能以mesh为单位
            if ( model.children && model.children.length ){
                model.children.forEach(mesh=>{
                    clickMeshs.push(mesh);
                })
            }
        })
    });
}
