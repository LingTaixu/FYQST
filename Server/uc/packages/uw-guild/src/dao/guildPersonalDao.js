/**
 * Created by Administrator on 2014/5/6.
 */

var BaseDao = require("uw-db").BaseDao;

var util = require("util");
function Dao() {
    BaseDao.call(this);
    this.Entity = require('uw-entity').GuildPersonalEntity;
    this.castCols = {
        outMsg : BaseDao.CAST_ARRAY,
        appliedMsg : BaseDao.CAST_ARRAY,
        actData : BaseDao.CAST_OBJECT,
        giftData: BaseDao.CAST_OBJECT,
        todayHydChests : BaseDao.CAST_ARRAY,
        weekHydChests : BaseDao.CAST_ARRAY,
        fuliChests: BaseDao.CAST_ARRAY
    };
    //++++++++++++++++++begin++++++++++++++++++++++
    this.getPersonUserList = function (client, guildId, cb) {
        var strSql = "SELECT p.addUpAct,p.guildAct,p.position,p.userId, u.lvl,u.magicLvl, u.vip, u.nickName, u.iconId, u.combat,u.lastUpdateTime,p.ennoble FROM uw_guild_personal p left join uw_user u on p.userId = u.id   where p.guildId =? ";
        client.query(strSql, [guildId], cb);
    };

    // this.getQQBrownerPersonAccountList = function(client, guildId, cb) {
    //     var strSql = "SELECT u.accountId, p.userId FROM uw_guild_personal p left join uw_user u on p.userId = u.id where p.guildId = ? and (u.sdkChannelId = 100039 || u.sdkChannelId = 100069)";
    //     client.query(strSql, [guildId], function(err, dataList) {
    //         if (err || !dataList) return cb(err, dataList);
    //         cb(err, dataList);
    //     });
    // };
    this.getMemberIdList = function(client, guildId, cb) {
        var strSql = "SELECT userId FROM uw_guild_personal where guildId = ?";
        client.query(strSql, [guildId], function(err, dataList) {
            if (err || !dataList) return cb(err, dataList);
            cb(err, dataList);
        });
    };

    this.getPersonUserListByOffTime = function (client, guildId, tm, cb) {
        var dtm = new Date().addMinutes(-tm);
        var strSql = "SELECT p.userId,u.lastUpdateTime FROM uw_guild_personal p left join uw_user u on p.userId = u.id   where p.guildId =? and lastUpdateTime > ? ";
        client.query(strSql, [guildId, dtm], cb);
    }; 
};

util.inherits(Dao, BaseDao);
module.exports = new Dao();