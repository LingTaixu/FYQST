/**
主-游戏配置(GameConfigEntity)
主-游戏配置(GameConfigEntity)
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/**/
    /** 跨服排名服Host **/
    this.rankServerHost = null;/*跨服排名服Host*/
    /** 跨服排名服port **/
    this.rankServerPort = null;/*跨服排名服port*/

};
_Class.tableName = 'uw_game_config';