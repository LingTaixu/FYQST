/**
 * Created by Sara on 2015/10/6.
 */
var core4Test = require("uw-test").core4Test;
var cb = core4Test.cb4Test;
var iface = require("uw-data").iface;

core4Test.setSession(68698,1);

//初始化数据
function getTeamBossList(){
    var args = {};     
    core4Test.callIface(iface.a_boss_getTeamBossList, args, cb);
}
 
/***********************************************************************************************************************/
getTeamBossList(); 
 