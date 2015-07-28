<?php
$url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx6e20ff10bae65ce5&secret=754d73922d673f37631e7f5d3c2f40b7";
$baidu = curl_get($url);
$token = json_decode($baidu,true);
$access_token = $token['access_token'];
$openid = !empty($_REQUEST['openid'])?$_REQUEST['openid']:'of4CVtxpUKJHGSe8MPcfouZA2WB8';
$message = $_REQUEST['message'];
$url = "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=".$access_token;
$textnew =  '{
    "touser": "'.$openid.'",
    "msgtype": "text",
    "text": {
        "content": "'.$message.'"
        }
    }';
 $status = curl_post($url,$textnew);
 echo $status;
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
?>