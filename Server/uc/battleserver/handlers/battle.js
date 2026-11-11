var w2g  = require('../utils/w2g.js');
var Player = require('../logic/battle/player.js').Player; 
var playerManager = require('../logic/battle/player.js').playerManager; 
var bossManager = require('../logic/battle/boss.js').bossManager; 
var logger = require('uw-log').getLogger("uw-logger", __filename);
var zlarea = require('../logic/battle/area.js').zlarea; 
var hjarea = require('../logic/battle/area.js').hjarea; 
const consts = require('../logic/battle/consts.js');
var appUtil = require('../logic/battle/appUtil.js');

class Battle {
    __init__(ns) {  
       appUtil.appInit(this, ns);
       //console.log("modlue __init__",ns);
    }
    onconnect(socket) {
        logger.info('CSBOSS onconnected', socket.id);  

        let query = socket.authData.query;
        let data = socket.authData.data;
        let server = socket.authData.server;

        let userData = data[0]; 
        let showData = data[1];
        let guildData = data[2];
        let heroData = data[3];
        //console.log("hero1 data ",  heroData[0]);
        let p = new Player(socket, query.serverIndexId, userData, heroData, showData,guildData);
        logger.info("CSBOSS AUTH SUCC:%s,%s,%s", query.accountId, userData.id, socket.id, p.getServerId(), p.getHp());
        socket.userId = userData.id;
        socket.serverId = query.serverIndexId;
        p.io = server.io;
        playerManager.addPlayer(p);
    }
    ondisconnect(client, data) {
        let player = playerManager.getPlayer(client.id);
        //console.log("ondisconnect:", client.id, client.userId);
        player.offLine();
    } 
    onsyncEnterBoss(client, data) { 
        let player = playerManager.getPlayer(client.id);
        player.setCombat(data.combat);
        //console.log('onsyncEnterBoss:', client.id, client.userId, data);
        player.enterMap(data.id);
    }
    onsyncReady(client, data) {
        let player = playerManager.getPlayer(client.id);
        player.readyDone();
    }
    onsyncLeave(client, data) {
        let player = playerManager.getPlayer(client.id);
        player.leaveMap();
    } 
    onsyncUser(client, data) {
        //console.log("onSyncUser:",client.id);
        let player = playerManager.getPlayer(client.id);
        if(!player) return; 
        w2g.reloadBattleUser(client.userId, client.serverId,  (err, data) => {
            if(err) return;
            let userData = data[0]; 
            let showData = data[1];
            let guildData = data[2];
            let heroData = data[3];
            player.setData(userData,heroData,showData,guildData);  
        });
    }
    onsyncHurt(client, data) { 
        let player = playerManager.getPlayer(client.id);
        player.hurt(data);
    } 
    onsyncHp(client, data) { 
        let player = playerManager.getPlayer(client.id);
        player.setHpFromClient(data);
    } 
    onsyncBossInfo(client, data) {
        //console.log('onsyncBossInfo ', client.id, data);
        let player = playerManager.getPlayer(client.id);
        let bossInfo = bossManager.getBossListByType(data.type);
        player.send('syncBossInfo', bossInfo);
    } 
    onfollowBossHp(client, data){ 
        //console.log("onfollowBossHp:",client.id);
        if(data.type == consts.eBossType.HJBoss){
            let player = playerManager.getPlayer(client.id);
            let bossInfo = bossManager.getBossListByType(consts.eBossType.HJBoss);
            player.send('syncBossInfo', bossInfo);  
            hjarea.join(client);   
        }
   
    }
    onunfollowBossHp(client, data){ 
        //console.log("onunfollowBossHp:",client.id);
        if(data.type == consts.eBossType.HJBoss){
            hjarea.leave(client);
        }
    }
    onsyncPos(client, data) { 
        let player = playerManager.getPlayer(client.id);
        let map = player.map;
        if (!map){
            logger.error("onsyncPos :%s,%s not in map", player.getUserId(), player.getPlayerId()); 
            return;
        }
        map.changePos(player, data); 
    }
    onsyncTarget(client, data) {
        //data : {type:玩家或npc, id:对应id};
        let player = playerManager.getPlayer(client.id);
        let map = player.map;
        if (!map){
            logger.error("onsyncTarget :%s,%s not in map", player.getUserId(), player.getPlayerId()); 
            return;
        }
        map.playerChangeTarget(player, data); 
    }
    onsyncBossOwner(client,data){
        let player = playerManager.getPlayer(client.id);
        player.cancelBossOwner(data);
    }
    onsyncRevive(client, data){
        let player = playerManager.getPlayer(client.id);
        data = data || {};
        player.revive(data.type);
    }
    onsyncReviveHero(client, data){
        let player = playerManager.getPlayer(client.id);
        player.reviveHero(data);
    } 
    onguildRankAll(client){
        let player = playerManager.getPlayer(client.id);
        player.onGuildRankAll();
    }
    onuserRank(client){
        let player = playerManager.getPlayer(client.id);
        player.onUserRank();
    }
    oninspire(client){
        let player = playerManager.getPlayer(client.id);
        player.onInspire();
    }
    ongetSelfRank(client){
        let player = playerManager.getPlayer(client.id);
        player.onGetSelfRank();
    }
    onpickChest(client, data){
        let player = playerManager.getPlayer(client.id);
        player.onpickChest(data.chestId);  
    }
    onunpickChest(client, data){
        let player = playerManager.getPlayer(client.id);
        player.onunpickChest(data.chestId);  
    }
    onbuyGoods(client, data){
        let player = playerManager.getPlayer(client.id);
        player.onBuyGoods(data.goodsId);
    }
    onsyncUserList(client, data){
        let player = playerManager.getPlayer(client.id);
        player.onSyncUserList(player);      
    }
    isValidSocket(socket, query, server, cb) {
        var self = this;
        logger.info("CSBOSS READY TO AUTH :%s,%s,%s", query.accountId, query.serverIndexId, query.loginKey); 
        w2g.authBattle(query.accountId, query.serverIndexId, query.loginKey, (err, data) => {
            if (err) {
                logger.info("CSBOSS AUTH FAIL :%s,%s,%s,%j", query.accountId, query.serverIndexId, query.loginKey,err); 
                return cb(new Error('auth fail'));
            }

            socket.authData = {query: query, data: data,server:server}; 
            return cb(null);
        });
    }

}; 

module.exports = Battle;
