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
	<link rel="stylesheet" href="../css/index.min.css?23" />
	
	<script type="text/javascript" src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>

	
	<script src="../js/lib/jquery/jquery-2.1.1.min.js" type="text/javascript"></script>
	<script src="../js/lib/jquery/jquery.sha1.js" type="text/javascript"></script>
	<script src="../js/lib/date.format.js" type="text/javascript"></script>
	
	<script>
		$(function(){
			function getQueryStringByName(name){
				 var result = location.search.match(new RegExp("[\?\&]" + name+ "=([^\&]+)","i"));
				 if(result == null || result.length < 1){
					 return "";
				 }
				 return result[1];

			}

			function isWeixin() {
				var ua = navigator.userAgent.toLowerCase();
				if (ua.match(/MicroMessenger/i) == "micromessenger") {
					return true;
				} else {
					return false;
				}
			}
			
			var r={};
			r.amount=getQueryStringByName('amount');
			r.openid=getQueryStringByName('openid');
			r.no=getQueryStringByName('no');
			r.productId=getQueryStringByName('productId');

			r.uid=getQueryStringByName('uid');
			//alert(r.openid);

			r.rechargeType=getQueryStringByName('rechargeType');
			
			if(r.rechargeType==1){
				r.rechargeType="支付宝网页支付";
				if(isWeixin()){
					$("#pay").css("display","none");
					$("#tips").css("display","block");
					$("#content").html(window.location.href);
				}
			}
			if(r.rechargeType==2){
				r.rechargeType="微信支付";
			}
			
			$("#amount").html(r.amount+" 元");
			$("#no").html(r.no);
			var now=(new Date()).format("yyyy-mm-dd HH:MM:ss");
			$("#date").html(now);

			$("#rechargeType").html(r.rechargeType);
			
			var createNonceStr = function () {
				 return Math.random().toString(36).substr(2, 15);
			};

		var createTimestamp = function () {
			 return parseInt(new Date().getTime() / 1000) + '';
		};
		var raw = function (args) {
			  var keys = Object.keys(args);
			  keys = keys.sort()
			  var newArgs = {};
			  keys.forEach(function (key) {
				newArgs[key.toLowerCase()] = args[key];
			  });

			  var string = '';
			  for (var k in newArgs) {
				string += '&' + k + '=' + newArgs[k];
			  }
			  string = string.substr(1);
			  return string;
		};
		
		var nonceStr=createNonceStr();
		var timestamp=createTimestamp();
		var weixinSdkConfig=function(ticket){
			//alert(ticket);
			var ret = {
				jsapi_ticket: ticket,
				nonceStr: nonceStr,
				timestamp: timestamp,
				url: window.location.href
			};
			var string=raw(ret);			
			var signature=$.sha1(string);
			
			var config=
			{     
				//debug:true,    
				appId: 'wx6e20ff10bae65ce5', 
				timestamp: timestamp,
				nonceStr: nonceStr,
				jsApiList: ['scanQRCode','onMenuShareTimeline','onMenuShareAppMessage','chooseWXPay'],
				signature:signature
			}
			
			
			$(document).ready(function(){
				wx.config(config);
				

				wx.error(function(res){
					alertWarning(JSON.stringify(res));
				});
			});        
		};
		
		 var url="http://m.xiaoniubang.com/api/access_token.php";
		 $.ajax({
			url: url,
			dataType: "json",
			cache:true,
			type:'GET',
			success: function(data){
				weixinSdkConfig(data.ticket);
			},
			error:function(data){
				alert(data.msg);
			}
		});
		var flag=true;
		$("#return").bind("click",function(){
			window.location='http://m.xiaoniubang.com/#/recharge';
		});
		
		$("#pay").bind("click",function(){
			if(getQueryStringByName('rechargeType')==1){//支付宝付款
			    window.location.href="http://m.xiaoniubang.com/pay/createTransaction.php?uid="+r.uid
					+"&no="+r.no
					+"&amount="+r.amount
					+"&rechargeType=4"
					+"&productId="+r.productId;
			}
			if(getQueryStringByName('rechargeType')==2)//微信支付充值
			{
				if(!flag){
					return;
				}
				/*var url="http://mainage.com/api/order/add?token="+r.token
					+"&openid="+r.openid
					+"&goodsId="+r.pid+"&quantity="+r.quantity;
				*/
				var url="http://m.xiaoniubang.com/api/pay/wechat/demo/getPayparam.php?openid="
					+r.openid+"&amount=0.01";//+r.amount;
					//alert(url);
				$("#pay").text("正在进行微信安全支付。。。")
				flag=false;
				$.ajax({
					url: url,
					dataType: "json",
					cache:true,
					type:'POST',
					success: function(data){
						//alert(JSON.stringify(data));
						if (data) {
							var d=data;
							wx.chooseWXPay({
								timestamp: d.timeStamp,
								nonceStr: d.nonceStr, 
								package: d.package, 
								signType: d.signType, 
								paySign: d.paySign, 
								success: function (res) {
									// 支付成功后的回调函数
									//alert("充值成功！");
									//alert(JSON.stringify(res));
									window.location.href="http://m.xiaoniubang.com/pay/createTransaction-wx.php?uid="+r.uid
									+"&no="+r.no
									+"&amount="+r.amount
									+"&rechargeType=4"
									+"&productId="+r.productId
									+"&openid="+r.openid;
									
									
									//window.location='http://m.xiaoniubang.com/#/recharge';
								}
							});

						}else{
							alert(data.msg);
						}
					},
					error:function(data){
						alert(JSON.stringify(data));
					}
				});
			}




		});

		
	});
	
	</script>
	<style>
    .scrollable-content{
        padding-left:1em;
        padding-right:1em;
    }
    .address-info{
        padding:1em 0;
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
    .address-info div button.back{
        width:90%;
        text-align:center;
        margin-left:5%;
        padding:.8em;
        color:#fff;
        background:#aaa;
        border:1px solid #aaa;

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
    .col-xs-4,.col-xs-8{
    	text-align:left;
    }
</style>
  </head>

  <body style="padding:1em .5em;text-align:center;overflow-y:auto;">
		
    <div class="address-info">
            <div class="address-title">请确认信息</div>
            <div style="background:#ddd;min-height:2em;line-height:2em;">
            	<span class="col-xs-4">充值金额：</span>
                <span class="col-xs-8" id="amount">60</span>
                <div class="clear"></div>
            </div>
            <div style="background:#ddd;min-height:2em;line-height:2em;">
            	<span class="col-xs-4">流水号：</span>
                <span class="col-xs-8" id="no"></span>
                <div class="clear"></div>
            </div>
			<div style="background:#ddd;min-height:2em;line-height:2em;">
            	<span class="col-xs-4">支付方式：</span>
                <span class="col-xs-8" id="rechargeType"></span>
                <div class="clear"></div>
            </div>


            <div style="background:#ddd;min-height:2em;line-height:2em;">
            	<span class="col-xs-4">充值日期：</span>
                <span class="col-xs-8" id="date"></span>
                <div class="clear"></div>
            </div>

            <div style="text-align:right;padding-bottom:1em;">
            </div>

            <div><button id="pay">确定</button></div>
			
			<div style="padding-top:1em;display:none;" id="tips">
			    选择支付宝付款方式需要您进行下面操作：<br/>
				复制以下链接在浏览器打开付款：
				

				<div style="padding:1em;white-space: normal;width:90%;text-align:left;overflow-x:auto;">
					<textarea style="width:100%;height:100px;" id="content"></textarea>
				</div>
			</div>

			<div style="padding:15px 0;"><button id="return" class="back">返回</button></div>

            
    </div>
	
  </body>
</html>
