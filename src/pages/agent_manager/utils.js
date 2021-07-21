async function fetchProvince(code, properties = {}){
    let { data } = await getGeoJson({ code });
    if ( properties.level === 'city') {
        return ;
    }
    let result = new Blob([JSON.stringify(data)], { type:'text/json'});
    let e = document.createEvent('MouseEvents');
    let a = document.createElement('a');
    a.download = code === '100000_full' ? '100000' : properties.adcode + '.json';
    a.href = window.URL.createObjectURL(result);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
	e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
    // 统计是否有重复adcode
    // if ( !mapData[properties.adcode]){
    //     mapData[properties.adcode] = 0;
    // } else {
    //     mapData[properties.adcode] = ++mapData[properties.adcode]
    // }
    if ( properties.name === '台湾省' 
        || properties.name === '北京市'
        || properties.name === '上海市'
        || properties.name === '天津市'
        || properties.name === '重庆市'
    ){
        return;
    }
    if ( code === '100000_full' || ( properties.level === 'province'  && data && data.type && data.type === 'FeatureCollection' )){
        data.features.map((item)=>{
            // 直辖市相当于省，下面行政单位是区
            fetchProvince(item.properties.adcode + '_full', item.properties ); 
        })  
    }
}