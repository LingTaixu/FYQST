var logger = require('uw-log').getLogger("uw-logger",__filename);
var BaseDao = require("uw-db").BaseDao;
var util = require("util");
function Dao() {
    BaseDao.call(this);
    this.Entity = require('uw-entity').WorldBossRecordEntity;
    this.castCols = {
        resultData:BaseDao.CAST_OBJECT 
    };
    //++++++++++++++++++begin++++++++++++++++++++++

    this.getLastBattleResult = function(client, battleId, cb){ 
        var strSql = " battleId = ? order by recordTime desc limit 1";
        this.list(client, strSql, [battleId], function(err,data){
        	if(err)return cb(err);
            cb(null,data);
        });    
    };
};

util.inherits(Dao, BaseDao);
module.exports = new Dao();