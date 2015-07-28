<?php 
	header ( 'Content-type:text/html;charset=UTF-8' );
	include_once $_SERVER ['DOCUMENT_ROOT'] . '/ebank/mpi/payweb_mpi/func/Common.php';
	include_once $_SERVER ['DOCUMENT_ROOT'] . '/ebank/mpi/payweb_mpi/func/SDKConfig.php';
	include_once $_SERVER ['DOCUMENT_ROOT'] . '/ebank/mpi/payweb_mpi/func/Log.php';
	include_once $_SERVER ['DOCUMENT_ROOT'] . '/ebank/mpi/payweb_mpi/func/SecureUtil.php';
	include_once $_SERVER ['DOCUMENT_ROOT'] . '/ebank/mpi/payweb_mpi/func/HttpClient.php';
	
	//$transType = $_POST['transType'];
    transConsume();
	/**
	 *	交易类型判断
	 */
	/*if('01' == $transType){
		transConsume();//消费			
	}else if('31' == $transType){
		revokeCore();//消费撤销
	}else if('34' == $transType){
		returnGoods();//退货
	}*/
	
	/**
	 * 消费交易-前台 
	 */
	 function transConsume(){
	 		$log = new PayLog ( SDK_LOG_FILE_PATH, "PRC", SDK_LOG_LEVEL );
			$log->LogInfo( "[处理前台请求开始]" );
			$secMerId = '';//$_POST['secMerId'];
			if(!isset($secMerId) || empty($secMerId)){
				$secMerId = "";
			}
			$payChannel = $_REQUEST['payChannel'];
			if(!isset($payChannel) || empty($payChannel)){
				$payChannel = "";
			}
			$amount = transAmountConvert(0,$_REQUEST['orderAmount']);
			$params = array(
				'mchtAccessType' => '01', //商户接入类型(01收单，02发卡),必传,默认为商户到网关,网关以01收单平台进行支付 普通商户传01，银联传02
				'currencyType' => '156', //币种 156人民币
				'version' => '1.0.0',	//版本号
				'charset' => 'UTF-8',	//编码格式 默认(utf-8)
				'locale' => 'en',	//语言 默认（en）
				'channel' => '6001',	//渠道编号,商户6001
				'payAccessTypeId' =>  '01',  // 01页面跳转交易（支付），02后台交易(消费撤销，退货)
				'orderAmount' => $amount,	//订单金额（以分为最小单位 如100元 = 10000 100.01元 = 10001）
				'orderTime' => date("YmdHis",time()),//$_POST['orderTime'],	//订单时间，格式[yyyyMMddHHmmss]
				'orderNumber' =>$_REQUEST['orderNumber'].$_REQUEST['user_id'],// $_POST['orderNumber'],	//消费的订单号，由商户生成
				'transType' => '01',		//交易类型(01:消费，31:消费撤销，34:退货,1001:对账文件,35:商户交易状态查询)
				'merId' => '585320548160001',//$_POST['merId'],//普通商户或一级商户，商户号商户
				'secMerId' => $secMerId,//一级商户下，二级商户交易时必送
				'payChannel' => $payChannel,				//商户自定义支付渠道是必送：苏州银行网银：6002苏州银行手机银行：6003银联在线：6006(保留域)
				'backEndUrl' => BACK_NOTIFY_URL ,//后台通知地址
				'frontEndUrl' => FRONT_NOTIFY_URL,//前台通知地址
				'customerIp' => '127.0.0.1',	//ip地址
				'termType' => '02',//终端类型
				'signature'=>'',
			);
			//var_dump($params);exit;
			// 签名
			sign ( $params );
			
			// 前台请求地址
			$front_uri = NETWAY_FRONT_TRANS_URL;
			$log->LogInfo ( "前台请求地址为>" . $front_uri );
			
			//echo $params ['signature'];
		
			$params_str = base64_encode(covertParamsToJson ( $params ));
		
			// 构造 自动提交的表单
			$html_form = create_html ( $params_str, $front_uri );
			
			$log->LogInfo ( "-------前台交易自动提交表单>--begin----" );
			$log->LogInfo ( $html_form );
			$log->LogInfo ( "-------前台交易自动提交表单>--end-------" );
			$log->LogInfo ( "============处理前台请求 结束===========" );
			echo $html_form;
	 	
	 }
	
	 /**
	 * 消费撤销-后台 
	 */
	 function revokeCore(){
	 		$log = new PayLog ( SDK_LOG_FILE_PATH, "PRC", SDK_LOG_LEVEL );
			$log->LogInfo( "[处理后台请求开始]" );
			$secMerId = $_POST['secMerId'];
			if(!isset($secMerId) || empty($secMerId)){
				$secMerId = "";
			}
			$amount = transAmountConvert(0,$_POST['orderAmount']);
			$params = array(
				'mchtAccessType' => '01', //商户接入类型(01收单，02发卡),必传,默认为商户到网关,网关以01收单平台进行支付 普通商户传01，银联传02
				'currencyType' => '156', //币种 156人民币
				'version' => '1.0.0',	//版本号
				'charset' => 'UTF-8',	//编码格式 默认(utf-8)
				'locale' => 'en',	//语言 默认（en）
				'channel' => '6001',	//渠道编号,商户6001
				'payAccessTypeId' =>  '02',  // 01页面跳转交易（支付），02后台交易(消费撤销，退货)
				'orderAmount' => $amount,	//订单金额（以分为最小单位 如100元 = 10000 100.01元 = 10001）
				'orderTime' => $_POST['orderTime'],	//订单时间，格式[yyyyMMddHHmmss]
				'orderNumber' => $_POST['orderNumber'],	//消费的订单号，由商户生成
				'transType' => '31',		//交易类型(01:消费，31:消费撤销，34:退货,1001:对账文件,35:商户交易状态查询)
				'merId' => $_POST['merId'],//普通商户或一级商户，商户号商户
				'secMerId' => $secMerId,//一级商户下，二级商户交易时必送
				'backEndUrl' => BACK_NOTIFY_URL ,//后台通知地址
				'frontEndUrl' => FRONT_NOTIFY_URL,//前台通知地址
				'customerIp' => '127.0.0.1',	//ip地址
				'termType' => '02',//终端类型
				'signature'=>'',
				'initOrderNumber'=> $_POST['initOrderNumber'],//原支付交易订单号
				'initOrderTime'=> $_POST['initOrderTime']//原支付交易订单时间
			);
			
			// 签名
			sign ( $params );
			
			// 后台请求地址
			$back_uri = NETWAY_BACK_TRANS_URL;
			$log->LogInfo ( "后台请求地址为>" . $back_uri );
					
			$params_str = base64_encode(covertParamsToJson ( $params ));
					
			$log->LogInfo ( "-------后台交易请求>--begin----" );
			
			//发送后台请求
			$result = sendHttpRequest ($params_str, $back_uri);
			
			$log->LogInfo ( $result );
			$log->LogInfo ( "-------后台交易请求>--end-------" );
			$log->LogInfo ( "============处理后台请求 结束===========" );
	 	
	 		echo base64_decode($result);
	 }
	 
	 
	 /**
	 * 退货-后台 
	 */
	 function returnGoods(){
	 		$log = new PayLog ( SDK_LOG_FILE_PATH, "PRC", SDK_LOG_LEVEL );
			$log->LogInfo( "[处理后台请求开始]" );
			$secMerId = $_POST['secMerId'];
			if(!isset($secMerId) || empty($secMerId)){
				$secMerId = "";
			}
			$amount = transAmountConvert(0,$_POST['orderAmount']);
			$params = array(
				'mchtAccessType' => '01', //商户接入类型(01收单，02发卡),必传,默认为商户到网关,网关以01收单平台进行支付 普通商户传01，银联传02
				'currencyType' => '156', //币种 156人民币
				'version' => '1.0.0',	//版本号
				'charset' => 'UTF-8',	//编码格式 默认(utf-8)
				'locale' => 'en',	//语言 默认（en）
				'channel' => '6001',	//渠道编号,商户6001
				'payAccessTypeId' =>  '02',  //01：浏览器支付、02：后台支付，目前支持01
				'orderAmount' => $amount,	//订单金额（以分为最小单位 如100元 = 10000 100.01元 = 10001）
				'orderTime' => $_POST['orderTime'],	//订单时间，格式[yyyyMMddHHmmss]
				'orderNumber' => $_POST['orderNumber'],	//消费的订单号，由商户生成
				'transType' => '34',		//交易类型(01:消费，31:消费撤销，34:退货,1001:对账文件,35:商户交易状态查询)
				'merId' => $_POST['merId'],//普通商户或一级商户，商户号商户
				'secMerId' => $secMerId,//一级商户下，二级商户交易时必送
				'backEndUrl' => BACK_NOTIFY_URL ,//后台通知地址
				'frontEndUrl' => FRONT_NOTIFY_URL,//前台通知地址
				'customerIp' => '127.0.0.1',	//ip地址
				'termType' => '02',//终端类型
				'signature'=>'',
				'initOrderNumber'=> $_POST['initOrderNumber'],//原支付交易订单号
				'initOrderTime'=> $_POST['initOrderTime']//原支付交易订单时间
			);
			
			// 签名
			sign ( $params );
			
			// 后台请求地址
			$back_uri = NETWAY_BACK_TRANS_URL;
			$log->LogInfo ( "后台请求地址为>" . $back_uri );
					
			$params_str = base64_encode(covertParamsToJson ( $params ));
		
			$log->LogInfo ( "-------后台交易请求>--begin----" );
			
			//发送后台请求
			$result = sendHttpRequest ($params_str, $back_uri);
			
			$log->LogInfo ( "返回的result************".$result );
			$log->LogInfo ( "-------后台交易请求>--end-------" );
			$log->LogInfo ( "============处理后台请求 结束===========" );
	 		
	 		echo base64_decode($result);
	 }
	
?>