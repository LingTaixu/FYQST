/**
主-兑换码(CouponEntity)
兑换码
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 使用用户id **/
    this.userId = null;/*使用用户id*/
    /** 名称 **/
    this.name = null;/*名称*/
    /** 描述 **/
    this.content = null;/*描述*/
    /** 生成码 **/
    this.code = null;/*生成码*/
    /** 类型 **/
    this.type = 0;/*类型   0一次  1无限制*/
    /** 生效时间 **/
    this.startTime = null;/*生效时间*/
    /** 截止时间 **/
    this.endTime = null;/*截止时间*/
    /** 物品 **/
    this.items = null;/*{hero:{&quot;id&quot;:num,..},diamond:100,wipeItem:100}*/
    /** 渠道组 **/
    this.channelIds = null;/*渠道组*/
    /** 渠道号 **/
    this.channelId = 0;/*渠道号*/
    /** 是否领取 **/
    this.isUsed = 0;/*是否领取*/
    /** 服务器id **/
    this.serverId = 0;/**/
    /** 兑换码领取周期 **/
    this.period = 0;/**/
    /** 是否使用新兑换码机制 **/
    this.isNew = 0;/*是否使用新兑换码机制*/
    /** 用户账号id **/
    this.accountId = 0;/*用户账号id*/
    /** 绑定账号id **/
    this.bindAccountId = 0;/*绑定账号id，0 为不限制*/

};
_Class.tableName = 'uw_coupon';