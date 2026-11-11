/**
主-系统信息表(SystemMessageEntity)

**/
var _Class = module.exports = function(){
    /** id **/
    this.id = null;/*id*/
    /** 服务器id **/
    this.serverId = 0;/*默认为0，所有服务器*/
    /** 公告内容 **/
    this.message = null;/*公告内容*/
    /** 公告类型 **/
    this.type = 1;/*公告类型： 
1 marquee 跑马灯公告
2 即时公告*/
    /** 字体颜色 **/
    this.color = '#000000';/*字体颜色*/
    /** 字体大小 **/
    this.size = 16;/*字体大小*/
    /** 状态 **/
    this.status = 0;/*状态0未发送，1已发送*/
    /** 显示次数 **/
    this.times = 1;/*显示次数*/
    /** 间隔时间 **/
    this.interval = 60;/*间隔时间 秒为单位*/
    /** 发送时间 **/
    this.sendTime = null;/*发送时间*/
    /** 创建时间 **/
    this.createTime = null;/*创建时间*/
    /** 最后更新时间 **/
    this.lastUpdateTime = null;/*最后更新时间*/

};
_Class.tableName = 'uw_system_message';