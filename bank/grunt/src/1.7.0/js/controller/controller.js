app.controller('teachersController', function($rootScope, dataStringify, $scope, $location, signSha1, $routeParams, httpRequest){
    setDocumentTitle();
	//alert("当前URL"+$location.absUrl());
    $rootScope.leftbar="fa-bars";
    $(".app-body").css("padding-top","50px");
	
	$rootScope.user=getToken();
	$rootScope.rootAct=$rootScope.user;
	$scope.$apply($rootScope.user);
	$scope.$apply($rootScope.rootAct);
	
	var rcRoute=getRechargeRoute();
	var o=getOrder();
	//alert(JSON.stringify(rcRoute));
	if(rcRoute && o){
		if(rcRoute.flag==1 || rcRoute.flag==11){
			var cId=rcRoute.cleanerId;
			//setRechargeRoute(null);
			$location.path("/order/"+cId);
		}
	}
	if(rcRoute && rcRoute.flag==2){
		var cId=rcRoute.cleanerId;
		//setRechargeRoute(null);
		$location.path("/payment/"+cId+"/n");
		
	}
	
    var bm = new BMap.Map("allmap");
    var mobileType=getMobileType();
	if(MobileTypes.Android==mobileType || 1==1){
		var pnt = new BMap.Point($rootScope.user.lng, $rootScope.user.lat);
		BMap.Convertor.translate(pnt, 0, initMap);
		//initMap(pnt);
	}else{
		getLocation(function(data,isSuccess){
			if(!isSuccess){
				alertWarning("请先开启您的定位服务再试");
			}else{
				translatePoint(data);
			}
		});
	}
	
	function translatePoint(position){ 
		var currentLat = position.coords.latitude; 
		var currentLon = position.coords.longitude;		
		var gpsPoint = new BMap.Point(currentLon, currentLat);
		BMap.Convertor.translate(gpsPoint, 0, initMap);

	}
	if($rootScope.currentCity){
		$scope.isGetLocation=true;
	}
	
	var testPoint=null;
	function testMap(p){
		alert(p.lng-testPoint.lng);
		alert(p.lat-testPoint.lat);
	}
	function initMap(point){
		//testPoint=point;
		//var pnt = new BMap.Point($rootScope.user.lng, $rootScope.user.lat);
		//BMap.Convertor.translate(pnt, 0, testMap);
		//alert('您的位置2：'+point.lng+','+point.lat);
		if(MobileTypes.Android==mobileType || 1==1){
			//point.lng=point.lng-0.0003;
			//point.lat=point.lat+0.0005;
			point = new BMap.Point(point.lng-0.0040, point.lat+0.00199);
		}
		var gc = new BMap.Geocoder();
		gc.getLocation(point, function(rs){
			var addComp = rs.addressComponents;
			$rootScope.currentCity=addComp;
			$scope.isGetLocation=true;
			$scope.$apply($scope.isGetLocation);

		});

		var data={
			lng:point.lng,
			user_id:$rootScope.user?$rootScope.user.id || 0 :0,
			lat:point.lat
		};
		//alert("当前位置lng:"+point.lng+",lat:"+point.lat);
		//point=new BMap.Point(120.73083, 31.287715);
		//alert(dataStringify('/user/cleanerLBS',data));
		httpRequest.Get(dataStringify('/user/cleanerLBS',data),{}).then(function (result) {
			  //alert(1);
              if (result && result.status == statusMsg.Success) {
				$scope.cleaners=result.cleaners;
				$scope.isGetLocation=true;
				$scope.$apply($scope.isGetLocation);
				for(var c in $scope.cleaners){
					var distance=bm.getDistance(point, new BMap.Point($scope.cleaners[c].lng, $scope.cleaners[c].lat));
					$scope.cleaners[c].distance=(distance/1000).toFixed(2);
				}
				$scope.cleaners.sort(function(a,b){return a.distance-b.distance});
				$scope.$apply($scope.cleaners);
				
              }else{
              	alertWarning(result.message);
              }
		});
	}

	
	$scope.goMap=function(){
		$location.path("/");
	};
	if(rcRoute && o && rcRoute.flag==1){
		
	}else{
		removeCleaner();
	}
	$scope.goTeacher=function(index){
		//alert(angular.toJson($scope.cleaners[index]));		
		setCleaner($scope.cleaners[index]);
		$location.path("/teacher");
	};
});
app.controller('teacherController', function($rootScope, dataStringify, $scope, $location, signSha1, $routeParams, httpRequest){
    setDocumentTitle();
    $rootScope.leftbar="fa-angle-left";
    $(".app-body").css("padding-top","50px");
	$scope.cleaner=getCleaner();
	if(!$scope.cleaner){
		alertExt("请先选择美车师",function(){
			$location.path("/");
			$scope.$apply($location);
		});
	}

	$scope.order=function(id){
		removeOrder();
		$location.path("/order/"+id);
	};
	//alert(angular.toJson($scope.cleaner));
	var data={
		direction:1,
		cleaner_id:$scope.cleaner? $scope.cleaner.id : 148 ,
		user_id:$rootScope.user.id 
	};
	httpRequest.Get(dataStringify('/evaluations/get',data),true,{}).then(function (result) {
		  if (result && result.status == statusMsg.Success) {
			$scope.evls=result.evaluations;
			$scope.totalCount=result.total_count;
		  }
	});
});

app.controller('orderController', function($rootScope, dataStringify, $scope, $location, signSha1, $routeParams, httpRequest){
    setDocumentTitle("预约洗车");
    $rootScope.leftbar="fa-angle-left";
	$scope.cleanerId=$routeParams.cleanerId || 0;
    $(".app-body").css("padding-top","0");
	
	$rootScope.pageTitle="预约洗车";
	$rootScope.couponPage=false;
	$scope.selectCoupon=function(type,addType){
		$rootScope.couponPage=true;
		$rootScope.isNoBack=true;
		$rootScope.pageTitle="优惠券";
		$scope.couponPageType=type;
		if(addType==1){
			$scope.addCouponType=addType;
		}else{
			$scope.addCouponType=0;
		}
		
	};
    $scope.summary={total_amount:0,pay_off:0,final_amount:0};
    $scope.availableCoupons= [];


    $scope.getDiscount=function(data,callback){
		//alert(angular.toJson(data));
		httpRequest.Get(dataStringify('/order/discount/details',data),true,{}).then(function (result) {
			  if (result && result.status == statusMsg.Success) {
				
				$scope.summary.total_amount=result.total_amount;
				$scope.summary.pay_off=result.pay_off;
				$scope.summary.final_amount=result.final_amount;

				//alert(angular.toJson($scope.summary));
				if(callback){
					callback($scope.summary);
				}
				
			  }else{
			  	//alertWarning(result.message);
			  	$scope.summary.total_amount=$scope.totalAmout;
			  	$scope.summary.pay_off=0;
			  	$scope.summary.final_amount=$scope.totalAmout;
			  }
		});
	};

	$scope.setCoupon=function(coupon){
		if(coupon.provider_id==2){
			var arrButton = ["取消","前往下载"];
			openDialog("该优惠券只能在小牛帮APP内使用，请下载小牛帮APP","", arrButton, null,
				function (r) {
					if (r) {
					   window.location.href="http://d.xiaoniubang.com/";
					}
			});
			return;
			
		}
		
		
		$scope.isSetCoupon=true;
		$scope.isUseCoupon=true;
		$rootScope.couponPage=false;
		$rootScope.isNoBack=false;
		$rootScope.pageTitle="预约洗车";
		var sevs=[];
		//alert(angular.toJson(coupon));
		if($scope.content){
			var o=$scope.content || [];
			for(var i=0;i<o.length;i++){
				var s={};
				s.service_id=o[i].id;
				s.count=1;
				sevs.push(s);				
			}
			var data={
				user_id:$rootScope.user.id ,
				services:angular.toJson(sevs),
				city_code:$scope.city_code,
				car_type:$scope.car.type,
				coupon_serial_no:coupon.serial_no

			};
			$scope.getDiscount(data);
		}
		$scope.currentCoupon=coupon;
		
	};

	$scope.getAvailableCoupons=function(data,callback){

		httpRequest.Get(dataStringify('/coupon/available',data),true,{}).then(function (result) {
			  if (result && result.status == statusMsg.Success) {
				
				$scope.availableCoupons=result.coupons;
				$scope.availableCoupons00= [
    {
      "service_id": "5",
      "name": "内饰基础清洁",
      "list": [
        {
          "serial_no": "544A08878E1ED16F",
          "expire_date": "2015-12-16",
          "create_time": "2014-12-16 12:41:17",
          "creator": "1",
          "last_update_time": "2014-12-16 12:47:06",
          "update_by": "145",
          "status": "0",
          "order_id": "498",
          "amount": "4",
          "requirement_id": "",
          "service_id": "5",
          "name": "代金券",
          "coupon_type": "2",
          "small_car_price": "",
          "big_car_price": "",
          "memo": "",
          "small_reference_price": "可享受9.0折优惠",
          "big_reference_price": "",
          "provider_id": "1",
          "user_id": "1",
          "category": "内饰基础清洁"
        }
      ]
    }
  ];
				if(callback){
					callback($scope.availableCoupons);
				}
				
			  }
		});
	};

	$scope.addCoupon=function(data,callback){

		httpRequest.POST(dataStringify('/coupon/add',data,true), data, { "Content-Type": "application/json" },true).then(function (result) {
			if (result.status == 1) {
				if(result.data.status==statusMsg.Success){
					alertExt("添加优惠券成功！",function(){
						if(callback){
							callback(result.data.coupon);
						}
					});
				}
			} else {
				alertWarning(result.data.message);
			}
		});
	};

	$scope.addNewCoupon=function(){
		if(!$scope.couponNo){
			alertWarning("请输入优惠券密码");
			return false;
		}
		var data={
			user_id:$rootScope.user.id ,
			coupon_serial_no:$scope.couponNo

		};
		var callback=function(cp){
			if($scope.addCouponType){
				$scope.couponPageType=1;
				for(var i=0;i<$scope.content.length;i++){
					var s={};
					s.service_id=$scope.content[i].id;
					s.count=1;
					sevs.push(s);				
				}
				var data={
					user_id:$rootScope.user.id ,
					services:angular.toJson(sevs)
				};

				$scope.getAvailableCoupons(data);

			}else{
				$scope.currentCoupon=cp;

				$scope.isSetCoupon=true;
				$rootScope.couponPage=false;
				$rootScope.isNoBack=false;
				$rootScope.pageTitle="预约洗车";
			}
		};
		$scope.addCoupon(data,callback);
	};
    $scope.goToAddress=function(){
    	$location.path("/address");
    };
    $scope.goToServices=function(){
    	var order=getOrder() || {};
    	if(!order.car){
    		alertWarning("请先选择您要服务的车辆");
    		return;
    	}
    	$location.path("/services");
    };

    $scope.goToDateTime=function(){
    	//$('#demo').mobiscroll('show');
    	initArea();
    	$('#pAddress').mobiscroll('show');
    };

    $scope.goToCar=function(){
    	$location.path("/myCars");
    };
	

	httpRequest.Get(dataStringify('/service_time/get',{user_id:$rootScope.user.id}),false,{}).then(function (result) {
		  if (result && result.status == statusMsg.Success) {
			//$('#demo').empty();
			var service_time=result.service_time;
			var fromHour=parseInt(service_time.from_hour);
			var toHour=parseInt(service_time.to_hour);
			var regionHour=toHour-fromHour;
			var continueDays=parseInt(service_time.continue_days);

			var curHour=(new Date()).getHours();
			var curMinute=(new Date()).getMinutes();

			/*for(var i=0;i<regionHour;i++){
				if((fromHour+i)>curHour)
					$("#demo").append("<option value='"+fromHour+i+".5f'>"+(fromHour+i)+":00 ~ "+(fromHour+i+1)+":00</option>");
				if(((fromHour+i)==curHour) && curMinute<=30){
					$("#demo").append("<option value='"+fromHour+i+".5f'>"+(fromHour+i)+":00 ~ "+(fromHour+i+1)+":00</option>");
				}
			}*/
			var todayUl="<li data-val=\"0.\">今天<ul>";
			var isToday=false;
			for(var i=0;i<regionHour;i++){
				if((fromHour+i)>curHour){
					isToday=true;
					todayUl=todayUl+"<li data-val=\""+(fromHour+i)+":00 ~ "+(fromHour+i+1)+":00\">"+(fromHour+i)+":00 ~ "+(fromHour+i+1)+":00</li>";					
				}
				if(((fromHour+i)==curHour) && curMinute<=30){
					isToday=true;
					todayUl=todayUl+"<li data-val=\""+(fromHour+i)+":00 ~ "+(fromHour+i+1)+":00\">"+(fromHour+i)+":00 ~ "+(fromHour+i+1)+":00</li>";
				}
				//todayUl=todayUl+"<li data-val=\""+(fromHour+i)+":00 ~ "+(fromHour+i+1)+":00\">"+(fromHour+i)+":00 ~ "+(fromHour+i+1)+":00</li>";		
			}
			todayUl=todayUl+"</ul></li>";
			if(!isToday){
				todayUl="";
			}

			tomorrowUl="<li data-val=\"1.\">明天<ul>";
			aTomorrowUl="<li data-val=\"2.\">后天<ul>";
			for(var i=0;i<regionHour;i++){
				tomorrowUl=tomorrowUl+"<li data-val=\""+(fromHour+i)+":00 ~ "+(fromHour+i+1)+":00\">"+(fromHour+i)+":00 ~ "+(fromHour+i+1)+":00</li>";
				aTomorrowUl=aTomorrowUl+"<li data-val=\""+(fromHour+i)+":00 ~ "+(fromHour+i+1)+":00\">"+(fromHour+i)+":00 ~ "+(fromHour+i+1)+":00</li>";
			}
			if(continueDays==2){
				tomorrowUl=tomorrowUl+"</ul></li>";
				aTomorrowUl="";
			}
			if(continueDays>=3){
				tomorrowUl=tomorrowUl+"</ul></li>";
				aTomorrowUl=aTomorrowUl+"</ul></li>";
			}
			//alert(todayUl+tomorrowUl+aTomorrowUl);
			$("#pAddress").html(todayUl+tomorrowUl+aTomorrowUl);

			/*$('#demo').mobiscroll().select({
				theme: 'android-ics light',
				display: 'bottom',
				minWidth: 200,
				width: 300,
				mode: 'scroller',
				headerText: '日期：'+(new Date()).Format("yyyy-MM-dd"),
				setText: "确认", 
				cancelText: "取消",
				onSelect:function(){
					var selectObj=$('#demo').mobiscroll('getInst');
					$scope.datetime=(new Date()).Format("yyyy-MM-dd")+" "+selectObj.val
					$scope.$apply($scope.datetime);
					var order=getOrder();
					order=order || {};
					order.datetime=$scope.datetime;
					setOrder(order);
				}
			});*/
			 
		  }else{
			alertWarning(result.message);
			
		  }
	});

	
	function initArea(){
        $('#pAddress').mobiscroll().treelist({
            theme: 'android-ics light',//ios
            display: 'bottom',
            mode: 'scroller',
            labels: ['日期', '时间段'],
            setText: "确认", //确认按钮名称
            cancelText: "取消", //取消按钮名籍
            width: "90",
            insertTo: "#serviceTime",
            onSelect:function(){
				var selectObj=$('#pAddress').mobiscroll('getInst');
				var arrSelectObjVal=selectObj.val.split('. ');
				var curDate = new Date(); 
				var seletedDate = new Date(curDate.getTime() + 24*60*60*1000*parseInt(arrSelectObjVal[0])); 

				$scope.datetime=seletedDate.Format("yyyy-MM-dd")+" "+arrSelectObjVal[1];
				$scope.$apply($scope.datetime);
				var order=getOrder();
				order=order || {};
				order.datetime=$scope.datetime;
				setOrder(order);
			}
        });
    }

	
	var order=getOrder();
	if(!order){
		setOrder({mobile:$rootScope.user.mobile || ''});
		order=getOrder();
	}
	if(order){
		$scope.mobile=order.mobile || '';
		$scope.address=order.address || '';
		$scope.car=order.car || '';
		$scope.content=order.content || '';
		$scope.totalAmout=order.totalAmout || '';
		$scope.datetime=order.datetime || '';
		//$scope.isUseCoupon=order.isUseCoupon || true;

		var sevs=[];
		//alert(angular.toJson(order.car));
		if(order.content){
			var o=order || [];
			for(var i=0;i<o.content.length;i++){
				var s={};
				s.service_id=o.content[i].id;
				s.count=1;
				sevs.push(s);				
			}
			var data={
				user_id:$rootScope.user.id ,
				services:angular.toJson(sevs)
			};

			$scope.getAvailableCoupons(data);

			var data={
				user_id:$rootScope.user.id ,
				services:angular.toJson(sevs),
				city_code:$scope.city_code,
				car_type:$scope.car.type,
				coupon_serial_no:''
			};

			$scope.getDiscount(data);
		}

	}else{
		$scope.mobile="";
		$scope.address="";
		$scope.car="";
		$scope.content="";
		$scope.totalAmout=0;
		$scope.datetime="";
		$scope.isUseCoupon=true;
	}
	
	{//解决默认车辆问题
		var data={
			user_id:$rootScope.user.id ,
			direction:1
		};
		
		httpRequest.Get(dataStringify('/cars/get',data),false,{}).then(function (result) {
			if (result && result.status == statusMsg.Success) {
				var cars=result.cars;
				if(cars && cars.length>0){
					if(!order.car || order.car==''){
						order.car=cars[0];
						setOrder(order);
						$scope.car=order.car;
					}
				}
			}
		});
	}
	
		
    
    $scope.isUseCoupon = true;
    $scope.toggleCoupon=function(){
    	$scope.isUseCoupon=!$scope.isUseCoupon;

    	var sevs=[];

		if($scope.content){
			var o=$scope.content || [];
			for(var i=0;i<o.length;i++){
				var s={};
				s.service_id=o[i].id;
				s.count=1;
				sevs.push(s);				
			}
			var data={
				user_id:$rootScope.user.id ,
				services:angular.toJson(sevs),
				city_code:$scope.city_code,
				car_type:$scope.car.type
			};
			if($scope.isUseCoupon){
				data.coupon_serial_no=$scope.currentCoupon.serial_no || $scope.availableCoupons[0].list[0].serial_no;
				$scope.getDiscount(data);
			}else{
				data.coupon_serial_no='';
				$scope.getDiscount(data,function(s){
					$scope.summary.total_amount=s.total_amount;
					$scope.summary.pay_off=0;
					$scope.summary.final_amount=s.total_amount;
					$scope.$apply($scope.summary);
				});
			}
			
		}
    };
	$scope.saveOrder=function(){
		var order=getOrder();
		if(order){
			order.mobile=$scope.mobile;
			order.comment=$scope.comment;
		}else{
			order={};
			order.mobile=$scope.mobile;
			order.comment=$scope.comment;
		}
		setOrder(order);
	};

    $("#allmap").height($(".home-page").height()-$("#title").height());
    var bm = new BMap.Map("allmap");
    var marker=null;
	
	var mobileType=getMobileType();
	if(MobileTypes.Android==mobileType || 1==1){
		var pnt = new BMap.Point($rootScope.user.lng, $rootScope.user.lat);
		BMap.Convertor.translate(pnt, 0, initMap);
		//initMap(pnt);
	}else{
		getLocation(function(data,isSuccess){
			if(!isSuccess){
				alertWarning("请先开启您的定位服务再试");
			}else{
				translatePoint(data);
			}
		});
	}
	$scope.city_code=224; //默认苏州 城市代码
    
	function translatePoint(position){ 
		var currentLat = position.coords.latitude; 
		var currentLon = position.coords.longitude;
		var gpsPoint = new BMap.Point(currentLon, currentLat);
		BMap.Convertor.translate(gpsPoint, 0, initMap);
	} 

	function initMap(point){
		if(MobileTypes.Android==mobileType || 1==1){
			//point.lng=point.lng-0.0003;
			//point.lat=point.lat+0.0005;
			point = new BMap.Point(point.lng-0.0040, point.lat+0.00199);
		}
		var gc = new BMap.Geocoder();
		gc.getLocation(point, function(rs){
			var addComp = rs.addressComponents;
			$rootScope.currentCity=addComp;
			
			var localCity = new BMap.LocalCity();
			localCity.get(function(e){
				$scope.city_code=e.code;
				if($rootScope.currentCity && $rootScope.currentCity.city){
					if($rootScope.currentCity.city!=e.name){
						$scope.city_code=224;
					}
				}
				goToOrderDetail();
			});

			if(order && order.address){
				$scope.address=order.address;
				order.lng=order.lng || point.lng;
				order.lat=order.lat || point.lat;
				setOrder(order);
			}else{
				$scope.address=rs.address;
				order=order || {};
				order.lng=point.lng;
				order.lat=point.lat;
				order.address=order.address || rs.address;
				setOrder(order);
			}
			$scope.$apply($scope.address);
		});


	}

	var checkOrder=function(o){
		if(!o.mobile){
			alertWarning("请输入手机号码");
			return false;
		}
		if(!o.car){
			alertWarning("请选择车辆");
			return false;
		}
		if(!o.address){
			alertWarning("请选择地址");
			return false;
		}
		if(!o.datetime){
			alertWarning("请选择预约时间");
			return false;
		}
		if(!o.content){
			alertWarning("请选择服务内容");
			return false;
		}
		//if($scope.isUseCoupon && !$scope.couponNo){
		//	alertWarning("请输洗车券号");
		//	return false;
		//}
		return true;
	};
	//orderController
	

	$scope.order=function(){
		var o=getOrder() || {};
		//alert(JSON.stringify(o));
		//return;
		if(!checkOrder(o)){
			return;
		}
		var sevs=[];
		o.content=o.content || [];
		for(var i=0;i<o.content.length;i++){
			var s={};
			s.service_id=o.content[i].id;
			s.count=1;
			sevs.push(s);
		}
		var data={
			user_id:$rootScope.user.id ,
			need_invoice:'0',
			invoice_title:"",
			mobile:o.mobile,
			address:o.address,
			lat:o.lat,
			lng:o.lng,
			city_code:$scope.city_code,
			cleaner_id:$scope.cleanerId || getCleaner().id,
			car_no:o.car.car_no,
			car_type:o.car.type,
			car_id:o.car.id,
			brand:o.car.brand,
			mode:o.car.mode,
			color:o.car.color,
			services:angular.toJson(sevs),
			reserve_time:o.datetime,
			coupon_serial_no:($scope.isSetCoupon && $scope.isUseCoupon)?$scope.currentCoupon.serial_no:'',
			comment:o.comment || $scope.comment || ''
		};
        //alert(angular.toJson(data));
		if(data.coupon_serial_no && $scope.currentCoupon && $scope.currentCoupon.provider_id==4){
		   var od=getOrder() || {};
		   od.ex1=data.user_id;
		   od.ex2=data.city_code;
		   od.ex3=data.cleaner_id;
		   od.ex4=data.services;
		   od.ex5=data.coupon_serial_no;
		   od.ex6=data.comment;
		   od.ex7=0;//是否已充值成功
		   setOrder(od);
		   
		   setRechargeRoute({flag:11,cleanerId:$scope.cleanerId || getCleaner().id});
			
			// alert(JSON.stringify($scope.summary));
			// alert("http://m.xiaoniubang.com/ebank/mpi/proccess/TransProcess.php?user_id="+data.user_id
					// +"&orderNumber="+(new Date()).getTime()
					// +"&orderAmount="+$scope.summary.final_amount || $scope.summary.amount
					// +"&rechargeType=7"
					// +"&productId=0");
			window.location.href="http://m.xiaoniubang.com/ebank/mpi/proccess/TransProcess.php?user_id="+data.user_id
					+"&orderNumber="+(new Date()).getTime()
					+"&orderAmount="+$scope.summary.final_amount || $scope.summary.amount
					+"&rechargeType=7"
					+"&productId=0";
			return;
		}
		httpRequest.POST(dataStringify('/order/add_v3',data,true), data, { "Content-Type": "application/json" },true).then(function (result) {
			//alert(angular.toJson(result));
			if (result.status == 1) {				
				if(result.data.status==statusMsg.Success){
					var msg="亲，您的订单已经成功发送给指定的美车师，他在接单后会第一时间联系您，"+
					"若20分钟后未联系您，订单将失效，请耐心等待，不要重复下单！";
					
					var arrButton = ["确定"];
					openDialog(msg,"",arrButton,0,
						function(r){
							if(!r){
								$location.path("/payment/"+result.data.order.id);
								$rootScope.redirectPath="/";
								$scope.$apply($location);
							}
							
					});
				}
			} else {
				if(result.data.status=="183011"){
					var arrButton = ["取消","前往充值"];
					openDialog(result.data.message,"", arrButton, null,
						function (r) {
							if (r) {
							   var od=getOrder() || {};
							   od.ex1=data.user_id;
							   od.ex2=data.city_code;
							   od.ex3=data.cleaner_id;
							   od.ex4=data.services;
							   od.ex5=data.coupon_serial_no;
							   od.ex6=data.comment;
							   setOrder(od);
							   
							   setRechargeRoute({flag:1,cleanerId:$scope.cleanerId || getCleaner().id});
							   $location.path("/recharge/"+result.data.balance_margin);
							   $scope.$apply($location);
							}
					});
				}else{
					//alert(result.data.message);
					alertWarning(result.data.message);
					//alert(dataStringify('/order/add_v3',data,true));
				}
			}
		});
    };
	
	function goToOrderDetail(){
	
		var rcRoute=getRechargeRoute();
		
		if(rcRoute){
			if(rcRoute.flag==1 || rcRoute.flag==11){
				setRechargeRoute(null);
				
				var o=getOrder() || {};
				//alert(JSON.stringify(o));
				if(o.ex7!=1){//使用苏州银行1元洗车券是否支付成功 XNBE0EEU939
					return;
				}
				
				var data={
					user_id:o.ex1 ,
					need_invoice:'0',
					invoice_title:"",
					mobile:o.mobile,
					address:o.address,
					lat:o.lat,
					lng:o.lng,
					city_code:o.ex2,
					cleaner_id:o.ex3,//7027
					car_no:o.car.car_no,
					car_type:o.car.type,
					car_id:o.car.id,
					brand:o.car.brand,
					mode:o.car.mode,
					color:o.car.color,
					services:o.ex4,
					reserve_time:o.datetime,
					coupon_serial_no:o.ex5,
					comment:o.ex6
				};
				httpRequest.POST(dataStringify('/order/add_v3',data,true), data, { "Content-Type": "application/json" },true).then(function (result) {
					//alert(JSON.stringify(result));
					if (result.status == 1) {
						//alert("恭喜下单成功！");
						if(result.data.status==statusMsg.Success || result.data.status=="OK"){
							var msg="亲，您的订单已经成功发送给指定的美车师，他在接单后会第一时间联系您，"+
							"若20分钟后未联系您，订单将失效，请耐心等待，不要重复下单！";
							//alert(msg);
							var arrButton = ["确定"];
							openDialog(msg,"",arrButton,0,
								function(r){
									if(!r){
										$location.path("/payment/"+result.data.order.id);
										$rootScope.redirectPath="/";
										$scope.$apply($location);
									}
							});
						}
					}else {
						//alert("恭喜下单成功！");
						if(result.data.status=="183011"){
							var arrButton = ["取消","前往充值"];
							openDialog(result.data.message,"", arrButton, null,
								function (r) {
									if (r) {
									   var od=getOrder() || {};
									   od.ex1=data.user_id;
									   od.ex2=data.city_code;
									   od.ex3=data.cleaner_id;
									   od.ex4=data.services;
									   od.ex5=data.coupon_serial_no;
									   od.ex6=data.comment;
									   setOrder(od);
									   
									   setRechargeRoute({flag:1,cleanerId:$scope.cleanerId || getCleaner().id});
									   $location.path("/recharge/"+result.data.balance_margin);
									   $scope.$apply($location);
									}
							});
						}else{
							alertWarning(result.data.message);
						}
					}
				});
			}
		}
	}
});
app.controller('addressController',function($rootScope, dataStringify, $scope, $location, signSha1, $routeParams, httpRequest){
	setDocumentTitle();
    $rootScope.leftbar="fa-angle-left";
    $(".app-body").css("padding-top","50px");

    $scope.address1="";
    $scope.address2="";
    $scope.point={};
    $(".app-body").css("padding-top","0");
	$("#allmap").height($(".home-page").height()-$("#title").height()+15);
    var bm = new BMap.Map("allmap");
    var marker=null;
	var myMarker=null;
	var myPoint=null;
	var isSelect=false;
    

	// 添加带有定位的导航控件
	  var navigationControl = new BMap.NavigationControl({
		// 靠左上角位置
		anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
		// LARGE类型
		type: BMAP_NAVIGATION_CONTROL_LARGE,
		// 启用显示定位
		enableGeolocation: true
	  });
	  bm.addControl(navigationControl);
	  // 添加定位控件
	  var geolocationControl = new BMap.GeolocationControl();
	  geolocationControl.addEventListener("locationSuccess", function(e){
		// 定位成功事件
		var address = '';
		address += e.addressComponent.province;
		address += e.addressComponent.city;
		address += e.addressComponent.district;
		address += e.addressComponent.street;
		address += e.addressComponent.streetNumber;
		//alert("当前定位地址为：" + address);
		
	  });
	  geolocationControl.addEventListener("locationError",function(e){
		// 定位失败事件
		alert(e.message);
	  });
	  bm.addControl(geolocationControl);



	var mobileType=getMobileType();
	if(MobileTypes.Android==mobileType || 1==1){
		var pnt = new BMap.Point($rootScope.user.lng, $rootScope.user.lat);
		bm.centerAndZoom(pnt, 15);
		setTimeout(function () {
			//initMap(pnt);
            BMap.Convertor.translate(pnt, 0, initMap);     //真实经纬度转成百度坐标
        }, 0);
		
	}else{
		getLocation(function(data,isSuccess){
			if(!isSuccess){
				//alert(data.message);
				alertWarning("请先开启您的定位服务再试");
				//translatePoint({coords:{latitude:31,longitude:120}});
			}else{
				translatePoint(data);
			}
		});
	}
	
	function translatePoint(position){ 
		var currentLat = position.coords.latitude; 
		var currentLon = position.coords.longitude;
		var gpsPoint = new BMap.Point(currentLon, currentLat);
		bm.centerAndZoom(gpsPoint, 15);
		//bm.addControl(new BMap.NavigationControl());

		setTimeout(function () {
            BMap.Convertor.translate(gpsPoint, 0, initMap);     //真实经纬度转成百度坐标
        }, 0);
	} 
	
	var showInfo=function(e){
		//alert(e.point.lng + ", " + e.point.lat);
		var gc = new BMap.Geocoder();
		gc.getLocation(e.point, function(rs){
			var addComp = rs.addressComponents;
			//alert(angular.toJson(rs));
			//alert(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
			$scope.address1=rs.address;
			$scope.$apply($scope.address1);
			bm.removeOverlay(marker);
			marker = new BMap.Marker(e.point);
			bm.addOverlay(marker);
			var label = new BMap.Label("洗车地点", { offset: new BMap.Size(20, -10) });
			marker.setLabel(label); //添加百度label
			
			myMarker = new BMap.Marker(myPoint);
			bm.addOverlay(myMarker);
			var label = new BMap.Label("我的位置", { offset: new BMap.Size(20, -10) });
			myMarker.setLabel(label); //添加百度label
			
			$scope.address2="";
			$scope.$apply($scope.address2);
			
			isSelect=true;
			
			$scope.point=e.point;

		});
	}
	function initMap(point){
		//alert(mobileType);
		if(MobileTypes.Android==mobileType || 1==1){
			//point.lng=point.lng-0.0003;
			//point.lat=point.lat+0.0005;
			//alert(JSON.stringify(point));
			point = new BMap.Point(point.lng-0.0040, point.lat+0.00199);
			//alert(JSON.stringify(point));
		}
		myPoint=point;
		
		var o=getOrder() || {};
		if(o.isSelect){
			var p = new BMap.Point(o.lng, o.lat);
			marker = new BMap.Marker(p);
			bm.addOverlay(marker);
			
			var label = new BMap.Label("洗车地点", { offset: new BMap.Size(20, -10) });
			marker.setLabel(label); //添加百度label
			
			myMarker = new BMap.Marker(myPoint);
			bm.addOverlay(myMarker);
			var label = new BMap.Label("我的位置", { offset: new BMap.Size(20, -10) });
			myMarker.setLabel(label); //添加百度label
			
			$scope.address1=o.address1;
			$scope.$apply($scope.address1);
			$scope.address2=o.address2;
			$scope.$apply($scope.address2);
		}else{
			marker = new BMap.Marker(myPoint);
			bm.addOverlay(marker);
			
			var label = new BMap.Label("我的位置", { offset: new BMap.Size(20, -10) });
			marker.setLabel(label); //添加百度label
		}
		
		
		bm.setCenter(point);
		marker.enableDragging();
		bm.addEventListener("click", showInfo);
		var gc = new BMap.Geocoder();
		gc.getLocation(point, function(rs){
			var addComp = rs.addressComponents;
			if(!o.isSelect){
				$scope.address1=rs.address;
				$scope.$apply($scope.address1);
			}
			
			$scope.point=point;
		});
	}

	$scope.save=function(){
		$scope.address=$scope.address1+$scope.address2;
		var order=getOrder();
		if(order){
			order.address=$scope.address;
			order.address1=$scope.address1;
			order.address2=$scope.address2;
			order.lng=$scope.point.lng;
			order.lat=$scope.point.lat;
			order.isSelect=isSelect;
			//order.point=myPoint;
		}else{
			order={};
			order.address=$scope.address;
			order.address1=$scope.address1;
			order.address2=$scope.address2;
			order.lng=$scope.point.lng;
			order.lat=$scope.point.lat;
			order.isSelect=isSelect;
			//order.point=myPoint;
		}
		setOrder(order);
		$location.path("/order/"+getCleaner().id);
	};

});

app.controller('paymentController', function($rootScope, $scope,dataStringify, $location, signSha1, $routeParams, httpRequest){
    setDocumentTitle();
    $rootScope.leftbar="fa-angle-left";
    $(".app-body").css("padding-top","0");

    $scope.orderId=$routeParams.orderId || -1;
    $scope.isService=$routeParams.isService || 'n';
    if($scope.isService=="y"){
		setDocumentTitle("服务列表");
		$scope.isShowServiceList=true;		
    	$rootScope.pageTitle="服务列表";
    }else{
    	setDocumentTitle("当前订单");
    	$scope.isShowServiceList=false;
    	$rootScope.pageTitle="当前订单";
    }

	$scope.addService=function(){
		$location.path("/payment/"+$scope.orderId+"/y");
	}
	
	if($scope.isService!="y"){
		
		
		var rcRoute=getRechargeRoute();
		
		if(rcRoute && rcRoute.flag==2){
				var data=rcRoute.extData;
				setRechargeRoute(null);
				
				httpRequest.POST(dataStringify('/services/appendOrUpgrade_v2',data,true), data, { "Content-Type": "application/json" },false).then(function (result) {
					if (result.status == 1) {
						if(result.data.status==statusMsg.Success){
							//alertExt("追加服务成功！",function(){
								var data={
									user_id:$rootScope.user.id ,
									order_id:$scope.orderId
								};

								httpRequest.Get(dataStringify('/order/details/get',data),true,{}).then(function (result) {
									  if (result && result.status == statusMsg.Success) {
										$scope.order=result.order;

										httpRequest.Get(dataStringify('/user/details/get_v2',{user_id:result.order.cleaner_id}),true,{}).then(function (result) {
											  if (result && result.status == statusMsg.Success) {
												$scope.cleaner=result.user;
											  }
										});
									  }
								});
							//});
						}
					} else {
						//alert(JSON.stringify(result));
						if(result.data.status=="183011"){
							var arrButton = ["取消","前往充值"];
							openDialog(result.data.message,"", arrButton, null,
								function (r) {
									if (r) {
									   setRechargeRoute({flag:2,cleanerId:$scope.orderId,extData:data});
									   $location.path("/recharge/"+result.data.balance_margin);
									   $scope.$apply($location);
									}
							});
						}else{
							alertWarning(result.data.message);
						}
					}
				});
		}else{
			var data={
				user_id:$rootScope.user.id ,
				order_id:$scope.orderId
			};

			httpRequest.Get(dataStringify('/order/details/get',data),true,{}).then(function (result) {
				  if (result && result.status == statusMsg.Success) {
					$scope.order=result.order;


					httpRequest.Get(dataStringify('/user/details/get_v2',{user_id:result.order.cleaner_id}),true,{}).then(function (result) {
						  if (result && result.status == statusMsg.Success) {
							$scope.cleaner=result.user;
						  }
					});



				  }
			});
			
		}
		
	}
	

	if($scope.isService=="y"){
		$scope.selectedService=[];
		var data={
			user_id:$rootScope.user.id ,
			order_id:$scope.orderId
		};
		httpRequest.Get(dataStringify('/services/filter_v2',data),true,{}).then(function (result) {
			  if (result && result.status == statusMsg.Success) {
				$scope.services=result.services;
				$scope.getTotalAmout();
			  }
		});

		$(".scrollable-content").delegate(".col-xs-2.choice-option","click",function(){
			var $fa=$(this).find('.fa');
			var isMust=$fa.hasClass('must');
			var isRadio=$(this).parent().parent().parent().find(".service-title-radio").length;
			var isChecked=$fa.hasClass('fa-check-circle');
			if(isMust){
				alertWarning("该项服务为必须项目");
				return;
			}
			
			if(isRadio){
				var checkedOption=$(this).parent().parent().parent().find('.fa-check-circle');
				checkedOption.removeClass('fa-check-circle');
				checkedOption.addClass('fa-circle-thin');
				checkedOption.parent().parent().removeClass('main-text2')
			}
			
			if(isChecked){
				$fa.addClass('fa-circle-thin');
				$fa.removeClass('fa-check-circle');
				$fa.parent().parent().removeClass('main-text2')
			}else{
				$fa.addClass('fa-check-circle');
				$fa.removeClass('fa-circle-thin');
				$fa.parent().parent().addClass('main-text2')
			}
			$scope.selectedService=[];
			$(".col-xs-2.choice-option").each(function(){
				var fa=$(this).find('.fa');
				var svs=$(this).attr('data').split('-');
				var isCk=fa.hasClass('fa-check-circle');
				if(isCk){
					$scope.selectedService.push($scope.services[svs[0]].children[svs[1]]);
				}
			});
			$scope.getTotalAmout();

		});
		$scope.getTotalAmout=function(){
			$scope.totalAmout=0;
			for(var i=0;i<$scope.selectedService.length;i++){
				$scope.totalAmout=$scope.totalAmout+parseInt($scope.selectedService[i].price);
			}
			$scope.$apply($scope.totalAmout);
		};
		$scope.appendService=function(){
			var sArr=[];
			for(var i=0;i<$scope.selectedService.length;i++){
				var s={};
				s.service_id=$scope.selectedService[i].id;
				s.count=1;
				s.append_type=$scope.selectedService[i].append_type;
				s.parent_id=$scope.selectedService[i].parent_id;
				sArr.push(s);
			}
			var data={
				user_id:$rootScope.user.id,
				order_id:$scope.orderId,
				services:angular.toJson(sArr)
			};
			httpRequest.POST(dataStringify('/services/appendOrUpgrade_v2',data,true), data, { "Content-Type": "application/json" },true).then(function (result) {
				if (result.status == 1) {
					if(result.data.status==statusMsg.Success){
						alertExt("追加服务成功！",function(){
							history.back();
						});
					}
				} else {
					//alert(JSON.stringify(result));
					if(result.data.status=="183011"){
						var arrButton = ["取消","前往充值"];
						openDialog(result.data.message,"", arrButton, null,
							function (r) {
								if (r) {
								   setRechargeRoute({flag:2,cleanerId:$scope.orderId,extData:data});
								   $location.path("/recharge/"+result.data.balance_margin);
								   $scope.$apply($location);
								}
						});
					}else{
						alertWarning(result.data.message);
					}
				}
			});


		};
	}
		

	$scope.goToServiceDetail=function(url,name){
		$location.path('/service').search({url:url,name:name});
	};

	$scope.updateOrder=function(status){
		var data={
			user_id:$rootScope.user.id,
			order_id:$scope.orderId,
			status:status
		};
		if(status==8){//不满意
			httpRequest.PUT(dataStringify('/order/status/update_v2',data,true), data, { "Content-Type": "application/json" },true).then(function (result) {
				if (result.status == 1) {
					if(result.data.status==statusMsg.Success){
						msg="亲，小牛帮美车师已接收到您的投诉，他将会在第一时间给您回电，服务不周，还请多多谅解。";
						var arrButton = ["确定"];
						openDialog(msg,"",arrButton,0,
							function(r){
								$scope.order.status=8;
								$scope.$apply($scope.order);
						});
					}
				} else {
					alertWarning(result.data.message);
				}
			});

		}
		if(status==5){//满意付款
			var arrButton = ["确定","取消"];
			openDialog("当前余额"+$rootScope.rootAct.balance+"元","使用余额支付",arrButton,0,
				function(r){
					if(!r){
						httpRequest.PUT(dataStringify('/order/status/update_v2',data,true), data, { "Content-Type": "application/json" },true).then(function (result) {
							if (result.status == 1) {
								if(result.data.status==statusMsg.Success){
									$scope.order.status=5;
									$scope.$apply($scope.order);
									
									var rootAct={
										user_id:$rootScope.user.id
									};
									httpRequest.Get(dataStringify('/user/details/get_v2',rootAct),false,{}).then(function (result) {
										  debugAlert(angular.toJson(result));
										  if(result.status==statusMsg.Success){
												
												$rootScope.rootAct.balance=result.user.balance;
												/*$scope.rootAct=result.user;
												if(!$scope.rootAct.avatar){
													$scope.rootAct.avatar=$rootScope.user.headimgurl;
												}*/
												$scope.$apply($rootScope.rootAct);
											}else{
												alertWarning(result.msg);
											}
									});
									
									
								}
							} else {
								alertWarning(result.data.message);
							}
						});
					}

			});
			
		}
		if(status==6){//取消订单
			var arrButton = ["取消","确定"];
			openDialog("您确定要取消该订单吗？","", arrButton, null,
				function (r) {
					if (r) {
						   httpRequest.PUT(dataStringify('/order/status/update_v2',data,true), data, { "Content-Type": "application/json" },true).then(function (result) {
								if (result.status == 1) {
									if(result.data.status==statusMsg.Success){
										$scope.order.status=6;
										$scope.$apply($scope.order);
										$location.path("/");
										$scope.$apply($location);
									}
								} else {
									alertWarning(result.data.message);
								}
							});
					}
			});
			
			
		}

	};
	
});
app.controller('servicesController', function($rootScope,dataStringify, $scope, $location, signSha1, $routeParams, httpRequest){
    setDocumentTitle();
    $rootScope.leftbar="fa-angle-left";
    $(".app-body").css("padding-top","50px");
    
    $scope.selectedService=[];
    $scope.totalAmout=0;
	
	{
		var order=getOrder() || {};
		var arr=order.content || [];
		var s=[];
		for(var i=0 ;i<arr.length;i++){
			s.push(arr[i].id);
		}
		$scope.oldServices=s;
		$scope.totalAmout=order.totalAmout;
	}

	$scope.goToServiceDetail=function(url,name){
		$location.path('/service').search({url:url,name:name});
	};
	

	var localCity = new BMap.LocalCity();
	localCity.get(function(e){
		var city_code=e.code;
		if($rootScope.currentCity && $rootScope.currentCity.city){
			if($rootScope.currentCity.city!=e.name){
				city_code=224;
			}
		}
		var order=getOrder() || {};
		var data={
			city_code:city_code ,
			user_id:$rootScope.user.id ,
			car_type:order.car?order.car.type : 1
		};
		httpRequest.Get(dataStringify('/services/get_v2',data),true,{}).then(function (result) {
			  if (result && result.status == statusMsg.Success) {
				$scope.services=result.services;
				for(var i=0;i<$scope.services.length;i++){
					for(var j=0;j<$scope.services[i].children.length;j++){
						if($scope.services[i].children[j].is_must=='1'){
							//$scope.selectedService.push($scope.services[i].children[j]);
						}
					}
				}
				//$scope.getTotalAmout();
				//alert(angular.toJson(result.services));
			  }
		});
	});

	$(".scrollable-content").delegate(".col-xs-2.choice-option","click",function(){
		var $fa=$(this).find('.fa');
		var isRadio=$(this).parent().parent().parent().find(".service-title-radio").length;
		var isMust=$fa.hasClass('must');
		var isChecked=$fa.hasClass('fa-check-circle');
		if(isMust){
			alertWarning("该项服务为必选项目");
			return;
		}
		if(isRadio){
			var checkedOption=$(this).parent().parent().parent().find('.fa-check-circle');
			checkedOption.removeClass('fa-check-circle');
			checkedOption.addClass('fa-circle-thin');
			checkedOption.parent().parent().removeClass('main-text2')
		}
		if(isChecked){
			$fa.addClass('fa-circle-thin');
			$fa.removeClass('fa-check-circle');
			$fa.parent().parent().removeClass('main-text2')
		}else{
			$fa.addClass('fa-check-circle');
			$fa.removeClass('fa-circle-thin');
			$fa.parent().parent().addClass('main-text2')
		}
		$scope.selectedService=[];
		$(".col-xs-2.choice-option").each(function(){
			var fa=$(this).find('.fa');
			var svs=$(this).attr('data').split('-');
			var isCk=fa.hasClass('fa-check-circle');
			if(isCk){
				$scope.selectedService.push($scope.services[svs[0]].children[svs[1]]);
			}
		});
		$scope.getTotalAmout();

	});
	$scope.getTotalAmout=function(){
		$scope.totalAmout=0;
		for(var i=0;i<$scope.selectedService.length;i++){
			$scope.totalAmout=$scope.totalAmout+parseInt($scope.selectedService[i].price);
		}
		$scope.$apply($scope.totalAmout);
	};
	$scope.save=function(){
		var order=getOrder();
		if(order){
			order.content=$scope.selectedService.length==0?null : $scope.selectedService;
			order.totalAmout=$scope.totalAmout;
		}else{
			order={};
			order.content=$scope.selectedService.length==0?null : $scope.selectedService;
			order.totalAmout=$scope.totalAmout;
		}
		if(order.content==null){
			alertWarning("您未选择服务项目");
			return;
		}
		setOrder(order);
		$location.path('/order');
	};

});

app.controller('serviceController', function($rootScope,dataStringify, $scope, $location, signSha1, $routeParams, httpRequest){
    setDocumentTitle("小牛帮在线预约洗车");
    $rootScope.leftbar="fa-angle-left";
    $(".app-body").css("padding-top","50px");
    $scope.search=$location.search();
    $rootScope.pageTitle=$scope.search.name;

    

    $("#frame").attr("src",$scope.search.url);
    
   
});

app.controller('rechargeController', function($rootScope, $scope, dataStringify, $location, signSha1, $routeParams, httpRequest){
    setDocumentTitle();
    $rootScope.leftbar="fa-angle-left";
    $(".app-body").css("padding-top","50px");
	
	$scope.defaultAmout=parseFloat($routeParams.value) || '';
    $scope.recharge=function(){

    	history.back();
    };
	var data={
		user_id:$rootScope.user.id 
	};
    httpRequest.Get(dataStringify('/recharge/products/get',data),false,{}).then(function (result) {
		  if (result && result.status == statusMsg.Success) {
			$scope.coupons=result.products;
		  }
	});

	var dataAccount={
		user_id:$rootScope.user.id 
	};
	$scope.account={mobile:$rootScope.user.mobile,balance:$rootScope.user?$rootScope.user.balance : '0.00'};
    /*httpRequest.Get(dataStringify('/user/details/get_v2',dataAccount),false,{}).then(function (result) {
		  if (result && result.status == statusMsg.Success) {
			$scope.account=result.user;
		  }
	});*/

	
	
	$scope.rechargeType=1;
	$scope.productId=0;
	$scope.rechargeMethod=function(type){
		$scope.rechargeType=type;
		if(type==2){
			for(var i=0;i<$scope.coupons.length;i++){
				$scope.coupons[i].class="";
			}
			$scope.coupons[0].class="active";
			$scope.rechargeAmout=$scope.coupons[0].amount;
			$scope.productId=$scope.coupons[0].id;
		}else{
			for(var i=0;i<$scope.coupons.length;i++){
				$scope.coupons[i].class="";
			}
			$scope.productId=0;
		}
	};
	$scope.chooseCoupon=function(id,index){
		for(var i=0;i<$scope.coupons.length;i++){
			$scope.coupons[i].class="";
		}
		$scope.rechargeType=2;
		$scope.coupons[index].class="active";
		$scope.rechargeAmout=$scope.coupons[index].amount;
		$scope.productId=id;
	};
	$scope.payType=4;
	$scope.choosePayMetod=function(type){
		$scope.payType=type;
		if(type==3){
			var arrButton = ["取消","确定"];
			openPrompt("<input type='text' placeholder='请输入充值卡密码' style='width:100%;border: 1px solid #eee;'/>","充值卡充值", arrButton, 
				function (r,data) {
					if (r) {
						
					  	var dataCard={
							user_id:$rootScope.user.id ,
							card_no:data[0]
						};
						//alert(JSON.stringify(dataCard));
						httpRequest.POST(dataStringify('/card/purchase',dataCard,true), dataCard, { "Content-Type": "application/json" },true).then(function (result) {
							if (result.status == 1) {
								if(result.data.status==statusMsg.Success){
									alertExt("充值卡充值成功！",function(){
										history.back();
									});
								}
							} else {
								alertWarning(result.data.message);
							}
						});
					}
			});
		}
	};

	$scope.recharge=function(){
		var amount=0;
		if($scope.rechargeType==1){
			if(!$scope.defaultAmout){
				alertWarning("充值金额只能是大于0的数字");
				return;
			}
			var re = /^[0-9]+.?[0-9]*$/;
			if(!re.test($scope.defaultAmout)){
				alertWarning("充值金额只能是数字");
				return;
			}
			amount=$scope.defaultAmout;
		}else{
			amount=$scope.rechargeAmout;
		}
		if($scope.payType===3){
			var arrButton = ["取消","确定"];
			openPrompt("<input type='text' placeholder='请输入充值卡密码' style='width:100%;border: 1px solid #eee;'/>","充值卡充值", arrButton, 
				function (r,data) {
					if (r) {
						   var dataCard={
								user_id:$rootScope.user.id ,
								card_no:data[0]
							};
							//alert(JSON.stringify(dataCard));
							httpRequest.POST(dataStringify('/card/purchase',dataCard,true), dataCard, { "Content-Type": "application/json" },true).then(function (result) {
								if (result.status == 1) {
									if(result.data.status==statusMsg.Success){
										alertExt("充值卡充值成功！",function(){
											history.back();
										});
									}
								} else {
									alertWarning(result.data.message);
								}
							});
					}
			});
		}
		if($scope.payType===1){//支付宝充值
			//window.location="http://m.xiaoniubang.com/api/pay/wapali/alipayapi.php?fee="+amount+"&no="+(new Date()).getTime();
			window.location="/ebank/pay/?amount="+amount
				+"&no="+(new Date()).getTime()
				+"&rechargeType="+$scope.payType
				+"&uid="+$rootScope.user.id
				+"&openid="+$rootScope.user.openid
				+"&productId="+$scope.productId;
		}
		if($scope.payType===2){//微信充值
			window.location="/ebank/pay/?amount="+amount
				+"&no="+(new Date()).getTime()
				+"&rechargeType="+$scope.payType
				+"&uid="+$rootScope.user.id
				+"&openid="+$rootScope.user.openid
				+"&productId="+$scope.productId;
		}
		if($scope.payType===4){//苏州银行手机银行
			window.location="/ebank/pay/?amount="+amount
				+"&no="+(new Date()).getTime()
				+"&rechargeType="+$scope.payType
				+"&uid="+$rootScope.user.id
				+"&openid="+$rootScope.user.openid
				+"&productId="+$scope.productId;
		}
	};

	$scope.checkAmountFormat=function(e){
    	var no=$(e.target).val();
    	if(e.keyCode!=8 && e.keyCode!=46 && e.keyCode!=13 && e.keyCode!=190){
    		if(e.keyCode<48 || e.keyCode>57){
    			e.returnValue=false;
    		}
		}
    };
});


app.controller('myCarsController',function($rootScope, dataStringify, $scope, $location, signSha1, $routeParams, httpRequest){
	setDocumentTitle();
    $rootScope.leftbar="fa-angle-left";
    $(".app-body").css("padding-top","0px");

    $scope.addCar=function(){
    	removeCar();
    	$location.path("/car");
    };

    $scope.goToCar=function(car){
    	removeCar();
    	var c={};
    	c.city=(car.car_no).substr(0,1);
    	c.cityCode=(car.car_no).substr(1,1);
    	c.no=(car.car_no).substr(2);
    	c.id=car.id;
    	c.color=car.color;
    	c.brand=car;
    	setCar(c);
    	$location.path("/car");
    };

    var data={
		user_id:$rootScope.user.id ,
		direction:1
	};
	
    httpRequest.Get(dataStringify('/cars/get',data),true,{}).then(function (result) {
		if (result && result.status == statusMsg.Success) {
			$scope.cars=result.cars;
			var order=getOrder() || {};

			$scope.car=order.car || $scope.cars[0];
		}
	});

	$scope.save=function(){
		var order=getOrder() || {};
		if(order.car && order.car.id && order.car.id==$scope.car.id){

		}else{
			order.content=null;
			order.totalAmout=0;
		}
		
		order.car=$scope.car;
		setOrder(order);
		$location.path("/order/"+getCleaner().id);
	};

	$(".scrollable-content").delegate(".col-xs-2.choice-option","click",function(){
		var $fa=$(this).find('.fa');
		var index=$fa.attr("data");
		var isChecked=$fa.hasClass('fa-check-circle');
		var ckNum=$(".scrollable-content .fa-check-circle").length;
		$(".col-xs-2.choice-option").each(function(){
			if(ckNum>0){
				var fa=$(this).find('.fa');
				fa.addClass('fa-circle-thin');
				fa.removeClass('fa-check-circle');
			}
		});

		
		if(isChecked){
			if(ckNum!=1){
				$fa.addClass('fa-circle-thin');
				$fa.removeClass('fa-check-circle');
			}else{
				$fa.addClass('fa-check-circle');
				$fa.removeClass('fa-circle-thin');
			}
		}else{
			$fa.addClass('fa-check-circle');
			$fa.removeClass('fa-circle-thin');
		}

		$scope.car=$scope.cars[index];
	});

	$scope.swipeLeft=function(e){
		var elm=e.currentTarget;
		$(elm).removeClass("swipe-right");
		$(elm).addClass("swipe-left");
	};

	$scope.swipeRight=function(e){
		var elm=e.currentTarget;
		$(elm).removeClass("swipe-left");
		$(elm).addClass("swipe-right");
	};

	$scope.deleteCar=function(id){
		var data={
			user_id:$rootScope.user.id ,
			car_id:id
		};
		httpRequest.DELETE(dataStringify('/car/delete',data), data, { "Content-Type": "application/json" },true).then(function (result) {
			if (result.status == "OK") {
				
				
				var rdata={
					user_id:$rootScope.user.id ,
					direction:1
				};
				
				httpRequest.Get(dataStringify('/cars/get',rdata),true,{}).then(function (result) {
					if (result && result.status == statusMsg.Success) {
						$scope.cars=result.cars;
						var order=getOrder() || {};

						$scope.car=order.car || $scope.cars[0];
						alertWarning("删除成功！");
					}
				});
			} else {
				alertWarning(result.data.message);
			}
		});
	};

});

app.controller('carController',function($rootScope, dataStringify, $scope, $location, signSha1, $routeParams, httpRequest){
	setDocumentTitle();
    $rootScope.leftbar="fa-angle-left";
    $(".app-body").css("padding-top","0px");
	
	$scope.car=getCar() || {};
	
	$scope.carNo=$scope.car.no || '';

    $scope.selectBrand=function(){
		$scope.setCar();
    	$location.path("/carBrand");
    };

    $scope.goToColor=function(){
    	$('#demo').mobiscroll('show');
    };

    
	
	$('#demo').mobiscroll().select({
        theme: 'android-ics light',
        display: 'bottom',
        minWidth: 200,
        width: 300,
        mode: 'scroller',
		setText: "确认", 
		cancelText: "取消",
		onSelect:function(){
			var selectObj=$('#demo').mobiscroll('getInst');
			$scope.car=getCar() || {};
			$scope.car.color=selectObj.getValue();
			$scope.$apply($scope.car.color);
			var c=getCar() || {};
			c.color=$scope.car.color;
			setCar(c);
		}
    });

    $scope.setCar=function(){
    	var car=getCar() || {};
    	car.no=$scope.carNo;
		setCar(car);
    };
	
	

    $scope.saveCar=function(){
		$scope.setCar();
    	var car=getCar() || {};
    	car.city=car.city || '苏';
    	car.cityCode=car.cityCode || 'E';
    	//alert(angular.toJson(car));
    	if(!car.no || (car.no && car.no.length!=5)){
			alertWarning("请输入5位车牌号");
			return;
		}
		if(!car.brand){
			alertWarning("请选择车辆型号");
			return;
		}
		if(!car.brand.mode && !car.brand.name){
			alertWarning("请选择车辆型号");
			return;
		}
		if(!car.color){
			alertWarning("请选择车辆颜色");
			return;
		}
    	var data={
			user_id:$rootScope.user.id ,
			car_no:car.city+car.cityCode+car.no,
			brand:car.brand.brand,
			mode:car.brand.name || car.brand.mode,
			color:car.color,
			type:car.brand.type,
			//front_image:'',
			//behind_image:''
		};
		
		//alert(JSON.stringify(data));
		if(car.id){
			data.car_id=car.id;
			httpRequest.PUT(dataStringify('/car/update',data,true), data, { "Content-Type": "application/json" },true).then(function (result) {
				if (result.status == 1) {
					if(result.data.status==statusMsg.Success){
						$scope.newcar=result.data.car;
						$scope.car.id=result.data.car.id;
						setCar($scope.car);
						alertExt("修改成功！",function(){
							$location.path("myCars");
							$scope.$apply($location);
						});
					}
				} else {
					alertWarning(result.data.message);
				}
			});
		}else{
			httpRequest.POST(dataStringify('/car/add',data,true), data, { "Content-Type": "application/json" },true).then(function (result) {
				if (result.status == 1) {
					if(result.data.status==statusMsg.Success){
						$scope.newcar=result.data.car;
						$scope.car.id=result.data.car.id;
						setCar($scope.car);
						alertExt("添加成功！",function(){
							$location.path("myCars");
							$scope.$apply($location);
						});
					}
				} else {
					alertWarning(result.data.message);
				}
			});
		}
    };

    $scope.checkCarNo=function(e){
    	var no=$(e.target).val();
    	if(no && no.length>=5){
    		if(e.keyCode!=8 && e.keyCode!=46){
    			e.returnValue=false;
    		}
    	}
    };

     $scope.upperCaseCarNo=function(e){    	
    	/*var no=$(e.target).val();
    	var newNo=angular.uppercase(no);
    	$(e.target).val(newNo);*/
    };

    $scope.getRegion=function(){
    	$location.path("/carCity");
    };
    $scope.getRegionLetter=function(){
    	$location.path("/carCity/1");
    };
});

app.controller('carBrandController',function($rootScope, dataStringify, $scope,$filter,$anchorScroll,anchorScroll, $location, signSha1, $routeParams, httpRequest){
	setDocumentTitle();
    $rootScope.leftbar="fa-angle-left";
    $(".app-body").css("padding-top","0px");
	
    $scope.gotoAnchor = function(e) {
    	var t=$(e.target).attr("target");
        anchorScroll.toView("#"+t,true,50);
    };
	
	$scope.gotoSubBrand=function(sId){
		$location.path("/carSubBrand/"+sId);
	};

	var data={
		user_id:$rootScope.user.id 
	};
    httpRequest.Get(dataStringify('/car/brand/get',data),true,{}).then(function (result) {
		if (result && result.status == statusMsg.Success) {
			$scope.carBrands=result.car_brands;
		}
	});

});

app.controller('carSubBrandController',function($rootScope, dataStringify, $scope, $location, signSha1, $routeParams, httpRequest){
	setDocumentTitle();
	var brandId=$routeParams.id || 0;
    $rootScope.leftbar="fa-angle-left";
    $(".app-body").css("padding-top","0px");

    var data={
		user_id:$rootScope.user.id ,
		brand_id: brandId
	};
    httpRequest.Get(dataStringify('/car/modes/get',data),true,{}).then(function (result) {
		if (result && result.status == statusMsg.Success) {
			$scope.subBrands=result.car_modes;
		}
	});

	$scope.gotoOrder=function(sId,index,parent){
		var c=$scope.subBrands[parent].list[index];
		c.brandId=brandId;
		var car=getCar() || {};
		car.brand=c;
		setCar(car);		
		$location.path("/car");
	};


});

app.controller('carCityController',function($rootScope, dataStringify, $scope, $location, signSha1, $routeParams, httpRequest){
	setDocumentTitle();

    $rootScope.leftbar="fa-angle-left";
    $(".app-body").css("padding-top","0px");

    $scope.type=$routeParams.type? true : false;


    $(".scrollable-content").delegate(".car-city","click",function(){
		$(this).addClass("car-city-active");
		var car=getCar() || {};
		if($scope.type){
			car.cityCode=$(this).text();
		}else{
			car.city=$(this).text();
		}
		
		setCar(car);
		$location.path("/car");
		$scope.$apply($location);
	});
});
app.controller('myOrdersController',function($rootScope, dataStringify, $scope, $location, signSha1, $routeParams, httpRequest){
	setDocumentTitle();
	
	
	$rootScope.currentTab=$rootScope.currentTab? $rootScope.currentTab : 1;
	$scope.setCurrentTab=function(c){
		$rootScope.currentTab=c;
	}
	
    $rootScope.leftbar="fa-angle-left";
    $(".app-body").css("padding-top","50px");

	var data={
		user_id:$rootScope.user.id ,
		type: 1,
		direction:1,
		reference_id:1
	};

    httpRequest.Get(dataStringify('/order/my',data),{}).then(function (result) {
		  if (result && result.status == statusMsg.Success) {
		  	debugAlert(angular.toJson(result));
			$scope.currentOrders=result.orders;
		  }else{
			alertWarning(result.message);
		  }
	});

	var data={
		user_id:$rootScope.user.id ,
		type: 2,
		direction:1,
		reference_id:1
	};

    httpRequest.Get(dataStringify('/order/my',data),{}).then(function (result) {
		  if (result && result.status == statusMsg.Success) {
		  	debugAlert(angular.toJson(result));
			$scope.orders=result.orders;
		  }else{
			alertWarning(result.message);
		  }
	});

	$scope.goToOrderPage=function(id){
		$location.path("/payment/"+id);
	};
    
    

});

app.controller('myCouponsController',function($rootScope, dataStringify, $scope, $location, signSha1, $routeParams, httpRequest){
	setDocumentTitle();

    $rootScope.leftbar="fa-angle-left";
    $(".app-body").css("padding-top","0");

	var data={
		user_id:$rootScope.user.id //,
		//status:1
	};
	
    httpRequest.Get(dataStringify('/coupon/my',data),{}).then(function (result) {
		  if (result && result.status == statusMsg.Success) {
		  	debugAlert(angular.toJson(result));
			$scope.coupons=result.coupons;
			/*$scope.coupons= [
    {
      "service_id": "5",
      "name": "内饰基础清洁",
      "list": [
        {
          "serial_no": "544A08878E1ED16F",
          "expire_date": {},
          "create_time": "2014-12-16 12:41:17",
          "creator": "1",
          "last_update_time": "2014-12-16 12:47:06",
          "update_by": "145",
          "status": "0",
          "order_id": "498",
          "amount": "4",
          "requirement_id": "",
          "service_id": "5",
          "name": "小牛帮洗车代金券",
          "coupon_type": "2",
          "small_car_price": "",
          "big_car_price": "",
          "memo": "",
          "small_reference_price": "",
          "big_reference_price": "",
          "provider_id": "1",
          "user_id": "1",
          "category": "内饰基础清洁"
        }
      ]
    }
  ];*/
		  }else{
			alertWarning(result.message);
		  }
	});

	/*var data={
		user_id:$rootScope.user.id ,
		status: 2
	};

    httpRequest.Get(dataStringify('/coupon/my',data),{}).then(function (result) {
		  if (result && result.status == statusMsg.Success) {
		  	debugAlert(angular.toJson(result));
			$scope.orders=result.coupons;
		  }else{
			alertWarning(result.message);
		  }
	});
	
	
	
	$scope.goToOrderPage=function(id){
		$location.path("/payment/"+id);
	};
    */

    $scope.addCoupon=function(data,callback){

		httpRequest.POST(dataStringify('/coupon/add',data,true), data, { "Content-Type": "application/json" },true).then(function (result) {
			if (result.status == 1) {
				if(result.data.status==statusMsg.Success){
					alertExt("添加优惠券成功！",function(){
						if(callback){
							callback(result.data.coupon);
						}
					});
				}
			} else {
				alertWarning(result.data.message);
			}
		});
	};

	$scope.addNewCoupon=function(){
		if(!$scope.couponNo){
			alertWarning("请输入优惠券密码");
			return false;
		}
		var data={
			user_id:$rootScope.user.id ,
			coupon_serial_no:$scope.couponNo

		};
		var callback=function(cp){
			$rootScope.couponPage=false;
  	 		$rootScope.isNoBack=false;
  	 		var data={
				user_id:$rootScope.user.id 
			};

			httpRequest.Get(dataStringify('/coupon/my',data),{}).then(function (result) {
				  if (result && result.status == statusMsg.Success) {
					debugAlert(angular.toJson(result));
					$scope.coupons=result.coupons;
				  }else{
					alertWarning(result.message);
				  }
			});
		};
		$scope.addCoupon(data,callback);
	};

	$scope.navSave=function(){
		$scope.couponNo="";
  	 	$rootScope.couponPage=true;
  	 	$rootScope.isNoBack=true;
	};
	
	$scope.setCoupon=function(coupon){
		if(coupon.provider_id==2){
			var arrButton = ["取消","前往下载"];
			openDialog("该优惠券只能在小牛帮APP内使用，请下载小牛帮APP","", arrButton, null,
				function (r) {
					if (r) {
					   window.location.href="http://d.xiaoniubang.com/";
					}
			});
			return;
			
		}
		
	};
    

});
app.controller('accountDetailController',function($rootScope, dataStringify, $scope, $location, signSha1, $routeParams, httpRequest){
	setDocumentTitle();

    $rootScope.leftbar="fa-angle-left";
    $(".app-body").css("padding-top","50px");

    var data={
		user_id:$rootScope.user.id ,
		type: 1,
		direction:1,
		reference_id:1
	};
	

    httpRequest.Get(dataStringify('/transactions/get',data),{}).then(function (result) {
		  //alert(JSON.stringify(result));
		  if (result && result.status == statusMsg.Success) {
		  	debugAlert(angular.toJson(result));
			$scope.currentOrders=result.transactions;
		  }else{
			alertWarning(result.message);
		  }
	});

	$scope.getPayType=function(t){
		//1 余额 2 e币(积分) 3 红包
		if(t==1){
			return "余额支付";
		}
		if(t==2){
			return "e币(积分)";
		}
		if(t==3){
			return "红包";
		}
		return "余额支付";
	};

	$scope.getRechargeType=function(t){
		//1 银联,2 支付宝(移动),3充值卡充值,4支付宝(wap),5建行网银,6微信支付,7财付通
		if(t==1){
			return "银联";
		}
		if(t==2){
			return "支付宝(移动)";
		}
		if(t==3){
			return "充值卡充值";
		}
		if(t==4){
			return "支付宝(wap)";
		}
		if(t==5){
			return "建行网银";
		}
		if(t==6){
			return "微信支付";
		}
		if(t==7){
			return "财付通";
		}
		if(t==8){
			return "系统充值";
		}
		if(t==9){
			return "苏州银行";
		}
		return "充值卡充值";
	};

	var data={
		user_id:$rootScope.user.id ,
		type: 2,
		direction:1,
		reference_id:1
	};

    httpRequest.Get(dataStringify('/transactions/get',data),{}).then(function (result) {
		  if (result && result.status == statusMsg.Success) {
		  	debugAlert(angular.toJson(result));
			$scope.orders=result.transactions;
		  }else{
			alertWarning(result.message);
		  }
	});


});



app.controller('oauth2Controller', function ($rootScope, $scope, httpRequest, dataStringify, $location, $window, $routeParams) {
      setDocumentTitle("微信登录授权");
      
      $rootScope.pageTitle="微信登录授权";
      var host=$location.absUrl().split("oauth2.php")[0];
      var code=getQueryStringByName('code');
      var state=getQueryStringByName('state');
      $scope.isLogin=false;
	  var url="http://m.xiaoniubang.com/api/getopenid.php?code="+code;
      $.get(url, function(r){
      	 if(r && r.openid){
      	 	var url2="http://m.xiaoniubang.com/api/getuser.php?token="+r.access_token+"&openid="+r.openid;
      	 	alertWarning("授权成功，正在获取用户信息...");
      	 	$.get(url2, function(r2){
				 if(r2 && r2.openid){
						alertExt("获取用户信息成功",function(){
							//  
							var data={
								weixin_open_id:r2.openid
							};

							var bindPhone=function()
							{
								setDocumentTitle("绑定手机号码");
								$rootScope.pageTitle="微信登录授权";
								$scope.isLogin=true;
								$scope.$apply($rootScope.pageTitle);
								$scope.$apply($scope.isLogin);

								$("#btnSetPhone").bind("click",function(){
									var mobile=$("#mobile").val();
									if(!mobile){
										alertWarning("请输入手机号码");
										return;
									}
									if(mobile.length!=11){
										alertWarning("请输入11位手机号码");
										return;
									}
									var data={
										mobile:mobile,
										weixin_open_id:r2.openid
									};
									httpRequest.POST(dataStringify('/user/wechat/binding',data,true), data, { "Content-Type": "application/json" },true).then(function (result) {
										if (result.status == 1) {
											if(result.data.status==statusMsg.Success){
												alertExt("绑定手机号成功！",function(){
													setToken(result.data.user,r2);
													$window.location=host+"#/"+state;
												});
											}
										} else {
											alertWarning(result.data.message);
										}
									});
								});
							};

							httpRequest.Get(dataStringify('/user/wechat/details',data),{}).then(function (result) {
								  debugAlert(angular.toJson(result));
								  if (result && result.status == statusMsg.Success) {
									if(result.user && result.user.mobile){
										setToken(result.user,r2);
										$window.location=host+"#/"+state;
									}else{
										bindPhone();
									}
								  }

								  if (result && result.status == '193020') {
									bindPhone();
								  }
							});



						});
				 }else{
					alertWarning(r.errmsg);
				 }
				 
			  });
      	 }else{
      	 	alertWarning(r.errmsg);
      	 }
      });
	  /*{
	  	"openid":"of4CVtxpUKJHGSe8MPcfouZA2WB8",
	    "nickname":"Paul 鍚�",
	    "sex":1,
	    "language":"zh_CN",
	    "city":"鑻忓窞",
	    "province":"姹熻嫃",
	    "country":"涓浗",
	    "headimgurl":"http:\/\/wx.qlogo.cn\/mmopen\/ajNVdqHZLLBZEC8ibJswbH32druSTEOZhrficIvOWX52DwjWCAPO9chhvGLUIdkTAhCnrXia6wTrkTpiccSQm9gPIg\/0",
	    "privilege":[]
	  }*/
});

app.controller('homeController', function($rootScope, $scope, $location, signSha1, $routeParams, httpRequest){
    setDocumentTitle();
    $rootScope.leftbar="fa-bars";
    $(".app-body").css("padding-top","50px");
	
	$("#allmap").height($(".home-page").height()-$(".nav-bar-bottom").height());
    var bm = new BMap.Map("allmap");
    
	getLocation(function(data,isSuccess){
		if(!isSuccess){
			//alert(data.message);
			alertWarning("请先开启您的定位服务再试");
		}else{
			translatePoint(data);
		}
	});
	function translatePoint(position){ 
		var currentLat = position.coords.latitude; 
		var currentLon = position.coords.longitude;
		var gpsPoint = new BMap.Point(currentLon, currentLat);
		bm.centerAndZoom(gpsPoint, 15);
		bm.addControl(new BMap.NavigationControl());

		setTimeout(function () {
            BMap.Convertor.translate(gpsPoint, 0, initMap);     //真实经纬度转成百度坐标
        }, 0);

	}
	function initMap(point){ 
		//alert(point);
		var marker = new BMap.Marker(point);
		bm.addOverlay(marker);
		var label = new BMap.Label("美车师", { offset: new BMap.Size(20, -10) });
		marker.setLabel(label); //添加百度label
		bm.setCenter(point);
	}
	
	$scope.order=function(){
		$location.path("/teachers");
	};
});
