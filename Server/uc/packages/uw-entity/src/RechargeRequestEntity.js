/**
主-充值请求记录(RechargeRequestEntity)
充值请求记录
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 账号id **/
    this.accountId = null;/*账号id*/
    /** 用户id **/
    this.userId = null;/*用户id*/
    /** 服务器id **/
    this.serverId = null;/*服务器id*/
    /** 充值项id **/
    this.rechargeId = null;/*充值项id*/
    /** 状态 **/
    this.status = 0;/*状态 0:请求 1:支付成功 2:领取钻石*/
    /** 添加时间 **/
    this.addTime = null;/*添加时间*/
    /** 业务号 **/
    this.transId = null;/*业务号*/
    /** 渠道物品id **/
    this.goodsId = 0;/*渠道物品id*/
    /** 订单号 **/
    this.orderNo = null;/*订单号*/
    /** 状态2 **/
    this.gmStatus = 0;/*0  普通 1 补单 2 模拟充值*/
    /** 商品价格 **/
    this.goodsPrice = 0;/*单位元*/
    /** 付费金额 **/
    this.feeMoney = 0;/*单位分*/
    /** 渠道id **/
    this.channelId = null;/*渠道id*/
    /** 子渠道ID **/
    this.sdkChannelId = null;/**/

};
_Class.tableName = 'uw_recharge_request';