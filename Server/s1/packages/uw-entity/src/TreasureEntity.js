/**
秘宝信息表(TreasureEntity)
秘宝信息表
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 拥有者id **/
    this.userId = null;/*拥有者id*/
    /** 秘宝id **/
    this.treasureId = null;/*秘宝id*/
    /** 开启时间 **/
    this.openTime = null;/*开启时间*/
    /** 是否有效 **/
    this.isOpen = 1;/*是否有效*/
    /** 开出物品 **/
    this.items = null;/*开出物品*/
    /** 是否删除 **/
    this.isDelete = 0;/*是否删除*/

};
_Class.tableName = 'uw_treasure';