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
define("GAME_SERVER1_URL", 'http://127.0.0.1:20001');
define("GAME_SERVER_ADMKEY", 'JAGAHSAAJDF1FRHGAHAJKASKL34TSAFDSDFGA335');

// OSAdmin 常量
define('ADMIN_URL' ,'http://127.0.0.1:8080/vp000');// http://127.0.0.1:8201   http://localhost/ttf_tool:8201  http://m.sanguoh5.com:8081
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

// 页面设置
define('DEBUG' ,false);
define('PAGE_SIZE', 25);

$OSA_TEMPLATES = array(
	'default' => '默认模板',
	'schoolpainting' => '青葱校园',
	'blacktie' => '黑色领结',
	'wintertide' => '冰雪冬季',
);

$OSADMIN_COMMAND_FOR_LOG = array(	
	'SUCCESS' => '成功',
	'ERROR' => '失败',
	'ADD' => '增加',
	'DELETE' => '删除',
	'MODIFY' => '修改',
	'LOGIN' => '登录',
	'LOGOUT' => '退出',
	'PAUSE' => '封停',
	'PLAY' => '解封',
);

$OSADMIN_CLASS_FOR_LOG = array(
	'ALL' => '全部',
	'User' => '用户',
	'UserGroup' => '账号组',
	'Module' => '菜单模块',
	'MenuUrl' => '功能',
	'GroupRole' => '权限',
	'QuickNote' => 'QuickNote',
);


$GAMEPLAYER_QUERY_TYPE=array(
    "charname"=>"角色名称",
    "uid"=>"玩家账号",
    "charid"=>"角色ID",
);

$GAMEMESSAGE_QUERY_TYPE=array(
    1=>"系统公告", //原来的跑马灯
    //2=>"即时公告",
);

$GAMENOTICE_QUERY_TYPE=array(
    3=>"游戏选区页公告",
    //2=>"活动咨询",
    //4=>"跨服战况"
);

$BAN_ACCOUNT_TYPE=array(
    1=>"封号",
    2=>"禁言"
);
$BAN_STATUS_TYPE=array(
    0=>'正常',
    1=>'普通封号',
    2=>'设备封号',
    3=>'测试账号',
    4=>'GM账号'
);

$CHAT_TYPE=array(
    2=>'世界聊天',
    5=>'公会聊天'
);

$CARD_TYPE = array(
    1810 =>'月卡-瓦尔基里的祝福',
    1811 =>'周卡-阿尔忒弥斯的祝福'
);
$INTEGRAL_TYPE = array(
    88 =>'荣誉号角',
    1809 =>'充值积分',
    85 => '星辰粉末',
    1807 => '皇家猫粮',
    45 => '拿铁咖啡'
);

$SERVER_STATUS = array(
    1 =>'良好',
    2 =>'正常',
    3 => '火爆',
    4 => '未开放'
);

$CHANNEL_IDS = array(
    10006 =>'胡莱-应用宝',
    99999 =>'测试'
);

$CURRENCY_TYPE = [
    1 => '金币',
    2 => '钻石',
    3 => '荣誉值',
    4 => '声望',
    7 => '积分',
];
