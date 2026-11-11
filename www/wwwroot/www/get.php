<?php
error_reporting(0);
$urlbase='http://cdn.fyh5.hulai.com/lianyun/resource/dynamic2/';
for($i=400;$i<500;$i++){
	$file='item_'.$i.'000.png';
	$png=file_get_contents($urlbase.$file);
		if($png){
			echo $file.PHP_EOL;
			file_put_contents($file,$png);
		}
}
/*
$filehead='item_f';
for($i=1;$i<10;$i++){
	for($l=1;$l<22;$l++){
		$m=str_pad($l,4,0,STR_PAD_LEFT);
		$file=$filehead.$i.$m.'.png';
		$png=file_get_contents($urlbase.$file);
		if($png){
			echo $file.PHP_EOL;
			file_put_contents($file,$png);
		}
	}
}
*/
/*
for($i=611;$i<1000;$i++){
	for($l=0;$l<5;$l++){
		$file='m'.$i.'_'.$l.'a.png';
		$png=file_get_contents($urlbase.$file);
		if($png){
			echo $file.PHP_EOL;
			file_put_contents($file,$png);
		}
		$file='m'.$i.'_'.$l.'r.png';
		$png=file_get_contents($urlbase.$file);
		if($png){
			echo $file.PHP_EOL;
			file_put_contents($file,$png);
		}
		$file='m'.$i.'_'.$l.'s.png';
		$png=file_get_contents($urlbase.$file);
		if($png){
			echo $file.PHP_EOL;
			file_put_contents($file,$png);
		}
	}
}
*/
//get e
/*
for($i=1;$i<1000;$i++){
	$file='e'.$i.'A.png';
	$png=file_get_contents($urlbase.$file);
	if($png){
		echo $file.PHP_EOL;
		file_put_contents($file,$png);
	}
	$file='e'.$i.'B.png';
	$png=file_get_contents($urlbase.$file);
	if($png){
		echo $file.PHP_EOL;
		file_put_contents($file,$png);
	}
	$file='e'.$i.'C.png';
	$png=file_get_contents($urlbase.$file);
	if($png){
		echo $file.PHP_EOL;
		file_put_contents($file,$png);
	}
	$file='e'.$i.'D.png';
	$png=file_get_contents($urlbase.$file);
	if($png){
		echo $file.PHP_EOL;
		file_put_contents($file,$png);
	}
	$file='e'.$i.'E.png';
	$png=file_get_contents($urlbase.$file);
	if($png){
		echo $file.PHP_EOL;
		file_put_contents($file,$png);
	}
}*/
//get sta
/*
$urlbase='http://cdn.fyh5.hulai.com/lianyun/resource/dynamic2/sta/';
for($i=500;$i<1000;$i++){
	$file='r'.$i.'.png';
	$png=file_get_contents($urlbase.$file);
	if($png){
		echo $file.PHP_EOL;
		file_put_contents($file,$png);
	}
}*/
/*
$filehead='head_';
for($i=0;$i<100000;$i++){
	$l=str_pad($i,5,0,STR_PAD_LEFT);
	//echo $l.PHP_EOL;
	$file=$filehead.$l.'.png';
	$png=file_get_contents($urlbase.$file);
	if($png){
		echo $file.PHP_EOL;
		file_put_contents($file,$png);
	}
}
*/
/*
$filehead='gift_skill_';
for($i=0;$i<10000;$i++){
	$l=str_pad($i,4,0,STR_PAD_LEFT);
	//echo $l.PHP_EOL;
	$file=$filehead.$l.'.png';
	$png=file_get_contents($urlbase.$file);
	if($png){
		echo $file.PHP_EOL;
		file_put_contents($file,$png);
	}
}
*/
//get item
/*
$filehead='item_';
for($i=100000;$i<1000000;$i++){
	$l=str_pad($i,6,0,STR_PAD_LEFT);
	//echo $l.PHP_EOL;
	$file=$filehead.$l.'.png';
	$png=file_get_contents($urlbase.$file);
	if($png){
		echo $file.PHP_EOL;
		file_put_contents($file,$png);
	}
}*/
//get map
/*
$filehead='map_';
for($i=101;$i<111;$i++){
	for($l=0;$l<8;$l++){
		for($m=0;$m<10;$m++){
			$file=$filehead.$i.'_'.$l.'_'.$m.'.jpg';
			$png=file_get_contents($urlbase.$file);
			if($png){
				echo $file.PHP_EOL;
			file_put_contents($file,$png);
			}
		}
	}
}
*/