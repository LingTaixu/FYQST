var core4Test = require("uw-test").core4Test;
var cb = core4Test.cb4Test;
var iface = require("uw-data").iface;

core4Test.setSession(79376,1);

//领取
function receive(){
    var args = {};
    var argsKeys = iface.a_activity_receive_args;
    args[argsKeys.activityId] = 3;
    args[argsKeys.index] = 0;
    core4Test.callIface(iface.a_activity_receive, args, cb);
}


//领取
function getList(){
    var args = {};
    core4Test.callIface(iface.a_activity_getList, args, cb);
}

// 刷新每日商店
function refreshDayShop(){
    var args = {}; 
    var argsKeys = iface.a_activity_refreshDayShop_args;
    args[argsKeys.activityId] = 1085;
    args[argsKeys.type] = 0;
    core4Test.callIface(iface.a_activity_refreshDayShop, args, cb);
}


/***********************************************************************************************************************/
//receive();

//getList();

refreshDayShop();