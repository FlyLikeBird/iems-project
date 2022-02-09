import * as THREE from 'three';
export var loadModels = [
    { path:'transformer_mini.gltf', name:'3#变压器'}, 
    { path:'inlineBox_mini.gltf', name:'进线柜'}, 
    { path:'feedbackBox_mini.gltf', name:'馈电柜'},
    { path:'capBox_mini.gltf', name:'电容柜'}
];
export var modelList = [
    { path:'transformer_mini.gltf', name:'3#变压器', mach_id:'3101067114' }, 
    { path:'inlineBox_mini.gltf', name:'进线柜'}, 
    { path:'feedbackBox_mini.gltf', name:'馈电柜1'},
    { path:'feedbackBox_mini.gltf', name:'馈电柜2'},
    { path:'feedbackBox_mini.gltf', name:'馈电柜3'},
    { path:'capBox_mini.gltf', name:'电容柜1' },
    { path:'capBox_mini.gltf', name:'电容柜2' }
];

export function layout(cacheModels, group, clickMeshs){
    let distance = 0;
    modelList.forEach((item,index)=>{
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
        distance += mWidth;
        model.height = mHeight;
        model.rotateY(Math.PI);
        model.position.set( index === 0 ? 0 : distance, mHeight/2, 0);
        group.add(model);
        // 将group里的所有子Mesh都添加到clickMeshs，射线判定只能以mesh为单位
        if ( model.children && model.children.length ){
            model.children.forEach(mesh=>{
                clickMeshs.push(mesh);
            })
        }
    });
}
