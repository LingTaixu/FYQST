/**
游戏-聚灵妖莲(DemonLotusEntity)
聚灵妖莲
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*公会个人信息id*/
    /** 用户id **/
    this.userId = null;/*用户id*/
    /** 妖莲等级 **/
    this.lvl = 0;/*妖莲等级*/
    /** 累计经验值 **/
    this.addUpExpc = 0;/*累计经验值*/
    /** 最后操作时间 **/
    this.lastOpeTime = null;/*最后操作时间*/
    /** 进阶等级 **/
    this.advanceLvl = 0;/*进阶等级*/
    /** 宝物等级 **/
    this.treasureLvl = 0;/*宝物等级*/

};
_Class.tableName = 'uw_demon_lotus';