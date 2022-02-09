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
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'5P01进线柜' }, 
        { path:'capBox_mini.gltf', type:'capBox', name:'5P02电容柜' }, 
        { path:'capBox_mini.gltf', type:'capBox', name:'5P03电容柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'5P04出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'5P05出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'5P06出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'5P07出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'5P08出线柜' }, 
        { path:'connectBox_mini.gltf', type:'connectBox', name:'5P09联络柜' }, 
    ],
    [
        { path:'connectBox_mini.gltf', type:'connectBox', name:'6P09联络柜' },
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'6P08出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'6P07出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'6P06出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'6P05出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'6P04出线柜' }, 
        { path:'capBox_mini.gltf', type:'capBox', name:'6P03电容柜' }, 
        { path:'capBox_mini.gltf', type:'capBox', name:'6P02电容柜' }, 
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'6P01进线柜' }, 
    ],
    [
        { path:'transformer_mini.gltf', type:'transformer', name:'5#变压器', mach_id:'H1_DS_DI_R4B1_2G02', marginRight:120 }, 
        { path:'transformer_mini.gltf', type:'transformer', name:'6#变压器', mach_id:'H1_DS_DI_R4B1_2G03', marginRight:120 }, 
        { path:'inlineBox_mini.gltf', type:'inlineBox', name:'2G01进线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'2G02出线柜' }, 
        { path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'2G03出线柜' }, 
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
