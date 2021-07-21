import React, { useEffect ,useRef, useState } from 'react';
import { Spin } from 'antd';
import * as THREE from 'three';
// import { OrbitControls } from 'three-orbitcontrols';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import style from './monitorIndex.css';
console.log(THREE);
let frameTimer = null;
let timer = null;
let eventTimer = null;
let loadMesh = null;
let flipLock = false;
let autoRotateLock = false;
let motionLock = false;
let isFrontView = true;
let posTimer = null;
let canDrop = false;
let addEvent = false;
var machReg = /(\d+)_([a-zA-Z]+)/;
function fixObjectCenter(object){
    // 校正导入的group模型中心点s
    var box = new THREE.Box3();
    box.expandByObject(object);
    var mdlen = box.max.x - box.min.x;
    var mdwid = box.max.z - box.min.z;
    var mdhei = box.max.y - box.min.y;
    var x1 = box.min.x + mdlen / 2;
    // y轴设置比中心点上移50
    var y1 = box.min.y + 100;
    var z1 = box.min.z + mdwid / 2;
    // console.log(box);
    object.position.set(-x1, y1, -z1);
    // object.position.set(-x1,0,0);
    // 计算出xyz轴方向的缩放因子(group旋转后会影响到坐标轴);
    // let xRatio = 1/(Math.abs(box.max.x - box.min.x)/380);
    // let yRatio = 1/(Math.abs(box.max.y - box.min.y)/2/65);
    // let zRatio = 1/(Math.abs(box.max.z - box.min.z)/180);
    // console.log(yRatio);
    // transformerGroup.scale.set(xRatio,yRatio,1);
    // transformerGroup.translateY(Math.abs(box.max.y - box.min.y)/2*yRatio + 10);
    // scene.add(transformerGroup);
}
let textOption = {
    size: 14,
    height: 2,
    curveSegments: 12,
    bevelEnabled: false,
    bevelThickness: 10,
    bevelSize: 8,
    bevelSegments: 5
}
function createTextMesh(font, data, material){
    var textGeometry = new THREE.TextGeometry( `${data.title}${data.value ? ':' : ''}  ${data.value}`, {
        ...textOption,
        font
    } );
    var textMesh = new THREE.Mesh(textGeometry, material);
    return textMesh;
}

function createInfoMesh(render, parentMesh, posX, posY, posZ, isWarning, data, result){
    // 渲染信息框
    var group = new THREE.Group();
    let planeWidth = result ? 300 : 200;
    let planeHeight = 120
    var planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    // planeGeometry.attributes.uv.array = [0,1,1,0,0,0];
    // 生成canvas纹理
    var canvas = document.createElement("canvas");
    canvas.width = planeWidth;
    canvas.height = planeHeight;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = isWarning ? '#fd0606' : '#1286dd';
    ctx.fillRect(0,0,planeWidth,10);
    ctx.fillStyle = isWarning ? 'rgba(253,6,6,0.2)':'rgba(18,134, 221,0.2)';
    ctx.fillRect(0,10, planeWidth, planeHeight );
    // 标题下划线
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0,40, planeWidth, 1);
    ctx.fillStyle = '#fff';
    ctx.font = "14px Arial"; //字体样式设置
    ctx.textBaseline = "top"; //文本与fillText定义的纵坐标
    ctx.textAlign = "left"; //文本居中(以fillText定义的横坐标)
    
    let infoData;
    if ( isWarning ){
        // 告警状态
        infoData = [{ title:'告警类型', value:'温度越限'},{ title:'告警时间', value:'2021-06-16 18:00'}];
        infoData.forEach((item,index)=>{
            ctx.beginPath();
            ctx.fillText(`${item.title}: ${item.value}${item.unit}`, 10, 50 + 24 * index);
        });
    } else if ( result ) {
        // 标记了的设备
        ctx.fillText(result.input, 10, 20);
        infoData = [
            {title:'A相电流', value:Math.round(data.I1), unit:'A'},{ title:'    ', value:'', unit:''},{ title:'AB线电压', value:Math.round(data.U12), unit:'V'},
            {title:'B相电流', value:Math.round(data.I2), unit:'A'},{ title:'    ', value:'', unit:''},{ title:'BC线电压', value:Math.round(data.U23), unit:'V'},
            {title:'C相电流', value:Math.round(data.I3), unit:'A'},{ title:'    ', value:'', unit:''},{ title:'CA线电压', value:Math.round(data.U31), unit:'V'},
        ];
        let rowIndex = 0;
        for(let i=0;i<infoData.length;i+=3){
            ctx.beginPath();  
            ctx.fillStyle = rowIndex === 0 ? '#eff400' : rowIndex === 1 ? '#00ff00' : '#ff0000';
            ctx.fillText(`${infoData[i].title}:${infoData[i].value}${infoData[i].unit}${infoData[i+1].title}${infoData[i+2].title}:${infoData[i+2].value}${infoData[i+2].unit}`, 10, 50 + 24 * rowIndex);
            rowIndex++;
        }
    } else {
        // 未标记的设备
        ctx.fillText(parentMesh.name, 10, 20);
        infoData = [{ title:'温度', value:'48.3', unit:'℃'}, { title:'负荷', value:'84.18', unit:'%' }, { title:'风机', value:'开', unit:'' }];
        infoData.forEach((item,index)=>{
            ctx.beginPath();
            ctx.fillText(`${item.title}: ${item.value}${item.unit}`, 10, 50 + 24 * index);
        })
    }

    var texture = new THREE.CanvasTexture(canvas);
    var planeMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map:texture,
        side:THREE.DoubleSide
    });
    var planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.position.set(0, 200, 0);
    group.add(planeMesh);
    // console.log(planeGeometry);
    // 渲染底部连接线
    var vertices = new Float32Array([
        0, 0, 0, //顶点1坐标
        0,150,0
    ]);
    var lineGeometry = new THREE.BufferGeometry();
    lineGeometry.attributes.position = new THREE.BufferAttribute(vertices,3);
    var lineMeterial = new THREE.LineBasicMaterial({
        color:0x1286dd
    });
    var lineMesh = new THREE.Line(lineGeometry, lineMeterial);
    var circleShape = new THREE.Shape();
    circleShape.absarc(0,4,4,0,Math.PI * 2);
    var shapeGeometry = new THREE.ShapeGeometry(circleShape,25);
    var shapeMaterial = new THREE.MeshBasicMaterial({
        color:0x1286dd,
        side:THREE.DoubleSide
    });
    var shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
    group.add(lineMesh);
    group.add(shapeMesh);
    group.position.set(posX,posY,posZ);
    // group.rotateY(Math.PI);
    if ( !isFrontView ){
        parentMesh.isFlip = true;
        group.rotateY(Math.PI);
    }
    parentMesh.add(group);
    render();
}

var vertices = new Float32Array([
    -3000, 0, 0, //顶点1坐标
    3000,0, 0
  ]);
function createPlane(width, height){
    var planeGeometry = new THREE.PlaneGeometry(width, height);
    var material = new THREE.MeshBasicMaterial({
        color:0x00ff00
    });
    var planeMesh = new THREE.Mesh(planeGeometry, material);
    // planeMesh.position.set(0,-globalOffset,0);
    planeMesh.rotation.x = Math.PI / 2;
    return planeMesh;
}

function PowerRoomScene({ dispatch }){
    const containerRef = useRef();
    const [loading, toggleLoading] = useState(true);
    const loadingRef = useRef(true);
    useEffect(()=>{
        loadingRef.current = loading;
    },[loading])
    useEffect(()=>{
        var scene = new THREE.Scene();
        var dom = containerRef.current;
        let width = containerRef.current.offsetWidth;
        let height = containerRef.current.offsetHeight;
        var axisHelper = new THREE.AxisHelper(100);
        // scene.add(axisHelper);
        // 模型添加点击事件
        var raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        // 创建点光源
        var point = new THREE.PointLight(0xffffff,0.8);
        point.position.set(0, 400, 100); 
        scene.add(point);
        // 创建正面平行光源
        var directionalLight = new THREE.DirectionalLight(0x226890, 0.8);
        // 设置光源的方向：通过光源position属性和目标指向对象的position属性计算
        directionalLight.position.set(0, 300, 300);
        // 方向光指向对象网格模型mesh2，可以不设置，默认的位置是0,0,0
        scene.add(directionalLight); 
        // 创建背面光源
        var backLight = new THREE.DirectionalLight(0xffffff,0.4);
        backLight.position.set(0,300,-300);
        scene.add(backLight);
        // 创建摄影机对象
        var camera = new THREE.PerspectiveCamera(60, width/height, 0.1, 4000); 
        camera.up.set(0,1,0);
        camera.position.set(0,680,1000); //设置相机位置
        camera.lookAt(scene.position); //设置相机方向(指向的场景对象)
        /**
         * 创建渲染器对象
         */
        var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(width, height);//设置渲染区域尺寸
        renderer.setClearColor(0x000000, 0);
        
        dom.appendChild(renderer.domElement); //body元素中插入canvas对象
        //执行渲染操作   指定场景、相机作为参数
        render();
        function render(){
            // console.log(scene.rotation.y);
            // 限定y轴方向的偏移角度
            if ( scene.rotation.x >= Math.PI / 2 ) {
                scene.rotation.x = Math.PI / 2;
            }
            if ( scene.rotation.x <= -Math.PI / 2) {
                scene.rotation.x = -Math.PI / 2;
            }
            // 限定y轴方向的偏移角度
            if ( Math.abs(scene.rotation.y) >= Math.PI * 2  ) {
                scene.rotation.y = 0;
            }
            if ( Math.abs(scene.rotation.y) >= Math.PI /2 && !autoRotateLock ){
                autoRotateLock = true;
                isFrontView = false;
                clickMeshs.forEach(group=>{
                    if ( group.isShowing ) {
                        group.children.forEach(mesh=>{
                            if ( mesh.children && mesh.children.length ){
                                mesh.children[0].rotateY(Math.PI);
                            }
                        })
                    }
                });
            }
            if ( Math.abs(scene.rotation.y) < Math.PI / 2 && autoRotateLock ) {
                autoRotateLock = false;
                isFrontView = true;
                clickMeshs.forEach(group=>{
                    if ( group.isShowing ) {
                        group.children.forEach(mesh=>{
                            if ( mesh.children && mesh.children.length ){
                                mesh.children[0].rotateY(-Math.PI);
                            }
                        })
                    }
                });
            }
            renderer.render(scene, camera);
        }
        // var controls = new OrbitControls(camera, renderer.domElement);
        // controls.addEventListener('change', render); 
        
        function motion(){
            // console.log(scene.rotation.y);
            motionLock = true;
            scene.rotation.y += 0.001;
            render();
            frameTimer = requestAnimationFrame(motion);
        }
        let clickPosX = 0, clickPosY = 0;
        function handleMouseWheel(e){
            // e.stopPropagation();
            let target = scene.children.filter(i=>i.name === 'main-content')[0];
            if ( target ){
                if ( e.wheelDelta < 0 ){
                    let ratio = target.scale.x * 0.9;
                    target.scale.set(ratio, ratio, ratio);
                } else {
                    let ratio = target.scale.x * 1.1;
                    target.scale.set(ratio, ratio, ratio);
                }
                render();
            }
        }
        function handleMouseMove(e){
            if ( loadingRef.current ) return;
            if ( canDrop ) return;
            let boundingRect = renderer.domElement.getBoundingClientRect();
            let pointX = e.clientX - boundingRect.left;
            let pointY = e.clientY - boundingRect.top;
            let result = checkIsInRect(pointX, pointY, boundingRect);           
            if ( result ) {
                window.cancelAnimationFrame(frameTimer);
                motionLock = false;
                if ( !addEvent ){
                    addEvent = true;
                    window.addEventListener('mousewheel', handleMouseWheel);
                }
            } else {
                if ( !motionLock ) {
                    motion();
                }
                // 注销滚轮放大事件
                if ( addEvent ){
                    window.removeEventListener('mousewheel', handleMouseWheel);
                    addEvent = false;
                }
                // 离开操作区，关闭所有展开的信息框
                clickMeshs.forEach(group=>{
                    group.children.forEach(mesh=>{
                        if ( mesh.children && mesh.children.length ){
                            mesh.remove(mesh.children[0]);
                        }
                    });
                    group.isShowing = false;
                });
                render();
            }
        }
        
        function handleModelMouseMove(event){
            event.preventDefault();
            if ( canDrop ) return;
            let boundingRect = renderer.domElement.getBoundingClientRect();
            let pointX = event.clientX - boundingRect.left;
            let pointY = event.clientY - boundingRect.top;
            mouse.x = (pointX / width) * 2 - 1;
            mouse.y = -(pointY / height) * 2 + 1;            
            raycaster.setFromCamera(mouse, camera);
            // console.log(clickMeshs);
            var intersects = raycaster.intersectObjects(clickMeshs, true);            
            // console.log(intersects);
            if ( intersects.length ){
                let targetMesh = intersects[0].object;
                // console.log(targetMesh.parent.isShowing);
                // console.log(targetMesh.parent.uuid);
                // console.log(targetMesh);             
                if ( !targetMesh.parent.isShowing && targetMesh.name ) {
                    // console.log('a');
                    targetMesh.geometry.computeBoundingBox();
                    let box = targetMesh.geometry.boundingBox;
                    let posX = box.min.x + ( box.max.x - box.min.x ) / 2;
                    let posY = box.max.y;
                    let posZ = box.min.z + ( box.max.z - box.min.z )/ 2;
                    // console.log(posX,posY,posZ);
                    targetMesh.parent.isShowing = true;
                    let result = machReg.exec(targetMesh.name);
                    if ( result ) {
                        // 标记了的设备
                        new Promise((resolve, reject)=>{
                            dispatch({ type:'monitorIndex/fetchMachData', payload:{ register_code:result[1], mach_type:result[2], resolve, reject }})
                        })
                        .then(data=>{
                            createInfoMesh(render, targetMesh, posX, posY, posZ, false, data, result);     
                        })
                    } else {
                        createInfoMesh(render, targetMesh, posX, posY, posZ, false, null, null);     
                    }
                } 
                // console.log(targetMesh.parent.isShowing);
                clickMeshs.forEach(group=>{
                    // console.log(targetMesh.parent.uuid);
                    if ( group.uuid === targetMesh.parent.uuid ) return;
                    group.children.forEach(mesh=>{
                        if ( mesh.children && mesh.children.length ){
                            mesh.remove(mesh.children[0]);
                        }
                    });
                    group.isShowing = false;
                });
                render(); 

            }  
        }
        function handleMouseDown(e){
            clickPosX = e.clientX;
            clickPosY = e.clientY;
            canDrop = true;
        }
        function handleDrag(e){
            if ( !canDrop ) return;           
            posTimer = setTimeout(()=>{
                clickPosX = e.clientX;
                clickPosY = e.clientY;            
            },100);
            let offsetX = e.clientX - clickPosX;
            let offsetY = e.clientY - clickPosY;
            if ( Math.abs(offsetX) >= 10 ){
                if ( offsetX < 0 ){
                    scene.rotation.y = scene.rotation.y - 0.02  ;
                } else {
                    scene.rotation.y = scene.rotation.y + 0.02;
                }
                render();
            }
            if ( Math.abs(offsetY) >= 10 ){
                if ( offsetY < 0 ){
                    scene.rotation.x = scene.rotation.x - 0.02;
                } else {
                    scene.rotation.x = scene.rotation.x + 0.02;
                }
                render();
            } 
        }

        function handleMouseUp(e){
            canDrop = false;
        }
         let clickMeshs = [];
        //  将obj压缩成gltf格式;
        let dracoLoader = new DRACOLoader();
        let gltfLoader = new GLTFLoader();
        dracoLoader.setDecoderPath('/draco/gltf/');
        dracoLoader.setDecoderConfig({ type:'js' });
        dracoLoader.preload();
        gltfLoader.setDRACOLoader(dracoLoader);
        gltfLoader.load('/static/model/pr8/compress/pr8_mini.gltf',(gltf)=>{
            let object = gltf.scene;
            fixObjectCenter(object);
            object.name = 'main-content';
            scene.add(object);
            var grid = new THREE.GridHelper(5000, 100, 0x195582, 0x195582);
            grid.material.transparent = true;
            grid.material.opacity = 0.3;
            grid.position.set(0,100,0);
            scene.add(grid);
            if ( object.children.length ){
                object.children.forEach(i=>{
                    if (i.name === '门' ||  i.name === '外墙' ) return;
                    clickMeshs.push(i);                   
                })
            }
            motion();
            // render();
            toggleLoading(false);
        })
        
        
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleDrag);
        dom.addEventListener('mousemove', handleModelMouseMove);
        window.addEventListener('mousemove',handleMouseMove);
        return ()=>{
            window.cancelAnimationFrame(frameTimer);
            window.clearTimeout(eventTimer);
            window.clearTimeout(posTimer);
            dom.removeEventListener('mousemove', handleModelMouseMove);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleDrag);
            window.removeEventListener('mousewheel', handleMouseWheel);
            frameTimer = null;
            eventTimer = null;
            posTimer = null;
            flipLock = false;
            autoRotateLock = false;
            motionLock = false;
            isFrontView = true;
            canDrop = false;
            addEvent = false;
            // 清除模型上的所有信息数据
            clickMeshs.forEach(group=>{
                group.children.forEach(mesh=>{
                    if ( mesh.children && mesh.children.length ){
                        mesh.remove(mesh.children[0]);
                    }
                });
                group.isShowing = false;
            });
        }
    },[]);

    return (
        <div style={{ height:'100%'}}>
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

export default PowerRoomScene;

function checkIsInRect(pointX, pointY, rect){
    // 确定鼠标在模型区间内
    if ( pointX >= rect.width * 0.2 && pointX <= rect.width * 0.8 && pointY >= 0  ) {
        return true;
    } else {
        return false;
    }
}