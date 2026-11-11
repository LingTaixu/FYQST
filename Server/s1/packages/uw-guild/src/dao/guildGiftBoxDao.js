/**
 * Created by Administrator on 2014/5/6.
 */

var BaseDao = require("uw-db").BaseDao;

var util = require("util");
function Dao() {
    BaseDao.call(this);
    this.Entity = require('uw-entity').GuildGiftBoxEntity;
    this.castCols = {
        recvers: BaseDao.CAST_ARRAY
    };
    //++++++++++++++++++begin++++++++++++++++++++++
    this.getGiftBoxList = function (client, guildId, timeNow, cb) {
        var strSql = "SELECT * from uw_guild_giftbox  where guildId =? and endTime >= ?";
        client.query(strSql, [guildId, timeNow], cb);
    };
};

util.inherits(Dao, BaseDao);
module.exports = new Dao();