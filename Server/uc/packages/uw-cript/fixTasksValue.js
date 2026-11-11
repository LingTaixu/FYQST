var uwData = require("uw-data");
var t_hero = uwData.t_hero;
var c_prop = uwData.c_prop;
var async = require("async");
var uwClient = require("uw-db").uwClient;

var taskDao = require("uw-task").taskDao;
var userDao = require("uw-user").userDao;

var check = function(uwClient, cb) { 
    userDao.list(uwClient, " accountId > 0 and robotId = 0", [], function(err, userList) {
        if (err) return cb(err);
        async.map(userList, function(userData, cb1) {
        	var userId = userData.id;
            taskDao.select(uwClient, { userId: userId }, function(err, taskData) {
            	if (err) return cb1(err);
            	if (!taskData) return cb1(null);

            	var heroData = userData.heroData || {};
	            tempIdArr = Object.keys(heroData);
	            var heroSkinNum = tempIdArr.length; //英雄数目
	            //SSR英雄数目
	            var heroSkinSSRNum = 0;
	            tempIdArr.forEach(function(tempId) {
	            	// console.log('tempId->',tempId);
	            	if(!t_hero[tempId] || !t_hero[tempId].talismanstar) return;
	                if (t_hero[tempId].talismanstar == 3) {
	                    heroSkinSSRNum++;
	                }
	            });

                var tasksValue = taskData.tasksValue || {};
                if(tasksValue[c_prop.cTaskTypeKey.heroSkinNum] == heroSkinNum && tasksValue[c_prop.cTaskTypeKey.heroSkinSSRNum] == heroSkinSSRNum) return cb1(null); 
                console.log('修复任务数据 userId->',userData.id,'nickName->',userData.nickName,'heroSkinNum',tasksValue[c_prop.cTaskTypeKey.heroSkinNum],'==>',heroSkinNum,'heroSkinSSRNum->',tasksValue[c_prop.cTaskTypeKey.heroSkinSSRNum],'==>',heroSkinSSRNum);
                tasksValue[c_prop.cTaskTypeKey.heroSkinNum] = heroSkinNum;
                tasksValue[c_prop.cTaskTypeKey.heroSkinSSRNum] = heroSkinSSRNum;
                taskData.tasksValue = tasksValue;
                taskDao.update(uwClient, { tasksValue: taskData.tasksValue }, { userId: taskData.userId }, function(err, data) {
	            	if (err) return cb1(err);
	                return cb1(null);
	            });
                
            });
        }, function(err, data) {
            if (err) return cb(err);
            return cb(null);
        });

    });
};
// var daluan = function(uwClient, cb){
// 	taskDao.list(uwClient, " 1=1", [], function(err, taskList) {
// 		if (err) return cb(err);
// 		console.log('taskList.length----',taskList.length);
// 		async.map(taskList, function(taskData, cb1) {
// 			var tasksValue = taskData.tasksValue || {};
// 			tasksValue[c_prop.cTaskTypeKey.heroSkinNum] = 0;
// 			tasksValue[c_prop.cTaskTypeKey.heroSkinSSRNum] = 0;
//             // taskData.tasksValue = tasksValue;
//             taskDao.update(uwClient, { tasksValue: tasksValue }, { userId: taskData.userId }, function(err, data) {
//             	if (err) return cb1(err);
//                 return cb1(null);
//             });
// 		},function(err, data) {
//             if (err) return cb(err);
//             return cb(null);
//         })
// 	})
// }
// daluan(uwClient, function(err, data) {
// 	if(err)console.log(err);
//     console.log("daluan finish!");
//     //process.exit(0);
// });

check(uwClient, function(err, data) {
    console.log("fixTasksValue finish!");
    //process.exit(0);
});