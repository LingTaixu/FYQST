/**
 * Created by Sara on 2017/11/28.
 */
var exports = module.exports;


exports.gameInfoObj = function(){
    this.userid = "";
    this.user_level = 0;
    this.gameinfo =  "";
    this.value = 0;
    this.kingdom = "";
    this.phylum = "";
    this.classfield = "";
    this.family = "";
    this.genus = "";
    this.Date = (new Date()).toFormat("YYYY-MM-DD");
    this.Time = (new Date()).toFormat("HH24:MI:SS");
    this.extra = "";
};

exports.installObj = function(accountId, userId, nickName,  ip, extra){
    this.userid = accountId;
    this.udid = "";
    this.roleid = userId;
    this.source = "";
    this.affiliate = "";
    this.creative = "";  
    this.family = nickName;
    this.genus = "";
    this.fromUid = ip;
    this.installDate = (new Date()).toFormat("YYYY-MM-DD");  // 取值当前时间
    this.installTime = (new Date()).toFormat("HH24:MI:SS");  //
    this.extra = extra;
};


exports.dauObj = function(accountId, userId, ip, extra){
    this.userid = accountId;
    this.udid = "";
    this.roleid = userId;
    this.source = "";
    this.affiliate = "";
    this.creative = "";  
    this.family = "";
    this.genus = "";
    this.ip = ip;
    this.from_uid = "";
    this.date = (new Date()).toFormat("YYYY-MM-DD");  // 取值当前时间
    this.time = (new Date()).toFormat("HH24:MI:SS");  //
    this.extra = extra;   
};


exports.paymentObj = function(accountId, userId, transId, amount, ip, addDiamond, extra){
    this.userid = accountId;
    this.udid = "";
    this.roleid = userId;
    this.amount = amount;
    this.currency = "RMB";
    this.provider = "";
    this.ip = ip;
    this.transactionid = transId;
    this.status = "success";
    this.kingdom = "";
    this.phylum = "";  
    this.value2 = addDiamond;  //
    this.paymentDate = (new Date()).toFormat("YYYY-MM-DD");  // 取值当前时间
    this.paymentTime = (new Date()).toFormat("HH24:MI:SS");  //
    this.extra = extra;     
};


exports.economyObj = function(accountId, userId, currency, kingdom, amount, type, num, itemName, shopType,extra,udid){
    this.userid = accountId;
    this.udid = udid;
    this.roleid = userId;
    this.amount = amount;
    this.currency = currency;   
    this.value = num;
    this.kingdom = kingdom;
    this.phylum = type;
    this.classfield = shopType;
    this.family = "";
    this.genus = itemName;
    this.economyDate = (new Date()).toFormat("YYYY-MM-DD");  // 取值当前时间
    this.economyTime = (new Date()).toFormat("HH24:MI:SS");  //
    this.extra = extra;     
};

exports.counterRoleChoiceObj = function(accountId,userId,lvl,nickName){
    this.userid = accountId;
    this.udid = "";
    this.roleid = userId;
    this.user_level = lvl;
    this.counter = "role_choice";
    this.value = "";
    this.kingdom = "";
    this.phylum = "";
    this.classfield = "";
    this.family = nickName; 
    this.genus = "";
    this.date = (new Date()).toFormat("YYYY-MM-DD");  // 取值当前时间
    this.time = (new Date()).toFormat("HH24:MI:SS");  //
    this.extra = "";
}; 

exports.counterMissionObj = function(accountId, userId, lvl, taskType, taskId, taskName){
    this.userid = accountId;
    this.udid = "";
    this.roleid = userId;
    this.user_level = lvl;
    this.counter = "mission";
    this.value = "";
    this.kingdom = taskType;
    this.phylum = "end";
    this.classfield = "";
    this.family = taskName; 
    this.genus = taskId;
    this.date = (new Date()).toFormat("YYYY-MM-DD");  // 取值当前时间
    this.time = (new Date()).toFormat("HH24:MI:SS");  //
    this.extra = "";     
};
  
exports.counterItemObj = function(userId, roleId, userLevel, itemId, itemNum, itemName, flowType, counterType){
    this.userid = userId;
    this.udid = "";
    this.roleid = roleId;
    this.user_level =  userLevel;
    this.counter = "item";
    this.value = itemNum;
    this.kingdom = flowType;
    this.phylum = counterType;
    this.classfield = "";
    this.family = itemName; 
    this.genus = itemId;
    this.date = (new Date()).toFormat("YYYY-MM-DD");  // 取值当前时间
    this.time = (new Date()).toFormat("HH24:MI:SS");  //
    this.extra = "";  
};

exports.counterGuideObj = function(accountId, userId, lvl, guideId, guideSubject, guideContent){
    this.userid = accountId;
    this.udid = "";
    this.roleid = userId;
    this.user_level = lvl;
    this.counter = "guide";
    this.value = "";
    this.kingdom = guideSubject;
    this.phylum = "";
    this.classfield = "";
    this.family = guideContent; 
    this.genus = guideId;
    this.date = (new Date()).toFormat("YYYY-MM-DD");  // 取值当前时间
    this.time = (new Date()).toFormat("HH24:MI:SS");  //
    this.extra = "";     
};
                    
exports.milestoneObj = function(accountId, milestone, value, extra){
    this.userid = accountId;
    this.milestone = milestone;
    this.value = value;
    this.date = (new Date()).toFormat("YYYY-MM-DD");  // 取值当前时间
    this.time = (new Date()).toFormat("HH24:MI:SS");  //
    this.extra = extra;   
};

exports.beatObj = function(accountId, ip){
    this.userid = accountId;
    this.clientid = "";
    this.ip = ip;
    this.creative = "";
    this.date = (new Date()).toFormat("YYYY-MM-DD");  // 取值当前时间
    this.time = (new Date()).toFormat("HH24:MI:SS");  //
    this.extra = "";   
};

 
