var app = angular.module('MobileAngularUioauth', [
  'ngRoute',
  'mobile-angular-ui',
  'mobile-angular-ui.gestures'
]);
var preventCache='?20150422';//+Math.random().toString(36);

app.config(function($routeProvider) {
  $routeProvider.when('/',                      {templateUrl: 'views/oauth2.html'+preventCache, reloadOnSearch: false});
  $routeProvider.when('/oauth2', { templateUrl: "views/wechat/oauth2.html?"+preventCache });
});

app.controller('MainController', function($rootScope,dataStringify, httpRequest, $scope, $location,$window){
  
  $rootScope.$on('$routeChangeStart', function(){
    
  });
  
  $rootScope.$on('$routeChangeSuccess', function(a,b,c){
   
	
  });
  
});