/**
 * Created by Administrator on 2015/8/22.
 */

var util = require("util");
var BaseSerial = require("./BaseSerial.js");

function MedalSerial(){
    BaseSerial.call(this);
    this.timeout = 5000;
    this.uKey = "medalSerial-";
};

util.inherits(MedalSerial,BaseSerial);
module.exports = new MedalSerial();