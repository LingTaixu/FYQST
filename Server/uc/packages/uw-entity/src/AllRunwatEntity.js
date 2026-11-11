/**
后台-全服数据分析(AllRunwatEntity)
数据分析
**/
var _Class = module.exports = function(){
    /** 序号 **/
    this.id = null;/*序号*/
    /** 时间 **/
    this.dateTime = null;/*时间*/
    /** 新增 **/
    this.newUser = 0;/*新增*/
    /** 活跃 **/
    this.active = 0;/*活跃*/
    /** 次日留存 **/
    this.nextDayLeft = null;/*次日留存*/
    /** 7日留存 **/
    this.weekLeft = null;/*7日留存*/
    /** 流水 **/
    this.runwat = 0;/*流水*/
    /** 付费用户数 **/
    this.payCount = 0;/*付费用户数*/
    /** 新增付费 **/
    this.newPay = 0;/*新增付费*/
    /** ARPU **/
    this.ARPU = null;/*ARPU*/
    /** 付费率 **/
    this.payRate = null;/*付费率*/
    /** ARPPU **/
    this.ARPPU = null;/*ARPPU*/
    /** 累计流水 **/
    this.runwatNum = 0;/*累计流水*/
    /** 累计用户 **/
    this.userNum = 0;/*累计用户*/

};
_Class.tableName = 'uw_allrunwat';