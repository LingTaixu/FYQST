/**
后台-操作日志(ManagerLog)
后台操作日志
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 账号id **/
    this.managerId = null;/*账号id*/
    /** 账号名 **/
    this.managerName = null;/*账号名*/
    /** 模块 **/
    this.module = null;/*模块*/
    /** 服务器id **/
    this.serverId = 0;/*服务器id*/
    /** 类型 **/
    this.type = null;/*类型*/
    /** 操作 **/
    this.operation = null;/*操作*/
    /** ip **/
    this.ip = null;/*ip*/
    /** 时间 **/
    this.time = null;/*时间*/
    /** 类型id **/
    this.tid = null;/*类型id*/

};
_Class.tableName = 'uw_manager_log';