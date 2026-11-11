<?php
define('ACCESS', 1);
error_reporting(E_ALL ^ E_NOTICE);
// autoload 使用常量
define('ADMIN_BASE', dirname (__FILE__) . '/../../include');
define('ADMIN_BASE_LIB', ADMIN_BASE . '/lib/');
define('ADMIN_BASE_CLASS', ADMIN_BASE . '/class/');

// Smarty 模板使用常量
define('TEMPLATE_DIR', ADMIN_BASE . '/template/');
define('TEMPLATE_COMPILED', ADMIN_BASE . '/compiled/');
define('TEMPLATE_PLUGINS', ADMIN_BASE_LIB . 'Smarty/plugins/');
define('TEMPLATE_SYSPLUGINS', ADMIN_BASE_LIB . 'Smarty/sysplugins/');
define('TEMPLATE_CONFIGS', ADMIN_BASE . '/config/');
define('TEMPLATE_CACHE', ADMIN_BASE . '/cache/');

// 游戏服务器地址 (以后修改）
define("GAME_SERVER_ADMKEY", 'JAGAHSAAJDF1FRHGAHAJKASKL34TSAFDSDFGA335');

// OSAdmin 常量
define('ADMIN_URL' ,'http://192.168.0.101/gmt/uploads');
define('ADMIN_TITLE' ,'管理后台');
define('COMPANY_NAME' ,'MmoBay.cn');

// OSAdmin 数据库设置
define('OSA_DB_ID' ,'osadmin');
define('OSA_NWNY_ID' ,'game_server');
define('OSA_MAIN_ID' ,'master');
define('OSA_lOGIN_ID' ,'login');
define('OSA_GAMELOG_ID' ,'gamelog');

// 样例数据库设置
define('SAMPLE_DB_ID' ,'sample');
$DATABASE_LIST[SAMPLE_DB_ID] = array (
    'server' => '127.0.0.1',
    'port' => '3306',
    'username' => 'root',
    'password' => 'xxxxxx',
    'db_name' => 'osadmin');
//礼包码文件路径
define("GIFT_FILE",dirname(dirname(dirname(__FILE__))).'/download/');

// COOKIE 加密密钥，建议修改
define('OSA_ENCRYPT_KEY','whatafuckingday!');

// prefix 不要更改，除非修改 osadmin.sql 文件中的所有表名
define('OSA_TABLE_PREFIX' ,'osa_');


