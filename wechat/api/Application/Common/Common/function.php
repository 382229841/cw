<?php
/**
 * 字符串截取，支持中文和其他编码
 * @param string $str 需要转换的字符串
 * @param string $start 开始位置
 * @param string $length 截取长度
 * @param string $charset 编码格式
 * @param string $suffix 截断显示字符
 * @return string
 */
function msubstr($str, $start=0, $length, $charset="utf-8", $suffix=true) {
    $charset = strtolower($charset);
    if(function_exists("mb_substr"))
        $slice = mb_substr($str, $start, $length, $charset);
    elseif(function_exists('iconv_substr')) {
        $slice = iconv_substr($str,$start,$length,$charset);
        if(false === $slice) {
            $slice = '';
        }
    }else{
        $re['utf-8']   = "/[\x01-\x7f]|[\xc2-\xdf][\x80-\xbf]|[\xe0-\xef][\x80-\xbf]{2}|[\xf0-\xff][\x80-\xbf]{3}/";
        $re['gb2312'] = "/[\x01-\x7f]|[\xb0-\xf7][\xa0-\xfe]/";
        $re['gbk']    = "/[\x01-\x7f]|[\x81-\xfe][\x40-\xfe]/";
        $re['big5']   = "/[\x01-\x7f]|[\x81-\xfe]([\x40-\x7e]|\xa1-\xfe])/";
        preg_match_all($re[$charset], $str, $match);
        $slice = join("",array_slice($match[0], $start, $length));
    }
    return $suffix ? $slice.'...' : $slice;
}

/**
 * 检测输入的验证码是否正确
 * @param string $code 为用户输入的验证码字符串
 * @return boolen
 */
function check_verify($code, $id = ''){
    $verify = new \Think\Verify();
    return $verify->check($code, $id);
}

/**
 * 对用户的密码进行加密
 * @param string $password
 * @param string $encrypt //传入加密串，在修改密码时做认证
 * @return array/password
 */
function password($password, $encrypt='') {
	$pwd = array();
	$pwd['salt'] =  $encrypt ? $encrypt : Org\Util\String::randString(4);
	$pwd['password'] = md5(md5(trim($password)).$pwd['salt']);
	return $encrypt ? $pwd['password'] : $pwd;
}

/**
 * 解析多行sql语句转换成数组
 * @param string $sql
 * @return array
 */
function sql_split($sql) {
	$sql = str_replace("\r", "\n", $sql);
	$ret = array();
	$num = 0;
	$queriesarray = explode(";\n", trim($sql));
	unset($sql);
	foreach($queriesarray as $query) {
		$ret[$num] = '';
		$queries = explode("\n", trim($query));
		$queries = array_filter($queries);
		foreach($queries as $query) {
			$str1 = substr($query, 0, 1);
			if($str1 != '#' && $str1 != '-') $ret[$num] .= $query;
		}
		$num++;
	}
	return($ret);
}

/**
 * 格式化字节大小
 * @param  number $size      字节数
 * @param  string $delimiter 数字和单位分隔符
 * @return string            格式化后的带单位的大小
 * @author 麦当苗儿 <zuojiazi@vip.qq.com>
 */
function format_bytes($size, $delimiter = '') {
    $units = array('B', 'KB', 'MB', 'GB', 'TB', 'PB');
    for ($i = 0; $size >= 1024 && $i < 5; $i++) $size /= 1024;
    return round($size, 2) . $delimiter . $units[$i];
}

/**
 * 取得文件扩展
 * @param $filename 文件名
 * @return 扩展名
 */
function file_ext($filename) {
	return strtolower(trim(substr(strrchr($filename, '.'), 1, 10)));
}

/**
 * 文件是否存在
 * @param string $filename  文件名
 * @return boolean  
 */
function file_exist($filename ,$type=''){
	switch (STORAGE_TYPE){
		case 'Sae':
			$arr = explode('/', ltrim($filename, './'));
	        $domain = array_shift($arr);
	        $filePath = implode('/', $arr);
	        $s = new SaeStorage();
			return $s->fileExists($domain, $filePath);
			break;
		default:
			return \Think\Storage::has($filename ,$type);
	}
}

/**
 * 文件内容读取
 * @param string $filename  文件名
 * @return boolean         
 */
function file_read($filename, $type=''){
	switch (STORAGE_TYPE){
		case 'Sae':
			$arr = explode('/', ltrim($filename, './'));
	        $domain = array_shift($arr);
			$filePath = implode('/', $arr);
			$s=new SaeStorage();
			return $s->read($domain, $filePath);
			break;
		default:
			return \Think\Storage::read($filename, $type);
	}
}

/**
 * 文件写入
 * @param string $filename  文件名
 * @param string $content  文件内容
 * @return boolean         
 */
function file_write($filename, $content, $type=''){
	switch (STORAGE_TYPE){
		case 'Sae':
			$s=new SaeStorage();
			$arr = explode('/',ltrim($filename,'./'));
			$domain = array_shift($arr);
			$save_path = implode('/',$arr);
			return $s->write($domain, $save_path, $content);
			break;
		default:
			return \Think\Storage::put($filename, $content, $type);
	}
}

/**
 * 文件删除
 * @param string $filename  文件名
 * @return boolean     
 */
function file_delete($filename ,$type=''){
	switch (STORAGE_TYPE){
		case 'Sae':
			$arr = explode('/', ltrim($filename, './'));
	        $domain = array_shift($arr);
	        $filePath = implode('/', $arr);
	        $s = new SaeStorage();
			return $s->delete($domain, $filePath);
			break;
		default:
			return \Think\Storage::unlink($filename ,$type);
	}
}

/**
 * 获取文件URL
 * @param string $filename  文件名
 * @return string
 */
function file_path2url($filename){
	$search = array_keys(C('TMPL_PARSE_STRING'));
	$replace = array_values(C('TMPL_PARSE_STRING'));
	return str_ireplace($search, $replace, $filename);
}
/**
 * 获取文件路径
 * @param string $fileurl  文件URL
 * @return string
 */
function file_url2path($fileurl){
	$search = array_values(C('TMPL_PARSE_STRING'));
	$replace = array_keys(C('TMPL_PARSE_STRING'));
	return str_ireplace($search, $replace, $fileurl);
}
function get_encrypt($num = 6, $numc = false) {
    $str = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    $w = 61;
    if ($numc) {
        $str = '1234567890';
        $w = 9;
    }
    $encrypt = '';
    for($i = 0; $i < $num; $i++) {
        $encrypt .= $str{mt_rand(0, $w)};
    }
    return $encrypt;
}
/*
    * json格式化
    */
function jsonFormat($data, $indent=null){
    // 对数组中每个元素递归进行urlencode操作，保护中文字符
    array_walk_recursive($data, 'jsonFormatProtect');

    // json encode
    $data = json_encode($data);

    // 将urlencode的内容进行urldecode
    $data = urldecode($data);

    // 缩进处理
    $ret = '';
    $pos = 0;
    $length = strlen($data);
    $indent = isset($indent)? $indent : '    ';
    $newline = "\n";
    $prevchar = '';
    $outofquotes = true;

    for($i=0; $i<=$length; $i++){

        $char = substr($data, $i, 1);

        if($char=='"' && $prevchar!='\\'){
            $outofquotes = !$outofquotes;
        }elseif(($char=='}' || $char==']') && $outofquotes){
            $ret .= $newline;
            $pos --;
            for($j=0; $j<$pos; $j++){
                $ret .= $indent;
            }
        }

        $ret .= $char;

        if(($char==',' || $char=='{' || $char=='[') && $outofquotes){
            $ret .= $newline;
            if($char=='{' || $char=='['){
                $pos ++;
            }

            for($j=0; $j<$pos; $j++){
                $ret .= $indent;
            }
        }

        $prevchar = $char;
    }

    return $ret;
}
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
//异步
function setguanyi($url){
    $fp = fsockopen($url, 80, $errno, $errstr, 10);
    fputs($fp,"GET / HTTP/1.0\nHost: php.wilson.gs\n\n");
    while(!feof($fp)){
        fgets($fp,128);
    }
    fclose($fp);
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
