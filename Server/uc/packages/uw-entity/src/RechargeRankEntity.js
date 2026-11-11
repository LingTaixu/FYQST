/**
后台-充值排行(RechargeRankEntity)
后台-充值排行
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 用户id **/
    this.userId = null;/*用户id*/
    /** 昵称 **/
    this.nickName = null;/*昵称*/
    /** 服务器id **/
    this.serverId = null;/*服务器id*/
    /** 充值总额 **/
    this.payNum = null;/*充值总额*/
    /** 充值次数 **/
    this.payCount = null;/*充值次数*/
    /** 充值记录 **/
    this.payRecord = null;/*充值记录*/
    /** 购买金币总次数 **/
    this.buyGoldNum = null;/*购买金币总次数*/
    /** 商店记录 **/
    this.shopRecord = null;/*商店记录*/

};
_Class.tableName = 'uw_recharge_rank';