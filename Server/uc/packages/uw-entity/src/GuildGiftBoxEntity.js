/**
游戏-公会礼盒(GuildGiftBoxEntity)
行会礼盒
**/
var _Class = module.exports = function(){
    /** 礼盒id **/
    this.id = null;/*礼盒id*/
    /** 公会id **/
    this.guildId = 0;/*公会id*/
    /** 礼包id **/
    this.giftBoxId = 0;/*礼包宝箱id*/
    /** 发送者id **/
    this.userId = 0;/*发送者id*/
    /** 发送者名称 **/
    this.userName = null;/*发送者名称*/
    /** 发送时间 **/
    this.sendTime = null;/*发送时间*/
    /** 结束时间 **/
    this.endTime = null;/*结束时间*/
    /** 领取者列表 **/
    this.recvers = null;/*领取者列表[id1,id2,...]*/

};
_Class.tableName = 'uw_guild_giftbox';