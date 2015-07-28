<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimal-ui" />
    <meta name="apple-mobile-web-app-status-bar-style" content="yes" />
    <meta content="telephone=no" name="format-detection" />
    
	<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
	
	<link rel="shortcut icon" href="/favicon.png" type="image/x-icon" />
	<style>
    .scrollable-content{
        padding-left:1em;
        padding-right:1em;
    }
    .address-info{
        padding:1em 0;
        color:#ffffff;
        border:1px solid #EE5220;
        background:#EE5220;
    }
    .address-title{
        text-align:center;
        padding-bottom:1em;
        color:#000;
        font-weight:bold;
        font-size:1.2em;
    }
    .address-info div{
        white-space:nowrap;
    }
    .address-info div input{
        width:100%;
        margin-bottom:1em;
        margin-top:.5em;
        height:33px;
        border:1px solid #ddd;
        border-radius:0px;
    }
    .address-info div button{
        width:90%;
        text-align:center;
        margin-left:5%;
        padding:.8em;
        color:#fff;
        background:#EE5220;
        border:1px solid #EE5220;

    }
    .address-info div select{
        width:49%;
        margin-bottom:1em;
        margin-top:.5em;
        border:1px solid #ddd;
    }
    .address-info div select:last-child{
        margin-left:1%;
    }
</style>
  </head>

  <body style="padding:1em .5em;text-align:center;">
		
    <div class="address-info">
            
 
<?php
		$order_id=$_GET['order_id'];
		$trade_no=$_GET['trade_no'];
		$wx=$_GET['wx'];
		$transaction = explode('uid',$order_id); 
		
		if($wx==1){
			echo "恭喜您充值成功！^_^<br/><br/><a href='http://m.xiaoniubang.com'>点我 去在线洗车！</a>";
			header("refresh:3;url=http://m.xiaoniubang.com");
			exit;
		}else{
			
		}
		
		$serviceUrl="http://www.xiaoniubang.com/api";
		
		$data['user_id'] = $transaction[1];
		$data['transaction_id'] = $transaction[0];
		$data['order_id'] = $trade_no;
		//var_dump($data);
		
		$data['device'] = '5';
		//var_dump($data);
		//echo 'sdfsdfdsf';exit;
		$strSign=getSign($data);
		
		
		//echo $strSign;
		
		$m5=md5('/api/transaction/status/update_v2?'.$strSign.'_2014hofysoft_web');
		$url=$serviceUrl.'/transaction/status/update_v2?m5='.$m5;
		
		//echo $url;
		//$url=$serviceUrl.'/transaction/status/update_v2';
		
		$status=curl_post($url, $data);
		
		$status = json_decode($status,true);
		
		
		

		if($status['status'] != 'OK'){
			//echo json_encode(array('status'=>0,'data'=>$status,'msg'=>$status));
			echo "恭喜您充值成功！<br/><br/>";

		}else{
			if($wx==1){
				echo "恭喜您充值成功！^_^<br/><br/><a href='http://m.xiaoniubang.com'>点我 去在线洗车！</a>";
				header("refresh:3;url=http://m.xiaoniubang.com");
			}else{
				echo "恭喜您充值成功！^_^<br/><br/>请返回微信继续您的操作。";
			}
			//echo "恭喜您充值成功！^_^<br/><br/><a href='http://m.xiaoniubang.com'>点我 去在线洗车！</a>";
            //header("refresh:3;url=http://m.xiaoniubang.com");
			//echo json_encode(array('status'=>0,'data'=>$status,'msg'=>$status));
		}
		
?>

           
    </div>
	
  </body>
</html>


<?php		

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
	function formatBizQueryParaMap($paraMap, $urlencode)
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
	function getSign($Obj)
	{
		foreach ($Obj as $k => $v)
		{			
			$Parameters[$k] = $v;
		}
		//var_dump($Parameters);
		//签名步骤一：按字典序排序参数
		ksort($Parameters);
		//var_dump($Parameters);
		$String = formatBizQueryParaMap($Parameters, false);
		
		//echo '[string1]'.$String.'</br>';
		//签名步骤二：在string后加入KEY
		/*$String = $String."&key=".WxPayConf_pub::KEY;*/
		//echo "【string2】".$String."</br>";
		//签名步骤三：MD5加密
		/*$String = md5($String);*/
		//echo "【string3】 ".$String."</br>";
		//签名步骤四：所有字符转为大写
		/**$result_ = strtoupper($String);*/
		//echo "【result】 ".$result_."</br>";
		return $String;
	}

?>
