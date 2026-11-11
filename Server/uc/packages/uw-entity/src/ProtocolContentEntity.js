/**
主-协议内容(ProtocolContentEntity)
协议内容
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 内容 **/
    this.content = null;/*内容*/
    /** 是否开启 **/
    this.isOpen = 0;/*是否开启,0：不开启，1：开启*/

};
_Class.tableName = 'uw_protocol_content';