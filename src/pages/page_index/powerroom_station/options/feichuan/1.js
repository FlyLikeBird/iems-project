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
        { posX:0, posZ:0, direc:'right', path:'connectBox_mini.gltf', type:'connectBox', name:'联络柜' },
        { posX:0, posZ:0, direc:'right', path:'inlineBox_mini.gltf', type:'inlineBox', name:'进线柜' },
        { posX:0, posZ:0, direc:'right', path:'capBox_mini.gltf', type:'capBox', name:'电容柜' },
        { posX:0, posZ:0, direc:'right', path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜1'},
        { posX:0, posZ:0, direc:'right', path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜2'},
    ],
    [
        { posX:150, posZ:-300, direc:'front', path:'connectBox_mini.gltf', type:'connectBox', name:'联络柜1' },
        { posX:150, posZ:-300, direc:'front', path:'inlineBox_mini.gltf', type:'inlineBox', name:'进线柜1' },
        { posX:150, posZ:-300, direc:'front', path:'capBox_mini.gltf', type:'capBox', name:'电容柜1' },
        { posX:150, posZ:-300, direc:'front', path:'capBox_mini.gltf', type:'capBox', name:'电容柜2' },
        { posX:150, posZ:-300, direc:'front', path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜1'},
        { posX:150, posZ:-300, direc:'front', path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜2'},
        { posX:150, posZ:-300, direc:'front', path:'connectBox_mini.gltf', type:'connectBox', name:'联络柜2' },
        { posX:150, posZ:-300, direc:'front', path:'connectBox_mini.gltf', type:'connectBox', name:'联络柜3' },
        { posX:150, posZ:-300, direc:'front', path:'inlineBox_mini.gltf', type:'inlineBox', name:'进线柜2' },
        { posX:150, posZ:-300, direc:'front', path:'capBox_mini.gltf', type:'capBox', name:'电容柜3' },
        { posX:150, posZ:-300, direc:'front', path:'capBox_mini.gltf', type:'capBox', name:'电容柜4' },
        { posX:150, posZ:-300, direc:'front', path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜3'},
        { posX:150, posZ:-300, direc:'front', path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜4'}
    ],
    [
        { posX:180, posZ:100, path:'transformer_mini.gltf', type:'transformer', name:'3#变压器', mach_id:'3005100607' },
    ],
    [
        { posX:400, posZ:50, path:'transformer_mini.gltf', type:'transformer', name:'1#变压器', mach_id:'3005100608' },
    ],
    [
        { posX:1000, posZ:50, path:'transformer_mini.gltf', type:'transformer', name:'2#变压器', mach_id:'3003023585' },
    ],
    [
        { posX:550, posZ:50, path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜1'},
        { posX:550, posZ:50, path:'feedbackBox_mini.gltf', type:'feedbackBox', name:'馈电柜2'},
        { posX:550, posZ:50, path:'capBox_mini.gltf', type:'capBox', name:'电容柜' },
        { posX:550, posZ:50, path:'inlineBox_mini.gltf', type:'inlineBox', name:'进线柜' },
        { posX:550, posZ:50, path:'connectBox_mini.gltf', type:'connectBox', name:'联络柜' }
    ]
];

export function layout(cacheModels, group, clickMeshs){
    modelList.forEach(( row, index)=>{
        let distance = 0;
        row.forEach((item,j)=>{
            let model = cacheModels[item.path].clone();
            model.name = item.name;
            model.mach_id = item.mach_id;
            if ( item.direc === 'right') {
                model.rotateY(-Math.PI/2);
            } else if ( item.direc === 'front'){
                model.rotateY(Math.PI);
            }
            // 获取每个模型的空间大小
            let box = new THREE.Box3();
            box.expandByObject(model);
            var mWidth = box.max.x - box.min.x;
            var mDeep = box.max.z - box.min.z;
            var mHeight = box.max.y - box.min.y;
            model.height = mHeight;
            if ( item.direc === 'right' ){
                model.position.set( item.posX , mHeight/2, -distance + item.posZ);
            } else {
                model.position.set( item.posX + distance, mHeight/2, item.posZ );
            }
            distance += item.direc === 'right' ? mDeep : mWidth;
            group.add(model);
            // // 将group里的所有子Mesh都添加到clickMeshs，射线判定只能以mesh为单位
            if ( model.children && model.children.length ){
                model.children.forEach(mesh=>{
                    clickMeshs.push(mesh);
                })
            }
        });
        
    });
    
}
// rotate会影响box的计算结果,不影响position坐标轴
// let geometry = new THREE.BoxGeometry(100,30,10);
// var mtl = new THREE.MeshBasicMaterial({ color:0x0000ff });
// let mesh = new THREE.Mesh(geometry, mtl);
// let box = new THREE.Box3();
// mesh.rotateY(Math.PI/2);
// box.expandByObject(mesh);
// console.log(box);
// mesh.position.set(0,0,100);
// group.add(mesh);
