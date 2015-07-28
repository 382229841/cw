<?php
/**
 * 通用通知接口demo
 * ====================================================
 * 支付完成后，微信会把相关支付和用户信息发送到商户设定的通知URL，
 * 商户接收回调信息后，根据需要设定相应的处理流程。
 * 
 * 这里举例使用log文件形式记录回调信息。
*/
	include_once("./log_.php");
	include_once("../WxPayPubHelper/WxPayPubHelper.php");

    //使用通用通知接口
	$notify = new Notify_pub();

	//存储微信的回调
	$xml = $GLOBALS['HTTP_RAW_POST_DATA'];	
	$notify->saveData($xml);
	
	//验证签名，并回应微信。
	//对后台通知交互时，如果微信收到商户的应答不是成功或超时，微信认为通知失败，
	//微信会通过一定的策略（如30分钟共8次）定期重新发起通知，
	//尽可能提高通知的成功率，但微信不保证通知最终能成功。
	if($notify->checkSign() == FALSE){
		$notify->setReturnParameter("return_code","FAIL");//返回状态码
		$notify->setReturnParameter("return_msg","签名失败");//返回信息
	}else{
		$notify->setReturnParameter("return_code","SUCCESS");//设置返回码
	}
	$returnXml = $notify->returnXml();
	echo $returnXml;
	
	//==商户根据实际情况设置相应的处理流程，此处仅作举例=======
	
	//以log文件形式记录回调信息
	$log_ = new Log_();
	$log_name="./notify_url.log";//log文件路径
	$log_->log_result($log_name,"【接收到的notify通知】:\n".$xml."\n");

	if($notify->checkSign() == TRUE)
	{
		if ($notify->data["return_code"] == "FAIL") {
			//此处应该更新一下订单状态，商户自行增删操作
			$log_->log_result($log_name,"【通信出错】:\n".$xml."\n");
		}
		elseif($notify->data["result_code"] == "FAIL"){
			//此处应该更新一下订单状态，商户自行增删操作
			$log_->log_result($log_name,"【业务出错】:\n".$xml."\n");
		}
		else{
			//此处应该更新一下订单状态，商户自行增删操作
			$log_->log_result($log_name,"【支付成功】:\n".$xml."\n");

			$serviceUrl="http://www.xiaoniubang.com/api";
			
			$data2['user_id'] = $notify->data["openid"];
			$data2['order_id'] = $notify->data["transaction_id"];
			$data2['transaction_id'] = $notify->data["out_trade_no"];
			$data2['device'] = '5';
			//var_dump($data);
			//echo 'sdfsdfdsf';exit;
			$strSign=getSign2($data2);
			
			
			//echo $strSign;exit;
			
			$m5=md5('/api/transaction/status/update_v2?'.$strSign.'_2014hofysoft_web');
			$url=$serviceUrl.'/transaction/status/update_v2?m5='.$m5;
			//echo $url;//exit;
			$status=curl_post($url, $data2);
			
			$status = json_decode($status,true);
			
			
		}
		
		//商户自行增加处理流程,
		//例如：更新订单状态
		//例如：数据库操作
		//例如：推送支付完成信息
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
	
	/**
	 * 	作用：格式化参数，签名过程需要使用
	 */
	function formatBizQueryParaMap2($paraMap, $urlencode)
	{
		$buff = "";
		ksort($paraMap);
		foreach ($paraMap as $k => $v)
		{
		    if($urlencode)
		    {
			   $v = urlencode($v);
			}
			//$buff .= strtolower($k) . "=" . $v . "&";
			$buff .= $k . "=" . $v . "&";
		}
		$reqPar;
		if (strlen($buff) > 0) 
		{
			$reqPar = substr($buff, 0, strlen($buff)-1);
		}
		return $reqPar;
	}
	
	/**
	 * 	作用：生成签名
	 */
	function getSign2($Obj)
	{
		foreach ($Obj as $k => $v)
		{			
			$Parameters[$k] = $v;
		}
		//var_dump($Parameters);
		//签名步骤一：按字典序排序参数
		ksort($Parameters);
		//var_dump($Parameters);
		$String = formatBizQueryParaMap2($Parameters, false);
		return $String;
	}
?>