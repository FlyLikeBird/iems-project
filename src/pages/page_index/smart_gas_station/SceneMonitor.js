import React, { useEffect ,useRef, useState } from 'react';
import { Spin } from 'antd';
import * as THREE from 'three';
import { OrbitControls } from 'three-orbitcontrols';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { fixObjectCenter, createGroundMesh, checkIsInRect, createInfoMesh, updateInfoMesh, deleteInfo } from '@/pages/utils/models';
import style from '@/pages/IndexPage.css';

let isRunning = false;
let frameTimer = null;
let isBack = false;
let attrTimer = null;

let airMachMaps = {
    '01#英格索兰200HP':'ACSUB0752XWS01',
    '02#巨风100HP':'ACSUB0752XWS02',
    '03#巨风50HP':'ACSUB0752XWS03',
    '05#阿特拉斯50HP':'ACSUB0752XWS05',
    '04#阿特拉斯50HP':'ACSUB0752XWS04'
};

let eleMachMaps = {
    '01#英格索兰200HP':'2037000303',
    '02#巨风100HP':'310810305701',
    '03#巨风50HP':'310810305702',
    '04#阿特拉斯50HP':'310810305703',
    '05#阿特拉斯50HP':'310810305704'
};


function SceneMonitor({ dispatch, isFulled, currentCompany, currentScene, sceneIndex }){
    const containerRef = useRef();
    const [loading, toggleLoading] = useState(true);
    function createScene(){
        
    }
    useEffect(()=>{
        var scene = new THREE.Scene();
        var grid = new THREE.GridHelper(5000, 100, 0x195582, 0x195582);
        grid.material.transparent = true;
        grid.material.opacity = 0.3;
        // grid.position.set(0,100,0);
        scene.add(grid);
        var container = containerRef.current;
        let width = containerRef.current.offsetWidth;
        let height = containerRef.current.offsetHeight;
        // var axisHelper = new THREE.AxisHelper(100);
        // scene.add(axisHelper);
        // 添加环境光
        scene.add(new THREE.AmbientLight(0xd9d9f8, 0.8));
        // 创建正面平行光源
        var direc1 = new THREE.DirectionalLight(0xececfc, 1);
        var direc2 = new THREE.DirectionalLight(0xececfc, 0.7);

        // 设置光源的方向：通过光源position属性和目标指向对象的position属性计算
        // direc1.position.set(-400, 400, 500);
        direc1.position.set(0, 300, 500);
        direc2.position.set(-100, 500, 500 );
        // direc2.castShadow = true;
        // direc2.shadow.camera.near = 200; //产生阴影的最近距离
        // direc2.shadow.camera.far = 1400; //产生阴影的最远距离
        // direc2.shadow.camera.left = -500; //产生阴影距离位置的最左边位置
        // direc2.shadow.camera.right = 500; //最右边
        // direc2.shadow.camera.top = 500; //最上边
        // direc2.shadow.camera.bottom = -500; //最下面
        // direc2.shadow.mapSize.width = 1024;
        // direc2.shadow.mapSize.height = 1024;
        // 方向光指向对象网格模型mesh2，可以不设置，默认的位置是0,0,0
        scene.add(direc1); 
        scene.add(direc2);
        // scene.add(new THREE.DirectionalLightHelper(direc1, 200));
        // scene.add(new THREE.DirectionalLightHelper(direc2, 200));
        // scene.add(new THREE.CameraHelper(direc2.shadow.camera));
        // 创建摄影机对象
        var camera = new THREE.PerspectiveCamera(60, width/height, 0.1, 4000); 
        camera.up.set(0,1,0);
        camera.position.set(0,180,1200); //设置相机位置
        camera.lookAt(scene.position); //设置相机方向(指向的场景对象)
        /**
         * 创建渲染器对象
         */
        var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(width, height);//设置渲染区域尺寸
        renderer.setClearColor(0x000000, 0);
        // renderer.shadowMap.enabled = true;
        // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement); //body元素中插入canvas对象
        let clickMeshs = [];
        var raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        // 所有模型的组合对象
        let group = new THREE.Group();
        //  将obj压缩成gltf格式;
        let dracoLoader = new DRACOLoader();
        let gltfLoader = new GLTFLoader();
        dracoLoader.setDecoderPath('/draco/gltf/');
        dracoLoader.setDecoderConfig({ type:'js' });
        dracoLoader.preload();
        gltfLoader.setDRACOLoader(dracoLoader);
        gltfLoader.load('/static/models/airStation_mini.gltf',gltf=>{
            // gltf.scene.rotateY(Math.PI/2);
            let modelGroup = new THREE.Group();
            let sumBox = fixObjectCenter(gltf.scene);
            modelGroup.add(gltf.scene);
            modelGroup.rotateY(-Math.PI/2);
            // console.log(gltf);
            // 优化模型材质，调整THREE.MeshPhysicalMaterial材质的金属度和粗糙度
            if ( gltf.scene.children && gltf.scene.children.length ){
                gltf.scene.children.forEach(obj=>{
                    if ( obj.type === 'Mesh' ) {
                        obj.material = new THREE.MeshPhysicalMaterial({
                            color:obj.material.color,
                            metalness:0.7,
                            roughness:0.5,
                            // emissive:obj.material.color,
                            // emissiveIntensity:0.2
                        });
                        // obj.castShadow = true;
                        // obj.receiveShadow = true;
                    } else if ( obj.type === 'Group' ) {
                        if ( obj.children && obj.children.length ) {
                            obj.children.forEach(mesh=>{
                                mesh.material = new THREE.MeshPhysicalMaterial({
                                    color:mesh.material.color,
                                    metalness:0.7,
                                    roughness:0.5,
                                    // emissive:mesh.material.color,
                                    // emissiveIntensity:0.2
                                });
                                // mesh.receiveShadow = true;
                                // mesh.castShadow = true;
                                clickMeshs.push(mesh);
                            });

                        }
                    }
                })
            }
            // let groundMesh = createGroundMesh(sumBox.max.x - sumBox.min.x + 100, sumBox.max.z - sumBox.min.z + 100);
            // modelGroup.add(groundMesh);
            group.add(modelGroup);
            scene.add(group);
            toggleLoading(false);
            animate();
            // render();
            // 记录变化后模型的坐标值
            attrTimer = setTimeout(()=>{
                if ( gltf.scene.children && gltf.scene.children.length ){
                    gltf.scene.children.forEach(obj=>{                
                        if ( obj.type === 'Group' ) {
                            let box = new THREE.Box3();
                            box.expandByObject(obj);
                            let width = box.max.x - box.min.x;
                            let height = box.max.y - box.min.y;
                            let deep = box.max.z - box.min.z;
                            let x = box.min.x + width/2;
                            let y = box.min.y + height;
                            let z= box.min.z + deep/2;
                            // console.log(box);
                            obj.centerPos = new THREE.Vector3(x, y, z);
                        }
                    })
                }
               
            },500)
        });
        // 
        let target = null;
        let prevTarget = null;
        
        let isEmpty = true;
        let isRunning = false;
        let infoMesh;

        function handleMouseOver(event){
            if ( !containerRef.current ) return;
            let boundingRect = containerRef.current.getBoundingClientRect();
            let pointX = event.clientX - boundingRect.left;
            let pointY = event.clientY - boundingRect.top;
            let width = containerRef.current.offsetWidth;
            let height = containerRef.current.offsetHeight;
            mouse.x = (pointX / width) * 2 - 1;
            mouse.y = -(pointY / height) * 2 + 1; 
            if ( checkIsInRect(pointX, pointY, boundingRect.width) ){  
                controls.autoRotate = false;       
                isRunning = false;
                window.cancelAnimationFrame(frameTimer);              
            } else {
                if ( !isRunning ){
                    // console.log('restart');
                    isRunning = true;
                    controls.autoRotate = true;
                    animate();
                }
                return ;
            }               
            raycaster.setFromCamera(mouse, camera);
            var intersects = raycaster.intersectObjects(clickMeshs);      
            if ( intersects.length ){
                isEmpty = false;
                target = group.children[0].children[0].children.filter(i=>i.uuid === intersects[0].object.parent.uuid )[0];            
                // console.log(target);
                // 判断target.centerPos是防止初始化还没加载好就生成信息模型而报错
                if ( target  && prevTarget !== target && target.centerPos ){
                    // 清除前一次生成的信息模块
                    if ( prevTarget ){
                        deleteInfo(group, prevTarget);
                    }     
                    // 判断是否已有信息模块
                    infoMesh = group.children.filter(i=>i.name === 'info')[0];
                    if ( !infoMesh ) {
                        // 查空压机相关数据
                        if ( airMachMaps[target.name] ){
                            // 查空压机关联的电表数据
                            if ( eleMachMaps[target.name] ) {
                                Promise.all([
                                    new Promise((resolve, reject)=>{
                                        dispatch({ type:'gasStation/fetchAirMachData', payload:{ mach_type:'gas', register_code:airMachMaps[target.name], resolve, reject }})
                                    }),
                                    new Promise((resolve, reject)=>{
                                        dispatch({ type:'gasStation/fetchAirMachData', payload:{ mach_type:'ele', register_code:eleMachMaps[target.name], resolve, reject }})
                                    })
                                ])
                                .then(([airData, eleData])=>{
                                    airData.ele = eleData.Iavb;
                                    group.add(createInfoMesh( target, false, airData, isBack, 'gas'));
                                    render();
                                })
                            } else {
                                new Promise((resolve, reject)=>{
                                    dispatch({ type:'gasStation/fetchAirMachData', payload:{ mach_type:'gas', register_code:airMachMaps[target.name], resolve, reject }})
                                })
                                .then((data)=>{
                                    group.add(createInfoMesh( target, false, data, isBack, 'gas'));
                                    render();
                                })
                            }
                        } else {
                            // group.add(createInfoMesh(target, false, {}, isBack, 'gas'));
                            // render();
                        }
                    } else {
                        // 更新定位数据和材质数据
                        if ( airMachMaps[target.name] ) {
                            if ( eleMachMaps[target.name] ) {
                                Promise.all([
                                    new Promise((resolve, reject)=>{
                                        dispatch({ type:'gasStation/fetchAirMachData', payload:{ mach_type:'gas', register_code:airMachMaps[target.name], resolve, reject }})
                                    }),
                                    new Promise((resolve, reject)=>{
                                        dispatch({ type:'gasStation/fetchAirMachData', payload:{ mach_type:'ele', register_code:eleMachMaps[target.name], resolve, reject }})
                                    })
                                ])
                                .then(([airData, eleData])=>{
                                    airData.ele = eleData.Iavb;
                                    updateInfoMesh(target, infoMesh, 'gas', airData, isBack, false);
                                    render();
                                })
                            } else {
                                new Promise((resolve, reject)=>{
                                    dispatch({ type:'gasStation/fetchAirMachData', payload:{ mach_type:'gas', register_code:airMachMaps[target.name], resolve, reject }})
                                })
                                .then((data)=>{
                                    updateInfoMesh(target, infoMesh, 'gas', data, isBack, false);
                                    render();
                                })
                            }
                            
                        } else {
                            // updateInfoMesh(target, infoMesh, 'gas', {}, isBack, false);
                            // render();
                        }
                    }
                }
                prevTarget = target;              
            } else {   
                // 离开模型区间时，清除当前生成的信息模块
                if ( !isEmpty ){
                    if ( target ){
                        deleteInfo(group, target);
                    }
                    prevTarget = null;
                    isEmpty = true;
                    render();
                }
            }
        }
        //执行渲染操作   指定场景、相机作为参数
        function render(){
            renderer.render(scene, camera);
        }
        function animate() {
            frameTimer = requestAnimationFrame( animate );         
            // // required if controls.enableDamping or controls.autoRotate are set to true
            controls.update();
            renderer.render( scene, camera );
        }
       
        var controls = new OrbitControls(camera, renderer.domElement);//创建控件对象
        //监听鼠标、键盘事件
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        // 顺时针方向，0 -- Math.PI/2 --- Math.PI --- -Math.PI --- -Math.PI/2 --- 0
        controls.addEventListener('change', ()=>{
            // 监听场景的翻转状态
            // console.log(controls.getAzimuthalAngle());
            let angle = controls.getAzimuthalAngle();
            if ( angle > -Math.PI/2 && angle < Math.PI /2 ) {
                isBack = false; 
            } else {
                isBack = true;
            }
            render();
        });
        window.addEventListener('mousemove', handleMouseOver);
        function handleResize(){
            // 重新设置相机宽高比例
            let width = containerRef.current.offsetWidth;
            let height = containerRef.current.offsetHeight;
            camera.aspect = width / height;
            // 更新相机投影矩阵
            camera.updateProjectionMatrix();
            // 重新设置渲染器渲染范围
            renderer.setSize(width, height);
        }
        window.addEventListener('resize', handleResize);
        return ()=>{
            clearTimeout(attrTimer);
            attrTimer = null;
            cancelAnimationFrame(frameTimer);
            frameTimer = null;
            window.removeEventListener('resize', handleResize);
        }
    },[]);
   
    return (
        <div style={{ overflow:'hidden', position:'absolute', top:'0', left:'0', width:'100%', height:'100%' }}>
            {
                loading
                ?
                <Spin className={style['spin']} size='large' tip='场景加载中，请稍后...' style={{ top:'40%' }} />
                :
                null
            }
            <div ref={containerRef} style={{ width:'100%', height:'100%' }}>
            
            </div>
        </div>
        
    )
}

function areEqual(prevProps, nextProps){
    if ( prevProps.currentScene !== nextProps.currentScene  ) {
        return false;
    } else {
        return true;
    }
}

export default React.memo(SceneMonitor, areEqual);
