/**
 * Created by Administrator on 2016/5/3.
 */

var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var server1Data = require("./data/server5.json");
var dsNameConsts = require("uw-data").dsNameConsts;
var ds = require('uw-ds').ds;

var run = function(){
    var oldLength = JSON.stringify(server1Data).length;
    console.log("oldLength:",oldLength);
    var newObj = JSON.parse(JSON.stringify(server1Data));
    var recordData = newObj.recordData;
    for(var key in recordData){
        var serverRecordData = recordData[key];
        _yasuoGuildWar(serverRecordData);
        _yasuoGuildUser(serverRecordData);

        delete serverRecordData._guildWarDefenceRecordDic
        delete serverRecordData._guildWarAttackRecordDic
        delete serverRecordData._guildWarGroupDic
        delete serverRecordData._guildWarUserGroupDic
    }
    var newLength = JSON.stringify(newObj).length;
    console.log("newLength:",newLength);
    console.log("newObj:",JSON.stringify(newObj) );
};

var _yasuoGuildWar = function(serverRecordData){
    var _guildWarDic = serverRecordData._guildWarDic;
    var _guildWarGroupDic = serverRecordData._guildWarGroupDic;
    var tempArr1 = [];
    for(var key in _guildWarDic){
        var locGuildWar = _guildWarDic[key];
        delete locGuildWar.fightRecordArr;
        var locData = wrapResult(null,locGuildWar,dsNameConsts.SyncGuildWarData);

        _guildWarDic[key] = locData;

        for(var key2 in locGuildWar){
            tempArr1.push(locData[key2]);
        }
    }
    serverRecordData._guildWarDic = tempArr1;

};

var _yasuoGuildUser = function(serverRecordData){
    var _guildWarUserDic = serverRecordData._guildWarUserDic;
    var _guildWarUserGroupDic = serverRecordData._guildWarUserGroupDic;

    for(var key in _guildWarUserDic){
        var locGuildUser = _guildWarUserDic[key];
        var locData = wrapResult(null,locGuildUser,dsNameConsts.SyncGuildWarUser);
        _guildWarUserDic[key] = locData;
    }

};

run();