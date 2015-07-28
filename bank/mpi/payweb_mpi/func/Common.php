﻿<?php
include_once $_SERVER ['DOCUMENT_ROOT'] . '/ebank/mpi/payweb_mpi/func/Log.php';
include_once $_SERVER ['DOCUMENT_ROOT'] . '/ebank/mpi/payweb_mpi/func/SDKConfig.php';
// 初始化日志


function my_sort($a, $b){
	return strlen($a) - strlen($b);
}

/**
 * 数组 排序后转化为字体串,签名时候用
 *
 * @param array $params        	
 * @return string
 */
function coverParamsToString($params) {
	$log = new PayLog ( SDK_LOG_FILE_PATH, "PRC", SDK_LOG_LEVEL );
	
	$sign_str = '';
	// 排序
	//krsort ( $params);
	
	sort($params,SORT_STRING);
	
	$sort_str = '';

	foreach ( $params as $key => $val ) {
		if ($key == 'signature') {
			continue;
		}
		$sort_str .= $val;
	}

	return $sort_str;
}


/**
 * 数组 排序后转化为字体串,验签时候用的
 *
 * @param array $params        	
 * @return string
 */
function coverParamsToStringVertify($params,$signature) {
	$log = new PayLog ( SDK_LOG_FILE_PATH, "PRC", SDK_LOG_LEVEL );
	
	$sign_str = '';
	// 排序
	//krsort ( $params);
	
	sort($params,SORT_STRING);
	
	$sort_str = '';

	foreach ( $params as $key => $val ) {
		if ($val == $signature) {
			continue;
		}
		$sort_str .= $val;
	}

	return $sort_str;
}


function covertParamsToJson($params){
	$sign_str = '{';
	
	foreach ( $params as $key => $val ) {
		$sign_str .= "\"$key\":\"$val\",";
	}

	$sign_str = substr ( $sign_str, 0, strlen ( $sign_str )-1);
	
	$sign_str .= '}';
	return $sign_str;
}


/**
 * 字符串转换为 数组
 *
 * @param unknown_type $str        	
 * @return multitype:unknown
 */
function coverStringToArray($str) {
	$result = array ();

	if (! empty ( $str )) {
		$temp = preg_split ( '/&/', $str );
		if (! empty ( $temp )) {
			foreach ( $temp as $key => $val ) {
				$arr = preg_split ( '/=/', $val, 2 );
				if (! empty ( $arr )) {
					$k = $arr ['0'];
					$v = $arr ['1'];
					$result [$k] = $v;
				}
			}
		}
	}
	return $result;
}
/**
 * 处理返回报文 解码客户信息 , 如果编码为GBK 则转为utf-8
 *
 * @param unknown_type $params        	
 */
function deal_params(&$params) {
	/**
	 * 解码 customerInfo
	 */
	if (! empty ( $params ['customerInfo'] )) {
		$params ['customerInfo'] = base64_decode ( $params ['customerInfo'] );
	}
	
	if (! empty ( $params ['encoding'] ) && strtoupper ( $params ['encoding'] ) == 'GBK') {
		foreach ( $params as $key => $val ) {
			$params [$key] = iconv ( 'GBK', 'UTF-8', $val );
		}
	}
}

/**
 * 压缩文件 对应java deflate
 *
 * @param unknown_type $params        	
 */
function deflate_file(&$params) {
	global $log;
	foreach ( $_FILES as $file ) {
		$log->LogInfo ( "---------处理文件---------" );
		if (file_exists ( $file ['tmp_name'] )) {
			$params ['fileName'] = $file ['name'];
			
			$file_content = file_get_contents ( $file ['tmp_name'] );
			$file_content_deflate = gzcompress ( $file_content );
			
			$params ['fileContent'] = base64_encode ( $file_content_deflate );
			$log->LogInfo ( "压缩后文件内容为>" . base64_encode ( $file_content_deflate ) );
		} else {
			$log->LogInfo ( ">>>>文件上传失败<<<<<" );
		}
	}
}

/**
 * 处理报文中的文件
 *
 * @param unknown_type $params        	
 */
function deal_file($params) {
	global $log;
	if (isset ( $params ['fileContent'] )) {
		$log->LogInfo ( "---------处理后台报文返回的文件---------" );
		$fileContent = $params ['fileContent'];
		
		if (empty ( $fileContent )) {
			$log->LogInfo ( '文件内容为空' );
		} else {
			// 文件内容 解压缩
			$content = gzuncompress ( base64_decode ( $fileContent ) );
			$root = SDK_FILE_DOWN_PATH;
			$filePath = null;
			if (empty ( $params ['fileName'] )) {
				$log->LogInfo ( "文件名为空" );
				$filePath = $root . $params ['merId'] . '_' . $params ['batchNo'] . '_' . $params ['txnTime'] . 'txt';
			} else {
				$filePath = $root . $params ['fileName'];
			}
			$handle = fopen ( $filePath, "w+" );
			if (! is_writable ( $filePath )) {
				$log->LogInfo ( "文件:" . $filePath . "不可写，请检查！" );
			} else {
				file_put_contents ( $filePath, $content );
				$log->LogInfo ( "文件位置 >:" . $filePath );
			}
			fclose ( $handle );
		}
	}
}

/**
 * 金额转换，flag如果是0，元转为分；flag如果是1，分转为元；
 */
function transAmountConvert($flag, $txnAt){
	if(0 == $flag){
		$money = $txnAt * 100;
		$amount = sprintf("%012u",$money); 
		return $amount;
	}else{
		$money1 = intval($txnAt);
		$amount1 = $money1 / 100;
		return $amount1;	
	}
}

/**
 * 构造自动提交表单
 *
 * @param unknown_type $params        	
 * @param unknown_type $action        	
 * @return string
 */
function create_html($params, $action) {
	$encodeType = 'UTF-8';
	$html = <<<eot
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset={$encodeType}" />
</head>
<body  onload="javascript:document.pay_form.submit();">
    <form id="pay_form" name="pay_form" action="{$action}" method="post">
	
eot;
		$html .= "    <input type=\"hidden\" name=\"params\" id=\"params\" value=\"{$params}\" />\n";

	$html .= <<<eot
    <input type="submit" type=\"hidden\">
    </form>
</body>
</html>
eot;
	return $html;
}


?>