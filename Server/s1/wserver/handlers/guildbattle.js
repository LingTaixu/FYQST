var w2g  = require('../utils/w2g.js');
var Player = require('../logic/guildbattle/player.js').Player; 
var playerManager = require('../logic/guildbattle/player.js').playerManager; 
var npcManager = require('../logic/guildbattle/npc.js').npcManager; 
var logger = require('uw-log').getLogger("uw-logger", __filename); 
const consts = require('../logic/guildbattle/consts.js');
var appUtil = require('../logic/guildbattle/appUtil.js');

class GuildBattle {
    __init__(ns) {  
       appUtil.appInit(this, ns);
       //console.log("modlue __init__",ns);
    }
    onconnect(socket) {  
        logger.info('GUILDBATTLE onconnected', socket.id);  
        let query = socket.authData.query;
        let data = socket.authData.data;
        let server = socket.authData.server;

        let userData = data[0]; 
        let showData = data[1];
        let guildData = data[2];
        let heroData = data[3];
        //console.log("hero1 data ",  heroData[0]);
        let p = new Player(socket, query.serverIndexId, userData, heroData, showData,guildData);
        logger.info("GUILDBATTLE AUTH SUCC:%s,%s,%s", query.accountId, userData.id, socket.id, p.getServerId(), p.getHp());
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
    onenterGuildBattle(client, data) { 
        let player = playerManager.getPlayer(client.id);
       // player.setCombat(data.combat);
        //console.log('onsyncEnterBoss:', client.id, client.userId, data);
        let mapId = consts.eCONST.GB_MAPID;
        player.enterMap(mapId);
    }
    onsyncReady(client, data) {
        let player = playerManager.getPlayer(client.id);
        player.readyDone();
    }
    onsyncLeave(client, data) {
        let player = playerManager.getPlayer(client.id);
        player.leaveMap();
    }
    onsyncHurt(client, data) { 
        let player = playerManager.getPlayer(client.id);
        player.onHurt(data);
    } 
    onsyncHp(client, data) { 
        let player = playerManager.getPlayer(client.id);
        player.onSetHpFromClient(data);
    } 
    onsyncPos(client, data) { 
        let player = playerManager.getPlayer(client.id);
        player.onChangePos(data); 
    }
    onsyncTarget(client, data) {
        //data : {type:玩家或npc, id:对应id};
        let player = playerManager.getPlayer(client.id);
        player.onChangeTarget(data); 
    }
    onsyncBossInfo(client, data) {
        console.log('guildBattle.onsyncBossInfo ', client.id, data);  
    } 
    onsyncRevive(client, data){
        let player = playerManager.getPlayer(client.id);
        data = data || {};
        player.onRevive(data.type);
    }
    onsyncReviveHero(client, data){
        let player = playerManager.getPlayer(client.id);
        player.onReviveHero(data);
    }
    ongetPReward(client, data){
        let player = playerManager.getPlayer(client.id);
        player.onGetPReward(data); 
    }
    onholdPillar(client, data){
        let player = playerManager.getPlayer(client.id);
        player.onHoldPillar(data.id);
    }
    onunholdPillar(client, data){
        let player = playerManager.getPlayer(client.id);
        player.onunHoldPillar();
    }
    onpickChest(client, data){
        let player = playerManager.getPlayer(client.id);
        player.onpickChest(data.chestId);  
    }
    onunpickChest(client, data){
        let player = playerManager.getPlayer(client.id);
        player.onunpickChest(data.chestId);  
    }
    onsyncChest(client, data){
        let player = playerManager.getPlayer(client.id);
        player.onsyncChest();  
    }
    isValidSocket(socket, query, server, cb) {
        var self = this;
        logger.info("GUILDBATTLE READY TO AUTH :%s,%s,%s", query.accountId, query.serverIndexId, query.loginKey); 
        w2g.authBattle(query.accountId, query.serverIndexId, query.loginKey, (err, data) => {
            if (err) {
                logger.info("GUILDBATTLE AUTH FAIL :%s,%s,%s,%j", query.accountId, query.serverIndexId, query.loginKey,err); 
                return cb(new Error('auth fail'));
            }

            socket.authData = {query: query, data: data,server:server}; 
            return cb(null);
        })
    }

}; 

module.exports = GuildBattle;
