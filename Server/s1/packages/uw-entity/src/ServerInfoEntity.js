/**
主-服务器信息表(ServerInfoEntity)
服务器信息表。用于管理服务器信息。
**/
var _Class = module.exports = function(){
    /** id **/
    this.id = null;/*id*/
    /** 服务器名称 **/
    this.name = null;/**/
    /** 合服后的名字 **/
    this.mergerName = null;/*合服后的名字*/
    /** 游戏区 **/
    this.area = null;/*游戏区*/
    /** 服务器ip **/
    this.host = null;/*服务器ip*/
    /** 端口 **/
    this.port = null;/*端口*/
    /** 是否是新区 **/
    this.isNew = 1;/*是否是新区*/
    /** 状态 **/
    this.status = 1;/*状态:
0:维护,1:良好，2:正常，3:爆满 ,4:未开放*/
    /** 数据库链接字符串 **/
    this.dbLink = null;/*数据库链接字符串*/
    /** 排序 **/
    this.sort = 0;/*越大越在后面*/
    /** 渠道区分 **/
    this.appId = null;/*渠道区分*/
    /** 服务器id **/
    this.serverId = null;/*服务器id*/
    /** 客户端索引id **/
    this.indexId = null;/*客户端索引id*/
    /** 是否维护 **/
    this.isClose = 0;/**/
    /** 维护说明 **/
    this.closeExplain = null;/**/
    /** 开服日期 **/
    this.serverDate = null;/**/
    /** 外部数据库链接 **/
    this.outLink = null;/*外部数据库链接*/
    /** 服务器2ip **/
    this.host2 = null;/*[ws服务 Host]*/
    /** 端口2 **/
    this.port2 = null;/*[ws  服务端口]*/

};
_Class.tableName = 'uw_server_info';