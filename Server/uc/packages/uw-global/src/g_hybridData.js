/*
 *	 游戏里混合数据
 */
 
var uwData = require("uw-data");
var c_prop = uwData.c_prop;
var exports = module.exports; 
var rankDao = null;
var client = null;
var checkRequire = function(){ 
    client = client || require("uw-db").uwClient; 
    rankDao = rankDao || require("uw-rank").rankDao;
};

var __rankFirstCache = {};
 
//获取排行榜第一
exports.getRankFirst = function(rankType,cb){
    checkRequire();
    var data = __rankFirstCache[rankType];
    if(data)return cb(null,data); 
};

//设置战力榜第一
exports.loadRankFirst = function(cb){
    checkRequire();
    var rankCondition = "ORDER BY rankValue DESC,id ASC limit 1";
    var rankType = c_prop.rankTypeKey.combatRank; 
    //便于扩展
    switch(rankType){
        case c_prop.rankTypeKey.combatRank:
            rankCondition = "ORDER BY rankValue DESC,id ASC limit 1";
            break;
    }
    rankDao.list(client,"rankType = ? " + rankCondition,[rankType],function(err,rankData){
        if(err) return cb(err);
        __rankFirstCache[rankType] = rankData[0]; 
        cb(null,rankData[0]);
    });
}

