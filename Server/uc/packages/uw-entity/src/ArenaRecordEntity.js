/**
游戏-排位赛记录(ArenaRecordEntity)
排位赛挑战记录
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/**/
    /** 用户id **/
    this.userId = null;/**/
    /** 用户等级 **/
    this.userLvl = 0;/*用户等级*/
    /** 用户头像 **/
    this.userIconId = null;/**/
    /** 用户名字 **/
    this.userName = null;/*用户名字*/
    /** 用户胜场 **/
    this.userWinCount = null;/**/
    /** 对手id **/
    this.enemyId = null;/*对手id*/
    /** 对手等级 **/
    this.enemyLvl = 0;/*对手等级*/
    /** 对手头像 **/
    this.enemyIconId = null;/**/
    /** 对手名字 **/
    this.enemyName = null;/*对手名字*/
    /** 对手胜场 **/
    this.enemyWinCount = null;/**/
    /** 是否胜利 **/
    this.isWin = 0;/*是否胜利*/
    /** 挑战时间 **/
    this.fightTime = null;/*挑战时间*/
    /** 战斗数据 **/
    this.fightData = null;/*战斗数据*/
    /** 战斗类型 **/
    this.fightType = null;/*战斗类型
1,排位赛,2仇人榜*/
    /** 是否结算 **/
    this.isDeal = 0;/*是否结算
0:没结算
1:已结算*/
    /** 是否阅读 **/
    this.isRead = 0;/**/
    /** 是否复仇 **/
    this.isRevenge = 0;/*是否复仇*/

};
_Class.tableName = 'uw_arena_record';