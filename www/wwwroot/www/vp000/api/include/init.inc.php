<?php
error_reporting(E_ALL);
session_start();
require 'config/config.inc.php';
//require 'config/config.game.php';
//require 'config/config.mail.php';
//require 'config/config.lvl.php';
require 'config/config.server.php';
//require 'config/config.recharge.php';
//require 'config/config.recharge_old.php';
//require 'config/config.copy.php';
//require 'config/config.payInfo.php';
//require 'config/config.bossLevel.php';
//require 'config/config.item.php';
//require 'config/config.guide.php';
//require 'config/config.itemLogic.php';
//require 'config/config.sdkChannel.php';
//require 'config/config.guildlvl.php';

function OSAdminAutoLoad($classname){
	$filename = str_replace('_', '/', $classname) . '.class.php';
    // class类
    $filepath = ADMIN_BASE_CLASS . $filename;
    if (file_exists($filepath)) {
        return include $filepath;
    }else{
		// Class 仅支持一级子目录
		// 如果子目录中 class 文件与 CLASS 根下文件同名，则子目录里的 class 文件将被忽略

		$handle=opendir(ADMIN_BASE_CLASS);

		while (false !== ($file = readdir($handle))) {
			if (is_dir(ADMIN_BASE_CLASS. "/" . $file)) {
				$filepath=ADMIN_BASE_CLASS."/".$file."/".$filename;
				if (file_exists($filepath)) {
					return include $filepath;
				}
			}
		}
	}
    // lib 库文件
    $filepath = ADMIN_BASE_LIB . $filename;
    if (file_exists($filepath)) {
        return include $filepath;
    }

    throw new Exception( $filepath . ' NOT FOUND!');
}
spl_autoload_register('OSAdminAutoLoad');

//if(!isset($_SESSION['osa_timezone'])){
//		$timezone = System::get('timezone');
//		$_SESSION['osa_timezone'] = $timezone;
//}
//
//date_default_timezone_set($_SESSION['osa_timezone']);
