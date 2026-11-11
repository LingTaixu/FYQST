/**
主-战斗分组(BattlesGroupEntity)
战斗分组
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*编号*/
    /** 类型 **/
    this.type = null;/**/
    /** 名称 **/
    this.name = null;/**/
    /** 服务器组 **/
    this.serverArr = null;/*[服务器id,服务器id...]*/
    /** 战斗服地址 **/
    this.battleHost = null;/**/
    /** 战斗服端口 **/
    this.battlePort = null;/**/
    /** 战斗服ID **/
    this.battleID = null;/**/

};
_Class.tableName = 'uw_battles_group';