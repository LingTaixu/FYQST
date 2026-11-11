/*
 * 定义枚举常量
 */

var exports = module.exports;

exports.eActorType = {
    boss: 0, //boss 
    player: 1,//玩家
    hero: 2	 
};

// 定义跨服boss新类型
exports.eBossType = {
	TianMing: 13, // 天命
	ZhongLi: 14,	// 中立
	HJBoss : 16,	// 幻境BOSS
	CSTianMing:17, // 天命(跨服)
	CSWorldBoss:18	// 世界BOSS(跨服)
};

exports.eBossStatus = {
	init : 0,
	readyForAlive:1,
	alive: 2,
	dead : 3,
	final:4
};

exports.eLoseTargetStatus = {
	init : 0,		// 初始值
	haveTarget:1,	// 有target
	noTarget: 2,	// 失去target 
};

exports.ePlayerStatus = {
	alive : 0,
	dead : 1
};

exports.eCostHJType = {
	own : 1,
	chest : 2
};

exports.eBossResult = {
	win: 0,		// 胜利,boss死亡
	timeout : 1 	// boss时间到
};

exports.eFightStatus = {
	idle :  0,	// idle
	normal: 1,   // 普通
	shield: 2    // 护盾
};

exports.eWBStage = {
	init : 0,
	prepareFroBattle : 1,
	battle: 2,
	shop : 3,
	close : 4
};

// 定义常量 (全部大写)
exports.eCONST = {
	SHIELD_ACTIVATE_HP: 0.2, 
	SHEILD_MAX_TIME : 15,	// 单位秒
	REVIVE_INTERVAL : 8,
	REVIVE_COST	: 100,		// 复活消耗100
	ZLBOSSLIST_ROOMID : "zlbosslist",
	HJBOSSLIST_ROOMID : "hjbosslist",
	PICK_CD: 10000,			// 拾取cd 2000 毫秒
	BOSS_RECOVERHP_CD: 10,	// 回满血CD
	SYNC_GUILDRANK_INTERVAL: 3000,	// 同步公会排行间隔 (10秒)
	MAP_DEL_INTERVAL: 30000,	// 30秒回收地图
	SYNC_SELF_INTERAVL:2000,		// 2秒钟
	SYNC_HURT_INTERAVL:3000,		// 3秒钟
	DROP_PROPAB : 0.1,			// 10%概率
	LUCKY_PROPAB: 0.05,			// 5%概率
	WORLDBOSS_DROP_ITEMID: 6001,	// 世界boss掉落
	SHOP_STAGE1_INTERVAL: 300,	// stage1 状态时间(秒)
	SHOP_STAGE2_INTERVAL: 300	// stage2 状态时间(秒)
};

exports.eEnterLimit = {
	limitLvl : 1,
	guildLvl : 2,
	tmFund : 3
};

exports.eChestStatus = {
	normal: 0, 
	picking : 1 
};

exports.eShopStatus = {
	init : 0,  // 初始值
	limit : 1,	// 前3可买
	all : 2,	// 所有人可以买
	close: 3	// 关闭
};
