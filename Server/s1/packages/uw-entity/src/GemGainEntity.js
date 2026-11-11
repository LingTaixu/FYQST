/**
后台-获取钻石(GemGainEntity)
后台-获取钻石
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 时间 **/
    this.recordTime = null;/*时间*/
    /** 用户ID **/
    this.userId = null;/*用户ID*/
    /** 获取项目 **/
    this.item_id = null;/*获取项目*/
    /** 获取钻石 **/
    this.amount = null;/*获取钻石*/
    /** 商店记录 **/
    this.shopRecord = null;/*商店记录*/
    /** 渠道号 **/
    this.channelId = null;/*渠道号*/

};
_Class.tableName = 'uw_gem_gain';