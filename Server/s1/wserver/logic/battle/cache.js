/*
 *  定义缓存数据
 */
 var exports = module.exports;
 var __offlineMsg = {};   // key : userId ,msg: []
 
 exports.addOfflineMsg = function(userId, msg){
 	if (!__offlineMsg[userId]){
 		__offlineMsg[userId] = [];
 	} 
 	__offlineMsg.push(msg);
 }

exports.popOfflineMsg = function(userId, msg){
	if (__offlineMsg[userId]){
		return __offlineMsg[userId].pop();
	}
	return ;
}

exports.getOfflineMsg = function(userId){
	return __offlineMsg[userId];
}
