/**
游戏-系统红包(SysRedEnvelopeEntity)
游戏触发（或后台发送的）的发送给玩家的红包
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/**/
    /** 发送者id **/
    this.userId = 0;/*发送者id,系统为0*/
    /** 发送者名称 **/
    this.sendName = '&quot;系统&quot;';/*发送者名称*/
    /** 红包类型 **/
    this.redType = 1;/*红包类型*/
    /** 公会id **/
    this.guildId = null;/*公会id*/
    /** 红包物品id **/
    this.spItemId = null;/*红包物品*/
    /** 物品数量 **/
    this.amount = 0;/*物品数量*/
    /** 显示数量 **/
    this.viewAmount = 0;/*显示数量*/
    /** 人数 **/
    this.personNum = 0;/*人数*/
    /** 红包祝福 **/
    this.wish = null;/*红包祝福*/
    /** 每人限额区间 **/
    this.limitZone = null;/*每人限额区间*/
    /** 添加时间 **/
    this.addTime = null;/*添加时间*/
    /** 处理状态 **/
    this.isDeal = 0;/*处理状态*/

};
_Class.tableName = 'uw_sys_red_envelope';