/**
后台-消耗钻石(ConsumeEntity)
后台-消耗钻石
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 时间 **/
    this.recordTime = null;/*时间*/
    /** 用户ID **/
    this.userId = null;/*用户ID*/
    /** 消耗项目 **/
    this.item_id = null;/*消耗项目*/
    /** 消耗钻石 **/
    this.amount = null;/*消耗钻石*/
    /** 商店记录 **/
    this.shopRecord = null;/*商店记录*/
    /** 渠道号 **/
    this.channelId = null;/*渠道号*/

};
_Class.tableName = 'uw_consume';