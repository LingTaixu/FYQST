/**
主-掉落配置(LootConfigEntity)
主-掉落配置
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/**/
    /** 开始时间 **/
    this.startTime = null;/*开始时间*/
    /** 结束时间 **/
    this.endTime = null;/*结束时间*/
    /** 特殊掉落的物品类型 **/
    this.lootTypeArr = null;/*特殊掉落的物品类型*/

};
_Class.tableName = 'uw_loot_config';