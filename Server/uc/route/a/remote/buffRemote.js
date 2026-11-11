/**
 * Module dependencies
 */
var exports = module.exports;
var g_buff = require('uw-global').g_buff;

/**
 * 更新buff
 * @param data
 * @param cb
 */
exports.updateBuff = function(data,cb){
    var id = data.id;
    var buffData = data.buffData;
    var endTime = buffData.endTime;
    buffData.endTime = new Date(endTime);
    g_buff.setBuffData(id,buffData);
    if(cb) cb();
};
