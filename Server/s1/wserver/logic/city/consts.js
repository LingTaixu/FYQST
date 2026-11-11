/*
 * 定义主城枚举常量
 */

var exports = module.exports;

// 定义常量 (全部大写)
exports.eChestStatus = {
	normal: 0, 
	picking : 1 
};

exports.eGodness  = {
	CHEST_ITEMID	: 2004,			// 女神礼包
	SPAWN_CHEST_INTERVAL: 30000,	// 30秒

	// BEGIN_HOUR: 20, 
	// BEGIN_MINUTE : 30,
	// MAX_INTERVAL: 600,	// 持续时间 （秒）
	MAX_PICKNUM: 9,		// 最大拾取数量
	MAX_CHESTNUM: 20,		// 地图上最多宝箱数
	PICK_CD: 2000,			// 拾取cd 2000 毫秒
	ADDEXP_INTERVAL: 3, 	// 3秒钟
};

exports.eActivityStatus = {
	init: 0, 			// 活动初始
	running : 1,		// 活动进行中
	closed: 2			// 活动结束
};

exports.eCONST = {
	WORLDMAP_NAME: 'maincity'		// 主城地图的名称
};