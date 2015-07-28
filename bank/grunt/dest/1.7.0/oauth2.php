<!DOCTYPE html>
<html>
  <head>
    <?php
		$preventCache=2015063011550;
	?>
    <meta charset="utf-8" />
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

	<script src="js/agl.min.js?<?php echo $preventCache;?>"></script>
    <script src="js/libs.min.js?<?php echo $preventCache;?>"></script>	
	<script src="js/mains.min.js?<?php echo $preventCache;?>"></script>
    <script src="js/oauth2.js?<?php echo $preventCache;?>"></script>
	<script src="js/index.min.js?<?php echo $preventCache;?>"></script>
  </head>

  <body 
    ng-app="MobileAngularUioauth" 
    ng-controller="MainController"

     style="background:#ffffff;text-align:center;"
    >
    <div class="app" style="background:#ffffff;">

     <div class="navbar navbar-app navbar-absolute-top">
        <div class="navbar-brand navbar-brand-center" ui-yield-to="title">
          微信登录授权
        </div>
	  </div>

	  
      <div class="app-body">
        
        <div class="app-content">
          <ng-view></ng-view>
        </div>
      </div>

    </div><!-- ~ .app -->
  </body>
</html>
