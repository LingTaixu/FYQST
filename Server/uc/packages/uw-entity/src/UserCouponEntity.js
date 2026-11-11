/**
游戏-用户兑换码(UserCouponEntity)
游戏-用户兑换码(UserCouponEntity)
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 兑换码批次 **/
    this.codeName = null;/*兑换码批次*/
    /** 玩家id **/
    this.userId = null;/*玩家id*/

};
_Class.tableName = 'uw_user_coupon';