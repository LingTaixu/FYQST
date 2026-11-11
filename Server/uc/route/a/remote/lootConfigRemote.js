/**
 * Module dependencies
 */
var exports = module.exports;
var g_lootConfig = require('uw-global').g_lootConfig;

/**
 * 更新掉落配置
 * @param lootTypeArr
 * @param cb
 */
exports.updateLootConfig = function(lootTypeArr,cb){
    g_lootConfig.setLootTypeArr(lootTypeArr);
    if(cb) cb();
};
