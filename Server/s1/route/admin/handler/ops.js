// The TypeScript console uses the existing admin-key filter and game cache.
// Absolute assignments avoid overwriting an online player through a separate SQL connection.
var g_cache = require('uw-global').g_cache;
var uwClient = require('uw-db').uwClient;
var sessionManager = require('uw-route').sessionManager;
var userDao = require('uw-user').userDao;
var numeric = ['gold','diamond','lvl','rebirthLvl','rebirthExp','achieveLvl','achieveExp','cybLvl','cybExp','jxLvl','jxExp','highPaTa','magicLvl'];
exports.a = function(args, session, next) {
    var userId = Number(args.userId), changes = args.changes;
    if (!Number.isSafeInteger(userId) || userId <= 0 || !changes || typeof changes !== 'object' || Array.isArray(changes)) return next(new Error('Invalid player update'));
    var keys = Object.keys(changes);
    if (!keys.length || keys.some(function(key) { return numeric.indexOf(key) < 0 || !Number.isSafeInteger(changes[key]) || changes[key] < 0 || changes[key] > 2147483647; })) return next(new Error('Invalid player fields'));
    function apply(player) {
        keys.forEach(function(key) { player.userData[key] = changes[key]; });
        player.setUserDataDirty(g_cache.UDDirtyType.noTwoBag);
    }
    var cached = g_cache.getGamePlayerInCache(userId);
    if (cached) {
        if (!cached.userData.accountId || cached.userData.robotId) return next(new Error('Player not found'));
        apply(cached);
        return next(null, { userId: userId, applied: changes, storage: 'game-cache' });
    }
    userDao.selectCols(uwClient, 'id,accountId,robotId', { id: userId }, function(err, user) {
        if (err) return next(err);
        if (!user || !user.accountId || user.robotId) return next(new Error('Player not found'));
        userDao.update(uwClient, changes, { id: userId }, function(err) {
            if (err) return next(err);
            var player = g_cache.getGamePlayerInCache(userId);
            if (player) apply(player);
            next(null, { userId: userId, applied: changes, storage: player ? 'game-cache' : 'database' });
        });
    });
};
exports.b = function(args, session, next) {
    var total = 0, players = g_cache.GamePlayerList();
    Object.keys(players).forEach(function(id) {
        var user = players[id].userData;
        if (!user) return;
        var s = sessionManager.getSessionByAccountId(user.accountId, user.serverIndexId);
        if (s && s.expireTime && s.expireTime.getTime() > Date.now() && !s.isKick && !s.loggedInOtherDevice) total++;
    });
    next(null, { available: true, online: total });
};
exports.c = function(args, session, next) {
    var accountId = Number(args.accountId), serverIndexId = Number(args.serverIndexId);
    if (!Number.isSafeInteger(accountId) || accountId <= 0 || !Number.isSafeInteger(serverIndexId) || serverIndexId <= 0) return next(new Error('Invalid account'));
    var target = sessionManager.getSessionByAccountId(accountId, serverIndexId);
    if (target) target.isKick = 1;
    next(null, { kicked: !!target });
};
