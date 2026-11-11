/**
主-渠道配置信息(ChannelConfigEntity)
渠道配置信息
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/**/
    /** 渠道号 **/
    this.channelId = null;/**/
    /** 子渠道号 **/
    this.sdkChannelId = null;/**/
    /** 渠道名称 **/
    this.channelName = null;/**/
    /** 子渠道名称 **/
    this.sdkChannelName = null;/**/
    /** 渠道描述 **/
    this.desc = null;/**/

};
_Class.tableName = 'uw_channel_config';