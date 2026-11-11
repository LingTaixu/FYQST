/**
游戏-公用(GameCommonEntity)
游戏-公用(GameCommonEntity)
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/**/
    /** 最高副本 **/
    this.highCopyId = 0;/**/
    /** 是否开启Boss **/
    this.isOpenBoss = 1;/**/
    /** 假充值数据 **/
    this.fakeData = null;/*假数据 ，key值，见c_prop表*/

};
_Class.tableName = 'uw_game_common';