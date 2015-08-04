<!DOCTYPE html>
<html>
  <head>
    <?php
		$preventCache=201507301319;
	?>
	<meta charset="utf-8" />
    <meta http-equiv="Content-Type"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimal-ui" />
    <meta name="apple-mobile-web-app-status-bar-style" content="yes" />
	<meta content="telephone=no" name="format-detection" />
    
	<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
	
	<link rel="shortcut icon" href="favicon.png" type="image/x-icon" />
	
    <link rel="stylesheet" href="css/index.min.css?<?php echo $preventCache;?>" />
	
	<script type="text/javascript" src="http://api.map.baidu.com/api?ak=SS5uyU39oNlHtswd1T6ZmLCB&v=1.5"></script>
	<script type="text/javascript" src="http://developer.baidu.com/map/jsdemo/demo/convertor.js"></script>
	
	<script type="text/javascript" src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
	<script src="js/agl.min.js?<?php echo $preventCache;?>"></script>
    <script src="js/libs.min.js?<?php echo $preventCache;?>"></script>	
	<script src="js/mains.min.js?<?php echo $preventCache;?>"></script>
    <script src="js/app.min.js?<?php echo $preventCache;?>"></script>
	<script src="js/index.min.js?<?php echo $preventCache;?>"></script>
  </head>

  <body 
    ng-app="MobileAngularUiExamples" 
    ng-controller="MainController"
    >

    <!-- Sidebars -->
	<div ng-swipe-left='Ui.turnOff("uiSidebarLeft")' ng-include="'views/sidebar.html?10'" 
			ui-track-as-search-param='true'
			class="sidebar sidebar-left"></div>
			
    <div class="app" ng-swipe-right='Ui.turnOn("uiSidebarLeft")' ng-swipe-left='Ui.turnOff("uiSidebarLeft")'>
		
      <div class="navbar navbar-app navbar-absolute-top" ng-show="isShowNavbar">
        <div class="navbar-brand navbar-brand-center" ui-yield-to="title">
          
        </div>
		<div class="btn-group pull-left" ng-click="back()">
          <div class="btn btn-back sidebar-toggle">
            <i class="fa {{leftbar}}"></i>
          </div>
        </div>
	  </div>
	  <div class="weixin-top-line" ng-if="isShowTopLine">
        
	  </div>  

	  
      <div class="app-body" ng-class="{loading: loading}" style="padding-top:{{isShowNavbar?'50px':'0px'}}">
        <div ng-show="loading" class="app-content-loading">
          <i class="fa fa-spinner fa-spin loading-spinner"></i>
        </div>
        <div class="app-content">

        <div id="shareHint" ng-click="fadeOutShare();" style="display:none;position: fixed;
				background: #000000;
				width: 100%;
				top: 0;
				left: 0;
				z-index: 99999999;
				opacity: .8;
				height: 100%;">
			<img src="images/hint-1.png" style="position: fixed;width:55%;left:2em;top:2.8em;"/>
			<img src="images/hint-2.png" style="position: fixed;width:30%;right:1em;"/> 
		</div>
          <ng-view></ng-view>
        </div>
      </div>

    </div><!-- ~ .app -->

    <div ui-yield-to="modals"></div>
  </body>
</html>
