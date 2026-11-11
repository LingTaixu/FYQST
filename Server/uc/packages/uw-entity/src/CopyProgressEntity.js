/**
游戏-副本进度(CopyProgressEntity)
副本进度
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/**/
    /** 用户id **/
    this.userId = null;/*用户id*/
    /** 副本类型 **/
    this.copyType = null;/*副本类型*/
    /** 主副本id **/
    this.pCopyId = null;/*主副本id*/
    /** 连胜 **/
    this.winningStreak = 0;/*连胜*/
    /** 主副本挑战时间 **/
    this.pTime = null;/*主副本挑战时间*/
    /** 已通关子副本列表 **/
    this.copyObj = null;/*已通关子副本列表{子副本id:节点,子副本id:节点...}*/
    /** 最后一次通关子副本时间 **/
    this.refreshTime = null;/*最后一次通关子副本时间*/
    /** 子副本挑战时间列 **/
    this.timeArr = null;/*子副本挑战时间列*/
    /** 子副本星级 **/
    this.copyStar = null;/*子副本星级*/
    /** 主副本是否已经通过 **/
    this.finished = 0;/*主副本是否已经通过*/
    /** 是否领取通关奖励 **/
    this.isPickAward = null;/*是否领取通关奖励[0,0,1]*/
    /** 是否领取通关宝箱 **/
    this.isPickChests = null;/*是否领取通关宝箱[0,0,1]*/
    /** 子副本剩余挑战次数 **/
    this.timesPerDay = null;/*子副本已通关次数*/
    /** 购买次数 **/
    this.resetCounts = null;/*购买次数{id:次数,id:次数...}*/
    /** 购买时间 **/
    this.resetTime = null;/*购买时间*/
    /** 查看数据 **/
    this.readObj = null;/*查看数据{副本id:是否阅读}*/

};
_Class.tableName = 'uw_copy_progress';