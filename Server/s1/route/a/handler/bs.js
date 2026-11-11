var bonusBiz = require('uw-bonus-share').bonusBiz;
var client = require("uw-db").uwClient;
var uwData = require("uw-data");
var dsNameConsts = uwData.dsNameConsts;
var iface = uwData.iface;
var consts = uwData.consts;
var ds = require("uw-ds").ds;
var iface = uwData.iface;
var wrapResult = require('uw-utils').wrapResultFunc(__filename);
var proto = module.exports;

/**
 * 获取分红信息
 * @iface getInfo
 * @args {lastId:"分页id"}
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.a = function (args, session, next) {
    var argsKeys = iface.a_bonus_getInfo_args;
    var lastId = args[argsKeys.lastId] || 0;
    var userId = session.get(consts.session.userId);
    bonusBiz.getInfo(client, userId, lastId, function(err, shareData, relationData) {
        if (err) return next(null, wrapResult(err));
        var info = new ds.BonusInfo();
        if (shareData) {
            info.shareInfo = new ds.BonusShareData(0, shareData['relationCount'], shareData['amountDraw'], shareData['balance']);
            if (relationData) {
               var relations = [];
               for (var i = 0; i < relationData.length; i++) {
                    var relation = relationData[i];
                    relations.push(new ds.BonusRelationData(relation['id'], relation['userId'], relation['nickName'], relation['lvl'], relation['vip'], relation['amount']));
               }
               info.relations = relations;
            }
        } else {
            info.shareInfo = new ds.BonusShareData(1, 0, 0, 0);
        }
        next(null, wrapResult(null, info, dsNameConsts.BonusInfo));
    });
};


/**
 * 解散关系
 * @iface breakRelation
 * @args {inviteeUserId:"解散的用户ID"}
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.b = function (args, session, next) {
    var argsKeys = iface.a_bonus_breakRelation_args;
    var inviteeUserId = args[argsKeys.inviteeUserId];
    var userId = session.get(consts.session.userId);
    bonusBiz.breakRelation(client, userId, inviteeUserId, function(err) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null));
    });
};

/**
 * 上家分享
 * @iface share
 * @args {serverIndexId:"服务器ID"}
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.c = function(args, session, next) {
    var argsKeys = iface.a_bonus_share_args;
    var serverIndexId = args[argsKeys.serverIndexId];
    var userId = session.get(consts.session.userId);
    bonusBiz.createShare(client, userId, serverIndexId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.BonusShareUrl));
    });
}


/**
 * 上家提取返利
 * @iface draw
 * @args
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.d = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    bonusBiz.draw(client, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null, data, dsNameConsts.BonusDrawResult));
    });
}

/**
 * 上家首次分享发奖
 * @iface sendShareGift
 * @args
 * @param args
 * @param session
 * @param next
 * @returns
 */
proto.e = function(args, session, next) {
    var userId = session.get(consts.session.userId);
    bonusBiz.sendShareGift(client, userId, function(err, data) {
        if (err) return next(null, wrapResult(err));
        next(null, wrapResult(null));
    });
}
