/**
 * Created by Administrator on 2015/12/8.
 */

var exports = module.exports;
var uwData = require("uw-data");
var c_lvl = uwData.c_lvl;
var c_guildLvl = uwData.c_guildLvl;
var c_guildGift = uwData.c_guildGift;
var g_guild = require("uw-global").g_guild;
var c_game =  uwData.c_game;
//获取上香次数
exports.getActNum = function (guildPersonalData, actId) {
    _calRefreshData(guildPersonalData);
    var actDataArr = guildPersonalData.actData[actId] || [];
    return actDataArr[0] || 0;
};

//增加上香次数
exports.addActNum = function (guildPersonalData, actId, num) {
    _calRefreshData(guildPersonalData);
    var actDataArr = guildPersonalData.actData[actId] || [];
    var actNum = actDataArr[0] || 0;
    actDataArr[0] = actNum + num;
    guildPersonalData.actData[actId] = actDataArr;
};

//获取今天贡献
exports.getTodayAct = function (guildPersonalData) {
    _calRefreshData(guildPersonalData);
    return guildPersonalData.todayAct;
};

//增加今天贡献
exports.addTodayAct = function (guildPersonalData, num) {
    _calRefreshData(guildPersonalData);
    guildPersonalData.todayAct += num;
   // guildPersonalData.addUpAct += num;
    guildPersonalData.guildAct += num;
};

//获取今天公告次数
exports.getTodayNotice = function (guildPersonalData) {
    _calRefreshData(guildPersonalData);
    return guildPersonalData.noticeCount;
};

//增加今天公告次数
exports.addTodayNotice = function (guildPersonalData, num) {
    _calRefreshData(guildPersonalData);
    guildPersonalData.noticeCount += num;
};

//获取今天退会次数
exports.getTodayExitGuild = function (guildPersonalData) {
    _calRefreshData(guildPersonalData);
    return guildPersonalData.exitGuildCount;
};

//增加今天退会次数
exports.addTodayExitGuild = function (guildPersonalData, num) {
    _calRefreshData(guildPersonalData);
    guildPersonalData.exitGuildCount += num;
};

//获取今天抽奖次数
exports.getTodayLottery = function (guildPersonalData) {
    _calRefreshData(guildPersonalData);
    return guildPersonalData.lotteryCount;
};

//增加今天抽奖次数
exports.addTodayLottery = function (guildPersonalData, num) {
    _calRefreshData(guildPersonalData);
    guildPersonalData.lotteryCount += num;
};


//添加经验
exports.addGuildAct = function(guildData, act){

    var oldLvl = guildData.lvl;
    guildData.addUpAct+=act;

    var curLvl =  _getCurLvl(guildData.addUpAct);

    guildData.lvl = curLvl;

    //限制最高等级
    var maxLvl = c_game.guildSet[9];
    if(guildData.lvl>=maxLvl){
        guildData.lvl = maxLvl;
    }

    if(oldLvl!=curLvl){
        g_guild.reCalPkProp(guildData.id);
    }
};

// 增加活跃度
exports.addGuildHyd = function(guildData, num){
    exports.calRefreshGuildData(guildData);
    var todayHyd = guildData.todayHyd;
    guildData.todayHyd += parseInt(num); 
    if (guildData.todayHyd > parseInt(c_game.guildGrownCfg[0])){
        guildData.todayHyd = parseInt(c_game.guildGrownCfg[0]);
    }
    guildData.weekHyd += parseInt(num);

    if (guildData.weekHyd > parseInt(c_game.guildGrownCfg[1])){
        guildData.weekHyd = parseInt(c_game.guildGrownCfg[1]);
    }

    if (todayHyd < guildData.todayHyd && guildData.todayHyd >= c_game.guildGrownCfg[0]){

        // 触发邮件奖励 
        return [1,1];
    } 
    return [1,0];
}

// 公会成长 
exports.getGrownNum = function (guildData, gId) {
    exports.calRefreshGuildData(guildData);
    var dataArr = guildData.hydData[gId] || [];
    return dataArr[0] || 0;
};

//增加公会成长
exports.addGrownNum = function (guildData, gId, num) {
    exports.calRefreshGuildData(guildData);
    var dataArr = guildData.hydData[gId] || [];
    var grownNum = dataArr[0] || 0;
    dataArr[0] = grownNum + parseInt(num);
    guildData.hydData[gId] = dataArr;
};

// 增肌公会福利值
exports.addFuli = function(guildData, num){
    exports.calRefreshGuildData(guildData);
    guildData.fuli += parseInt(num);  
}

exports.calRefreshGuildPersonalData = function(guildPersonalData){
    return _calRefreshData(guildPersonalData);
}

exports.checkGuildGiftData = function(guildPersonalData, type, value){
    var bChanged = false;
    var giftData = guildPersonalData.giftData || {};
    var giftIdKeys = Object.keys(giftData);

    for(var i = 0; i < giftIdKeys.length && i < 20; i++){
        var id = giftIdKeys[i];
        if (c_guildGift[id].type == type){
             if (type == 2){ 
                if (giftData[id][0] == 0){
                    bChanged = true;
                    giftData[id][0] = 1;
                }
            }else if (type == 1 || type == 4 || type == 5){
                if (c_guildGift[id].targetValue <= value && giftData[id][0] == 0){
                    bChanged = true;
                    giftData[id][0] = 1;
                }
            }else if(type == 3){
                if (c_guildGift[id].targetValue == value && giftData[id][0] == 0){
                    bChanged = true;
                    giftData[id][0] = 1;
                }
            }
        }
    } 
    guildPersonalData.giftData = giftData;
    return  bChanged;
}
 
var _getCurLvl = function(addUpAct){
    var tempLvl = 0;
    for(var i = 0;i<50;i++){
        var locLvlData = c_lvl[i];
        if(!locLvlData) break;
        var locNextData = c_lvl[i+1];
        if(!locNextData) break;
        if(addUpAct<locLvlData.guildExp){
            break;
        }
        tempLvl++;
    }
    return tempLvl;
};

var _calRefreshData = function (guildPersonalData) {
    var bChanged = false;
    if (guildPersonalData.actLastTime) {
        if (typeof guildPersonalData.actLastTime == "string") {
            guildPersonalData.actLastTime = new Date(guildPersonalData.actLastTime);
        } 
    }

     if (guildPersonalData.weekRefreshTime) {
        if (typeof guildPersonalData.weekRefreshTime == "string") {
            guildPersonalData.weekRefreshTime = new Date(guildPersonalData.weekRefreshTime);
        } 
    }
    
    if (!guildPersonalData.actLastTime || !guildPersonalData.actLastTime.equalsDay(new Date())) {
        guildPersonalData.actLastTime = new Date();
        guildPersonalData.actData = {};
        guildPersonalData.todayAct = 0;
        guildPersonalData.noticeCount = 0;
        guildPersonalData.exitGuildCount = 0;
        guildPersonalData.lotteryCount = 0;
        guildPersonalData.todayHydChests = [0,0,0,0,0];
        guildPersonalData.fuliChests =  [0,0,0];
        bChanged = true;
    } 
 
    if (!guildPersonalData.weekRefreshTime ||  guildPersonalData.weekRefreshTime.getWeekNumber() != (new Date()).getWeekNumber()){
        guildPersonalData.weekHydChests = [0,0,0];
        guildPersonalData.weekRefreshTime = new Date(); 
        bChanged = true;
    }

    if(!guildPersonalData.actData){
        guildPersonalData.actData = {};
        bChanged = true;
    }
    return bChanged;
};

exports.calRefreshGuildData = function (guildData) {
    var bChanged = false;
    if (guildData.todayHydRefreshTime) {
        if (typeof guildData.todayHydRefreshTime == "string") {
            guildData.todayHydRefreshTime = new Date(guildData.todayHydRefreshTime);
        } 
    }

     if (guildData.weekHydRefreshTime) {
        if (typeof guildData.weekHydRefreshTime == "string") {
            guildData.weekHydRefreshTime = new Date(guildData.weekHydRefreshTime);
        } 
    }

    if (!guildData.todayHydRefreshTime || !guildData.todayHydRefreshTime.equalsDay(new Date())) {
        guildData.todayHyd = 0;
        guildData.fuli = 0;
        guildData.hydLuckyName = '';
        guildData.hydData = {};
        guildData.todayHydRefreshTime = new Date();
        bChanged = true;
    } 

    if (!guildData.weekHydRefreshTime ||  guildData.weekHydRefreshTime.getWeekNumber() != (new Date()).getWeekNumber()){ 
        guildData.weekHyd = 0; 
        guildData.weekHydRefreshTime = new Date();
        bChanged = true;
    }
    if(!guildData.hydData){
        guildData.hydData = {};
        bChanged = true;
    }
    return bChanged;
};