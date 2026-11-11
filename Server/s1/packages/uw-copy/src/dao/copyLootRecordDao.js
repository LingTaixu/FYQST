var util = require("util");
var BaseDao = require("uw-db").BaseDao;
function Dao(){
    BaseDao.call(this);
    this.Entity = require('uw-entity').CopyLootRecordEntity;
    this.castCols = {
         
    };
}
util.inherits(Dao,BaseDao);
module.exports = new Dao();