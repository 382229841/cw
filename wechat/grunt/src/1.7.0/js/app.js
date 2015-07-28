var app = angular.module('MobileAngularUiExamples', [
  'ngRoute',
  'mobile-angular-ui',
  'mobile-angular-ui.gestures'
]);
var preventCache='?'+Math.random().toString(36);

app.config(function($routeProvider) {
  $routeProvider.when('/',                      {templateUrl: 'views/teachers.html'+preventCache, reloadOnSearch: false});
  //$routeProvider.when('/teachers',           {templateUrl: 'views/teachers.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/teacher',           {templateUrl: 'views/teacher.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/order',       		{templateUrl: 'views/order.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/order/:cleanerId',       		{templateUrl: 'views/order.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/address',       		{templateUrl: 'views/address.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/payment',       		{templateUrl: 'views/payment.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/payment/:orderId',       		{templateUrl: 'views/payment.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/payment/:orderId/:isService',       		{templateUrl: 'views/payment.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/recharge',       		{templateUrl: 'views/recharge.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/recharge/:value',       		{templateUrl: 'views/recharge.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/mine',       		{templateUrl: 'views/mine.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/login',       		{templateUrl: 'views/registe.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/services',       		{templateUrl: 'views/services.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/service',       		{templateUrl: 'views/service.html'+preventCache, reloadOnSearch: false});
  
  $routeProvider.when('/myCars',       		{templateUrl: 'views/myCars.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/car',       		{templateUrl: 'views/car.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/carCity',       		{templateUrl: 'views/carCity.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/carCity/:type',       		{templateUrl: 'views/carCity.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/carBrand',       		{templateUrl: 'views/carBrand.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/carSubBrand',       		{templateUrl: 'views/carSubBrand.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/carSubBrand/:id',       		{templateUrl: 'views/carSubBrand.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/myOrders',       		{templateUrl: 'views/myOrders.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/myCoupons',       		{templateUrl: 'views/myCoupons.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/accountDetail',       		{templateUrl: 'views/accountDetail.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/oauth2', { templateUrl: "views/oauth2.html?"+preventCache });
  $routeProvider.when('/error', { templateUrl: "views/error.html?"+preventCache });
  $routeProvider.when('/pay/success/:tradeNo', { templateUrl: "views/paySuccess.html?"+preventCache });
  $routeProvider.otherwise({
	redirectTo: '/'
  });
  //$locationProvider.html5Mode(true);
});

app.controller('MainController', function($rootScope,dataStringify, httpRequest, $scope, $location,$window){
  $scope.userAgent = navigator.userAgent;  
  $rootScope.leftbar="fa-bars";
  $scope.isShowNavbar=true;
  $rootScope.$on('$routeChangeStart', function(){
    $rootScope.loading = true;
  });


  var isTest=true;
  $rootScope.isTest=isTest;
  $rootScope.pageTitle="";

  $rootScope.oauth2 = function(state,type){
  	if(isTest) return;
    $window.location=webchatOauth(state,type);
  };

  $rootScope.user=!isTest? getToken() : {id:4113,mobile:'15150181446'};
  //alert(angular.toJson($rootScope.user));
  if(!$rootScope.user && isWeixin()){
  	$rootScope.oauth2("","userinfo");
  }
  if(!isWeixin()){
  	//$location.path("error");
  }
	debugAlert(angular.toJson($rootScope.user));
	if($rootScope.user && $rootScope.user.id){
		var rootAct={
			user_id:$rootScope.user.id
		};
		httpRequest.Get(dataStringify('/user/details/get_v2',rootAct),false,{}).then(function (result) {
			  //alert(angular.toJson(result));
			  if(result.status==statusMsg.Success){

					$scope.rootAct=result.user;
					$scope.rootAct.balance=(parseFloat($scope.rootAct.balance)).toFixed(2);
					if(!$scope.rootAct.avatar){
						$scope.rootAct.avatar=$rootScope.user.headimgurl;
					}
				}else{
					alertWarning(result.msg);
				}
		});
	}
    
  $rootScope.$on('$routeChangeSuccess', function(a,b,c){
    $rootScope.loading = false;
	if(isWeixin()){
		$scope.isShowNavbar=true;
	}else{
		$scope.isShowNavbar=true;
	}
	if($location.path()==='/'){
		$scope.isShowTopLine=false;
	}else{
		if(isWeixin()){
			$scope.isShowTopLine=false;
		}
	}

	$rootScope.shareToFriends=function(){
        
        if(!isWeixin()){
            var arrButton = ["确定"];
            openDialog("请在微信内打开并分享到朋友圈", "", arrButton, null,
                function (r) {
                    if (r) {
                       
                    }
                });
        }else{
            $rootScope.fadeInShare();
        }
    }

    $rootScope.fadeOutShare=function(){
        $("#shareHint").fadeOut();
    }
    $rootScope.fadeInShare=function(){
        $("#shareHint").fadeIn();
    }
	
  });

  var scrollItems = [];

  for (var i=1; i<=100; i++) {
    scrollItems.push('Item ' + i);
  }

  $scope.scrollItems = scrollItems;

  $scope.bottomReached = function() {
    alert('Congrats you scrolled to the end of the list!');
  }
  
  $scope.back=function(){
  	 if($rootScope.isNoBack){
  	 	$rootScope.couponPage=false;
  	 	$rootScope.isNoBack=false;
  	 	return;
  	 }
  	 if($location.path()=='\/'){
  	 	$rootScope.Ui.toggle('uiSidebarLeft');
  	  	return
  	 }
  	 var path=$location.path();
  	 //alert(path);
  	 var newPath="";
  	 newPath=defindeBackBtn[path];
  	 if(path.indexOf('myCars')>-1){
  	 	var cleaner=getCleaner();
  	 	newPath=defindeBackBtn[path]+"/"+cleaner.id;
  	 }
  	 if(path.indexOf('myCars')>-1){
  	 	var cleaner=getCleaner();
  	 	newPath=defindeBackBtn[path]+"/"+cleaner.id;
  	 }
  	 if(path.indexOf('order')>-1){
  	 	newPath=defindeBackBtn['/order'];
  	 }
  	 
  	 if(newPath){
  	 	$location.path(newPath);
  	 	return;
  	 }
	 history.back();
  };
  $scope.goHome=function(){
	  $location.path('/');
  };
  $rootScope.getStar=function(value){
  	$rootScope.star=[];
  	var star="";
  	value=value+'';
  	if(value.length==0){
		star="<i class=\"main-text2 fa fa-star-o\"></i>"+
				"<i class=\"main-text2 fa fa-star-o\"></i>"+
				"<i class=\"main-text2 fa fa-star-o\"></i>"+
				"<i class=\"main-text2 fa fa-star-o\"></i>"+
				"<i class=\"main-text2 fa fa-star-o\"></i>";
				$rootScope.star=['fa-star-o','fa-star-o','fa-star-o','fa-star-o','fa-star-o'];
  	}else{
  		if(value.indexOf('.')==-1){
  			value=parseInt(value);
  			value=value>5?5:value;
  			for(var i=0;i<value;i++){
				star=star+"<i class=\"main-text2 fa fa-star\"></i>";
				$rootScope.star.push('fa-star');
  			}
  			for(var i=0;i<5-value;i++){
				star=star+"<i class=\"main-text2 fa fa-star-o\"></i>";
				$rootScope.star.push('fa-star-o');
  			}
  		}else{
  			value=parseInt(value);
  			value=value>4?4:value;
  			for(var i=0;i<value;i++){
				star=star+"<i class=\"main-text2 fa fa-star\"></i>";
				$rootScope.star.push('fa-star');
  			}
  			for(var i=0;i<4-value;i++){
				star=star+"<i class=\"main-text2 fa fa-star-o\"></i>";
				$rootScope.star.push('fa-star-o');
  			}
  			star=star+"<i class=\"main-text2 fa fa-star-half-o\"></i>";
  			$rootScope.star.push('fa-star-half-o');
  		}
  	}

  	//return star;
  };
  
  $scope.navigateTo=function(d){
	  $location.path("/"+d);	  
  };

  $rootScope.getOrderStatus=function(s){
  	/*1 刚下单
	2 已接受
	3 洗车中
	4 已洗完
	5 已确认(满意)
	6 已取消
	7 已过期
	8 不满意
	0未评价
	1已评价*/
	s=parseInt(s);
	var status="";
  	switch(s){
  		case 1:
  			status="刚下单";
  			break;
  		case 2:
  			status="已接受";
  			break;
  		case 3:
  			status="洗车中";
  			break;
  		case 4:
  			status="已洗完";
  			break;
  		case 5:
  			status="已确认";
  			break;
  		case 6:
  			status="已取消";
  			break;
  		case 7:
  			status="已过期";
  			break;
  		case 8:
  			status="不满意";
  			break;
  	}
  	return status;
  };
  
});