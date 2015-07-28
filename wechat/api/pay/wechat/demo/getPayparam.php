<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers:Content-Type, Authorization, Accept,X-Requested-With');
header('Content-type: application/json');


/**
 * JS_API支付demo
 * ====================================================
 * 在微信浏览器里面打开H5网页中执行JS调起支付。接口输入输出数据格式为JSON。
 * 成功调起支付需要三个步骤：
 * 步骤1：网页授权获取用户openid
 * 步骤2：使用统一支付接口，获取prepay_id
 * 步骤3：使用jsapi调起支付
*/
	include_once("../WxPayPubHelper/WxPayPubHelper.php");
	
	//使用jsapi接口
	$jsApi = new JsApi_pub();
	$openid = $_GET['openid'];
	$productId = $_GET['productId'];
	$userId = $_GET['uid'];
	$amount = $_GET['amount']*100;
	$transactionId=0;
	
	
	
	$serviceUrl="http://www.xiaoniubang.com/api";
		
	$data['user_id'] = $userId;
	$data['amount'] = $_GET['amount'];
	$data['recharge_type'] = 6;
	$data['product_id'] = $productId;
	$data['device'] = '5';
	//var_dump($data);
	//echo 'sdfsdfdsf';exit;
	$strSign=getSign2($data);
	
	
	//echo $strSign;exit;
	
	$m5=md5('/api/transaction/recharge_v2?'.$strSign.'_2014hofysoft_web');
	$url=$serviceUrl.'/transaction/recharge_v2?m5='.$m5;
	//echo $url;//exit;
	$status=curl_post($url, $data);
	
	$status = json_decode($status,true);

	if($status['status'] != 'OK'){
			echo json_encode(array('status'=>0,'data'=>$status,'msg'=>$status));

	}else{
		//$url="http://m.xiaoniubang.com/pay/success.php?trade_no=".$user_id."&order_id=".$status['transaction']['id']."uid".$openid."&wx=1";
		//header('location:'.$url);
		
		$transactionId=$status['transaction']['id'];
		$jsApi->setTransactionId($transactionId);
	}	
	
	
	//=========步骤2：使用统一支付接口，获取prepay_id============
	//使用统一支付接口
	$unifiedOrder = new UnifiedOrder_pub();
	$unifiedOrder->setParameter("openid","$openid");//商品描述
	$unifiedOrder->setParameter("body","小牛帮在线充值");//商品描述
	//自定义订单号，此处仅作举例
	$timeStamp = time();
	$out_trade_no = $transactionId;//WxPayConf_pub::APPID."$timeStamp";
	$unifiedOrder->setParameter("out_trade_no","$out_trade_no");//商户订单号 
	$unifiedOrder->setParameter("total_fee","$amount");//总金额
	$unifiedOrder->setParameter("notify_url",WxPayConf_pub::NOTIFY_URL);//通知地址 
	$unifiedOrder->setParameter("trade_type","JSAPI");//交易类型
	//非必填参数，商户可根据实际情况选填

	$prepay_id = $unifiedOrder->getPrepayId();
	
	$jsApi->setPrepayId($prepay_id);

	$jsApiParameters = $jsApi->getParameters();
	echo $jsApiParameters;exit;
	
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
		ksort($Parameters);
		$String = formatBizQueryParaMap2($Parameters, false);
		return $String;
	}
?>
