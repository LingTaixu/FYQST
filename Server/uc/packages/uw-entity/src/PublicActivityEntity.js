/**
主-游戏公共活动(PublicActivityEntity)
主-游戏公共活动(PublicActivityEntity)
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 标题 **/
    this.title = null;/*标题*/
    /** 标题全称 **/
    this.fullTitle = null;/*标题全称*/
    /** 类型 **/
    this.type = 0;/*1:首冲;
2:7天登陆
3:限时抢购
4:每日累充福利
5:全部累充福利
6:每日消费有礼
7:全部消费有礼
8:升级有奖
9:兑换码
*/
    /** icon类型 **/
    this.iconType = 0;/*icon类型*/
    /** 标题icon类型 **/
    this.tiIconType = 0;/*标题icon类型*/
    /** 开始时间 **/
    this.startTime = null;/*开始时间*/
    /** 结束时间 **/
    this.endTime = null;/*结束时间*/
    /** 物品 **/
    this.items = null;/*{hero:{&quot;id&quot;:num,..},diamond:100,wipeItem:100}*/
    /** 随机英雄数据 **/
    this.randomHeroes = null;/*[[种类数,总数]，.....]*/
    /** 扩展值 **/
    this.exValues = null;/*首充:不需要
七天登陆:[英雄tid,........]
每日限购：[钻石数,........]
每日累冲：[钻石数,........]
全部累冲：[钻石数,........]
每日消费有礼：[钻石数,........]
全部消费有礼：[钻石数,........]
领主等级礼包：[领主等级,....]
兑换码：不需要
VIP等级礼包：[VIP等级,....]

时间段限购：[钻石数,........]*/
    /** 扩展值2 **/
    this.exValues2 = null;/*每日限购：[限购数量,........]
时间段限购：[限购数量,........]*/
    /** 扩展值3 **/
    this.exValues3 = null;/*每日限购：[几折,........]
时间段限购：[几折,........]*/
    /** 内容 **/
    this.content = null;/*内容*/
    /** 是否开启 **/
    this.isOpen = 0;/*是否发布*/
    /** 排序 **/
    this.sort = 0;/*排序*/
    /** 活动额外信息 **/
    this.exData = null;/*活动额外信息 {&quot;1&quot;:&quot;jchd&quot;}*/
    /** 活动模板ID **/
    this.templateId = 0;/*活动模板ID*/
    /** 备注 **/
    this.note = null;/*备注*/
    /** 是否作为模板 **/
    this.isTemplate = 0;/*是否作为模板*/
    /** 模板名 **/
    this.templateName = null;/*模板名*/
    /** 生效服务器 **/
    this.serverArr = null;/*生效服务器*/
    /** 是否支持任意时间生效 **/
    this.isAnyTimeValid = 0;/*是否支持任意时间生效*/

};
_Class.tableName = 'uw_public_activity';