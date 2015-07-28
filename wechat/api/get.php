<?php
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Headers:Content-Type, Authorization, Accept,X-Requested-With');
        header('Content-type: application/json');

		//$post = json_decode(file_get_contents("php://input"), true);
	    header("Cache-control: private");
        header("Content-type: application/json");

    $url = $_GET['url'];
	$method = $_GET['method'];//$_SERVER['REQUEST_METHOD'];

	if($method == 'GET'){
			$status = callInterfaceCommon($url);
    }elseif($method == 'POST'){
			$status = callInterfaceCommon($url,'POST');
	}elseif($method == 'PUT'){
			$status = callInterfaceCommon($url, 'PUT');
	}else{
		    //$status = curl_put($url, $data, 'PUT');
			$status = callInterfaceCommon($url,'DELETE');
	}
	
	echo $status;
		
	    function callInterfaceCommon($url,$type){
			//初始化
			$ch = curl_init();
			//设置选项，包括URL
			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			if($type=='PUT'){
			 curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT'); //设置请求方式
			}
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); //不验证证书下同
			curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); //
			curl_setopt($ch, CURLOPT_HEADER, 0);
			curl_setopt($ch, CURLOPT_TIMEOUT,1);
			//执行并获取HTML文档内容
			$output = curl_exec($ch);
			//释放curl句柄
			curl_close($ch);
			return $output;
    }

?>