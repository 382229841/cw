<?php 
	header ( 'Content-type:text/html;charset=UTF-8' );
	include_once $_SERVER ['DOCUMENT_ROOT'] . '/ebank/mpi/payweb_mpi/func/Common.php';
	include_once $_SERVER ['DOCUMENT_ROOT'] . '/ebank/mpi/payweb_mpi/func/SDKConfig.php';
	include_once $_SERVER ['DOCUMENT_ROOT'] . '/ebank/mpi/payweb_mpi/func/Log.php';
	include_once $_SERVER ['DOCUMENT_ROOT'] . '/ebank/mpi/payweb_mpi/func/SecureUtil.php';
	$log = new PayLog ( SDK_LOG_FILE_PATH, "PRC", SDK_LOG_LEVEL );
	$log->LogInfo( "[后台接收支付网关报文处理]" );
	
	$respStr = $_POST['resp'];
	
	$resp = str_replace(' ','+',$respStr); 
	
	$respJson = base64_decode($resp);
	
	$log->LogInfo ( "接收支付网关报文>" . $respJson );
	
	
	$respArray = json_decode($respJson,true);

	if(verify($respArray) == 1){
		echo "验证签名成功,返回报文:" . $respJson;
	}else{
		echo "验证签名失败，返回报文:" . $respJson;
	}
	

?>