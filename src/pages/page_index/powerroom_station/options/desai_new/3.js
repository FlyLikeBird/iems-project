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
        { path:'transformer_mini.gltf', type:'transformer', name:'8#变压器', mach_id:'H1_DS_DI_R5B1_3G03', marginRight:50 },
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'8P01进线柜' }, 
        { path:'capBox_mini.gltf', type:'capBox', name:'8P02电容柜' }, 
        { path:'capBox_mini.gltf', type:'capBox', name:'8P03电容柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'8P04出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'8P05出线柜' }, 
        { path:'capBox_mini.gltf', type:'capBox', name:'8P06电容柜' }, 
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'8P07进线柜' }, 
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'8P08进线柜' }, 
        { path:'connectBox_mini.gltf', type:'connectBox', name:'7P09联络柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'7P08出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'7P07出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'7P06出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'7P05出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'7P04出线柜' }, 
        { path:'capBox_mini.gltf', type:'capBox', name:'7P03电容柜' }, 
        { path:'capBox_mini.gltf', type:'capBox', name:'7P02电容柜' }, 
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'7P01进线柜', marginRight:50 }, 
        { path:'transformer_mini.gltf', type:'transformer', name:'7#变压器', mach_id:'H1_DS_DI_R5B1_3G02', marginRight:50 },
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'3G01进线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'3G02出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'3G03出线柜' }, 
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
