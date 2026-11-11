var InviteEntity = require("uw-entity").InviteEntity;
var InviteRewardEntity = require("uw-entity").InviteRewardEntity;
var inviteRewardDao = require("../dao/inviteRewardDao");
var inviteDao = require("../dao/inviteDao");
var uwData = require("uw-data");
var c_game = uwData.c_game;
var c_prop = uwData.c_prop;
var userUtils = require("uw-user").userUtils;
var g_cache = require("uw-global").g_cache;
var exports = module.exports;
exports.invite = function(client, inviter, invitee, cb) {
    inviteDao.select(client, { 'inviterUid': inviter }, function(err, inviteData) {
        if (err) return cb(err);
        if (!inviteData) {
            var entity = new InviteEntity();
            entity.inviterUid = inviter;
            entity.inviteeUids = {};
            entity.inviteeUids[invitee] = 1;
            entity.num = 1;

            inviteDao.insert(client, entity, function(err, data) {
                if (err) return cb(err);
                entity.id = data.insertId;
                return cb(null, entity);
            });
        } else {
            if (!inviteData.inviteeUids[invitee]) {
                inviteData.inviteeUids[invitee] = 1;
                inviteData.num++;
                inviteDao.update(client, {
                    'inviteeUids': inviteData.inviteeUids,
                    'num': inviteData.num
                }, { 'inviterUid': inviter }, function(err, data) {
                });
            }

            return cb(null, inviteData);
        }
    });
};

// 返回邀请次数, 邀请奖励领取情况
exports.getInviteInfo = function(client, mainClient, userId, cb) {

    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        var inviter = gamePlayer.getAccount();
        inviteDao.select(mainClient, { 'inviterUid': inviter }, function(err, inviteData) {
            if (err) return cb(null, [0, []]);
            if (!inviteData) {
                return cb(null, [0, []]);
            } else {
                return cb(null, [[inviteData.num, inviteData.rewards]]);
            }
        });
    });
};

//  修改 rewards 内容
exports.getInviteReward = function(client, mainClient, userId, idx, cb) {
    if (idx < 0 || idx > 10) return cb("数据异常");
    g_cache.getGamePlayer(client, userId, function(err, gamePlayer) {
        var inviter = gamePlayer.getAccount();
        inviteDao.select(mainClient, { 'inviterUid': inviter }, function(err, inviteData) {
            if (err) return cb(err);
            if (!inviteData) {
                return cb('数据异常');
            } else {
                inviteData.rewards = inviteData.rewards || [];
                if (inviteData.rewards[idx]) {
                    return cb("已领取");
                }

                var userData = gamePlayer.userData;
                // 是否达到领取条件
                var shareCfg = c_game.sdkShareCfg[3].split(";")[idx];

                var inviteCfg = shareCfg.split(":");
                if (parseInt(inviteCfg[0]) > inviteData.num) return cb("不能领取");
                inviteData.rewards[idx] = 1;
                // var getDiamond = parseInt(inviteCfg[1]);

                // userUtils.addCurrency(userData, c_prop.currencyTypeKey.diamond, getDiamond, c_prop.itemGetTypeKey.event);
                var bagItems = {};
                // bagItems[c_prop.spItemIdKey.diamond] = getDiamond;
                bagItems[inviteCfg[1]] = inviteCfg[2];
                userUtils.saveItems(userData, bagItems, c_prop.itemGetTypeKey.event);
                _insertInviteReward(mainClient, gamePlayer.getAccount(), gamePlayer.getAccountId(), userId, gamePlayer.userData.nickName, bagItems);

                var updateUser = {
                    heroData : userData.heroData
                };

                gamePlayer.setUserDataDirty(g_cache.userDirtyFlag(bagItems));

                inviteDao.update(mainClient, { 'rewards': inviteData.rewards }, { 'inviterUid': inviter }, function(err, data) {
                    if (err) return cb(err);
                    return cb(null, [updateUser, [inviteData.num, inviteData.rewards], bagItems]);
                });
            }
        });
    });
};

exports.getInviteRewardRecord = function(client, cb) {
    var condition = "ORDER BY id DESC limit 50";
    inviteRewardDao.list(client, "recordType = ? " + condition, [1], function(err, hisList) {
        if (err) return cb(err);
        return cb(null, hisList);
    });
};

var _insertInviteReward = function(mainClient, account, accountId, userId, nickName, items) {
    var entity = new InviteRewardEntity();
    entity.recordType = 1;
    entity.account = account;
    entity.accountId = accountId;
    entity.userId = userId;
    entity.nickName = nickName;
    entity.items = items;
    entity.recordTime = new Date();
    inviteRewardDao.insert(mainClient, entity, function(err, data) {
    });
};
