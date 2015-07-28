<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers:Content-Type, Authorization, Accept,X-Requested-With');
    header('Content-type: application/json');
	$code = $_GET['code'];
    $url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx6e20ff10bae65ce5&secret=754d73922d673f37631e7f5d3c2f40b7&code=".$code."&grant_type=authorization_code";
    $baidu = curl_get($url);
  //  $token = json_decode($baidu,true);
//    $token = $token['access_token'];
  //  header("Cache-control: private");
//    header("Content-type: application/json");
   // echo json_encode($baidu);
echo $baidu;
    exit;

    /**
     * curl get方法封装
     *
     */
    function curl_get($url){
        //初始化
        $ch = curl_init();
        //设置选项，包括URL
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); //不验证证书下同
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false); //
        curl_setopt($ch, CURLOPT_HEADER, 0);
        //执行并获取HTML文档内容
        $output = curl_exec($ch);
        //释放curl句柄
        curl_close($ch);
        return $output;
    }
?>
