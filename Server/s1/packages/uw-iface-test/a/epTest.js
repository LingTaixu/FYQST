/**
 * Created by Sara on 2015/10/6.
 */
var core4Test = require("uw-test").core4Test;
var cb = core4Test.cb4Test;
var iface = require("uw-data").iface;

core4Test.setSession(68698,1);

//初始化数据
function getInfo(){
    var args = {};
    core4Test.callIface(iface.a_employ_getInfo, args, cb);
}

function employ(){
    var args = {}; 
    var argsKeys = iface.a_employ_employ_args;
    args[argsKeys.idx] = 0;
    core4Test.callIface(iface.a_employ_employ, args, cb);
}

function refresh(){
    var args = {};  
    core4Test.callIface(iface.a_employ_refresh, args, cb);
}

function reduceCD(){
    var args = {};  
    core4Test.callIface(iface.a_employ_reduceCD, args, cb);
}

function reward(){
    var args = {}; 
    var argsKeys = iface.a_employ_reward_args;
    args[argsKeys.idx] = 1; 
    core4Test.callIface(iface.a_employ_reward, args, cb);
}

function feedback(){
    var args = {};   
    core4Test.callIface(iface.a_employ_feedback, args, cb);
}
function getRewardHistory(){
    var args = {};
    core4Test.callIface(iface.a_employ_getRewardHistory, args, cb);
}
/***********************************************************************************************************************/
getRewardHistory(); 
//employ();
//refresh();
//reduceCD();
//reward();
