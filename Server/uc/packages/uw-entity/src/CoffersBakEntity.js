/**
游戏-国库备份信息(CoffersBakEntity)
游戏-国库备份信息(CoffersBakEntity)
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/**/
    /** 等级 **/
    this.lvl = 0;/*等级*/
    /** 建设值 **/
    this.buildValue = 0;/*建设值*/
    /** 国库当前储量 **/
    this.resource = 0;/*国库当前储量*/
    /** 今日掠夺储量 **/
    this.lootResource = 0;/*今日掠夺储量*/
    /** 今日被劫储量 **/
    this.beLootResource = 0;/*今日被劫储量*/
    /** 守卫玩家数据 **/
    this.defeseData = null;/*[门类型，用户id,头衔类型，被掠夺的对手id组]*/
    /** 防守记录 **/
    this.defeseRecordArr = null;/*防守记录*/
    /** 掠夺成功记录 **/
    this.lootRecordArr = null;/*掠夺成功记录*/
    /** 累计积分 **/
    this.points = 0;/*累计积分*/
    /** 今日积分 **/
    this.todayPoints = 0;/*今日积分*/
    /** buff等级 **/
    this.buffLvl = 0;/*buff等级*/
    /** buff经验 **/
    this.buffExpc = 0;/*buff经验*/
    /** buff基础值 **/
    this.buffBase = 0;/*buff基础值*/
    /** 备份时间 **/
    this.bakDate = null;/*备份时间*/
    /** 掠夺别的服务器用户数据 **/
    this.lootUserData = null;/*掠夺别的服务器用户数据*/
    /** 守卫击破时间数据 **/
    this.breakTimeData = null;/*守卫击破时间数据*/

};
_Class.tableName = 'uw_coffers_bak';