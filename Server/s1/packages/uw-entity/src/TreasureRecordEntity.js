/**
秘宝争夺记录(TreasureRecordEntity)
秘宝争夺记录
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 记录类型 **/
    this.recordType = null;/*记录类型*/
    /** 玩家id **/
    this.userId = null;/*玩家id*/
    /** 公会名 **/
    this.guildName = null;/*公会名*/
    /** vip等级 **/
    this.userVip = null;/*vip等级*/
    /** 玩家名 **/
    this.userName = null;/*玩家名*/
    /** 勋章称号 **/
    this.medalTitle = null;/*勋章称号*/
    /** 秘宝id **/
    this.treasureId = null;/*秘宝id*/
    /** 掉落物品 **/
    this.items = null;/*掉落物品*/
    /** 记录日期 **/
    this.recordDate = null;/**/

};
_Class.tableName = 'uw_treasureRecord';