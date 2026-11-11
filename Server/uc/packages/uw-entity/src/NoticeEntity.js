/**
主-公告(NoticeEntity)
公告
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 标题 **/
    this.title = null;/*标题*/
    /** 内容 **/
    this.content = null;/*内容*/
    /** 服务器id组 **/
    this.serverIdArr = null;/*服务器id组,[]长度为0时为全服*/
    /** 是否开启 **/
    this.isOpen = 0;/*是否开启,0：不开启，1：开启*/
    /** 更新时间 **/
    this.updateTime = null;/*更新时间*/
    /** icon类型 **/
    this.iconType = 0;/*icon类型*/
    /** 公告时间 **/
    this.noticeTime = null;/*公告时间*/
    /** 开始时间 **/
    this.startTime = null;/*开始时间*/
    /** 结束时间 **/
    this.endTime = null;/*结束时间*/
    /** 排序 **/
    this.sort = 0;/*排序*/
    /** 活动额外数据 **/
    this.exData = null;/*活动额外数据*/

};
_Class.tableName = 'uw_notice';