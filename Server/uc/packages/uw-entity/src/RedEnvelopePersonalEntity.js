/**
红包个人信息(RedEnvelopePersonalEntity)
红包个人信息
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 用户id **/
    this.userId = 1;/*用户id*/
    /** 累计全服红包 **/
    this.addUpServer = 0;/*累计全服红包*/
    /** 累计公会红包 **/
    this.addUpGuild = 0;/*累计公会红包*/
    /** 累计抢得元宝 **/
    this.addUpGet = 0;/*累计抢得元宝*/
    /** 今日发送份额 **/
    this.sendCount = 0;/*今日发送次数*/
    /** 最后发送时间 **/
    this.lastSendTime = null;/*领取记录{&quot;元宝数&quot;:userId,&quot;元宝数&quot;:userId......}*/
    /** 发送记录 **/
    this.getData = null;/*发送记录[[份额，用户id，名字],[份额，用户id，名字]..]*/
    /** 扩展数据 **/
    this.exData = null;/*扩展数据{}*/
    /** 累积抢的其他物品 **/
    this.exAddUpGet = null;/*累积抢的其他物品*/

};
_Class.tableName = 'uw_red_envelope_personal';