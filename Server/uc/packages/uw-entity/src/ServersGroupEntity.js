/**
主-服务器分组表(ServersGroupEntity)
服务器分组表
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 分组类型 **/
    this.type = null;/*分组类型*/
    /** 组名 **/
    this.name = null;/*组名*/
    /** 服务器组 **/
    this.serverArr = null;/*服务器组*/
    /** 是否删除 **/
    this.isDelete = null;/*是否删除*/
    /** 分组方案 **/
    this.case = null;/*分组方案*/

};
_Class.tableName = 'uw_servers_group';