var dbhelper = require('../utils/dbhelper.js');
var w2g  = require('../utils/w2g.js');
var Player = require('../logic/city/player.js').Player;
var playerManager = require('../logic/city/player.js').playerManager; 
var worldMap = require('../logic/city/worldmap.js').worldMap;
const consts = require('../logic/city/consts.js'); 
var logger = require('uw-log').getLogger("uw-logger", __filename);
var appUtil = require('../logic/city/appUtil.js');

class City {
    __init__(ns) {
        //console.log("modlue __init__",ns);
        //w2g.init();
        appUtil.appInit(this, ns);
    }
    onsyncPos(client, data) { 
        //console.log('onsyncPos', JSON.stringify(data)); 
        let player = playerManager.getPlayer(client.id);
        player.move(data); 
    } 
    onsyncUser(client, data) {
        //console.log("onSyncUser:",client.id);
        let player = playerManager.getPlayer(client.id);
        if(!player) return; 
        w2g.reloadCityUser(client.userId, client.serverId,  (err, data) => {
            if(err) return;
            player.setData(data); 
            player.updateUserInfo(); 
        });
    }
    onconnect(socket) {
        logger.info('CITY onconnected', socket.id);  
        let query = socket.authData.query;
        let data = socket.authData.data;
        let server = socket.authData.server;
        let p = new Player(socket, query.serverIndexId, query.pos, data);
        logger.info("CITY AUTH SUCC:%s,%s,%s", query.accountId, p.getUserId(), p.getServerId(), socket.id);
        socket.userId = p.getUserId();
        socket.serverId = p.getServerId();
        p.io = server.io;
        playerManager.addPlayer(p); 
        delete socket.authData;
    }
    ondisconnect(client, data) {
        console.log('ondisconnect ', client.id, client.userId);
        let player = playerManager.getPlayer(client.id);
        player.offLine();
    }
    onfake(client){ 
        w2g.getFakeUserList(client.userId, 20, client.serverId, (err, data) => { 
            if(err) return;
            client.emit('fake', data);
        });
    }
    onsyncGodnessBegin(client){
        let player = playerManager.getPlayer(client.id);
        worldMap.syncGodnessBegin(player, true);
    }
    onjoinGodness(client){
        let player = playerManager.getPlayer(client.id);
        player.joinGodness(); 
    }
    onpickChest(client, data){
        let player = playerManager.getPlayer(client.id);
        player.pickChest(data.chestId);  
    }
    onsyncEnter(client, data) {
        //console.log('onsyncEnter ', client.id, data);
        let mapId = consts.eCONST.WORLDMAP_NAME;
        let player = playerManager.getPlayer(client.id);
        player.enter(worldMap); 
    }
    onsyncLeave(client, data) {
        //console.log('onsyncLeave ', client.id, data);
        let player = playerManager.getPlayer(client.id);
        player.leave();  
    }
    isValidSocket(socket, query, server, cb) {
        var self = this; 
        logger.info("CITY READY TO AUTH :%s,%s,%s", query.accountId, query.serverIndexId, query.loginKey); 
        w2g.authCity(query.accountId, query.serverIndexId, query.loginKey, (err, data) => {
            if (err) {
                logger.info("CITY AUTH FAIL :%s,%s,%s,%j", query.accountId, query.serverIndexId, query.loginKey,err); 
                return cb(new Error('auth fail'));
            } 
            //console.log("auth data :", query, data.userData);
            socket.authData = {query: query, data: data,server:server}; 
            return cb(null);
        })
    }

};

module.exports = City;