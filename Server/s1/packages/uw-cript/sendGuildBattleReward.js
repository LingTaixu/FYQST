/**
 * Created by Administrator on 2018/2/16.
 */ 
var async = require("async");  
var guildBiz = require("uw-guild").guildBiz;
var uwClient = require("uw-db").uwClient;
var scriptUtils = require("./scriptUtils");
 
var sendWareHouseReward = function(serverData, sClient, cb){
     guildBiz.sendGuildBattleWareHouseReward(sClient,cb);
};

scriptUtils.runByServerIds([1],sendWareHouseReward);