var BaseDao = require("uw-db").BaseDao;

var util = require("util");

function Dao() {
    BaseDao.call(this);
    this.Entity = require('uw-entity').GuildBattleRecordEntity;
    this.castCols = {
        battleData: BaseDao.CAST_OBJECT,
        battleGuild: BaseDao.CAST_ARRAY,
        battleUser: BaseDao.CAST_ARRAY
    };

    this.getLastRecord = function(client, cb) {
        this.select(client, " 1=1 order by id desc", [], function(err, data) {
            if (err) return cb(err);
            if (!data) return cb(null);
            cb(null, data);
        });
    };
};

util.inherits(Dao, BaseDao);
module.exports = new Dao();