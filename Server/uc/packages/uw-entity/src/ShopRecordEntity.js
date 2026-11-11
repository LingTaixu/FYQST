/**
游戏-商店购买记录(ShopRecordEntity)
游戏-商店购买记录
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 用户id **/
    this.userId = null;/*用户id*/
    /** 用户等级 **/
    this.userLvl = null;/*用户等级*/
    /** 用户vip **/
    this.userVip = null;/*用户vip*/
    /** 消耗金币 **/
    this.costGold = null;/*消耗金币*/
    /** 商店类型 **/
    this.shopType = null;/*商店类型*/
    /** 消耗元宝 **/
    this.costDiamond = null;/*消耗元宝*/
    /** 购买物品 **/
    this.buyItemId = null;/*购买物品*/
    /** 购买数量 **/
    this.buyAmount = null;/*购买数量*/
    /** 购买时间 **/
    this.buyTime = null;/*购买时间*/

};
_Class.tableName = 'uw_shop_record';