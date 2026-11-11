/**
 * Created by Administrator on 2015/9/18.
 */
var commonUtils = require("uw-utils").commonUtils;

//缓存
var fightCache = {};

var _fightType  = function(userId, copyType){
	return userId + "_" + copyType;
};

/**
 * 新增
 * @param userId
 * @param lootUid
 */
exports.newData =  function(userId,lootUid, copyType, manyNum){
    var randomKey = commonUtils.getRandomLetter(6);
    fightCache[_fightType(userId, copyType)] = [lootUid,randomKey,manyNum];
};

/**
 * 获取
 * @param userId
 * @returns {*}
 */
exports.getData = function(userId, copyType){
    return fightCache[_fightType(userId, copyType)];
};

/**
 * 删除
 * @param userId
 */
exports.delData =  function(userId, copyType){
    if(!fightCache[_fightType(userId, copyType)]) return;
    delete fightCache[_fightType(userId, copyType)];
};
