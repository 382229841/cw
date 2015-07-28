<?php
// 签名证书路径
define("SDK_SIGN_CERT_PATH", "../paymentCert/client.pfx");
// 签名证书密码
define("SDK_SIGN_CERT_PWD", "123456"); 
// 验签证书
define("SDK_VERIFY_CERT_PATH", "../paymentCert/payweb.cer");
// 前台通知地址
define("FRONT_NOTIFY_URL", "http://m.xiaoniubang.com/ebank/mpi/proccess/SuccessBack.php");
// 后台通知地址
define("BACK_NOTIFY_URL", "http://m.xiaoniubang.com/ebank/mpi/proccess/CallBack.php");
//苏州银行网关前台请求地址
define("NETWAY_FRONT_TRANS_URL", "http://test.suzhoubank.com/PayWeb/netpay/transProcess.do");
//苏州银行网关后台请求地址
define("NETWAY_BACK_TRANS_URL", "http://test.suzhoubank.com/PayWeb/netpay/backTransProcess.do");
//日志 目录 
define("SDK_LOG_FILE_PATH", "../logs/");
//日志级别
//const SDK_LOG_LEVEL = "DEBUG";
define("SDK_LOG_LEVEL", "DEBUG"); 
?>