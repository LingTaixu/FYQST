/**
游戏-boss掉落记录(CopyLootRecordEntity)
掉落记录
**/
var _Class = module.exports = function(){
    /** id **/
    this.id = null;/**/
    /** userId **/
    this.userId = null;/**/
    /** 玩家名 **/
    this.userName = null;/*玩家名*/
    /** 副本类型 **/
    this.copyType = null;/*副本类型(全民、中立、天命BOSS都算作副本记录)*/
    /** bossId **/
    this.bossId = null;/**/
    /** 掉落物品Id **/
    this.itemId = null;/**/
    /** 掉落时间 **/
    this.lootTime = null;/**/

};
_Class.tableName = 'uw_copyloot_record';