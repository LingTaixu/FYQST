/**
主-账号(AccountEntity)
游戏-账号
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 账号名 **/
    this.name = null;/*账号名*/
    /** 邮箱 **/
    this.email = null;/*邮箱*/
    /** 密码 **/
    this.pwd = null;/*密码*/
    /** 机器码 **/
    this.deviceId = null;/*机器码，设备唯一号*/
    /** 账号状态 **/
    this.status = 0;/*账号状态  0正常 ，1普通封号，2设备封号*/
    /** 渠道id **/
    this.channelId = 0;/*渠道id*/
    /** sdk数据 **/
    this.sdkData = null;/*sdk数据*/
    /** 扩展数据 **/
    this.exData = null;/*扩展数据*/
    /** 创建时间 **/
    this.createTime = null;/*创建时间*/
    /** 创建ip **/
    this.createIP = null;/*创建ip*/
    /** 最后修改时间 **/
    this.lastUpdateTime = null;/*最后修改时间*/
    /** 登陆次数 **/
    this.loginCount = 0;/**/
    /** 登陆key **/
    this.loginKey = null;/*登陆key*/
    /** 拥有角色的服务器 **/
    this.userServers = null;/*拥有角色的服务器*/
    /** 充值补偿 **/
    this.rechargeCom = null;/*充值补偿  [充值元宝数量,是否发送奖励]*/
    /** sdk渠道号 **/
    this.sdkChannelId = null;/*sdk渠道号*/
    /** 禁言过期时间 **/
    this.bendExpireAt = null;/*禁言过期时间*/
    /** 禁言类型，第一位为普通聊天，第二位客服聊天 **/
    this.bendType = 0;/*禁言类型，第一位为普通聊天，第二位客服聊天*/

};
_Class.tableName = 'uw_account';