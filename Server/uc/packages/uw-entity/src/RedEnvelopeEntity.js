/**
红包(RedEnvelopeEntity)
红包
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 红包类型 **/
    this.redType = 1;/*红包类型*/
    /** 发送者id **/
    this.userId = null;/*发送者id*/
    /** 公会id **/
    this.guildId = null;/*公会id*/
    /** 红包物品 **/
    this.spItemId = 200;/*红包物品,默认元宝*/
    /** 红包元宝 **/
    this.diamond = null;/*红包元宝*/
    /** 人数 **/
    this.personNum = 0;/*人数*/
    /** 红包祝福 **/
    this.wish = 0;/*红包祝福*/
    /** 领取记录 **/
    this.getData = null;/*领取记录[[元宝数,userId],[元宝数,userId]......]*/
    /** 添加时间 **/
    this.addTime = null;/*添加时间*/
    /** 过期时间 **/
    this.expireTime = null;/*过期时间*/
    /** 是否删除 **/
    this.isDelete = 0;/*是否删除*/

};
_Class.tableName = 'uw_red_envelope';