import { Node, Rect, Point, Direction } from '@topology/core';
export function myShape(ctx, node){
    ctx.beginPath();
    ctx.arc(node.rect.x + node.rect.width / 2, node.rect.y + node.rect.height / 2, 50,0,Math.PI * 2);
    (node.fillStyle || node.bkType) && ctx.fill();
    ctx.strokeStyle='blue';
    ctx.stroke();
}

export function myAnchors(node) {
    node.anchors.push(new Point(node.rect.x, node.rect.y + node.rect.height / 2, Direction.Left));
    node.anchors.push(new Point(node.rect.x + node.rect.width / 2, node.rect.y, Direction.Up));
    node.anchors.push(new Point(node.rect.x + node.rect.width, node.rect.y + node.rect.height / 2, Direction.Right));
    node.anchors.push(new Point(node.rect.x + node.rect.width / 2, node.rect.y + node.rect.height, Direction.Bottom));
    // demo，其他自定义锚点。这里只是示例。
    for (let i = 10; i < 360; i += 10) {
      if (i % 90 === 0) {
        continue;
      }
      const direction = Math.floor(i / 90);
      const pt = new Point(
        node.rect.center.x + (Math.sin((i / 180) * Math.PI) * node.rect.width) / 2,
        node.rect.center.y + (Math.cos((i / 180) * Math.PI) * node.rect.height) / 2,
        direction
      );
      pt.hidden = true;
      node.anchors.push(pt);
    }
  }

export function myIconRect(node){
    node.iconRect = new Rect(node.rect.x, node.rect.y+10, node.rect.width, (node.rect.height*2)/3 -20);
    node.fullIconRect = node.rect;
}

export function myTextRect(node){
    node.textRect = new Rect(node.rect.x + 10, node.rect.y + (node.rect.height*2)/3, node.rect.width - 20, node.rect.height / 3 - 5)
    node.fullTextRect = node.rect;
}

export function drawRoundRect(ctx, x, y, width, height, radius, data){
    // 左上角
    ctx.beginPath();
    ctx.textAlign = 'start';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.translate(x,y);
    ctx.arc(width - radius, height - radius, radius, 0, Math.PI / 2);
    ctx.lineTo(radius, height);
    ctx.arc(radius, height - radius, radius, Math.PI /2, Math.PI);
    ctx.lineTo(0, radius);
    ctx.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2);
    ctx.lineTo(width - radius, 0);
    ctx.arc(width - radius, radius, radius, Math.PI * 3 /2, Math.PI * 2);
    ctx.lineTo(width, height - radius);
    ctx.closePath();
    ctx.fillStyle = '#5399fa';
    ctx.strokeStyle = '#1555ae';
    ctx.fill();
    // ctx.stroke();
    // 绘制数据
    if ( data && data.length ){
        data.forEach((item, index)=>{
            let yPos = 30 * index;
            ctx.beginPath();
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'start';
            ctx.fillText( item.unit === 'PF' ? (+item.value).toFixed(2) : Math.floor(item.value), 6, yPos + 15);
            ctx.beginPath();
            ctx.fillStyle = '#b3dfe7';
            ctx.font = '12px Arial';
            ctx.textAlign = 'end';
            ctx.fillText( item.unit, width - 6, yPos + 15);
            if ( index === 0 ) return;
            ctx.beginPath();
            ctx.strokeStyle = '#ecf7ff';
            ctx.moveTo(0, yPos);
            ctx.lineTo(width, yPos);
            ctx.lineWidth = 0.5;
            ctx.stroke();
        })
    }
    ctx.restore();
}

export function drawRoundRect2(ctx, x, width, height, radius, data){
    // 左上角
    ctx.beginPath();
    ctx.textAlign = 'start';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.translate(x,0);
    ctx.arc(width - radius, height - radius, radius, 0, Math.PI / 2);
    ctx.lineTo(radius, height);
    ctx.arc(radius, height - radius, radius, Math.PI /2, Math.PI);
    ctx.lineTo(0, radius);
    ctx.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2);
    ctx.lineTo(width - radius, 0);
    ctx.arc(width - radius, radius, radius, Math.PI * 3 /2, Math.PI * 2);
    ctx.lineTo(width, height - radius);
    ctx.closePath();
    ctx.fillStyle = '#5399fa';
    ctx.strokeStyle = '#1555ae';
    ctx.fill();
    // ctx.stroke();
    // 绘制数据
    if ( data && data.length ){
        data.forEach((item, index)=>{
            let yPos = 30 * index;
            ctx.beginPath();
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'start';
            ctx.fillText( item.unit === 'PF' ? (+item.value).toFixed(2) : Math.floor(item.value), 6, yPos + 15);
            ctx.beginPath();
            ctx.fillStyle = '#b3dfe7';
            ctx.font = '12px Arial';
            ctx.textAlign = 'end';
            ctx.fillText( item.unit, width - 6, yPos + 15);
            if ( index === 0 ) return;
            ctx.beginPath();
            ctx.strokeStyle = '#ecf7ff';
            ctx.moveTo(0, yPos);
            ctx.lineTo(width, yPos);
            ctx.lineWidth = 0.5;
            ctx.stroke();
        })
    }
    ctx.restore();
}