<?php

	include_once('proccess/phpaes.php');//$_GET['params'];//
    $respStr =$_GET['params'];// '59A+HnUpgFqOvb/7BhbRr3J04Yo2Con6ATA48QVLfYhTi5r659vwU5PM1R1yuvUoAT58qazckhahzI53kWtsPq0cT14obkOSJ20CY4IsIpM=';
    //echo $respStr;
	//echo $respStr."<br/>";
	//echo urlencode($respStr);
	$sign = $_GET['sign'];
    $data = phpaes::AesDecrypt($respStr);//echo $data;
    /*$data = explode(":",$data);
    $status['phoneNumber'] = explode("\"",$data[1]);
    $status['phoneNumber'] = $status['phoneNumber'][1];
    $status['userId'] = explode("\"",$data[2]);
    $status['userId'] = $status['userId'][1];
    $status['channel'] = explode("\"",$data[3]);
    $status['channel'] = $status['channel'][1];*/
    //echo json_encode($status);
	echo json_encode($data);
?>