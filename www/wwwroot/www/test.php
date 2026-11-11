<?php
$json=file_get_contents('c_payInfo.json');
$json=json_decode($json,true);
foreach($json as $v=>$k){
	if($k["L"]){
		echo $v.';'.json_encode($k['L']).'<br>';
		//file_put_contents('items.txt',$v.';'.$k['B'].PHP_EOL,FILE_APPEND);
	}
}