var core4Test = require("uw-test").core4Test;
var cb = core4Test.cb4Test;
var iface = require("uw-data").iface;

core4Test.setSession(68698,1);

//获取用户信息
function getInfo(){
    var args = {};
    core4Test.callIface(iface.a_user_getInfo, args, cb);
}

//改名
function changeName(){
    var args = {};
    var argsKeys = iface.a_user_changeName_args;
    args[argsKeys.name] = "ac";
    core4Test.callIface(iface.a_user_changeName, args, cb);
}

//升级
function upLvl(){
    var args = {};
    core4Test.callIface(iface.a_user_upLvl, args, cb);
}

//红点提示
function getRedPoint(){
    var args = {};
    core4Test.callIface(iface.a_user_getRedPoint, args, cb);
}

//同步数据
function asyncData(){
    var args = {};

    var sendData = [];
    sendData[0] = 0; 
    sendData[1] = 0; 
    sendData[2] = 0; 
    sendData[3] = 0; 
    sendData[4] = 0; 
    sendData[5] = 0; 
    sendData[6] = 0; 
    sendData[7] = 0; 
    var argsKeys = iface.a_user_syncData_args;
    args[argsKeys.sendData] = sendData;  
    core4Test.callIface(iface.a_user_syncData, args, cb);
}

//购买金币
function buyGold(){
    var args = {};
    var argsKeys = iface.a_user_buyGold_args;
    args[argsKeys.num] = 1;
    core4Test.callIface(iface.a_user_buyGold, args, cb);
}

//购买背包格子
function buyBagGrid(){
    var args = {};
    core4Test.callIface(iface.a_user_buyBagGrid, args, cb);
}

//计算离线收益
function offlineEarnings(){
    var args = {};
    core4Test.callIface(iface.a_user_offlineEarnings, args, cb);
}

//打开背包宝箱
function getBagChest(){
    var args = {};
    var argsKeys = iface.a_user_getBagChest_args;
    args[argsKeys.chestId] = 720;
    args[argsKeys.count] = 1;
    core4Test.callIface(iface.a_user_getBagChest, args, cb);
}
 
/***********************************************************************************************************************/
//getInfo();
//changeName();
//upLvl();
//getRedPoint();
asyncData();
//buyGold();
//buyBagGrid();
//offlineEarnings();
//getBagChest(); 