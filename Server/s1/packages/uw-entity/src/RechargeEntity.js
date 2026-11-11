/**
游戏-充值记录表(RechargeEntity)
游戏-充值记录表
**/
var _Class = module.exports = function(){
    /** id **/
    this.id = null;/*id*/
    /** 用户id **/
    this.userId = null;/**/
    /** 充值项id **/
    this.rechargeId = null;/**/
    /** 充值钻石 **/
    this.diamond = null;/*充值钻石*/
    /** 充值时间 **/
    this.rechargeTime = null;/**/
    /** 生效时间 **/
    this.effTime = null;/*生效时间*/
    /** 渠道号 **/
    this.channelId = null;/*渠道号*/
    /** 业务号 **/
    this.transId = null;/*业务号*/
    /** 币种 **/
    this.currency = 'CNY';/*币种,CNY,USD,HKD,TWD*/
    /** ip **/
    this.ip = null;/*ip*/
    /** 金额 **/
    this.payMoney = null;/*金额*/
    /** 用户当前等级 **/
    this.userLvl = null;/*用户当前等级*/

};
_Class.tableName = 'uw_recharge';