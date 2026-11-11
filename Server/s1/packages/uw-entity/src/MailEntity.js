/**
游戏-邮件(MailEntity)
邮件
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 用户id **/
    this.userId = null;/*用户id*/
    /** 类型 **/
    this.type = null;/*类型*/
    /** 发送者 **/
    this.fromName = null;/*发送者*/
    /** 标题 **/
    this.title = null;/*标题*/
    /** 内容 **/
    this.content = null;/*内容*/
    /** 替换值 **/
    this.replaceArgs = null;/*替换值*/
    /** 附件物品 **/
    this.items = null;/*{hero:{&quot;id&quot;:num,..},diamond:100,wipeItem:100}*/
    /** 是否提取物品 **/
    this.isPicked = 0;/*是否提取物品*/
    /** 是否阅读 **/
    this.isRead = 0;/*是否阅读*/
    /** 操作后几小时删除 **/
    this.delHours = null;/*操作后几小时删除*/
    /** 删除时间 **/
    this.delTime = null;/*删除时间*/
    /** 过期时间 **/
    this.expireTime = null;/*过期时间*/
    /** 添加时间 **/
    this.addTime = null;/*添加时间*/
    /** 是否删除 **/
    this.isDelete = 0;/**/
    /** 任务id **/
    this.taskId = 0;/*任务id*/

};
_Class.tableName = 'uw_mail';