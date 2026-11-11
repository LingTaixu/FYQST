/*
 * 定义枚举常量
 */

var exports = module.exports;

exports.eActorType = {
    boss: 0, //boss 
    player: 1,//玩家
    hero: 2	 
};

exports.eBossType = {
	TianMing: 13, // 天命
	ZhongLi: 14,	// 中立
	HJBoss : 16	// 幻境BOSS
};

exports.eBossStatus = {
	init : 0,
	readyForAlive:1,
	alive: 2,
	dead : 3,
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
	normal: 0,   // 普通
	shield: 1    // 护盾
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
