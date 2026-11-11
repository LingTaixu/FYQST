const utils = require("../utils/utils.js");
const project = require('uw-config').project;
const dsNameConsts = require("uw-data").dsNameConsts;
const ds = require("uw-ds").ds;
const iface = require("uw-data").iface; 
const userBiz = require("uw-user").userBiz;
const heroPropHelper = require("uw-hero").heroPropHelper;
const heroBiz =require("uw-hero").heroBiz;
const uwClient = require("uw-db").uwClient;
const logger = require('uw-log').getLogger("uw-logger", __filename);
const wrapResult = require('uw-utils').wrapResultFunc(__filename);
const guildBiz = require("uw-guild").guildBiz;

var exports = module.exports;

// exports.authBattle = function(accountId, serverId, loginKey, cb) {
//      userBiz.getBattleUser(uwClient, accountId, serverId, loginKey, function(err, data){
//      	if(err) return cb(err);
//      	let showData = data[2];
//      	let showHeroData = new ds.ShowHeroData();
//         showHeroData.heroList = showData[0];
//         showHeroData.otherDataList = showData[1]; [[衣服显示id,武器显示id,翅膀显示id],..]
//         showHeroData.fightData = showData[2];
//         data[2] = wrapResult(null,showHeroData,dsNameConsts.ShowHeroData);
//      	return cb(err, data);
//      }); 
// }     
  
// exports.authCity = function(accountId, serverId, loginKey, cb) {
//      userBiz.getWSRoleData(uwClient, accountId,loginKey,  serverId, function(err, data){
//        if(err) return cb(err);
//         if(!data[0]) return cb("no user");
//         let wsRoleData = new ds.WSRoleData();
//         wsRoleData.userData = {};
//         let userData = data[0];
//         wsRoleData.userData.id = userData.id;
//         wsRoleData.userData.nickName = userData.nickName;
//         wsRoleData.userData.lvl = userData.lvl; 
//         wsRoleData.userData.iconId = userData.iconId;
//         wsRoleData.userData.medalTitle = userData.medalTitle;
//         wsRoleData.userData.achieveLvl = userData.achieveLvl;
//         wsRoleData.hero = data[1]; 
//         wsRoleData.fightData = data[2];
//         return cb(err, [userData, wrapResult(null,wsRoleData,dsNameConsts.WSRoleData)])
//      }); 
// }   

// exports.reloadCityUser  = function(userId, cb){
//    userBiz.getWSRoleData2(uwClient, userId, function(err, data){
//         if(err) return cb(err);
        
//         let wsRoleData = new ds.WSRoleData();
//         wsRoleData.userData = {};
//         let userData = data[0];
//         wsRoleData.userData.id = userData.id;
//         wsRoleData.userData.nickName = userData.nickName;
//         wsRoleData.userData.lvl = userData.lvl; 
//         wsRoleData.userData.iconId = userData.iconId;
//         wsRoleData.userData.medalTitle = userData.medalTitle;
//         wsRoleData.userData.achieveLvl = userData.achieveLvl;

//         wsRoleData.userData.rebirthLvl = userData.rebirthLvl;
//         wsRoleData.userData.noble = userData.noble;
//         wsRoleData.hero = data[1]; 
//         wsRoleData.fightData = data[2];
//         return cb(err, [userData, wrapResult(null,wsRoleData,dsNameConsts.WSRoleData)])
//      });  
// }

// exports.getFakeUserList = function(userId, num, cb){
//     userBiz.getFakeWSUserList(uwClient, userId, num, function(err, dataList){
//        if(err) return  cb(null, []);
 
//         var wsData = new ds.WSRoleList();
//         wsData.roleList = [];
//         for(var i = 0; i < dataList.length; i++){
//             var data = dataList[i]; 
//             var wsRoleData = new ds.WSRoleData();
//             wsRoleData.userData = {};
//             var userData = data[0]; 

//             if (!data[1] || !data[2]) continue;
            
//             wsRoleData.userData.id = userData.id;
//             wsRoleData.userData.nickName = userData.nickName;
//             wsRoleData.userData.lvl = userData.lvl; 
//             wsRoleData.userData.iconId = userData.iconId;
//             wsRoleData.userData.medalTitle = userData.medalTitle;
//             wsRoleData.userData.achieveLvl = userData.achieveLvl;

//             wsRoleData.userData.rebirthLvl = userData.rebirthLvl;
//             wsRoleData.userData.noble = userData.noble;
//             wsRoleData.hero = data[1]; 
//             wsRoleData.fightData = data[2]; 
//             wsData.roleList.push(wsRoleData);
//         }
//         cb(null, wrapResult(null, wsData,dsNameConsts.WSRoleList));
//     });
// };
 
  exports.guildBattleResult = function(guildRes, userRes, serverId, cb) {
     guildBiz.recoreGuildBattleResult(uwClient, guildRes, userRes, cb);
 } ; 
 
exports.getMaxHp = function(heroData){
	return heroPropHelper.getMaxHpFight(heroData);
};

// exports.insertMails = function(mailList){
//     mailDao.insertList(uwClient, mailList, function (err, data) {});
// };
 
// exports.enterZhongLiBoss = function(userId, cb){
//     userBiz.enterZhongLiBoss(uwClient, userId, function(err, exUserData){
//         if(err) return cb(err);
//         let data  = wrapResult(null,exUserData,dsNameConsts.ExUserData);
//         return cb(err, data);
//     });
// };
 
// exports.addGodnessExp = function(userId, sec, cb){
//     userBiz.addGodnessExp(uwClient, userId, sec, function(err, data){
//         if(err) return cb(err); 
//         var exUserData = new ds.ExUserData();
//         exUserData.userData = data[0]
//         return cb(null, wrapResult(null,exUserData,dsNameConsts.ExUserData));
//     });  
// };

// exports.addGodnessChest = function(userId, chestId, cb){
//     userBiz.addGodnessChest(uwClient, userId, chestId, function(err, data){
//         if(err) return cb(err);

//         var reData = new ds.ExUserData(); 
//         reData.userData = data[0];
//         reData.bagItems = data[1]; 
//         return cb(err, wrapResult(null,reData,dsNameConsts.ExUserData));
//     });    
// }

// exports.costDiamond =  async function(userId, diamond, cb){
//     userBiz.costDiamond(uwClient, userId, diamond, cb);
// }




