/**
 * google map 工具类
 * @static
 * @author liujianchuan
 * @date   2014.10.16   
 */
define(["infobox"], function(InfoBox){
	var GMapUtils = {
        /**
         * @public
		 * @method init 初始化地图
         * @param  {string} containerid  传入容器id，用于渲染地图
		 * @param  {object} opt   地图属性
		 */
		map:null,
		init:function(containerid, opt){
			var me = this;
			if(window["google"]&&google.maps){
				me.initMap(containerid,opt);
			}else{
				window.googleMapCbFun = function(){
					me.initMap(containerid,opt);
				}
				$.getScript('http://maps.google.cn/maps/api/js?libraries=geometry&sensor=false&key=AIzaSyDuVPF7CxcYsNQhLlwCbTMgThoUl0UQHhg&callback=googleMapCbFun');
			}
		},
		initMap:function(containerid, opt){
			var me = this,
				lat = 39.92, lng = 116.46,
				myOptions = {
					center: myLatlng
				},
				myLatlng = new google.maps.LatLng(lat, lng);
			$.extend(myOptions,opt||{});
			this.map = new google.maps.Map(document.getElementById(containerid), myOptions);
			this.map.markers = this.map.markers || [];
			this.map.lines = this.map.lines || [];
			this.map.polygon = this.map.polygon || [];
			this.getInfoBox();
		},
		getInfoBox:function(){
			var me = this;
			if(!this.infoBox){
				me.infoBox = InfoBox;
				$(me).trigger("mapalready");
				me.mapstatus = "yes";
			}
		},
		getStatus:function(){
			var me = this;
			if(!me.mapstatus){
				return false;
			}else{
				return true;
			}
		},
		/**
		 * @method setMap 修改当前操作的map
		 */
		setMap:function(map){
			this.map = map;
			this.map.markers = this.map.markers || [];
			this.map.lines = this.map.lines || [];
			this.map.polygon = this.map.polygon || [];
			this.getInfoBox();

		},
		/**
		 * @method getMap 获取操作的map
		 */
		getMap:function(){
			return this.map;
		},
        /**
		 * @method createLatLng 创建经纬度对象
         * @param  {object}   opt.lat   经度
         * @param  {object}   opt.lng   纬度
		 */
        createLatLng:function(opt){
			return new google.maps.LatLng(opt.lat-0, opt.lng-0);
		},
		/**
		 * @method addMarker
		 * @param  {object} opt  传入参数
		 * @param  {number} opt.lat   经度
		 * @param  {number} opt.lng   纬度
		 * @param  {object} opt.icon   图片的参数
		 * @param  {string} opt.icon.url   图片地址
		 * @param  {object} opt.icon.point 点得参数 里面包含x,y 图片组件的横纵坐标
		 * @param  {object} opt.icon.size  图片大小 里面包含w,h
		 * @example
		 * {
	            lat:27.3,
	            lng:39.2,
	            icon:{
	                url:"",
	                point:{
	                    x:0,
	                    y:0
	                },
	                size:{
	                    w:18,
	                    h:18
	                }
	            }
	        }
		 */
		addMarker:function(opt){
			var marker,
			latlng = this.createLatLng(opt),
			markerOpt = {
				position:latlng,
				map:this.map
			};
			opt.icon&&$.extend(markerOpt,{
				icon:this.getIcon(opt.icon)
			});
			marker = new google.maps.Marker(markerOpt);
			this.map.markers.push(marker);

			return marker;
		},
		createInfoWindow:function(opt){
			return new google.maps.InfoWindow(opt);
		},
		createDiyInfoWindow:function(opt){
			var myOptions = {
				alignBottom:true,
				pixelOffset: new google.maps.Size(-110, -30),
				closeBoxURL:"",    //设置是否有关闭按钮
				isHidden: false
			};
			$.extend(myOptions,opt)
			return new this.infoBox(myOptions);
		},
        /*
		 * @public 
         * @method 注册事件
		 * @param  {object}   google里的元素对象(比如：坐标)
		 * @param  {string}   type   事件类型：click,....
		 * @param  {function} callback 事件执行函数
		 **/
		addEvent:function(obj,type,callback){
			var me = this;
			google.maps.event.addListener(obj,type,function(){
				callback&&callback.call(obj);
			});
		},
        /*
		 * @public 
         * @method 删除事件，将会删除掉传入对象下，type事件类型对应的所有执行函数
		 * @param  {object}   google里的元素对象(比如：坐标)
		 * @param  {string}   type   事件类型：click,....
		 **/
		removeEvent:function(obj,type){
			//这里暂时使用清除对象指定事件的所有监听函数
			google.maps.event.clearListeners(obj,type);
		},
		/*
		 *@method 创建icon
		 * @private
		 * @param  {object} opt.icon   图片的参数
		 * @param  {string} opt.icon.url   图片地址
		 * @param  {object} opt.icon.point 点得参数 里面包含x,y 图片组件的横纵坐标
		 * @param  {object} opt.icon.size  图片大小 里面包含w,h
		 * @param  {object} icon对象 
		 **/
		getIcon:function(iconOpt){
			var size  = new google.maps.Size(iconOpt.size.w,iconOpt.size.h),  //icon的尺寸
				point = new google.maps.Point(iconOpt.point.x, iconOpt.point.y); //icon的显示位置,图片精灵
			return new google.maps.MarkerImage(iconOpt.url, size, point);
		},
		/*
		 *@method 根据坐标查找marker
		 *@private 
		 *@param   {object}   pos    经纬度
		 *    @param   {number}   pos.lat   经度
		 *    @param   {number}   pos.lng   纬度
		 *@param   {string}   control   控制是否删除“del” 如果是del则删除marker
		 *@return  {object}    marker对象
		 **/
		searchMarkerByPosition:function(pos,control){
			if(this.map.markers.length>0){	
				var marker,p,
					inpos = this.createLatLng(pos);
				for(var i = 0;i<this.map.markers.length;i++){
					marker = this.map.markers[i];
					p = marker.position;
					if(inpos.toString()==p.toString()){
						if(control&&control=="del"){
							this.map.markers.splice(i,1);
						}
						return marker;
					}
				}
			}
		},

		/*
		 *@method  替换marker的图标
		 *@param   {object}   pos    经纬度
		 *    @param   {number}   pos.lat   经度
		 *    @param   {number}   pos.lng   纬度
		 * @param  {object} opt.icon   图片的参数
		 * @param  {string} opt.icon.url   图片地址
		 * @param  {object} opt.icon.point 点得参数 里面包含x,y 图片组件的横纵坐标
		 * @param  {object} opt.icon.size  图片大小 里面包含w,h
		 **/
		changeMarkerIcon:function(pos,opt){
			var marker = this.searchMarkerByPosition(pos);
			marker.setIcon(this.getIcon(opt.icon))
		},
        /*
		 *@method  showInfoWindow 根据传入的坐标点，显示对应的信息弹层
		 *@param   {object}   经纬度
		 *    @param   {number}   pos.lat   经度
		 *    @param   {number}   pos.lng   纬度
		 **/
		showInfoWindow:function(pos){
			var marker = this.searchMarkerByPosition(pos);
			marker.infoWindow.open(this.map,marker);
		},
        /*
		 *@method  closeInfoWindow  根据传入的坐标点，隐藏对应的信息弹层
		 *@param   {object}   经纬度
		 *    @param   {number}   pos.lat   经度
		 *    @param   {number}   pos.lng   纬度
		 **/
		closeInfoWindow:function(pos){
			var marker = this.searchMarkerByPosition(pos);
			marker.infoWindow.close();
		},
		/*
		 *@method  删除标记
		 *@param   {object}   经纬度
		 *    @param   {number}   pos.lat   经度
		 *    @param   {number}   pos.lng   纬度
		 **/
		delMarker:function(pos){
			var marker = this.searchMarkerByPosition(pos,"del");
			marker.setMap(null);
		},
		/*
 		 *@method 画线
 		 *@param   {object}   经纬度
		 *    @param   {number}   pos.lat   经度
		 *    @param   {number}   pos.lng   纬度
		 *@param   {object}   线的属性 
		 *@param   {string}   opt.strokeColor    线的颜色   exp:#FF0000
		 *@param   {number}   opt.strokeOpacity  透明度   exp:0.5
		 *@param   {number}   opt.strokeWeight   宽度    exp:5
		 **/
		drawLine:function(pos,opt){
			var me = this,points = [],line;
			for(var i=0,p;p = pos[i++];){
				points.push(new google.maps.LatLng(p.lat, p.lng))
			}
			$.extend(opt,{
				path:points
			})
			line = new google.maps.Polyline(opt);
			line.setMap(this.map);
			this.map.lines.push(line);
			return line;
		},
        /*
 		 *@method 画面
 		 *@param   {array}   经纬度对象的数组
		 *@param   {object}   线的属性 
		 *@param   {string}   opt.strokeColor    线的颜色   exp:#FF0000
		 *@param   {number}   opt.strokeOpacity  透明度   exp:0.5
		 *@param   {number}   opt.strokeWeight   宽度    exp:5
		 **/
		drawPolygon:function(pos,opt){
			var bounds = [],latlng,polygon;
			for(var i=0;i<pos.length;i++){
				latlng = pos[i].split(",");
				bounds.push(this.createLatLng({
					lat:latlng[0],
					lng:latlng[1]
				}))
			}
			polygon = new google.maps.Polygon($.extend(opt,{
				paths:bounds
			}))
			polygon.setMap(this.map);
			this.map.polygon.push(polygon);
			return polygon;
		},
        /*
		 * @method fitBounds 根据传入的经纬度数组设置最优视图
         * @param   {array}   latlngs    经纬度对象的数组
		 **/
		fitBounds:function(latlngs){
			//[{lat:123,lng:234},{lat:2134,lng:234}]
			var mapBounds =new google.maps.LatLngBounds();
			for(var i =0;i<latlngs.length;i++){
				mapBounds.extend(this.createLatLng(latlngs[i]))
			}
			this.map.fitBounds(mapBounds);
		},
		setCenter:function(latlng){
			//{lat:123,lng:234}
			this.map.setCenter(new google.maps.LatLng(latlng.lat,latlng.lng));
		},
		setZoom:function(zoom){
			if(typeof zoom == 'number'){
				this.map.setZoom(zoom);
			}
		},
		getPolyCenter:function(poly){
			var lowx,
		        highx,
		        lowy,
		        highy,
		        lats = [],
		        lngs = [],
		        lngs1 = lats1 = 0,
		        vertices = poly.getPath(),
		    	len = vertices.length,
		    	latlng = {},
		    	tmplng,tmplat;

		    for(var i=0; i<vertices.length; i++) {
		    	tmplat = vertices.getAt(i).lat();
		    	tmplng = vertices.getAt(i).lng();

		      lngs.push(tmplng);
		      lats.push(tmplat);
		      lngs1 += tmplng;
		      lats1 += tmplat;
		    }
		    function sort(arr){
		    	return arr.sort(function(a,b){
		    		return a-b;
		    	})
		    }
		    lats = sort(lats);
		    lngs = sort(lngs);
		    
		    lowx = lats.shift();
		    highx = lats.pop();
		    lowy = lngs.shift();
		    highy = lngs.pop();
		    latlng.lat = lowx + ((highx - lowx) / 2);
		    latlng.lng = lowy + ((highy - lowy) / 2);
		    lowx=highx=lowy=highy=lats=lngs=lngs1=lats1=vertices=len=tmplng=tmplat=null;
		    return this.createLatLng(latlng);
		},
		/*
		 *@method 清空地图里的线
		 **/
		clearLine:function(){
			var lines = this.map.lines;
			for(var i=0,line;line = lines[i++];){
				line.setMap(null);
			}
			lines = [];
		},
        /*
		 *@method 清空地图里的标记
		 **/
		clearMarker:function(){
			for(var i=0,marker;marker = this.map.markers[i++];){
				marker.setMap(null);
			}
			this.map.markers = [];
		},	
        /*
		 *@method 清空地图里的标记和线
		 **/
		empty:function(){
			this.clearLine();
			this.clearMarker();	
		}
	}
	return GMapUtils;
})