import React, { useEffect ,useRef, useState } from 'react';
import { Spin } from 'antd';
import * as THREE from 'three';
import { OrbitControls } from 'three-orbitcontrols';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { createInfoMesh, updateInfoMesh, createGroundMesh, deleteInfo, checkIsInRect } from '@/pages/utils/models';
import { bindMaps } from './options/desai_new/bindMaps';
import style from './monitorIndex.css';

let machReg = /(\d+)_([a-zA-Z]+)/;
let frameTimer = null;
let isBack = false;
let pathMaps = {
    // 西文思
    '3':'feichuan',
    //  胜华电子(惠阳)有限公司
    '36':'shdz',
    // 德赛电池
    '38':'desai',
    '42':'desai_new'
}

var cacheModels = {

}

function getMachId(target){
    let result;
    if ( target.mach_id ) {
        result = target.mach_id;
    } else {
        let name = target.name.substring(0, 4);
        result = bindMaps[name] || bindMaps[name + '_1'];
    }
    return result;
}
function PowerRoomScene({ dispatch, currentCompany, currentScene, sceneIndex, fullscreen }){
    const containerRef = useRef();
    const [loading, toggleLoading] = useState(true);
    useEffect(()=>{
        let scene = new THREE.Scene();
        let grid = new THREE.GridHelper(5000, 100, 0x195582, 0x195582);
        grid.material.transparent = true;
        grid.material.opacity = 0.3;
        // grid.position.set(0,100,0);
        scene.add(grid);
        var container = containerRef.current;
        let width = containerRef.current.offsetWidth;
        let height = containerRef.current.offsetHeight;
        // var axisHelper = new THREE.AxisHelper(100);
        // scene.add(axisHelper);
        // scene.add(axisHelper);
        // 创建点光源
        var point = new THREE.PointLight(0xffffff,0.8);
        point.position.set(0, 400, 100); 
        scene.add(point);
        // 创建正面平行光源
        var directionalLight = new THREE.DirectionalLight(0x226890, 0.8);
        // 设置光源的方向：通过光源position属性和目标指向对象的position属性计算
        directionalLight.position.set(0, 300, 800);
        // 方向光指向对象网格模型mesh2，可以不设置，默认的位置是0,0,0
        scene.add(directionalLight); 
        // 创建背面光源
        var backLight = new THREE.DirectionalLight(0xffffff,0.4);
        backLight.position.set(0,300,-300);
        scene.add(backLight);
        // 创建摄影机对象
        let camera = new THREE.PerspectiveCamera(60, width/height, 0.1, 4000); 
        camera.up.set(0,1,0);
        camera.position.set(0,580,1400); //设置相机位置
        camera.lookAt(scene.position); //设置相机方向(指向的场景对象)
        /**
         * 创建渲染器对象
         */
        let renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(width, height);//设置渲染区域尺寸
        renderer.setClearColor(0x000000, 0);
        
        container.appendChild(renderer.domElement); //body元素中插入canvas对象
        //执行渲染操作   指定场景、相机作为参数
        function render(){
            renderer.render(scene, camera);
        }
        let clickMeshs = [];
        var raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        // 所有模型的组合对象
        let group = new THREE.Group();
        let allPromises = [] ;

        //  将obj压缩成gltf格式;
        let dracoLoader = new DRACOLoader();
        let gltfLoader = new GLTFLoader();
        dracoLoader.setDecoderPath('/draco/gltf/');
        dracoLoader.setDecoderConfig({ type:'js' });
        dracoLoader.preload();
        gltfLoader.setDRACOLoader(dracoLoader);
        let resourcePath = pathMaps[currentCompany.company_id];
        if ( resourcePath ){
            import(`./options/${resourcePath}/${sceneIndex}.js`)
            .then(module=>{
                let { loadModels, modelList, layout } = module;
                for( var i=0;i<loadModels.length;i++){
                    (function(item){
                        var promise = new Promise((resolve, reject)=>{
                            if ( !cacheModels[item.path] ) {
                                gltfLoader.load(`/static/models/${item.path}`,gltf=>{
                                    cacheModels[item.path] = gltf.scene.children[0];
                                    resolve();
                                })
                            } else {
                                resolve();
                            }
                        });
                        allPromises.push(promise);
                    })(loadModels[i])
                }
                Promise.all(allPromises)
                .then(()=>{
                    // console.log(cacheModels);
                    layout(cacheModels, group, clickMeshs); 
                    // console.log(group);  
                    if ( group.children && group.children.length ){
                        group.children.forEach(obj=>{                
                            if ( obj.type === 'Group' ) {
                                let box = new THREE.Box3();
                                box.expandByObject(obj);
                                let width = box.max.x - box.min.x;
                                let height = box.max.y - box.min.y;
                                let deep = box.max.z - box.min.z;
                                let x = box.min.x + width/2;
                                let y = box.min.y + height;
                                let z= box.min.z + deep/2;
                                obj.centerPos = new THREE.Vector3(x, y, z);
                            }
                        })
                    }    
                    // 计算总的模型盒子边界并使盒子X轴和Z轴方向居中
                    var groupBox = new THREE.Box3();
                    groupBox.expandByObject(group);
                    let groupWidth =  groupBox.max.x - groupBox.min.x;
                    let groupDeep = groupBox.max.z - groupBox.min.z;
                    group.position.set(-groupBox.min.x - groupWidth/2, 0, -groupBox.min.z-groupDeep/2);
                    // 创建地面模型
                    let groundMesh = createGroundMesh(groupWidth + 200, groupDeep + 200 );
                    scene.add(group);
                    scene.add(groundMesh);
                    // render();
                    animate();
                    toggleLoading(false);
                    // 添加鼠标移入
                    window.addEventListener('mousemove', handleMouseOver);
                });
            })
        } else {
            toggleLoading(false);
            render();
        }
        
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
            // console.log(width, height);
            mouse.x = (pointX / width) * 2 - 1;
            mouse.y = -(pointY / height) * 2 + 1; 
            // console.log(mouse.x, mouse.y);
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
                target = group.children.filter(i=>i.uuid === intersects[0].object.parent.uuid )[0];
                if ( target  && prevTarget !== target && target.centerPos ){
                    // 清除前一次生成的信息模块
                    if ( prevTarget ){
                        deleteInfo(group, prevTarget);
                    }     
                    infoMesh = group.children.filter(i=>i.name === 'info')[0];
                    if ( !infoMesh ){
                        let mach_id = target.mach_id || getMachId(target);
                        if ( mach_id ){
                            new Promise((resolve, reject)=>{
                                dispatch({ type:'monitorIndex/fetchMachData', payload:{ register_code:mach_id, resolve, reject }})
                            })
                            .then((data)=>{
                                group.add(createInfoMesh( target, false, data, isBack, 'ele'));
                                render();
                            })
                        } else {
                            // group.add(createInfoMesh(target, false, {}, isBack, 'ele'));
                            // render();
                        }
                    } else {
                        let mach_id = target.mach_id || getMachId(target);
                        if ( mach_id ) {
                            new Promise((resolve, reject)=>{
                                dispatch({ type:'monitorIndex/fetchMachData', payload:{ register_code:mach_id, resolve, reject }})
                            })
                            .then((data)=>{
                                updateInfoMesh(target, infoMesh, 'ele', data, isBack, false);
                                render();
                            })
                        } else {
                            // updateInfoMesh(target, infoMesh, 'ele', {}, isBack, false);
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
        })
        function animate() {
            frameTimer = requestAnimationFrame( animate );         
            // required if controls.enableDamping or controls.autoRotate are set to true
            controls.update();
            renderer.render( scene, camera );
        }
        function handleResize(){
            let width = containerRef.current.offsetWidth;
            let height = containerRef.current.offsetHeight;
            // 重新设置相机宽高比例
            camera.aspect = width / height;
            // 更新相机投影矩阵
            camera.updateProjectionMatrix();
            // 重新设置渲染器渲染范围
            renderer.setSize(width, height);
        }
        window.addEventListener('resize', handleResize);
        return ()=>{
            window.removeEventListener('mousemove', handleMouseOver);
            window.removeEventListener('resize', handleResize);
        }
    },[]);
   
    return (
        <div style={{ height:'100%', overflow:'hidden' }}>
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

export default React.memo(PowerRoomScene, areEqual);
