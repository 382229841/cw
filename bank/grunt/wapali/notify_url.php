<?php
/* *
 * 功能：支付宝服务器异步通知页面
 * 版本：3.3
 * 日期：2012-07-23
 * 说明：
 * 以下代码只是为了方便商户测试而提供的样例代码，商户可以根据自己网站的需要，按照技术文档编写,并非一定要使用该代码。
 * 该代码仅供学习和研究支付宝接口使用，只是提供一个参考。


 *************************页面功能说明*************************
 * 创建该页面文件时，请留心该页面文件中无任何HTML代码及空格。
 * 该页面不能在本机电脑测试，请到服务器上做测试。请确保外部可以访问该页面。
 * 该页面调试工具请使用写文本函数logResult，该函数已被默认关闭，见alipay_notify_class.php中的函数verifyNotify
 * 如果没有收到该页面返回的 success 信息，支付宝会在24小时内按一定的时间策略重发通知
 */
define('WEB_ROOT', dirname(dirname(dirname(__FILE__))).'/');
define('WEB_DATA', WEB_ROOT . 'data/');
require_once(WEB_ROOT."Application/Lib/Model/LogModel.class.php");

require_once("alipay.config.php");
require_once("lib/alipay_notify.class.php");
require_once('apipaydes.php');  //加密解密函数
//计算得出通知验证结果
$alipayNotify = new AlipayNotify($alipay_config);
$verify_result = $alipayNotify->verifyNotify();

$str="[verify_result]$verify_result";
$notify_data = $_POST['notify_data'];
preg_match('/<out_trade_no>(.+?)<\/out_trade_no>/i',$notify_data,$out_trade_no);
preg_match('/<trade_no>(.+?)<\/trade_no>/i',$notify_data,$trade_no);
preg_match('/<trade_status>(.+?)<\/trade_status>/i',$notify_data,$trade_status);
$data['out_trade_no'] = $out_trade_no[1];
$data['trade_no'] = $trade_no[1];
$data['trade_status'] = $trade_status[1];
$str.="\n[POST]".var_export($data,true);
$str.="\n[GET]".var_export($_GET,true);
LogModel::Write('alipay',$str,'notify_url');

if($verify_result) {//验证成功
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//请在这里加上商户的业务逻辑程序代

	
	//——请根据您的业务逻辑来编写程序（以下代码仅作参考）——
	
    //获取支付宝的通知返回参数，可参考技术文档中服务器异步通知参数列表
	
	//商户订单号

	//$out_trade_no = $_POST['out_trade_no'];

	//支付宝交易号

	//$trade_no = $_POST['trade_no'];

	//交易状态
LogModel::Write('alipay','33333','notify_url');
	//$trade_status = $_POST['trade_status'];
	$pay_much = $_POST['total_fee'];

	$sell_buy = $_POST['buyer_email'];
    // Header("Location: ".$alipay_config['feedbackUrl']."/index.php?s=/order/order/payok&pay_order_sn=".$out_trade_no."&much=".$_POST['total_fee']."&pay_id=".$_POST['buyer_email']);
    if($trade_status[1] == 'TRADE_FINISHED' || $trade_status[1] == 'TRADE_SUCCESS' || $_POST['result'] == 'success') {
        $code[] = $out_trade_no[1];
        $code[] = $trade_no[1];LogModel::Write('alipay',$code,'notify_url');
        $pay_sn = encrypt(implode('_#_',$code),$key);
        $pay_sn = urlencode(setUrlCode($pay_sn));
//	$url = $alipay_config['feedbackUrl']."/order/noteok&pay_sn=".$pay_sn.'&pay_id='.$sell_buy;
	$url = $alipay_config['paySuccess'].$pay_sn;	
	$f = file_get_contents($url);
		if(intval($f)>0){
			echo "success";		//请不要修改或删除
		}
	}
    else {
    	echo "trade_status=".$_POST['trade_status'];
    }
}
else 
{
    //验证失败
    echo "fail";

    //调试用，写文本函数记录程序运行情况是否正常
    //logResult("这里写入想要调试的代码变量值，或其他运行的结果记录");
}
?>
