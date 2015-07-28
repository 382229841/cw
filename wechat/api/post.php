<?php
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Headers:Content-Type, Authorization, Accept,X-Requested-With');
        header('Content-type: application/json');

		$post = json_decode(file_get_contents("php://input"), true);
	    header("Cache-control: private");
        header("Content-type: application/json");

    $url = $post['url'];
	$data = $post['data'];
	$method = $post['method'];//$_SERVER['REQUEST_METHOD'];
	//$url = "http://121.40.197.120:3000/api/car/delete";
	//$data = array('car_id'=>'156','user_id'=>'145');
	//$url = "http://121.40.197.120:3000/api/car/update";
	//$data = array('user_id'=>145,'car_id'=>'156','car_no'=>'苏A8AAGd','brand'=>'aa','mode'=>'bb','color'=>'香槟色','type'=>1);
    if($method == 'GET'){
        $status = curl_get($url);
    }elseif($method == 'POST'){
			$status = curl_post($url,$data);
	}elseif($method == 'PUT'){
			$status = curl_put($url, $data, 'PUT');
	}else{
		    //$status = curl_put($url, $data, 'PUT');
			$status = curl_put($url,$data,'DELETE');
	}
	$status = json_decode($status,true);
	if($status['status'] != 'OK'){
			echo json_encode(array('status'=>0,'data'=>$status,'msg'=>$status));
	}else{
			echo json_encode(array('status'=>1,'data'=>$status,'msg'=>'提交成功'));
	}
    //curl get
    function curl_get($url){
        //初始化
        $ch = curl_init();
        //设置选项，包括URL
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
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
	//curl post方法封装
	function curl_post($url, $post){
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); //不验证证书下同
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); //
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
		$output = curl_exec($ch);
		curl_close($ch);
		return $output;
	}
	//curl put
	function curl_put($url,$data,$method='post'){
		//PUT
	   $ch = curl_init(); //初始化CURL句柄 
		curl_setopt($ch, CURLOPT_URL, $url); //设置请求的URL
		curl_setopt($ch, CURLOPT_RETURNTRANSFER,1); //设为TRUE把curl_exec()结果转化为字串，而不是直接输出 
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method); //设置请求方式
		 
		curl_setopt($ch,CURLOPT_HTTPHEADER,array("X-HTTP-Method-Override: $method"));//设置HTTP头信息
		curl_setopt($ch, CURLOPT_POSTFIELDS, $data);//设置提交的字符串
		$document = curl_exec($ch);//执行预定义的CURL 
		/*if(!curl_errno($ch)){ 
		  $info = curl_getinfo($ch); 
		  echo 'Took ' . $info['total_time'] . ' seconds to send a request to ' . $info['url']; 
		} else { 
		  echo 'Curl error: ' . curl_error($ch); 
		}*/
		curl_close($ch);
		 
		return $document;
	}
	//curl DELETE 
	function curl_delete($url, $post){
		$curl_handle = curl_init (); 
		// Set default options. 
		curl_setopt ( $curl_handle, CURLOPT_URL, $url); 
		curl_setopt ( $curl_handle, CURLOPT_FILETIME, true ); 
		curl_setopt ( $curl_handle, CURLOPT_FRESH_CONNECT, false ); 


		curl_setopt ( $curl_handle, CURLOPT_HEADER, true ); 
		curl_setopt ( $curl_handle, CURLOPT_RETURNTRANSFER, true ); 
		curl_setopt ( $curl_handle, CURLOPT_TIMEOUT, 5184000 ); 
		curl_setopt ( $curl_handle, CURLOPT_CONNECTTIMEOUT, 120 ); 
		curl_setopt ( $curl_handle, CURLOPT_NOSIGNAL, true ); 
		curl_setopt ( $curl_handle, CURLOPT_CUSTOMREQUEST, 'DELETE' ); 

		$ret = curl_exec ( $curl_handle );
		curl_close($curl_handle);
		return $ret;
	}
?>