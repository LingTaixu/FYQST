/*
 * 定义枚举常量
 */

var exports = module.exports;

exports.eActorType = {
    boss: 0, //boss (怪物)
    player: 1,//玩家
    // hero: 2,
    pillar: 2,	// 柱子	 
};
 
exports.eNpcStatus = {
	init : 0,
	readyForAlive:1,
	alive: 2,
	dead : 3,
};

exports.eNpcCfgStatus = {
	init : 0,					// 初始
	needForSpawn : 1,			// 需要刷新
	done : 2,					// 完成
};

exports.eAddScoreType = {
	killNpc : 1,
	killPlayer: 2,
	participatTime:3,
	holdPillar:4,
	holdPillarTime:5
};

exports.ePillarStatus = {
	init : 0,
	holding:1		// 占领进度中
};

exports.ePlayerStatus = {
	alive : 0,
	dead : 1
};

exports.eGuildBattleResult = {
	win: 0,		// 胜利,boss死亡
	timeout : 1 	// boss时间到
};

// 地图状态
exports.eMapStatus = {
	init : 0,				// 初始状态
	prepareBattle:1,		// 公会战数据准备 (从DB中拉取公会战数据)
	prepareDone:2,			// 准备完毕
	enterBattle : 3,			// 公会战开启（玩家可以进入)
	beginBattle: 4,				// 开启公会战
	battle:5,				// 公会战中
	endBattle:6,			// 公会战结束(有外层控制)
	eggact:7,				// 彩蛋活动
	endEggact:8,
	close:9,					// 地图需要关闭 
};

// 公会战状态
exports.eBattleStatus = {
	init : 0,				// 初始状态
	prepare:1,				// 准备中 (创建地图等)
	open:2,					// 玩家可以进入
	battle:3,				// 公会战中 （地图已开)
	eggact:4,				// 彩蛋活动
	close: 5,				// 公会战结束  
};
 
// 定义常量 (全部大写)
exports.eCONST = {
	GB_MAPID: 9999,
	REVIVE_INTERVAL : 8,
	REVIVE_COST	: 100,		// 复活消耗100
	NPC_PILLAR_ID : 960000,
	NPC_BZYJ_ID: 960001,
	NPC_RESPAWN_INTERVAL: 5000,	// NPC复活时间间隔 （5秒)
	PILLAR_HOLDSCORE_INTERVAL: 10000,	// 柱子占有时长加积分 (10秒)
	PILLAR_HOLDCD: 10000,	// 柱子占有ing CD (10秒)
	PILLAR_HOLDSCORE: 100,		// 柱子加积分
	SYNC_GUILDRANK_INTERVAL: 10000,	// 同步公会排行间隔 (10秒)
	BATTLE_START_HOUR: 		20,
	BATTLE_START_MINUTE: 	0,
	BATTLE_INTERVAL : 15, 	// 15,	// 15分钟
	BATTLE_PRETIME: 30, 	// 30,	// 30秒准备时间

	// CHEST_ITEMID	: 2004,			// 礼包ID
	COLOR_EGG_ITEMID:1300012,		//彩蛋
	GOLD_EGG_ITEMID:1300013,		//金蛋
	COLORFUL_EGG_INTERVAL: 10,  //彩蛋活动持续时间10分钟
	SPAWN_CHEST_NUM:15,			//每波产生箱子数
	PICK_CD: 2000,			// 拾取cd 2000 毫秒

	SPAWN_CHEST_INTERVAL: 60000,	// 1分钟
	MAX_PICKNUM: 9,		// 最大拾取数量
	// MAX_CHESTNUM: 20,		// 地图上最多宝箱数

	
	//egg for test
	// SPAWN_CHEST_INTERVAL: 30000,	// 30秒
	// MAX_PICKNUM: 999,		// 最大拾取数量
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