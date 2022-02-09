import * as THREE from 'three';
export var loadModels = [
    { path:'transformer_mini.gltf'}, 
    { path:'feedbackBox_mini.gltf'},
    { path:'capBox_mini.gltf'},
    { path:'inlineBox_mini.gltf'}, 
    { path:'eleBox_mini.gltf'},
    { path:'connectBox_mini.gltf'}
];
export var modelList = [
    [
        { path:'transformer_mini.gltf', type:'transformer', name:'7#变压器', mach_id:'3106084076' }, 
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'进线柜' },
        { path:'eleBox_mini.gltf', type:'eleBox', name:'发电柜' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜1' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜2' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜3' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜1'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜2'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜3'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜4'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜5'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜6'},
        { path:'connectBox_mini.gltf', type:'connectBox', name:'联络柜' },
    ],
    [
        { path:'transformer_mini.gltf', type:'transformer', name:'6#变压器', mach_id:'3106084073' }, 
        { path:'connectBox_mini.gltf', type:'connectBox', name:'联络柜1' },
        { path:'connectBox_mini.gltf', type:'connectBox', name:'联络柜2' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜1'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜2'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜3'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜4'},
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜1' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜2' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜3' },
        { path:'eleBox_mini.gltf', type:'eleBox', name:'发电柜' },
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'进线柜' }
    ],
    [
        { path:'transformer_mini.gltf', type:'transformer', name:'1#变压器', mach_id:'3106084074' }, 
        { path:'connectBox_mini.gltf', type:'connectBox', name:'联络柜1' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜1'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜2'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜3'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜4'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜5'},
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜1' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜2' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜3' },
        { path:'eleBox_mini.gltf', type:'eleBox', name:'发电柜' },
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'进线柜' }
    ],
    [
        { path:'transformer_mini.gltf', type:'transformer', name:'2#变压器', mach_id:'3106084078' }, 
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'进线柜' },
        { path:'eleBox_mini.gltf', type:'eleBox', name:'发电柜' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜1' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜2' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜3' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜1'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜2'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜3'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜4'},
    ],
    [
        { path:'transformer_mini.gltf', type:'transformer', name:'3#变压器', mach_id:'3106084082' }, 
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'进线柜1' },
        { path:'eleBox_mini.gltf', type:'eleBox', name:'发电柜' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜1' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜2' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜3' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜1'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜2'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜3'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜4'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜5'},
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'进线柜2' }
    ],
    [
        { path:'transformer_mini.gltf', type:'transformer', name:'4#变压器', mach_id:'3106084075' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜1'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜2'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜3'}, 
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜1' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜2' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜3' },
        { path:'eleBox_mini.gltf', type:'eleBox', name:'发电柜' },
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'进线柜1' }
    ],
    [
        { path:'transformer_mini.gltf', type:'transformer', name:'5#变压器', mach_id:'3107033180' }, 
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'进线柜1' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜1' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜2' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜3' },
        { path:'capBox_mini.gltf', type:'capBox', name:'电容柜4' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜1'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜2'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜3'},
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜4'},
        { path:'connectBox_mini.gltf', type:'connectBox', name:'联络柜1' },
        { path:'eleBox_mini.gltf', type:'eleBox', name:'发电柜' },
    ],
];

export function layout(cacheModels, group, clickMeshs){
    modelList.forEach(( row, index)=>{
        let distance = 0;
        row.forEach((item,j)=>{
            let model = cacheModels[item.path].clone();
            model.name = item.name;
            model.mach_id = item.mach_id;
            // 获取每个模型的空间大小
            let box = new THREE.Box3();
            box.expandByObject(model);
            // console.log(box);
            var mWidth = box.max.x - box.min.x;
            var mDeep = box.max.z - box.min.z;
            var mHeight = box.max.y - box.min.y;
            model.height = mHeight;
            model.rotateY(Math.PI);
            distance += mWidth;
            model.position.set( j === 0 ? 0 : distance, mHeight/2, index * -200 );
            group.add(model);
            // 将group里的所有子Mesh都添加到clickMeshs，射线判定只能以mesh为单位
            if ( model.children && model.children.length ){
                model.children.forEach(mesh=>{
                    clickMeshs.push(mesh);
                })
            }
        });
        
    });
}
