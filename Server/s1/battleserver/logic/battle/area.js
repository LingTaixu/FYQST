/*
 * 用于管理广播数据
 */

const consts = require('./consts.js');

var appServer = null;
var moduleNsp = null;

class Area {
	constructor(id) {
 		//this.data = null;		// k:v
 		this.id = id;   // Area Id
 	}
 	// setData(data){
 	// 	this.data = data;
 	// 	this.dirty = true;
 	// }
 	// check(){
 	// 	if(this.dirty){
 	// 		this.broadcast("syncBossInfo", this.data);
 	// 		this.dirty =false;
 	// 	}
 	// }
 	broadcast(protocol, data){
 		//console.log("Area broadcast:", this.id, protocol, data);
 		appServer.io.of(moduleNsp).to(this.id).emit(protocol, data);
 	}
 	join(client){
 		//console.log("Area join:", client.id, this.id);
 		client.join(this.id);
 	}
 	leave(client){
 		//console.log("Area leave:", client.id, this.id);
 		client.leave(this.id);
 	}
 	// 关播到所有Area
 	broadcastToAll(protocol, data){
 		//console.log("Area broadcastToAll:", protocol, data);
 		appServer.io.of(moduleNsp).emit(protocol, data);
 	}
};


var zlarea = new Area(consts.eCONST.ZLBOSSLIST_ROOMID);
var hjarea = new Area(consts.eCONST.HJBOSSLIST_ROOMID);
exports.zlarea = zlarea;
exports.hjarea = hjarea;
exports.init = function() {
	appServer = appServer || require('./appUtil.js').appServer;
	moduleNsp = moduleNsp || require('./appUtil.js').ns;
}