var core4Test = require("uw-test").core4Test;
var cb = core4Test.cb4Test;
var iface = require("uw-data").iface;

core4Test.setSession(2251,1);

//卖出道具
function sellItems(){
    var args = {};
    var argsKeys = iface.a_item_sellItems_args;
    args[argsKeys.itemId] = 18;
    args[argsKeys.itemNum] = 5;
    core4Test.callIface(iface.a_item_sellItems, args, cb);
}

/***********************************************************************************************************************/

sellItems();
