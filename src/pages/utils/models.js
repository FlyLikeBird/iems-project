import * as THREE from 'three';

export function fixObjectCenter(object){
    // 校正导入的group模型中心点
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
    // object.position.set(-x1, y1, -z1);
    object.position.set(-x1,0,-z1);
    // object.position.set(-x1,0,0);
    // 计算出xyz轴方向的缩放因子(group旋转后会影响到坐标轴);
    // let xRatio = 1/(Math.abs(box.max.x - box.min.x)/380);
    // let yRatio = 1/(Math.abs(box.max.y - box.min.y)/2/65);
    // let zRatio = 1/(Math.abs(box.max.z - box.min.z)/180);
    // console.log(yRatio);
    // transformerGroup.scale.set(xRatio,yRatio,1);
    // transformerGroup.translateY(Math.abs(box.max.y - box.min.y)/2*yRatio + 10);
    // scene.add(transformerGroup);
    return box;
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


export function updateInfoMesh(target, infoMesh, mach_type, data, isBack, isWarning ){
    infoMesh.visible = true;
    infoMesh.children[2].material.map = createCanvasTexture( target, mach_type, data, isWarning);
    infoMesh.position.set(target.centerPos.x, target.centerPos.y, target.centerPos.z );
    if ( isBack ) {
        if ( !infoMesh.children[2].backup ) {
            infoMesh.children[2].rotateY(Math.PI);
            infoMesh.children[2].backup = true;
        }
    } else {
        if ( infoMesh.children[2].backup ) {
            infoMesh.children[2].rotateY(-Math.PI);
            infoMesh.children[2].backup = false;
        }
    }
}

function createCanvasTexture( target, mach_type, data, isWarning){
    // 生成canvas纹理
    let planeWidth = 340;
    let planeHeight = mach_type === 'ele' ? 160 : 200 ;
    var canvas = document.createElement("canvas");
    canvas.width = planeWidth;
    canvas.height = planeHeight;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, planeWidth, planeHeight);
    ctx.fillStyle = isWarning ? '#fd0606' : '#1286dd';
    ctx.fillRect(0,0,planeWidth, 30);
    ctx.fillStyle = isWarning ? 'rgba(253,6,6,0.05)':'rgba(18,134, 221,0.05)';
    ctx.fillRect(0,10, planeWidth, planeHeight );
    ctx.strokeStyle = isWarning ? '#fd0606' : '#1286dd';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, planeWidth, planeHeight);
    // 标题下划线
    ctx.fillStyle = '#fff';
    ctx.font = "14px Arial"; //字体样式设置
    ctx.textBaseline = "top"; //文本与fillText定义的纵坐标
    ctx.textAlign = "left"; //文本居中(以fillText定义的横坐标)
    ctx.fillText(target.name, 10, 10);
    let infoData;
    if ( isWarning ){
        // 告警状态
        infoData = [{ title:'告警类型', value:'温度越限'},{ title:'告警时间', value:'2021-06-16 18:00'}];
        infoData.forEach((item,index)=>{
            ctx.beginPath();
            ctx.fillText(`${item.title} : ${item.value}${item.unit}`, 10, 50 + 24 * index);
        });
    } else if ( mach_type === 'ele') {
        // 标记了的设备
        infoData = [
            {title:'A相电流', value: data.I1 ? Math.round(data.I1) : '-- --', unit:'A'}, { title:'AB线电压', value: data.U12 ? Math.round(data.U12) : '-- --', unit:'V'},
            {title:'B相电流', value: data.I2 ? Math.round(data.I2) : '-- --', unit:'A'}, { title:'BC线电压', value: data.U23 ? Math.round(data.U23) : '-- --', unit:'V'},
            {title:'C相电流', value: data.I3 ? Math.round(data.I3) : '-- --', unit:'A'}, { title:'CA线电压', value: data.U31 ? Math.round(data.U31) : '-- --', unit:'V'},
        ];
        let rowIndex = 0;
        for(let i=0;i<infoData.length;i+=2){
            ctx.beginPath();  
            ctx.fillStyle = rowIndex === 0 ? '#eff400' : rowIndex === 1 ? '#00ff00' : '#ff0000';
            ctx.fillText(`${infoData[i].title} : ${infoData[i].value} ${infoData[i].unit}`, 10, 60 + 24 * rowIndex);
            ctx.fillText(`${infoData[i+1].title} : ${infoData[i+1].value} ${infoData[i+1].unit}`, 180, 60 + 24 * rowIndex);
            rowIndex++;
        }
    } else if ( mach_type === 'gas' ) {
        if ( Object.keys(data).length ) {
            infoData = [
                {title:'运行状态', value: data.is_running === 0 ? '停机' : '运行', unit:'', warningStatus:data.is_running === 0 ? true : false }, { title:'加载状态', value: data.is_loading === 0 ? '卸载' : '加载', unit:'', warningStatus:data.is_loading === 0 ? true : false },
                {title:'远程状态', value: data.is_remote === 0 ? '本地' : '远程', unit:''}, { title:'自动状态', value: data.is_auto === 0 ? '手动' : '自动', unit:''},
                {title:'加载率', value: data.run_time ? (data.load_time/data.run_time * 100).toFixed(1) : '-- --', unit:'%'}, { title:'实时电流', value: data.ele ?  (+data.ele).toFixed(2) : '-- --', unit:'A'},
                {title:'加载压力', value: data.loading ? (data.loading/10).toFixed(1) : '-- --', unit:'bar'}, { title:'卸载压力', value: data.unloading ? (data.unloading/10).toFixed(1) : '-- --', unit:'bar'},
                {title:'机组排气压力', value: data.grp_air_out ? (data.grp_air_out/10).toFixed(1) : '-- --', unit:'bar'}, { title:'主机排气温度 ', value: data.main_tmp_out ? Math.round(data.main_tmp_out/10) : '-- --', unit:'℃'},
                {title:'加载时间', value:data.load_time ? data.load_time : 0, unit:'小时'}, {title:'启动次数', value: data.startCnt || 0, unit:'次'}

            ];
            let rowIndex = 0;
            for(let i=0;i<infoData.length;i+=2){
                ctx.beginPath();
                ctx.fillStyle = infoData[i].warningStatus ? '#ff0000' : '#00ff00';
                ctx.fillText(`${infoData[i].title} : ${infoData[i].value} ${infoData[i].unit}`, 10, 50 + 24 * rowIndex);
                ctx.fillStyle = infoData[i+1].warningStatus ? '#ff0000' : '#00ff00';
                ctx.fillText(`${infoData[i+1].title} : ${infoData[i+1].value} ${infoData[i+1].unit}`, 180, 50 + 24 * rowIndex);
                rowIndex++;
            }
        }
    }
    return new THREE.CanvasTexture(canvas);    
}

export function createInfoMesh( target, isWarning, data, isBack, mach_type ){
    // 渲染信息框
    target.isShowing = true;
    var group = new THREE.Group();
    group.name = 'info';
    let planeWidth = 340;
    let planeHeight = mach_type === 'ele' ? 160 : 200 ;
    var planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    var canvasTexture = createCanvasTexture(target, mach_type, data, isWarning);
    var planeMaterial = new THREE.MeshBasicMaterial({
        transparent:true,
        map:canvasTexture,
        side:THREE.DoubleSide
    });
    planeMaterial.map.needsUpdate = true;
    var planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    // 渲染底部连接线
    var vertices = new Float32Array([
        0, 0, 0, //顶点1坐标
        0,150,0
    ]);
    var lineGeometry = new THREE.BufferGeometry();
    lineGeometry.attributes.position = new THREE.BufferAttribute(vertices,3);
    var lineMeterial = new THREE.LineBasicMaterial({
        color: isWarning ? 0xfd0606 : 0x1286dd
    });
    var lineMesh = new THREE.Line(lineGeometry, lineMeterial);
    // 绘制底部的三角形
    // var circleShape = new THREE.Shape();
    // circleShape.absarc(0,6,6,0,Math.PI * 2);
    // var shapeGeometry = new THREE.ShapeGeometry(circleShape,25);
    var shapeMaterial = new THREE.MeshBasicMaterial({
        color: isWarning ? 0xfd0606 : 0x1286dd,
        side:THREE.DoubleSide
    });
    var points = [new THREE.Vector2(0, 0), new THREE.Vector2(10, 10), new THREE.Vector2(-10, 10)];
    var triangleShape = new THREE.Shape(points);
    var shapeGeometry = new THREE.ShapeGeometry(triangleShape, 30);
    var shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
    // var ballGeometry = new THREE.SphereGeometry(5, 60, 60)
    // var ballMtl = new THREE.MeshLambertMaterial({
    //     color:0x1286dd
    // });
    // var ballMesh = new THREE.Mesh(ballGeometry, ballMtl);
    // ballMesh.position.set(0,5,0);
    planeMesh.position.set(0, 150 + planeHeight/2, 0);
    if ( isBack ){
        planeMesh.backup = true;
        planeMesh.rotateY(Math.PI);
    } 
    group.add(lineMesh);
    group.add(shapeMesh);
    group.add(planeMesh);
    // group.position.set(target.position.x, target.height, target.position.z);
    group.position.set(target.centerPos.x, target.centerPos.y, target.centerPos.z);
    return group;
}

// 创建地面模型
export function createGroundMesh(width, height){    
    var geometry = new THREE.BoxGeometry( width, 5, height );
    var material = new THREE.MeshPhysicalMaterial({
        transparent:true,
        opacity:0.8,
        // color:0xccdde8,
        color:0x1a73b6,
        metalness:1,
        roughness:1
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    return mesh;
}
// 删除InfoMesh
export function deleteInfo( group, target){
    // 考虑到group的层级下有可能有嵌套的group模型
    // if ( group.children[0].name === 'row' ) {
    //     group.children.forEach(row=>{
    //         row.children.forEach(item=>{
    //             if ( item.uuid === target.uuid ){
    //                 item.isShowing = false;
    //             }
    //         })
    //     });
    // } else {
        // modelGroup.children.forEach(item=>{
        //     if ( item.uuid === target.uuid ){
        //         item.isShowing = false;
        //     } 
        // })
    // }
    if ( group.children && group.children.length ){
        group.children.forEach(item=>{
            if ( item.name === 'info') {
                item.visible = false;
            }
        })
    }
}

export function checkIsInRect(pointX, pointY, width){
    // 确定鼠标在模型区间内
    if ( pointX >= width * 0.2 && pointX <= width * 0.8 && pointY >= 0  ) {
        return true;
    } else {
        return false;
    }
}