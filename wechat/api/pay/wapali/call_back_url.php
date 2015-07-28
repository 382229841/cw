<?php
	$trade_no = $_GET['trade_no'];
    $out_trade_no = $_GET['out_trade_no'];
	//header("Location: http://m.xiaoniubang.com/pay/success.php?trade_no=$trade_no&order_id=$out_trade_no";);
	$url="http://m.xiaoniubang.com/pay/success.php?trade_no=$trade_no&order_id=$out_trade_no";
	echo "<script>
		window.location.href='$url';
	</script>";
	
?>

