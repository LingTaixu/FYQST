/**
游戏-抽奖(LotteryEntity)
抽奖
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 用户id **/
    this.userId = 0;/*用户id*/
    /** 探宝值 **/
    this.treasureValue = 0;/*探宝值*/
    /** 探宝宝箱领取次数 **/
    this.treasureChestCount = 0;/*探宝宝箱领取次数*/

};
_Class.tableName = 'uw_lottery';